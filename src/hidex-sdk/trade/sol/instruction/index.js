import { TransactionMessage, VersionedTransaction, AddressLookupTableAccount, PublicKey } from '@solana/web3.js';
import { SOLANA_SYSTEM_PROGRAM_ID, SOLANA_SYSTEM_PROGRAM_TRANSFER_ID, SOLANA_CREATE_ACCOUNT_WITH_SEED_ID, JITO_FEE_ACCOUNT, SOLANA_MAX_TX_SERIALIZE_SIGN, NEED_CHANGE_SLIPPAGE_PROGRAM_IDS, SUPPORT_CHANGE_PROGRAM_IDS, PUMP_AMM_PROGRAM_ID, VERSION_TRANSACTION_PREFIX, PRE_PAID_EXPENSES, DEFAULD_SOLANA_GAS_LIMIT, COMMISSION_SOLANA_GAS_LIMIT, HIDEX_ADDRESS_LOOK_UP, BLOXROUTE, Trading_Service_Providers, PUMP_PROGRAM_ID } from '../config';
import { checkAccountCloseInstruction, createClaimInstruction, createEd25519ProgramIx, createMemoInstructionWithTxInfo, createTipTransferInstruction, createTradeNonceVerifyInstruction, createVersionTransaction, deleteTipCurrentInInstructions, deleteTransactionGasInstruction, getDexCommisionReceiverAndLamports, getInstructionAmounts, getInstructionReplaceDataHex, getTipAndPriorityByUserPriorityFee, getTradeNonce, getTransactionGasLimitUintsInInstruction, multiSignVersionedTraByPrivy, nomalVersionedTransaction, numberToLittleEndianHex, priorityFeeInstruction, setCreateAccountBySeedInstructionLamports, setTransferInstructionLamports, signVersionedTraByPrivy, versionedTra } from './InstructionCreator';
import { createMemoInstruction } from '@solana/spl-memo';
export function resetInstructions(currentSymbol, transactionMessage, newInputAmount, newOutputAmount) {
    console.log('传入的输出代币数量', newOutputAmount);
    console.log('传入的输入代币数量', newInputAmount);
    let transferInstructionIndex = -1;
    for (let i = 0; i < transactionMessage.instructions.length; i++) {
        const tempInstruction = transactionMessage.instructions[i];
        let dataHex = tempInstruction.data.toString('hex');
        let hasChange = false;
        if (tempInstruction.data.length == 0)
            continue;
        const instructionId = tempInstruction.data.readUint8();
        if (tempInstruction.programId.toBase58() == SOLANA_SYSTEM_PROGRAM_ID.toBase58() &&
            currentSymbol.isBuy &&
            i != transactionMessage.instructions.length - 1 &&
            i != transactionMessage.instructions.length - 2) {
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
                    console.log('增加滑点量后传入的输入代币数量', newInputAmount);
                    const availableLamports = BigInt(currentSymbol.solLamports) - BigInt(PRE_PAID_EXPENSES) - BigInt(currentSymbol.priorityFee);
                    console.log('当前用户余额', currentSymbol.solLamports);
                    console.log('可用于购买PUMP.amm的余额', availableLamports);
                    if (newInputAmount > availableLamports) {
                        newOutputAmount = (newOutputAmount * availableLamports) / newInputAmount;
                        console.log('余额不足，总量下移后购买的代币量', newOutputAmount);
                        newInputAmount = availableLamports;
                        console.log('余额不足，总量下移后消耗的sol', newInputAmount);
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
                    console.log('newOutputAmount', newOutputAmount);
                }
            }
            else {
                console.log('滑点修改前 changeSlippageData = ', dataHex);
                const beforeInputHex = dataHex
                    .slice(dataHex.length - 6)
                    .match(/.{2}/g)
                    ?.reverse()
                    .join('') || '';
                const bigIntBeforeInput = BigInt('0x' + beforeInputHex);
                console.log('修改前滑点值 = ', bigIntBeforeInput);
                const slippageChangeResult = numberToLittleEndianHex(Number(numerator), 3);
                dataHex = dataHex.slice(0, dataHex.length - 6) + slippageChangeResult;
                console.log('滑点指令后 tempInstruction = ', tempInstruction.data.toString('hex'));
            }
            console.log('滑点 = ' + currentSymbol.slipPersent);
            const swapInstructionBuffer = Buffer.alloc(8);
            swapInstructionBuffer.writeBigUInt64LE(newInputAmount);
            const newInputReverseHex = swapInstructionBuffer.toString('hex');
            console.log('计算滑点后输入的代币数量 = ' + newInputAmount);
            swapInstructionBuffer.writeBigUInt64LE(newOutputAmount);
            const newOutputReverseHex = swapInstructionBuffer.toString('hex');
            console.log('计算滑点后输出的代币数量 = ' + newOutputAmount);
            console.log('修改前data = ', tempInstruction.data.toString('hex'));
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
    console.log('addressLookupTableAccounts1', addressTables.length);
    addressTables.push(HIDEX_ADDRESS_LOOK_UP);
    const connection = HS.network.getProviderByChain(102);
    const mutiAccountInfo = await connection.getMultipleAccountsInfo(addressTables);
    const addressLookupTableAccounts = new Array(addressTables.length);
    for (let i = 0; i < mutiAccountInfo.length; i++) {
        const state = AddressLookupTableAccount.deserialize(mutiAccountInfo[i].data);
        for (let i = 0; i < state.addresses.length; i++) {
            if (JITO_FEE_ACCOUNT.indexOf(state.addresses[i].toBase58()) !== -1) {
                state.addresses[i] = new PublicKey('So11111111111111111111111111111111111111112');
            }
        }
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
    console.log('addressLookupTableAccounts2', addressLookupTableAccounts.length);
    const validAddressLookupTableAccounts = [];
    const currentSlot = await connection.getSlot();
    for (let i = 0; i < addressLookupTableAccounts.length; i++) {
        if (currentSlot < addressLookupTableAccounts[i].state.deactivationSlot) {
            validAddressLookupTableAccounts.push(addressLookupTableAccounts[i]);
        }
    }
    console.log('validAddressLookupTableAccounts3', validAddressLookupTableAccounts.length);
    return { message: transactionMessage, addressesLookup: validAddressLookupTableAccounts };
}
export async function compileTransactionByAddressLookup(swapBase64Str, addressLookupTableAccounts, HS) {
    if (!swapBase64Str.startsWith(VERSION_TRANSACTION_PREFIX)) {
        throw new Error('This token type does not support transactions');
    }
    const swapTransactionBuf = Buffer.from(swapBase64Str, 'base64');
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    let messageTables = transaction.message.addressTableLookups;
    let isSame = true;
    for (let i = 0; i < messageTables.length; i++) {
        if (messageTables[i].accountKey.toBase58() != addressLookupTableAccounts[i].key.toBase58()) {
            console.log('两个地址映射不一致，重新获取', messageTables[i].accountKey.toBase58(), addressLookupTableAccounts[i].key.toBase58());
            isSame = false;
            break;
        }
    }
    if (!isSame) {
        console.log('两个地址映射不一致，重新获取');
        let compileInfo = await compileTransaction(swapBase64Str, HS);
        return { message: compileInfo.message, addressesLookup: compileInfo.addressesLookup };
    }
    else {
        const transactionMessage = TransactionMessage.decompile(transaction.message, {
            addressLookupTableAccounts: addressLookupTableAccounts
        });
        return { message: transactionMessage, addressesLookup: addressLookupTableAccounts };
    }
}
export async function getAddressLookup(swapBase64Str, HS) {
    if (!swapBase64Str.startsWith(VERSION_TRANSACTION_PREFIX)) {
        throw new Error('This token type does not support transactions');
    }
    const swapTransactionBuf = Buffer.from(swapBase64Str, 'base64');
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    const addressTables = transaction.message.addressTableLookups.map((value) => {
        return value.accountKey;
    });
    console.log('addressLookupTableAccounts1', addressTables.length);
    addressTables.push(HIDEX_ADDRESS_LOOK_UP);
    const connection = HS.network.getProviderByChain(102);
    const mutiAccountInfo = await connection.getMultipleAccountsInfo(addressTables);
    const addressLookupTableAccounts = new Array(addressTables.length);
    for (let i = 0; i < mutiAccountInfo.length; i++) {
        const state = AddressLookupTableAccount.deserialize(mutiAccountInfo[i].data);
        for (let i = 0; i < state.addresses.length; i++) {
            if (JITO_FEE_ACCOUNT.indexOf(state.addresses[i].toBase58()) !== -1) {
                state.addresses[i] = new PublicKey('So11111111111111111111111111111111111111112');
            }
        }
        const lookUp = new AddressLookupTableAccount({
            key: addressTables[i],
            state: state
        });
        if (mutiAccountInfo[i].data.length != 0) {
            addressLookupTableAccounts[i] = lookUp;
        }
    }
    const validAddressLookupTableAccounts = [];
    const currentSlot = await connection.getSlot();
    for (let i = 0; i < addressLookupTableAccounts.length; i++) {
        if (currentSlot < addressLookupTableAccounts[i].state.deactivationSlot) {
            validAddressLookupTableAccounts.push(addressLookupTableAccounts[i]);
        }
    }
    console.log('validAddressLookupTableAccounts3', validAddressLookupTableAccounts.length);
    return { addressesLookup: validAddressLookupTableAccounts };
}
export function getActualLamports(currentSymbol, swapBase64Str, addressesLookup) {
    let validLamports = BigInt(currentSymbol.amountIn);
    if (!currentSymbol.isBuy) {
        return validLamports;
    }
    const swapTransactionBuf = Buffer.from(swapBase64Str, 'base64');
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    let isPump = false;
    const transactionMessage = TransactionMessage.decompile(transaction.message, {
        addressLookupTableAccounts: addressesLookup
    });
    for (let i = 0; i < transactionMessage.instructions.length; i++) {
        const tempInstruction = transactionMessage.instructions[i];
        const programId = tempInstruction.programId.toBase58();
        console.log('programId', programId);
        if (programId == PUMP_PROGRAM_ID.toBase58() || programId == PUMP_AMM_PROGRAM_ID.toBase58()) {
            isPump = true;
            break;
        }
    }
    if (isPump) {
        const precision = BigInt(10000);
        let numerator = BigInt(Math.round(currentSymbol.slipPersent * Number(precision)));
        let preLamports = validLamports + (validLamports * numerator) / precision;
        const availableLamports = BigInt(currentSymbol.solLamports) - BigInt(PRE_PAID_EXPENSES) - BigInt(currentSymbol.priorityFee);
        console.log('当前用户余额', currentSymbol.solLamports);
        console.log('可用于购买PUMP.amm的余额', availableLamports);
        if (preLamports > availableLamports) {
            validLamports = (availableLamports * BigInt(10)) / BigInt((1 + currentSymbol.slipPersent) * 10);
            console.log('余额不足，总量下移后消耗的sol', validLamports);
        }
        return validLamports;
    }
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
export async function getClaimSignature(signer, contentsHex, claimSignHex, recentBlockhash, wallet, connection) {
    try {
        const id = contentsHex.substring(contentsHex.length - 64);
        const idStr = Buffer.from(id, 'hex').toString();
        let memoStr = idStr + wallet.address;
        const memoInstruction = await createMemoInstruction(memoStr);
        const [addPriorityLimitIx, addPriorityPriceIx] = await priorityFeeInstruction(COMMISSION_SOLANA_GAS_LIMIT, DEFAULD_SOLANA_GAS_LIMIT);
        const ed25519ProgramIx = await createEd25519ProgramIx(signer, contentsHex, claimSignHex);
        const claimProgramIx = await createClaimInstruction(contentsHex, claimSignHex, wallet.address);
        const claimTx = await nomalVersionedTransaction(wallet, [ed25519ProgramIx, addPriorityLimitIx, addPriorityPriceIx, claimProgramIx, memoInstruction], new PublicKey(wallet.address), connection, recentBlockhash);
        return claimTx;
    }
    catch (error) {
        console.log('getClaimSignature===>', error);
    }
}
export async function getTransactionsSignature(transactionMessage, addressLookupTableAccounts, recentBlockhash, currentSymbol, owner, HS) {
    for (let i = 0; i < transactionMessage.instructions.length; i++) {
        const isDelete = await checkAccountCloseInstruction(currentSymbol, transactionMessage.instructions[i], owner, HS.network);
        if (isDelete) {
            transactionMessage.instructions.splice(i, 1);
            break;
        }
    }
    for (let i = transactionMessage.instructions.length - 1; i > transactionMessage.instructions.length - 3; i--) {
        const lastInstruction = transactionMessage.instructions[i];
        if (lastInstruction.programId.toBase58() == SOLANA_SYSTEM_PROGRAM_ID.toBase58()) {
            const instructionId = lastInstruction.data.readUInt32LE(0);
            if (instructionId === SOLANA_SYSTEM_PROGRAM_TRANSFER_ID) {
                console.log('SOLANA_SYSTEM_PROGRAM_TRANSFER_ID');
                transactionMessage.instructions.splice(transactionMessage.instructions.length - 1);
            }
        }
    }
    let priorityFee = Number(currentSymbol.priorityFee);
    const gasLimitInIx = getTransactionGasLimitUintsInInstruction(transactionMessage.instructions);
    console.log('gasLimitInIX', gasLimitInIx);
    await deleteTransactionGasInstruction(transactionMessage.instructions);
    const tempInstructions = [...transactionMessage.instructions];
    const memoIx = createMemoInstructionWithTxInfo(currentSymbol);
    transactionMessage.instructions.push(memoIx);
    const { swap_pda, commissionAmount } = await getDexCommisionReceiverAndLamports(currentSymbol);
    const commissionTransferIx = await createTipTransferInstruction(owner.publicKey, swap_pda, BigInt(commissionAmount));
    transactionMessage.instructions.push(commissionTransferIx);
    const tipIx = await createTipTransferInstruction(owner.publicKey, BLOXROUTE, BigInt(priorityFee * 0.5));
    transactionMessage.instructions.push(tipIx);
    const [addPriorityLimitIx, addPriorityPriceIx] = await priorityFeeInstruction(gasLimitInIx * 1.5, priorityFee * 0.5);
    transactionMessage.instructions.splice(0, 0, addPriorityLimitIx);
    transactionMessage.instructions.splice(0, 0, addPriorityPriceIx);
    const swapTx = await versionedTra([...transactionMessage.instructions], owner, recentBlockhash, addressLookupTableAccounts);
    const swapTxSer = swapTx.serialize();
    const swapTxBytesSize = swapTxSer.length;
    console.log('交易串字节长度 = ' + swapTxBytesSize);
    if (swapTxBytesSize < SOLANA_MAX_TX_SERIALIZE_SIGN) {
        return [swapTx];
    }
    else {
        const [addPriorityLimitIx, addPriorityPriceIx] = await priorityFeeInstruction(gasLimitInIx, DEFAULD_SOLANA_GAS_LIMIT);
        const gasFeeTx = await versionedTra([addPriorityLimitIx, addPriorityPriceIx], owner, recentBlockhash, addressLookupTableAccounts);
        const swapTx = await versionedTra(tempInstructions, owner, recentBlockhash, addressLookupTableAccounts);
        const commissionTx = await versionedTra([commissionTransferIx, memoIx], owner, recentBlockhash, addressLookupTableAccounts);
        const tipIx = await createTipTransferInstruction(owner.publicKey, new PublicKey(BLOXROUTE), BigInt(currentSymbol.priorityFee));
        const tipTx = await versionedTra([tipIx], owner, recentBlockhash, []);
        return [gasFeeTx, swapTx, commissionTx, tipTx];
    }
}
export async function getOwnerTradeNonce(owner, HS) {
    return getTradeNonce(owner, HS.network);
}
export async function getTransactionsSignatureArray(transactionMessage, addressLookupTableAccounts, recentBlockhash, currentSymbol, wallet, connection, HS) {
    const gasLimitInIx = getTransactionGasLimitUintsInInstruction(transactionMessage.instructions);
    console.log('gasLimitInIx', gasLimitInIx);
    const ownerAddr = wallet.address;
    deleteTipCurrentInInstructions(transactionMessage);
    deleteTransactionGasInstruction(transactionMessage.instructions);
    let ownerPublicKey = new PublicKey(wallet.address);
    let priorityFee = Number(currentSymbol.priorityFee);
    const { tipAmount, priorityAmount } = getTipAndPriorityByUserPriorityFee(priorityFee);
    const [addPriorityLimitIx, addPriorityPriceIx] = await priorityFeeInstruction(gasLimitInIx * 1.2, priorityAmount);
    const timestamp = Math.floor(Date.now() / 1000);
    const createTradeNonceVerifyIx = await createTradeNonceVerifyInstruction(timestamp, ownerPublicKey, HS.network);
    const memoIx = createMemoInstructionWithTxInfo(currentSymbol);
    const { swap_pda, commissionAmount } = await getDexCommisionReceiverAndLamports(currentSymbol);
    const commissionTransferIx = await createTipTransferInstruction(ownerPublicKey, swap_pda, BigInt(commissionAmount));
    let signTxArray = [];
    let unSignTxArray = [];
    let isBundle = false;
    for (let i = 0; i < Trading_Service_Providers.length; i++) {
        const providerInstructions = [...transactionMessage.instructions];
        providerInstructions.push(memoIx);
        providerInstructions.push(commissionTransferIx);
        providerInstructions.push(createTradeNonceVerifyIx);
        const tipIx = await createTipTransferInstruction(ownerPublicKey, Trading_Service_Providers[i], BigInt(tipAmount));
        providerInstructions.push(tipIx);
        providerInstructions.splice(0, 0, addPriorityLimitIx);
        providerInstructions.splice(0, 0, addPriorityPriceIx);
        let unSignVersionTransaction = createVersionTransaction(providerInstructions, ownerAddr, recentBlockhash, addressLookupTableAccounts);
        let unSignTxLength = unSignVersionTransaction.serialize().length;
        if (unSignTxLength > SOLANA_MAX_TX_SERIALIZE_SIGN) {
            isBundle = true;
        }
        unSignTxArray.push(unSignVersionTransaction);
    }
    if (!isBundle && unSignTxArray.length == Trading_Service_Providers.length) {
        try {
            let timeBeforeSig0n = Date.now();
            let multiSignTransactions = await multiSignVersionedTraByPrivy(wallet, connection, unSignTxArray);
            console.log('签名耗时', Date.now() - timeBeforeSig0n);
            if (multiSignTransactions.length == Trading_Service_Providers.length) {
                signTxArray.push([multiSignTransactions[0]], [multiSignTransactions[1]]);
                return signTxArray;
            }
        }
        catch { }
    }
    unSignTxArray = [];
    signTxArray = [];
    const bundleInstructions = [...transactionMessage.instructions];
    let gasFeeTx = createVersionTransaction([addPriorityLimitIx, addPriorityPriceIx], ownerAddr, recentBlockhash, addressLookupTableAccounts);
    let swapTx = createVersionTransaction(bundleInstructions, ownerAddr, recentBlockhash, addressLookupTableAccounts);
    let commissionTx = createVersionTransaction([commissionTransferIx, memoIx, createTradeNonceVerifyIx], ownerAddr, recentBlockhash, addressLookupTableAccounts);
    unSignTxArray.push(gasFeeTx, swapTx, commissionTx);
    for (let i = 0; i < Trading_Service_Providers.length; i++) {
        const tipIx = await createTipTransferInstruction(ownerPublicKey, Trading_Service_Providers[i], BigInt(tipAmount));
        let tipTx = createVersionTransaction([tipIx], ownerAddr, recentBlockhash, []);
        unSignTxArray.push(tipTx);
    }
    let bundelTxCount = 5;
    if (unSignTxArray.length == bundelTxCount) {
        try {
            unSignTxArray.splice(unSignTxArray.length);
            let timeBeforeSign = Date.now();
            let bundleTransactions = await multiSignVersionedTraByPrivy(wallet, connection, unSignTxArray);
            console.log('签名耗时', Date.now() - timeBeforeSign);
            if (bundleTransactions.length == bundelTxCount) {
                let signTxArrayFormService1 = [];
                let signTxArrayFormService2 = [];
                for (let i = 0; i < bundelTxCount; i++) {
                    if (i == bundelTxCount - 2) {
                        signTxArrayFormService1.push(bundleTransactions[i]);
                    }
                    else if (i == bundelTxCount - 1) {
                        signTxArrayFormService2.push(bundleTransactions[i]);
                    }
                    else {
                        signTxArrayFormService1.push(bundleTransactions[i]);
                        signTxArrayFormService2.push(bundleTransactions[i]);
                    }
                }
                signTxArray.push(signTxArrayFormService1, signTxArrayFormService2);
                return signTxArray;
            }
            else {
                throw new Error('VersionTransactions length must be ' + bundelTxCount);
            }
        }
        catch (error) {
            console.log('error', error);
            throw error;
        }
    }
    else {
        throw new Error('VersionTransactions length must be ' + bundelTxCount);
    }
}
export async function getTransactionsSignatureArray2(transactionMessage, addressLookupTableAccounts, recentBlockhash, currentSymbol, wallet, connection, HS) {
    const gasLimitInIx = getTransactionGasLimitUintsInInstruction(transactionMessage.instructions);
    console.log('gasLimitInIx', gasLimitInIx);
    const ownerAddr = wallet.address;
    deleteTipCurrentInInstructions(transactionMessage);
    deleteTransactionGasInstruction(transactionMessage.instructions);
    let ownerPublicKey = new PublicKey(wallet.address);
    let priorityFee = Number(currentSymbol.priorityFee);
    const { tipAmount, priorityAmount } = getTipAndPriorityByUserPriorityFee(priorityFee);
    const [addPriorityLimitIx, addPriorityPriceIx] = await priorityFeeInstruction(gasLimitInIx * 1.2, priorityAmount);
    const timestamp = Math.floor(Date.now() / 1000);
    console.log('timestamp', timestamp);
    const createTradeNonceVerifyIx = await createTradeNonceVerifyInstruction(timestamp, ownerPublicKey, HS.network);
    const memoIx = createMemoInstructionWithTxInfo(currentSymbol);
    const { swap_pda, commissionAmount } = await getDexCommisionReceiverAndLamports(currentSymbol);
    const commissionTransferIx = await createTipTransferInstruction(ownerPublicKey, swap_pda, BigInt(commissionAmount));
    let swapTxArray = [];
    for (let i = 0; i < Trading_Service_Providers.length; i++) {
        const providerInstructions = [...transactionMessage.instructions];
        providerInstructions.push(memoIx);
        providerInstructions.push(commissionTransferIx);
        providerInstructions.push(createTradeNonceVerifyIx);
        const tipIx = await createTipTransferInstruction(ownerPublicKey, Trading_Service_Providers[i], BigInt(tipAmount));
        providerInstructions.push(tipIx);
        providerInstructions.splice(0, 0, addPriorityLimitIx);
        providerInstructions.splice(0, 0, addPriorityPriceIx);
        console.log('准备系列化');
        let swapTxSer;
        let swapTxBytesSize = 0;
        let swapTx;
        try {
            let unSignVersionTransaction = createVersionTransaction(providerInstructions, ownerAddr, recentBlockhash, addressLookupTableAccounts);
            swapTx = await signVersionedTraByPrivy(wallet, connection, [unSignVersionTransaction]);
            swapTxSer = swapTx.serialize();
            swapTxBytesSize = swapTxSer.length;
        }
        catch { }
        console.log('交易串字节长度 = ' + swapTxBytesSize);
        if (swapTx && swapTxBytesSize > 0 && swapTxBytesSize < SOLANA_MAX_TX_SERIALIZE_SIGN) {
            swapTxArray.push([swapTx]);
        }
        else {
            console.log('进入大指令');
            const bundleInstructions = [...transactionMessage.instructions];
            let gasFeeTx = createVersionTransaction([addPriorityLimitIx, addPriorityPriceIx], ownerAddr, recentBlockhash, addressLookupTableAccounts);
            let swapTx = createVersionTransaction(bundleInstructions, ownerAddr, recentBlockhash, addressLookupTableAccounts);
            let commissionTx = createVersionTransaction([commissionTransferIx, memoIx, createTradeNonceVerifyIx], ownerAddr, recentBlockhash, addressLookupTableAccounts);
            const tipIx = await createTipTransferInstruction(ownerPublicKey, Trading_Service_Providers[i], BigInt(tipAmount));
            let tipTx = createVersionTransaction([tipIx], ownerAddr, recentBlockhash, []);
            let bundleTransactions = await multiSignVersionedTraByPrivy(wallet, connection, [gasFeeTx, swapTx, commissionTx, tipTx]);
            swapTxArray.push(bundleTransactions);
        }
    }
    return swapTxArray;
}
