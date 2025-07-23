import * as anchor from '@project-serum/anchor';
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { ComputeBudgetProgram, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import abis from '../../../common/abis';
import CustomWallet from '../../../wallet/custom';
import { sTokenAddress, zero } from '../../../common/config';
import { AssociateTokenProgram, BASE_ACCOUNT_INIT_FEE, JUPITER_PROGRAM_ID, PROGRAMID, PUEM_INSTRUCTION_PREFIX, PUMP_AMM_PROGRAM_ID, PUMP_PROGRAM_ID, SEED_DATA, SEED_NONCE, SEED_SWAP, SEED_TRADE, SEED_TRADE_NONCE, SOLANA_SYSTEM_PROGRAM_ID, SOLANA_SYSTEM_PROGRAM_TRANSFER_ID, SUPPORT_CHANGE_PROGRAM_IDS, TOKEN_PROGRAM_OWNS } from '../config';
import { createMemoInstruction } from '@solana/spl-memo';
export const isBuy = (currentSymbol) => {
    return !!currentSymbol.isBuy;
};
export function initAnchor(owner, network) {
    const connection = network.getProviderByChain(102);
    const wallet = new CustomWallet(owner);
    const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
    anchor.setProvider(provider);
}
export async function information(currentSymbol, owner, network) {
    initAnchor(owner, network);
    const programId = new PublicKey(PROGRAMID());
    const program = new anchor.Program(abis.solanaIDL, programId);
    const [data_pda] = await PublicKey.findProgramAddress([Buffer.from(SEED_DATA)], programId);
    const [swap_pda, bump2] = await PublicKey.findProgramAddress([Buffer.from(SEED_SWAP)], programId);
    const [trade_config_pda, bump3] = await PublicKey.findProgramAddress([Buffer.from(SEED_TRADE)], programId);
    const tokenInMint = new PublicKey(currentSymbol.in.address);
    const tokenOutMint = new PublicKey(currentSymbol.out.address);
    const associateTokenProgram = new PublicKey(AssociateTokenProgram);
    let inviterPublic = currentSymbol.inviter;
    if (currentSymbol.inviter === zero || !currentSymbol.inviter) {
        inviterPublic = swap_pda;
    }
    else {
        inviterPublic = new PublicKey(currentSymbol.inviter);
    }
    const amount = new anchor.BN(currentSymbol.amountIn);
    let userAtaAccount;
    if (currentSymbol.TOKEN_2022) {
        userAtaAccount = await getAssociatedTokenAddress(currentSymbol.isBuy ? tokenOutMint : tokenInMint, owner.publicKey, false, TOKEN_2022_PROGRAM_ID);
        console.log('userAtaAccount1 = ' + userAtaAccount);
    }
    else {
        userAtaAccount = await getAssociatedTokenAddress(currentSymbol.isBuy ? tokenOutMint : tokenInMint, owner.publicKey, false);
        console.log('userAtaAccount2 = ' + userAtaAccount);
    }
    const wSol = new PublicKey(sTokenAddress);
    const swapWsolPdaAta = await getAssociatedTokenAddress(wSol, swap_pda, true);
    const userwSolAta = await getAssociatedTokenAddress(wSol, owner.publicKey, false);
    console.log('userwSolAta = ' + userwSolAta.toBase58());
    console.log('wSol = ' + wSol.toBase58());
    const info = {
        program,
        dataPda: data_pda,
        swapPda: swap_pda,
        tradePda: trade_config_pda,
        bump2,
        bump3,
        associateTokenProgram,
        tokenOutMint,
        tokenInMint,
        amount,
        userAtaAccount,
        inviterPublic,
        wSol,
        swapWsolPdaAta,
        userwSolAta
    };
    return info;
}
export async function priorityFeeInstruction(limit, fee) {
    const addPriorityLimit = ComputeBudgetProgram.setComputeUnitLimit({
        units: limit
    });
    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: Math.floor((fee * Math.pow(10, 6)) / limit)
    });
    return [addPriorityLimit, addPriorityFee];
}
export async function versionedTra(instructions, owner, latestBlockhash, addressLookupTableAccounts) {
    const message = new TransactionMessage({
        payerKey: owner.publicKey,
        recentBlockhash: latestBlockhash,
        instructions
    }).compileToV0Message(addressLookupTableAccounts);
    const versionedTx = new VersionedTransaction(message);
    versionedTx.sign([owner]);
    return versionedTx;
}
export function createVersionTransaction(instructions, ownerAddress, latestBlockhash, addressLookupTableAccounts) {
    const message = new TransactionMessage({
        payerKey: new PublicKey(ownerAddress),
        recentBlockhash: latestBlockhash,
        instructions
    }).compileToV0Message(addressLookupTableAccounts);
    return new VersionedTransaction(message);
}
export async function multiSignVersionedTraByPrivy(wallet, transactions) {
    try {
        const signedVersionTransactions = await wallet.signAllTransactions(transactions);
        return signedVersionTransactions;
    }
    catch (error) {
        console.log('Privy SignTransaction sign error', error);
        throw error;
    }
}
export async function signVersionedTraByPrivy(wallet, transactions) {
    try {
        const signedVersionTransaction = await wallet.signTransaction(transactions[0]);
        console.log('Transaction signed successfully', signedVersionTransaction);
        return signedVersionTransaction;
    }
    catch (error) {
        console.log('Privy SignTransaction sign error', error);
        throw error;
    }
}
export async function nomalVersionedTransaction(instructions, owner, latestBlockhash) {
    const message = new TransactionMessage({
        payerKey: owner.publicKey,
        recentBlockhash: latestBlockhash,
        instructions
    }).compileToV0Message();
    const versionedTx = new VersionedTransaction(message);
    versionedTx.sign([owner]);
    return versionedTx;
}
export function getTotalFee(currentSymbol) {
    const priorityFee = currentSymbol.priorityFee || 0;
    let bribeFee = currentSymbol.bribeFee || 0;
    const fee = Math.floor(Number(priorityFee) + Number(bribeFee));
    if (currentSymbol.tradeType === 3) {
        const currentFee = fee;
        const total = BigInt(Math.floor(currentFee)) + BigInt(5000);
        console.log('Gmgn -> totalFee', total.toString());
        return total.toString();
    }
    const total = BigInt(Math.floor(fee)) + BigInt(5000 * 4);
    return total.toString();
}
export async function deleteTransactionGasInstruction(instructions) {
    let indexToDelete = 0;
    while (indexToDelete >= 0) {
        indexToDelete = -1;
        for (let i = 0; i < instructions.length; i++) {
            const txIx = instructions[i];
            if (txIx.programId.toBase58() == ComputeBudgetProgram.programId.toBase58()) {
                indexToDelete = i;
                instructions.splice(i, 1);
                break;
            }
        }
    }
}
export function getTransactionGasLimitUintsInInstruction(instructions) {
    console.log('指令长度', instructions.length);
    let gaslimit = 0;
    for (let i = 0; i < instructions.length; i++) {
        const txIx = instructions[i];
        if (txIx.programId.toBase58() == ComputeBudgetProgram.programId.toBase58()) {
            if (txIx.data[0] === 0x02) {
                const last8Bytes = txIx.data.slice(1);
                gaslimit = last8Bytes.readInt32LE(0);
                break;
            }
        }
    }
    return gaslimit;
}
export function isParameterValid(currentSymbol) {
    const lamportsBefore = new anchor.BN(currentSymbol.solLamports);
    const wsolAtaAmountBefore = new anchor.BN(currentSymbol.userwsolAtaAmount);
    const userWsolAtaLamports = new anchor.BN(currentSymbol.userWsolAtaLamports);
    const tokenAtaLamports = new anchor.BN(currentSymbol.tokenAtaLamports);
    console.log('lamportsBefore', currentSymbol.solLamports);
    console.log('wsolAtaAmountBefore', currentSymbol.userwsolAtaAmount);
    console.log('userWsolAtaLamports', currentSymbol.userWsolAtaLamports);
    console.log('tokenAtaLamports', currentSymbol.tokenAtaLamports);
    if (lamportsBefore < 0 || wsolAtaAmountBefore < 0 || userWsolAtaLamports < 0 || tokenAtaLamports < 0) {
        return false;
    }
}
export async function createSwapPrepareInstruction(currentSymbol, owner, network) {
    if (currentSymbol.isBuy) {
        return createBuySwapPrepareInstruction(currentSymbol, owner, network);
    }
    else {
        return createSaleSwapPrepareInstruction(currentSymbol, owner, network);
    }
}
export async function createSimpleSwapCompleteInstruction(currentSymbol, owner, network, gasFee) {
    if (currentSymbol.isBuy) {
        return createSimpleBuySwapCompletedInstruction(currentSymbol, owner, network, gasFee);
    }
    else {
        return createSimpleSaleSwapCompletedInstruction(currentSymbol, owner, network, gasFee);
    }
}
export async function createSwapCompleteInstruction(currentSymbol, owner, network) {
    if (currentSymbol.isBuy) {
        return createBuySwapCompletedInstruction(currentSymbol, owner, network);
    }
    else {
        return createSaleSwapCompletedInstruction(currentSymbol, owner, network);
    }
}
export async function createBuySwapPrepareInstruction(currentSymbol, owner, network) {
    const { program, tradePda, userAtaAccount, userwSolAta } = await information(currentSymbol, owner, network);
    console.log('tradePda = ' + tradePda.toBase58());
    return program.methods
        .buySwapPrepare()
        .accounts({
        tradeConfigPda: tradePda,
        userTokenAtaAccount: userAtaAccount,
        userWsolAtaAccount: userwSolAta,
        user: owner.publicKey
    })
        .instruction();
}
export async function createBuySwapCompletedInstruction(currentSymbol, owner, network) {
    const { program, dataPda, swapPda, tradePda, userAtaAccount, userwSolAta, inviterPublic } = await information(currentSymbol, owner, network);
    const type = new anchor.BN(currentSymbol.isPump ? 2 : 1);
    const dexCommissionRateBN = new anchor.BN(currentSymbol.feeRate);
    const inviterCommissionRateBN = new anchor.BN((currentSymbol.commissionRate || 0) * 10000);
    const tradeType = new anchor.BN(currentSymbol.tradeType > 0 ? 0 : 1);
    return program.methods
        .buySwapCompleted(tradeType, type, dexCommissionRateBN, inviterCommissionRateBN)
        .accounts({
        swapPda: swapPda,
        configPda: dataPda,
        tradeConfigPda: tradePda,
        user: owner.publicKey,
        userAtaAccount: userAtaAccount,
        userWsolAtaAccount: userwSolAta,
        inviter: inviterPublic,
        associateTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
    })
        .instruction();
}
export async function createSaleSwapPrepareInstruction(currentSymbol, owner, network) {
    const { program, tradePda, userAtaAccount, userwSolAta } = await information(currentSymbol, owner, network);
    return program.methods
        .saleSwapPrepare()
        .accounts({
        tradeConfigPda: tradePda,
        userWsolAtaAccount: userwSolAta,
        user: owner.publicKey,
        userAtaAccount: userAtaAccount
    })
        .instruction();
}
export async function createClaimInstruction(contents, signatrue, owner, network) {
    initAnchor(owner, network);
    const programId = new PublicKey(PROGRAMID());
    const program = new anchor.Program(abis.solanaIDL, programId);
    const [data_pda] = await PublicKey.findProgramAddress([Buffer.from(SEED_DATA)], programId);
    const [swap_pda, bump2] = await PublicKey.findProgramAddress([Buffer.from(SEED_SWAP)], programId);
    const [nonce_data] = await PublicKey.findProgramAddress([Buffer.from(SEED_NONCE)], programId);
    const contentBytes = Buffer.from(contents, 'hex');
    const signatrueBytes = Buffer.from(signatrue, 'hex');
    return program.methods
        .claimCommission(bump2, contentBytes, Array.from(signatrueBytes))
        .accounts({
        swapPda: swap_pda,
        configPda: data_pda,
        noncePda: nonce_data,
        user: owner.publicKey,
        ixSysvar: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        systemProgram: SystemProgram.programId
    })
        .instruction();
}
export async function createTradeNonceVerifyInstruction(timeStamp, owner, network) {
    initAnchor(owner, network);
    const programId = new PublicKey(PROGRAMID());
    const program = new anchor.Program(abis.solanaIDL, programId);
    const [trade_nonce_account] = await PublicKey.findProgramAddress([Buffer.from(SEED_TRADE_NONCE), owner.toBuffer()], programId);
    return program.methods
        .tradeNonceVerify(new anchor.BN(timeStamp))
        .accounts({
        tradeNonceAccount: trade_nonce_account,
        signer: owner,
        systemProgram: SystemProgram.programId
    })
        .instruction();
}
export async function getTradeNonce(owner, network) {
    initAnchor(owner, network);
    const programId = new PublicKey(PROGRAMID());
    const program = new anchor.Program(abis.solanaIDL, programId);
    const [trade_nonce_account] = await PublicKey.findProgramAddress([Buffer.from(SEED_TRADE_NONCE), owner.publicKey.toBuffer()], programId);
    try {
        const tradeNonceData = await program.account.tradeNonce.fetch(trade_nonce_account);
        console.log('tradeNonceData:', tradeNonceData);
        if (tradeNonceData) {
            console.log('tradeNonceData:', tradeNonceData.tradeNonce.toNumber());
            return tradeNonceData.tradeNonce.toNumber();
        }
    }
    catch (error) {
        if (error instanceof Error && error.message.includes('Account does not exist')) {
            console.log('账户不存在:', trade_nonce_account.toBase58());
            return 0;
        }
    }
    return -1;
}
export async function createEd25519ProgramIx(signer, contents, signatrue) {
    const signerPub = new PublicKey(signer);
    const contentBytes = Buffer.from(contents, 'hex');
    const signatrueBytes = Buffer.from(signatrue, 'hex');
    return anchor.web3.Ed25519Program.createInstructionWithPublicKey({
        publicKey: signerPub.toBytes(),
        message: contentBytes,
        signature: signatrueBytes
    });
}
export async function createSaleSwapCompletedInstruction(currentSymbol, owner, network) {
    const { program, dataPda, swapPda, tradePda, bump3, amount, userAtaAccount, swapWsolPdaAta, wSol, userwSolAta, inviterPublic } = await information(currentSymbol, owner, network);
    const type = new anchor.BN(currentSymbol.isPump ? 2 : 1);
    const dexCommissionRateBN = new anchor.BN(currentSymbol.feeRate);
    const inviterCommissionRateBN = new anchor.BN((currentSymbol.commissionRate || 0) * 10000);
    const tradeType = new anchor.BN(currentSymbol.tradeType > 0 ? 0 : 1);
    return program.methods
        .saleSwapCompleted(bump3, amount, tradeType, type, dexCommissionRateBN, inviterCommissionRateBN)
        .accounts({
        swapPda: swapPda,
        configPda: dataPda,
        tradeConfigPda: tradePda,
        wsolMint: wSol,
        userWsolAtaAccount: userwSolAta,
        swapPdaWsolAtaAccount: swapWsolPdaAta,
        user: owner.publicKey,
        userAtaAccount: userAtaAccount,
        inviter: inviterPublic,
        associateTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
    })
        .instruction();
}
export async function createSimpleBuySwapCompletedInstruction(currentSymbol, owner, network, gasFee) {
    const { program, dataPda, swapPda, tradePda, userAtaAccount, userwSolAta, inviterPublic } = await information(currentSymbol, owner, network);
    const type = new anchor.BN(currentSymbol.isPump ? 2 : 1);
    const dexCommissionRateBN = new anchor.BN(currentSymbol.feeRate);
    const inviterCommissionRateBN = new anchor.BN((currentSymbol.commissionRate || 0) * 10000);
    const tradeType = new anchor.BN(currentSymbol.tradeType > 0 ? 0 : 1);
    const tokenBalance = new anchor.BN(currentSymbol.tokenBalance);
    const lamportsBefore = new anchor.BN(currentSymbol.solLamports);
    const userWsolAtaLamports = new anchor.BN(currentSymbol.userWsolAtaLamports);
    const tokenAtaLamports = new anchor.BN(currentSymbol.tokenAtaLamports);
    const fee = new anchor.BN(gasFee);
    return program.methods
        .buySwapCompletedSimple(tradeType, type, dexCommissionRateBN, inviterCommissionRateBN, lamportsBefore, userWsolAtaLamports, tokenBalance, tokenAtaLamports, fee)
        .accounts({
        swapPda: swapPda,
        configPda: dataPda,
        tradeConfigPda: tradePda,
        user: owner.publicKey,
        userAtaAccount: userAtaAccount,
        userWsolAtaAccount: userwSolAta,
        inviter: inviterPublic,
        associateTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
    })
        .instruction();
}
export async function createSimpleSaleSwapCompletedInstruction(currentSymbol, owner, network, gasFee) {
    const { program, tokenInMint, dataPda, swapPda, tradePda, bump3, amount, userAtaAccount, swapWsolPdaAta, wSol, userwSolAta, inviterPublic } = await information(currentSymbol, owner, network);
    const type = new anchor.BN(currentSymbol.isPump ? 2 : 1);
    const dexCommissionRateBN = new anchor.BN(currentSymbol.feeRate);
    const inviterCommissionRateBN = new anchor.BN((currentSymbol.commissionRate || 0) * 10000);
    const tradeType = new anchor.BN(currentSymbol.tradeType > 0 ? 0 : 1);
    const lamportsBefore = new anchor.BN(currentSymbol.solLamports);
    const wsolAtaAmountBefore = new anchor.BN(currentSymbol.userwsolAtaAmount);
    const userWsolAtaLamports = new anchor.BN(currentSymbol.userWsolAtaLamports);
    console.log('userWsolAtaLamports = ' + userWsolAtaLamports);
    const tokenAtaLamports = new anchor.BN(currentSymbol.tokenAtaLamports);
    const fee = new anchor.BN(gasFee);
    return program.methods
        .saleSwapCompletedSimple(bump3, amount, tradeType, type, dexCommissionRateBN, inviterCommissionRateBN, lamportsBefore, wsolAtaAmountBefore, userWsolAtaLamports, tokenAtaLamports, tokenInMint.toBase58(), fee)
        .accounts({
        swapPda: swapPda,
        configPda: dataPda,
        tradeConfigPda: tradePda,
        wsolMint: wSol,
        userWsolAtaAccount: userwSolAta,
        swapPdaWsolAtaAccount: swapWsolPdaAta,
        user: owner.publicKey,
        userAtaAccount: userAtaAccount,
        inviter: inviterPublic,
        associateTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
    })
        .instruction();
}
export async function createTipTransferInstruction(from, to, lamports) {
    return SystemProgram.transfer({
        fromPubkey: from,
        toPubkey: to,
        lamports: lamports
    });
}
export function numberToLittleEndianHex(num, byteLength) {
    if (num < 0 || num > 0xffffff) {
        throw new Error('Number must be between 0 and 16777215 for 3 bytes');
    }
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setUint32(0, num, true);
    const bytes = new Uint8Array(buffer).slice(0, byteLength);
    return Array.from(bytes)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
}
export async function checkAccountCloseInstruction(currentSymbol, instruction, owner, network) {
    if (currentSymbol.isBuy)
        return false;
    if (TOKEN_PROGRAM_OWNS.indexOf(instruction.programId.toBase58()) < 0)
        return false;
    if (BigInt(currentSymbol.tokenBalance || '0') == BigInt(currentSymbol.amountIn))
        return false;
    const { userAtaAccount } = await information(currentSymbol, owner, network);
    const deleteAta = instruction.keys[0].pubkey.toBase58();
    if (userAtaAccount.toBase58() == deleteAta) {
        console.log('deleteAta被删除');
        return true;
    }
    return false;
}
export function getInstructionAmounts(currentSymbol, instruction) {
    const dataHex = instruction.data.toString('hex');
    const programId = instruction.programId.toBase58();
    let beforeInput = '';
    let beforeOutput = '';
    const indexInSupportingArr = SUPPORT_CHANGE_PROGRAM_IDS.get(programId) ?? 0;
    if ((programId == PUMP_AMM_PROGRAM_ID.toBase58() || programId == PUMP_PROGRAM_ID.toBase58()) && currentSymbol.isBuy) {
        beforeInput = dataHex.substring(indexInSupportingArr + 16, indexInSupportingArr + 16 * 2);
        beforeOutput = dataHex.substring(indexInSupportingArr, indexInSupportingArr + 16);
    }
    else if (programId == JUPITER_PROGRAM_ID.toBase58()) {
        beforeInput = dataHex.substring(dataHex.length - indexInSupportingArr, dataHex.length - indexInSupportingArr + 16);
        beforeOutput = dataHex.substring(dataHex.length - indexInSupportingArr + 16, dataHex.length - indexInSupportingArr + 16 * 2);
    }
    else {
        beforeInput = dataHex.substring(indexInSupportingArr, indexInSupportingArr + 16);
        beforeOutput = dataHex.substring(indexInSupportingArr + 16, indexInSupportingArr + 16 * 2);
    }
    const beforeInputHex = beforeInput.match(/.{2}/g)?.reverse().join('') || '';
    const bigIntBeforeInput = BigInt('0x' + beforeInputHex);
    const beforeOutputHex = beforeOutput.match(/.{2}/g)?.reverse().join('') || '';
    const bigIntBeforeOutput = BigInt('0x' + beforeOutputHex);
    return { input: bigIntBeforeInput, output: bigIntBeforeOutput };
}
export function getInstructionReplaceDataHex(currentSymbol, programId, dataHex, inputHex, outputHex) {
    let replaceHex = inputHex.concat(outputHex);
    if ((programId == PUMP_PROGRAM_ID.toBase58() || programId == PUMP_AMM_PROGRAM_ID.toBase58()) && dataHex.startsWith(PUEM_INSTRUCTION_PREFIX) && currentSymbol.isBuy) {
        replaceHex = outputHex.concat(inputHex);
    }
    const indexInSupportingArr = SUPPORT_CHANGE_PROGRAM_IDS.get(programId) ?? 0;
    let finalData;
    if (programId == JUPITER_PROGRAM_ID.toBase58()) {
        finalData = dataHex.slice(0, dataHex.length - indexInSupportingArr) + replaceHex + dataHex.slice(dataHex.length - indexInSupportingArr + 16 * 2);
    }
    else {
        finalData = dataHex.slice(0, indexInSupportingArr) + replaceHex + dataHex.slice(indexInSupportingArr + 16 * 2);
    }
    return finalData;
}
export function setTransferInstructionLamports(instruction, dataHex, newLamports) {
    const instructionId = instruction.data.readUInt32LE(0);
    if (instructionId === SOLANA_SYSTEM_PROGRAM_TRANSFER_ID) {
        const buffer = Buffer.alloc(8);
        buffer.writeBigUInt64LE(newLamports + BigInt(1000), 0);
        const newInputAmountHex = buffer.toString('hex');
        const transferData = dataHex.slice(0, dataHex.length - 16) + newInputAmountHex;
        Buffer.from(transferData, 'hex');
        instruction.data = Buffer.from(transferData, 'hex');
        return true;
    }
    return false;
}
export function setCreateAccountBySeedInstructionLamports(preAmountIn, instruction, dataHex, newLamports) {
    const totalInitFeeBefore = BASE_ACCOUNT_INIT_FEE + BigInt(preAmountIn);
    const totalInitFeeBuffer = Buffer.alloc(8);
    totalInitFeeBuffer.writeBigUInt64LE(totalInitFeeBefore);
    const initFeeHex = totalInitFeeBuffer.toString('hex');
    const feeInitIndex = dataHex.indexOf(initFeeHex);
    if (feeInitIndex >= 0) {
        const totalInitFeeAfter = BASE_ACCOUNT_INIT_FEE + newLamports;
        const totalInitFeeBuffer = Buffer.alloc(8);
        totalInitFeeBuffer.writeBigUInt64LE(totalInitFeeAfter);
        const initFeeHexAfter = totalInitFeeBuffer.toString('hex');
        const createAccountData = dataHex.slice(0, feeInitIndex) + initFeeHexAfter + dataHex.slice(feeInitIndex + 16);
        instruction.data = Buffer.from(createAccountData, 'hex');
        return true;
    }
    return false;
}
export function createMemoInstructionWithTxInfo(currentSymbol) {
    const txType = currentSymbol.isBuy ? 1 : 2;
    let memoHex = `0x${txType.toString(16).padStart(2, '0').toUpperCase()}`;
    const swapInstructionBuffer = Buffer.alloc(8);
    swapInstructionBuffer.writeBigUInt64LE(BigInt(currentSymbol.amountIn));
    const newInputReverseHex = swapInstructionBuffer.toString('hex');
    swapInstructionBuffer.writeBigUInt64LE(BigInt(currentSymbol.amountOutMin));
    const newOutputReverseHex = swapInstructionBuffer.toString('hex');
    const tokenAddr = currentSymbol.isBuy ? currentSymbol.out.address : currentSymbol.in.address;
    const memoInstruction = createMemoInstruction(memoHex + newInputReverseHex + newOutputReverseHex + tokenAddr);
    return memoInstruction;
}
export async function getDexCommisionReceiverAndLamports(currentSymbol) {
    const programId = new PublicKey(PROGRAMID());
    const [swap_pda] = await PublicKey.findProgramAddress([Buffer.from(SEED_SWAP)], programId);
    const realAmountIn = (Number(currentSymbol.amountIn) * 10000) / (10000 - currentSymbol.feeRate);
    const commissionAmount = currentSymbol.isBuy
        ? Math.floor((realAmountIn * currentSymbol.feeRate) / 10000)
        : Math.floor((Number(currentSymbol.amountOutMin) * currentSymbol.feeRate) / 10000);
    return { swap_pda, commissionAmount };
}
export async function deleteTipCurrentInInstructions(transactionMessage) {
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
}
export function getTipAndPriorityByUserPriorityFee(priorityFee) {
    let priorityAmount = 50000;
    let tipAmount = priorityFee - priorityAmount;
    return { tipAmount, priorityAmount };
}
