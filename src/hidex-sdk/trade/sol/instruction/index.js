import { TransactionMessage, VersionedTransaction, AddressLookupTableAccount, PublicKey, } from "@solana/web3.js";
import { SOLANA_SYSTEM_PROGRAM_ID, SOLANA_SYSTEM_PROGRAM_TRANSFER_ID, DEFAULT_SWAP_SOL_LAMPORTS, SOLANA_CREATE_ACCOUNT_WITH_SEED_ID, BASE_ACCOUNT_INIT_FEE, GMGN_PRIORITY_FEE_Collect_ID, JITO_FEE_ACCOUNT, DEFAULD_SOLANA_SWAP_LIMIT, TIP_MINI_IN_PRIORITY, DEFAULT_SWAP_PUMP_LAMPORTS, SOLANA_MAX_TX_SERIALIZE_SIGN, NEED_CHANGE_SLIPPAGE_PROGRAM_IDS, SUPPORT_CHANGE_PROGRAM_IDS, PUMP_AMM_PROGRAM_ID, PUMP_PROGRAM_ID, HIDEX_ADDRESS_LOOK_UP, DEFAULD_SOLANA_GAS_LIMIT, DEFAULD_BASE_GAS_FEE } from '../config';
import { checkAccountCloseInstruction, createSimpleSwapCompleteInstruction, createSwapCompleteInstruction, createSwapPrepareInstruction, createTipTransferInstruction, deleteTransactionGasInstruction, getInstructionAmounts, getInstructionReplaceDataHex, numberToLittleEndianHex, priorityFeeInstruction, versionedTra } from "./InstructionCreator";
export function resetInstructions(currentSymbol, transactionMessage, newInputAmount, newOutputAmount) {
    for (let i = 0; i < transactionMessage.instructions.length; i++) {
        const tempInstruction = transactionMessage.instructions[i];
        const dataHex = tempInstruction.data.toString("hex");
        console.log("programID = " + tempInstruction.programId.toBase58());
        const buffer = Buffer.alloc(8);
        buffer.writeBigUInt64LE(newInputAmount, 0);
        const newInputAmountHex = buffer.toString("hex");
        if (tempInstruction.programId.toBase58() == SOLANA_SYSTEM_PROGRAM_ID.toBase58()) {
            const instructionId = tempInstruction.data.readUInt32LE(0);
            if (instructionId === SOLANA_SYSTEM_PROGRAM_TRANSFER_ID) {
                const readBigUInt64LE = tempInstruction.data.readBigUInt64LE(4);
                if (DEFAULT_SWAP_SOL_LAMPORTS == readBigUInt64LE || DEFAULT_SWAP_PUMP_LAMPORTS == readBigUInt64LE) {
                    const transferData = dataHex.slice(0, dataHex.length - 16) + newInputAmountHex;
                    tempInstruction.data = Buffer.from(transferData, "hex");
                }
            }
            else if (instructionId === SOLANA_CREATE_ACCOUNT_WITH_SEED_ID) {
                const totalInitFeeBefore = BASE_ACCOUNT_INIT_FEE + DEFAULT_SWAP_SOL_LAMPORTS;
                const totalInitFeeBuffer = Buffer.alloc(8);
                totalInitFeeBuffer.writeBigUInt64LE(totalInitFeeBefore);
                const initFeeHex = totalInitFeeBuffer.toString("hex");
                const feeInitIndex = dataHex.indexOf(initFeeHex);
                console.log("feeInitIndex = " + feeInitIndex);
                if (feeInitIndex >= 0) {
                    const totalInitFeeAfter = BASE_ACCOUNT_INIT_FEE + newInputAmount;
                    totalInitFeeBuffer.writeBigUInt64LE(totalInitFeeAfter);
                    const initFeeHexAfter = totalInitFeeBuffer.toString("hex");
                    const createAccountData = dataHex.slice(0, feeInitIndex) +
                        initFeeHexAfter +
                        dataHex.slice(feeInitIndex + 16);
                    tempInstruction.data = Buffer.from(createAccountData, "hex");
                }
            }
        }
        const dexProgramIndex = SUPPORT_CHANGE_PROGRAM_IDS.get(tempInstruction.programId.toBase58()) ?? 0;
        if (dexProgramIndex > 0) {
            console.log("data = " + tempInstruction.data.toString("hex"));
            const amountsResult = getInstructionAmounts(currentSymbol, tempInstruction);
            console.log("修改前输入的代币数量 = " + amountsResult.input);
            console.log("修改前输出的代币数量 = " + amountsResult.output);
            console.log("传入的输入的代币数量 = " + newInputAmount);
            console.log("传入的输出的代币数量 = " + newOutputAmount);
            const precision = BigInt(10000);
            let numerator = BigInt(Math.round(currentSymbol.slipPersent * Number(precision)));
            if (NEED_CHANGE_SLIPPAGE_PROGRAM_IDS.indexOf(tempInstruction.programId.toBase58()) == -1) {
                newOutputAmount = newOutputAmount - (newOutputAmount * numerator / precision);
            }
            else {
                const slippageChangeResult = numberToLittleEndianHex(Number(numerator), 3);
                const changeSlippageData = dataHex.slice(0, dataHex.length - 6) + slippageChangeResult;
                tempInstruction.data = Buffer.from(changeSlippageData, "hex");
            }
            console.log("滑点 = " + currentSymbol.slipPersent);
            const swapInstructionBuffer = Buffer.alloc(8);
            swapInstructionBuffer.writeBigUInt64LE(newInputAmount);
            const newInputReverseHex = swapInstructionBuffer.toString("hex");
            console.log("计算滑点后输入的代币数量 = " + newInputAmount);
            swapInstructionBuffer.writeBigUInt64LE(newOutputAmount);
            const newOutputReverseHex = swapInstructionBuffer.toString("hex");
            console.log("计算滑点后输出的代币数量 = " + newOutputAmount);
            let finalData = getInstructionReplaceDataHex(currentSymbol, tempInstruction.programId.toBase58(), dataHex, newInputReverseHex, newOutputReverseHex);
            console.log("finalData = " + finalData);
            tempInstruction.data = Buffer.from(finalData, "hex");
            console.log("data3 = " + tempInstruction.data.toString("hex"));
        }
    }
    return transactionMessage;
}
export async function compileTransaction(swapBase64Str, HS) {
    const swapTransactionBuf = Buffer.from(swapBase64Str, "base64");
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    const addressTables = transaction.message.addressTableLookups.map((value) => {
        return value.accountKey;
    });
    addressTables.push(HIDEX_ADDRESS_LOOK_UP);
    const connection = HS.network.getProviderByChain(102);
    const mutiAccountInfo = await connection.getMultipleAccountsInfo(addressTables);
    const addressLookupTableAccounts = new Array(addressTables.length);
    for (let i = 0; i < mutiAccountInfo.length; i++) {
        const lookUp = new AddressLookupTableAccount({
            key: addressTables[i],
            state: AddressLookupTableAccount.deserialize(mutiAccountInfo[i].data),
        });
        if (mutiAccountInfo[i].data.length != 0) {
            addressLookupTableAccounts[i] = lookUp;
        }
    }
    const transactionMessage = TransactionMessage.decompile(transaction.message, {
        addressLookupTableAccounts: addressLookupTableAccounts
    });
    return { message: transactionMessage, addressesLookup: addressLookupTableAccounts };
}
export function isInstructionsSupportReset(transactionMessage, currentSymbol) {
    for (let i = 0; i < transactionMessage.instructions.length; i++) {
        const tempInstruction = transactionMessage.instructions[i];
        const programId = tempInstruction.programId.toBase58();
        console.log("********************************************************************************");
        const dexProgramIndex = SUPPORT_CHANGE_PROGRAM_IDS.get(programId) ?? 0;
        if (dexProgramIndex > 0) {
            console.log("dexId", programId);
            console.log("data", tempInstruction.data.toString("hex"));
            const amounts = getInstructionAmounts(currentSymbol, tempInstruction);
            console.log("检测指令中输入的代币数量 = " + amounts.input);
            console.log("检测指令中输出的代币数量 = " + amounts.output);
            console.log("检测指令中传入的输入的代币数量 = " + BigInt(currentSymbol.preAmountIn));
            console.log("检测指令中传入的输出的代币数量 = " + BigInt(currentSymbol.preAmountOut));
            let preAmountInBigInt = BigInt(currentSymbol.preAmountIn);
            let preAmountOutBigInt = BigInt(currentSymbol.preAmountOut);
            if (programId != PUMP_AMM_PROGRAM_ID.toBase58() && programId != PUMP_PROGRAM_ID.toBase58()) {
                if (amounts.input == preAmountInBigInt && amounts.output == preAmountOutBigInt) {
                    console.log("买入指令检测成功 = " + amounts.input);
                    return true;
                }
            }
            else {
                if (amounts.input == preAmountInBigInt || amounts.output == preAmountOutBigInt) {
                    console.log("买入指令检测成功 = " + amounts.input);
                    return true;
                }
            }
        }
    }
    return false;
}
export async function getTransactionsSignature(transactionMessage, addressLookupTableAccounts, recentBlockhash, currentSymbol, owner, HS) {
    console.log("getTransactionsSignature.instruction1 = " + transactionMessage.instructions.length);
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
    console.log("getTransactionsSignature.instruction12= " + transactionMessage.instructions.length);
    transactionMessage.instructions.splice(transactionMessage.instructions.length - 1);
    console.log("getTransactionsSignature.instruction13= " + transactionMessage.instructions.length);
    const swapPrepareIx = await createSwapPrepareInstruction(currentSymbol, owner, HS.network);
    console.log("getTransactionsSignature.instruction14= " + transactionMessage.instructions.length);
    const swapCompletedIx = await createSwapCompleteInstruction(currentSymbol, owner, HS.network);
    console.log("getTransactionsSignature.instruction15= " + transactionMessage.instructions.length);
    let priorityFee = Number(currentSymbol.priorityFee);
    deleteTransactionGasInstruction(transactionMessage.instructions);
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
        const swapTx = await versionedTra(transactionMessage.instructions, owner, recentBlockhash, addressLookupTableAccounts);
        const swapTxSer = swapTx.serialize();
        const swapTxBytesSize = swapTxSer.length;
        console.log("交易串字节长度 = " + swapTxBytesSize);
        if (swapTxBytesSize < SOLANA_MAX_TX_SERIALIZE_SIGN) {
            return [swapTx];
        }
        else {
            transactionMessage.instructions.splice(2, 1);
            transactionMessage.instructions.splice(priorityFee >= TIP_MINI_IN_PRIORITY ? transactionMessage.instructions.length - 2 : transactionMessage.instructions.length - 1, 1);
            const swapTx = await versionedTra(transactionMessage.instructions, owner, recentBlockhash, addressLookupTableAccounts);
            const swapTxSer = swapTx.serialize();
            const swapTxBytesSize = swapTxSer.length;
            console.log("交易串删除指令后的字节长度 = " + swapTxBytesSize);
            const [addPriorityLimitIx, addPriorityPriceIx] = await priorityFeeInstruction(DEFAULD_SOLANA_SWAP_LIMIT, DEFAULD_SOLANA_GAS_LIMIT);
            const simpleSwapCompletedIx = await createSimpleSwapCompleteInstruction(currentSymbol, owner, HS.network, Number(currentSymbol.priorityFee) + DEFAULD_SOLANA_GAS_LIMIT + 2 * DEFAULD_BASE_GAS_FEE);
            const simpleCompleteSwapTx = await versionedTra([addPriorityPriceIx, addPriorityLimitIx, simpleSwapCompletedIx], owner, recentBlockhash, addressLookupTableAccounts);
            console.log("交易串删除指令后的字节长度 = " + Buffer.from(simpleCompleteSwapTx.serialize()).toString("base64"));
            return [
                swapTx,
                simpleCompleteSwapTx
            ];
        }
    }
    else {
        const swapPrepareTx = await versionedTra([swapPrepareIx], owner, recentBlockhash, addressLookupTableAccounts);
        const swapTx = await versionedTra(transactionMessage.instructions, owner, recentBlockhash, addressLookupTableAccounts);
        const swaCompletedTx = await versionedTra([swapCompletedIx], owner, recentBlockhash, addressLookupTableAccounts);
        const randomIndex = Math.floor(Math.random() * JITO_FEE_ACCOUNT.length);
        const tipIx = await createTipTransferInstruction(owner.publicKey, new PublicKey(JITO_FEE_ACCOUNT[randomIndex]), BigInt(priorityFee));
        const tipTx = await versionedTra([tipIx], owner, recentBlockhash, addressLookupTableAccounts);
        const simulateTx = await versionedTra([...transactionMessage.instructions, swapCompletedIx, tipIx], owner, recentBlockhash, addressLookupTableAccounts);
        const txArray = [
            tipTx,
            swapPrepareTx,
            swapTx,
            swaCompletedTx
        ];
        if (simulateTx.serialize().length < SOLANA_MAX_TX_SERIALIZE_SIGN) {
            txArray.push(simulateTx);
        }
        return txArray;
    }
}
