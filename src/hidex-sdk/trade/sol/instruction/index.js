import { TransactionMessage, VersionedTransaction, AddressLookupTableAccount, PublicKey, } from "@solana/web3.js";
import { SUPPORT_CHANGE_PROGRAM_IDS, HIDEX_ADDRESS_LOOK_UP, SOLANA_SYSTEM_PROGRAM_ID, SOLANA_SYSTEM_PROGRAM_TRANSFER_ID, DEFAULT_SWAP_SOL_LAMPORTS, SOLANA_CREATE_ACCOUNT_WITH_SEED_ID, BASE_ACCOUNT_INIT_FEE, SUPPORT_CHANGE_INSTRUCTION_START_INDEXES, PUEM_INSTRUCTION_PREFIX, PUMP_PROGRAM_ID, GMGN_PRIORITY_FEE_Collect_ID, SOLANA_TX_SERIALIZE_SIGN, JITO_FEE_ACCOUNT, DEFAULD_SOLANA_SWAP_LIMIT, TIP_MINI_IN_PRIORITY, DEFAULT_SWAP_PUMP_LAMPORTS, SOLANA_MAX_TX_SERIALIZE_SIGN } from '../config';
import { createSwapCompleteInstruction, createSwapPrepareInstruction, createTipTransferInstruction, deleteTransactionGasInstruction, priorityFeeInstruction, versionedTra } from "./InstructionCreator";
export function resetInstructions(transactionMessage, newInputAmount, newOutputAmount) {
    for (let i = 0; i < transactionMessage.instructions.length; i++) {
        const tempInstruction = transactionMessage.instructions[i];
        const dataHex = tempInstruction.data.toString("hex");
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
        const dexProgramIndex = SUPPORT_CHANGE_PROGRAM_IDS.indexOf(tempInstruction.programId.toBase58());
        if (dexProgramIndex >= 0) {
            const beforeInput = dataHex.substring(SUPPORT_CHANGE_INSTRUCTION_START_INDEXES[dexProgramIndex], SUPPORT_CHANGE_INSTRUCTION_START_INDEXES[dexProgramIndex] + 16);
            const beforeInputHex = beforeInput.match(/.{2}/g)?.reverse().join("") || "";
            const bigIntBeforeInput = BigInt("0x" + beforeInputHex);
            console.log("修改前输入的代币数量 = " + bigIntBeforeInput);
            const beforeOutput = dataHex.substring(SUPPORT_CHANGE_INSTRUCTION_START_INDEXES[dexProgramIndex] + 16, SUPPORT_CHANGE_INSTRUCTION_START_INDEXES[dexProgramIndex] + 16 * 2);
            const beforeOutputHex = beforeOutput.match(/.{2}/g)?.reverse().join("") || "";
            const bigIntBeforeOutput = BigInt("0x" + beforeOutputHex);
            console.log("修改前输出的代币数量 = " + bigIntBeforeOutput);
            const swapInstructionBuffer = Buffer.alloc(8);
            swapInstructionBuffer.writeBigUInt64LE(newInputAmount);
            const newInputReverseHex = swapInstructionBuffer.toString("hex");
            console.log("修改后输入的代币数量 = " + newInputAmount);
            swapInstructionBuffer.writeBigUInt64LE(newOutputAmount);
            const newOutputReverseHex = swapInstructionBuffer.toString("hex");
            console.log("修改后输出的代币数量 = " + newOutputAmount);
            let replaceHex = newInputReverseHex.concat(newOutputReverseHex);
            if (tempInstruction.programId.toBase58() ==
                PUMP_PROGRAM_ID.toBase58() &&
                dataHex.startsWith(PUEM_INSTRUCTION_PREFIX)) {
                replaceHex = newOutputReverseHex.concat(newInputReverseHex);
            }
            const finalData = dataHex.slice(0, SUPPORT_CHANGE_INSTRUCTION_START_INDEXES[dexProgramIndex]) +
                replaceHex +
                dataHex.slice(SUPPORT_CHANGE_INSTRUCTION_START_INDEXES[dexProgramIndex] + 16 * 2);
            tempInstruction.data = Buffer.from(finalData, "hex");
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
export function isInstructionsSupportReset(transactionMessage) {
    for (let i = 0; i < transactionMessage.instructions.length; i++) {
        const transactionInstruction = transactionMessage.instructions[i];
        if (SUPPORT_CHANGE_PROGRAM_IDS.indexOf(transactionInstruction.programId.toBase58()) >= 0) {
            return true;
        }
    }
    return false;
}
export async function getTransactionsSignature(transactionMessage, addressLookupTableAccounts, recentBlockhash, currentSymbol, owner, HS) {
    transactionMessage.instructions.splice(transactionMessage.instructions.length - 1);
    const beforeMeessage = transactionMessage.compileToV0Message(addressLookupTableAccounts);
    const beforeTransaction = new VersionedTransaction(beforeMeessage);
    const serializedBeforeTransaction = beforeTransaction.serialize();
    const beforeTxSize = serializedBeforeTransaction.length;
    const swapPrepareIx = await createSwapPrepareInstruction(currentSymbol, owner, HS.network);
    const swapCompletedIx = await createSwapCompleteInstruction(currentSymbol, owner, HS.network);
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
        if (beforeTxSize < SOLANA_TX_SERIALIZE_SIGN) {
            const swapTx = await versionedTra(transactionMessage.instructions, owner, recentBlockhash, addressLookupTableAccounts);
            return [swapTx];
        }
        else {
            transactionMessage.instructions.splice(priorityFee >= TIP_MINI_IN_PRIORITY ? transactionMessage.instructions.length - 2 : transactionMessage.instructions.length - 1, 1);
            const swapTx = await versionedTra(transactionMessage.instructions, owner, recentBlockhash, addressLookupTableAccounts);
            const completeSwapTx = await versionedTra([swapCompletedIx], owner, recentBlockhash, addressLookupTableAccounts);
            return [
                swapTx,
                completeSwapTx
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
        const simulateTx = await versionedTra([swapPrepareIx, ...transactionMessage.instructions, swapCompletedIx, tipIx], owner, recentBlockhash, addressLookupTableAccounts);
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
