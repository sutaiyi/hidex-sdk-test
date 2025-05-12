import { TransactionMessage, VersionedTransaction, AddressLookupTableAccount, PublicKey } from '@solana/web3.js';
import { SOLANA_SYSTEM_PROGRAM_ID, SOLANA_SYSTEM_PROGRAM_TRANSFER_ID, SOLANA_CREATE_ACCOUNT_WITH_SEED_ID, GMGN_PRIORITY_FEE_Collect_ID, JITO_FEE_ACCOUNT, DEFAULD_SOLANA_SWAP_LIMIT, TIP_MINI_IN_PRIORITY, SOLANA_MAX_TX_SERIALIZE_SIGN, NEED_CHANGE_SLIPPAGE_PROGRAM_IDS, SUPPORT_CHANGE_PROGRAM_IDS, PUMP_AMM_PROGRAM_ID, HIDEX_ADDRESS_LOOK_UP, DEFAULD_SOLANA_GAS_LIMIT, VERSION_TRANSACTION_PREFIX, PRE_PAID_EXPENSES, } from '../config';
import { checkAccountCloseInstruction, createSwapCompleteInstruction, createSwapPrepareInstruction, createTipTransferInstruction, deleteTransactionGasInstruction, getInstructionAmounts, getInstructionReplaceDataHex, numberToLittleEndianHex, priorityFeeInstruction, setCreateAccountBySeedInstructionLamports, setTransferInstructionLamports, versionedTra } from './InstructionCreator';
export function resetInstructions(currentSymbol, transactionMessage, newInputAmount, newOutputAmount) {
    console.log("传入的输出代币数量", newOutputAmount);
    console.log("传入的输入代币数量", newInputAmount);
    let transferInstructionIndex = -1;
    for (let i = 0; i < transactionMessage.instructions.length; i++) {
        const tempInstruction = transactionMessage.instructions[i];
        const dataHex = tempInstruction.data.toString('hex');
        let hasChange = false;
        if (tempInstruction.data.length == 0)
            continue;
        const instructionId = tempInstruction.data.readUint8();
        if (tempInstruction.programId.toBase58() == SOLANA_SYSTEM_PROGRAM_ID.toBase58() && currentSymbol.isBuy && i != transactionMessage.instructions.length - 1) {
            hasChange = setTransferInstructionLamports(tempInstruction, dataHex, newInputAmount);
            if (hasChange) {
                transferInstructionIndex = i;
                console.log('转账指令已修改 = ' + transferInstructionIndex);
            }
        }
        if (tempInstruction.programId.toBase58() == SOLANA_SYSTEM_PROGRAM_ID.toBase58() && instructionId == SOLANA_CREATE_ACCOUNT_WITH_SEED_ID) {
            console.log(tempInstruction.data.length);
            hasChange = setCreateAccountBySeedInstructionLamports(currentSymbol.preAmountIn, tempInstruction, dataHex, newInputAmount);
            if (hasChange) {
                transferInstructionIndex = i;
                console.log('CreateAccountBySeed指令已修改 = ' + transferInstructionIndex);
            }
        }
        const dexProgramIndex = SUPPORT_CHANGE_PROGRAM_IDS.get(tempInstruction.programId.toBase58()) ?? 0;
        if (dexProgramIndex > 0) {
            const amountsResult = getInstructionAmounts(currentSymbol, tempInstruction);
            console.log('修改前输入的代币数量 = ' + amountsResult.input);
            console.log('修改前输出的代币数量 = ' + amountsResult.output);
            const precision = BigInt(10000);
            let numerator = BigInt(Math.round(currentSymbol.slipPersent * Number(precision)));
            if (NEED_CHANGE_SLIPPAGE_PROGRAM_IDS.indexOf(tempInstruction.programId.toBase58()) == -1) {
                if (tempInstruction.programId.toBase58() == PUMP_AMM_PROGRAM_ID.toBase58() && currentSymbol.isBuy) {
                    const newInputChangeBefore = newInputAmount;
                    newInputAmount = newInputAmount + (newInputAmount * numerator) / precision;
                    console.log("增加滑点量后传入的输入代币数量", newInputAmount);
                    const availableLamports = BigInt(currentSymbol.solLamports) - BigInt(PRE_PAID_EXPENSES) - BigInt(currentSymbol.priorityFee);
                    console.log("当前用户余额", currentSymbol.solLamports);
                    console.log("可用于购买PUMP.amm的余额", availableLamports);
                    if (newInputAmount > availableLamports) {
                        newOutputAmount = newOutputAmount * availableLamports / newInputAmount;
                        console.log("余额不足，总量下移后购买的代币量", newOutputAmount);
                        newInputAmount = availableLamports;
                        console.log("余额不足，总量下移后消耗的sol", newInputAmount);
                    }
                    console.log('transferInstructionIndex = ' + transferInstructionIndex);
                    if (transferInstructionIndex > 0) {
                        const transferInstruction = transactionMessage.instructions[transferInstructionIndex];
                        const dataHex2 = transferInstruction.data.toString('hex');
                        const instructionId = transferInstruction.data.readUInt32LE(0);
                        if (instructionId === SOLANA_SYSTEM_PROGRAM_TRANSFER_ID) {
                            console.log('转账指令重新修改为：', newInputAmount);
                            setTransferInstructionLamports(transferInstruction, dataHex2, newInputAmount);
                        }
                        else if (instructionId == SOLANA_CREATE_ACCOUNT_WITH_SEED_ID) {
                            console.log('SOLANA_CREATE_ACCOUNT_WITH_SEED指令重新修改为：', newInputAmount);
                            setCreateAccountBySeedInstructionLamports(newInputChangeBefore.toString(), transferInstruction, dataHex2, newInputAmount);
                        }
                    }
                    if (newInputAmount > BigInt(availableLamports)) {
                        throw new Error('Error: pump-amm insufficient account balance ' + currentSymbol.solLamports + ' for required input ' + newInputAmount);
                    }
                }
                else {
                    newOutputAmount = newOutputAmount - (newOutputAmount * numerator) / precision;
                    console.log("newOutputAmount", newOutputAmount);
                }
            }
            else {
                const slippageChangeResult = numberToLittleEndianHex(Number(numerator), 3);
                const changeSlippageData = dataHex.slice(0, dataHex.length - 6) + slippageChangeResult;
                tempInstruction.data = Buffer.from(changeSlippageData, 'hex');
            }
            console.log('滑点 = ' + currentSymbol.slipPersent);
            const swapInstructionBuffer = Buffer.alloc(8);
            swapInstructionBuffer.writeBigUInt64LE(newInputAmount);
            const newInputReverseHex = swapInstructionBuffer.toString('hex');
            console.log('计算滑点后输入的代币数量 = ' + newInputAmount);
            swapInstructionBuffer.writeBigUInt64LE(newOutputAmount);
            const newOutputReverseHex = swapInstructionBuffer.toString('hex');
            console.log('计算滑点后输出的代币数量 = ' + newOutputAmount);
            let finalData = getInstructionReplaceDataHex(currentSymbol, tempInstruction.programId.toBase58(), dataHex, newInputReverseHex, newOutputReverseHex);
            console.log('finalData = ' + finalData);
            tempInstruction.data = Buffer.from(finalData, 'hex');
            console.log('data3 = ' + tempInstruction.data.toString('hex'));
        }
    }
    return transactionMessage;
}
export async function compileTransaction(swapBase64Str, HS) {
    if (!swapBase64Str.startsWith(VERSION_TRANSACTION_PREFIX)) {
        throw new Error('This token type does not support transactions');
    }
    const swapTransactionBuf = Buffer.from(swapBase64Str, 'base64');
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    const addressTables = transaction.message.addressTableLookups.map((value) => {
        return value.accountKey;
    });
    addressTables.push(HIDEX_ADDRESS_LOOK_UP);
    const connection = HS.network.getProviderByChain(102);
    const mutiAccountInfo = await connection.getMultipleAccountsInfo(addressTables);
    const addressLookupTableAccounts = new Array(addressTables.length);
    for (let i = 0; i < mutiAccountInfo.length; i++) {
        const state = AddressLookupTableAccount.deserialize(mutiAccountInfo[i].data);
        const lookUp = new AddressLookupTableAccount({
            key: addressTables[i],
            state: state
        });
        if (mutiAccountInfo[i].data.length != 0) {
            addressLookupTableAccounts[i] = lookUp;
        }
    }
    const transactionMessage = TransactionMessage.decompile(transaction.message, {
        addressLookupTableAccounts: addressLookupTableAccounts
    });
    console.log('programId', transactionMessage.instructions[0].programId.toBase58());
    console.log('addressLookupTableAccounts', addressLookupTableAccounts.length);
    const validAddressLookupTableAccounts = [];
    const currentSlot = await connection.getSlot();
    for (let i = 0; i < addressLookupTableAccounts.length; i++) {
        if (currentSlot < addressLookupTableAccounts[i].state.deactivationSlot) {
            validAddressLookupTableAccounts.push(addressLookupTableAccounts[i]);
        }
    }
    console.log('validAddressLookupTableAccounts', validAddressLookupTableAccounts.length);
    return { message: transactionMessage, addressesLookup: validAddressLookupTableAccounts };
}
export function isInstructionsSupportReset(transactionMessage, currentSymbol) {
    for (let i = 0; i < transactionMessage.instructions.length; i++) {
        const tempInstruction = transactionMessage.instructions[i];
        const programId = tempInstruction.programId.toBase58();
        console.log('dexId', programId);
        console.log('********************************************************************************');
        const dexProgramIndex = SUPPORT_CHANGE_PROGRAM_IDS.get(programId) ?? 0;
        if (dexProgramIndex > 0) {
            console.log('data', tempInstruction.data.toString('hex'));
            const amounts = getInstructionAmounts(currentSymbol, tempInstruction);
            console.log('检测指令中输入的代币数量 = ' + amounts.input);
            console.log('检测指令中输出的代币数量 = ' + amounts.output);
            console.log('外部传入的预请求输入的代币数量 = ' + BigInt(currentSymbol.preAmountIn));
            console.log('外部传入的预请求输出的代币数量 = ' + BigInt(currentSymbol.preAmountOut));
            let preAmountInBigInt = BigInt(currentSymbol.preAmountIn);
            let preAmountOutBigInt = BigInt(currentSymbol.preAmountOut);
            if (amounts.input == preAmountInBigInt || amounts.output == preAmountOutBigInt) {
                console.log('买入指令检测成功 = ' + amounts.input);
                return true;
            }
        }
    }
    return false;
}
export async function getTransactionsSignature(transactionMessage, addressLookupTableAccounts, recentBlockhash, currentSymbol, owner, HS) {
    let deleteCloseAccountIndex = -1;
    for (let i = 0; i < transactionMessage.instructions.length; i++) {
        const isDelete = await checkAccountCloseInstruction(currentSymbol, transactionMessage.instructions[i], owner, HS.network);
        if (isDelete) {
            deleteCloseAccountIndex = i;
        }
    }
    if (deleteCloseAccountIndex >= 0) {
        transactionMessage.instructions.splice(deleteCloseAccountIndex, 1);
    }
    const lastInstruction = transactionMessage.instructions[transactionMessage.instructions.length - 1];
    if (lastInstruction.programId.toBase58() == SOLANA_SYSTEM_PROGRAM_ID.toBase58()) {
        const instructionId = lastInstruction.data.readUInt32LE(0);
        if (instructionId === SOLANA_SYSTEM_PROGRAM_TRANSFER_ID) {
            transactionMessage.instructions.splice(transactionMessage.instructions.length - 1);
        }
    }
    const swapPrepareIx = await createSwapPrepareInstruction(currentSymbol, owner, HS.network);
    let swapCompletedIx = await createSwapCompleteInstruction(currentSymbol, owner, HS.network);
    let priorityFee = Number(currentSymbol.priorityFee);
    await deleteTransactionGasInstruction(transactionMessage.instructions);
    const temTransactionInstructions = [...transactionMessage.instructions];
    if (currentSymbol.tradeType != 0) {
        transactionMessage.instructions.splice(0, 0, swapPrepareIx);
        transactionMessage.instructions.push(swapCompletedIx);
        if (priorityFee >= TIP_MINI_IN_PRIORITY) {
            const gmgnTipIx = await createTipTransferInstruction(owner.publicKey, GMGN_PRIORITY_FEE_Collect_ID, BigInt(priorityFee) * 2n / 3n);
            transactionMessage.instructions.push(gmgnTipIx);
            priorityFee = Number(BigInt(priorityFee) / 3n);
        }
        const [addPriorityLimitIx, addPriorityPriceIx] = await priorityFeeInstruction(DEFAULD_SOLANA_SWAP_LIMIT, priorityFee);
        transactionMessage.instructions.splice(0, 0, addPriorityLimitIx);
        transactionMessage.instructions.splice(0, 0, addPriorityPriceIx);
        let swapTx;
        try {
            swapTx = await versionedTra(transactionMessage.instructions, owner, recentBlockhash, addressLookupTableAccounts);
            if (swapTx) {
                const swapTxSer = swapTx.serialize();
                const swapTxBytesSize = swapTxSer.length;
                console.log("交易串字节长度 = " + swapTxBytesSize);
                if (swapTxBytesSize < SOLANA_MAX_TX_SERIALIZE_SIGN) {
                    return [swapTx];
                }
            }
        }
        catch { }
    }
    currentSymbol.tradeType = 0;
    swapCompletedIx = await createSwapCompleteInstruction(currentSymbol, owner, HS.network);
    const swapPrepareTx = await versionedTra([swapPrepareIx], owner, recentBlockhash, addressLookupTableAccounts);
    const swapTx = await versionedTra(temTransactionInstructions, owner, recentBlockhash, addressLookupTableAccounts);
    const swaCompletedTx = await versionedTra([swapCompletedIx], owner, recentBlockhash, addressLookupTableAccounts);
    const randomIndex = Math.floor(Math.random() * JITO_FEE_ACCOUNT.length);
    console.log("选中的jito tip地址", new PublicKey(JITO_FEE_ACCOUNT[randomIndex]).toBase58());
    const tipIx = await createTipTransferInstruction(owner.publicKey, new PublicKey(JITO_FEE_ACCOUNT[randomIndex]), BigInt(priorityFee));
    const [addPriorityLimitIx, addPriorityPriceIx] = await priorityFeeInstruction(DEFAULD_SOLANA_SWAP_LIMIT, DEFAULD_SOLANA_GAS_LIMIT);
    const tipTx = await versionedTra([addPriorityPriceIx, addPriorityLimitIx, tipIx], owner, recentBlockhash, addressLookupTableAccounts);
    return [
        tipTx,
        swapPrepareTx,
        swapTx,
        swaCompletedTx,
        swapTx
    ];
}
