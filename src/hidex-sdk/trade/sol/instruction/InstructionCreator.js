import * as anchor from '@project-serum/anchor';
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { ComputeBudgetProgram, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import abis from '../../../common/abis';
import CustomWallet from '../../../wallet/custom';
import { sTokenAddress, zero } from '../../../common/config';
import { AssociateTokenProgram, JUPITER_PROGRAM_ID, PROGRAMID, PUEM_INSTRUCTION_PREFIX, PUMP_AMM_PROGRAM_ID, PUMP_PROGRAM_ID, SEED_DATA, SEED_SWAP, SEED_TRADE, SUPPORT_CHANGE_PROGRAM_IDS, TOKEN_PROGRAM_OWNS } from '../config';
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
        console.log("userAtaAccount1 = " + userAtaAccount);
    }
    else {
        userAtaAccount = await getAssociatedTokenAddress(currentSymbol.isBuy ? tokenOutMint : tokenInMint, owner.publicKey, false);
        console.log("userAtaAccount2 = " + userAtaAccount);
    }
    const wSol = new PublicKey(sTokenAddress);
    const swapWsolPdaAta = await getAssociatedTokenAddress(wSol, swap_pda, true);
    const userwSolAta = await getAssociatedTokenAddress(wSol, owner.publicKey, false);
    console.log("userwSolAta = " + userwSolAta.toBase58());
    console.log("wSol = " + wSol.toBase58());
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
        userwSolAta,
    };
    return info;
}
export async function priorityFeeInstruction(limit, fee) {
    const addPriorityLimit = ComputeBudgetProgram.setComputeUnitLimit({
        units: limit,
    });
    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: Math.floor(fee * Math.pow(10, 6) / limit),
    });
    return [addPriorityLimit, addPriorityFee];
}
export async function versionedTra(instructions, owner, latestBlockhash, addressLookupTableAccounts) {
    const message = new TransactionMessage({
        payerKey: owner.publicKey,
        recentBlockhash: latestBlockhash,
        instructions,
    }).compileToV0Message(addressLookupTableAccounts);
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
export function deleteTransactionGasInstruction(instructions) {
    let countToDelete = 0;
    for (let i = 0; i < instructions.length; i++) {
        const txIx = instructions[i];
        if (txIx.programId.toBase58() == ComputeBudgetProgram.programId.toBase58()) {
            countToDelete++;
        }
    }
    instructions.splice(0, countToDelete);
}
export function isParameterValid(currentSymbol) {
    const lamportsBefore = new anchor.BN(currentSymbol.solLamports);
    const wsolAtaAmountBefore = new anchor.BN(currentSymbol.userwsolAtaAmount);
    const userWsolAtaLamports = new anchor.BN(currentSymbol.userWsolAtaLamports);
    const tokenAtaLamports = new anchor.BN(currentSymbol.tokenAtaLamports);
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
    console.log("tradePda = " + tradePda.toBase58());
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
        systemProgram: SystemProgram.programId,
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
        systemProgram: SystemProgram.programId,
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
        systemProgram: SystemProgram.programId,
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
    console.log("userWsolAtaLamports = " + userWsolAtaLamports);
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
        systemProgram: SystemProgram.programId,
    })
        .instruction();
}
export async function createTipTransferInstruction(from, to, lamports) {
    return SystemProgram.transfer({
        fromPubkey: from,
        toPubkey: to,
        lamports: lamports,
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
        .map(byte => byte.toString(16).padStart(2, '0'))
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
        console.log("deleteAta被删除");
        return true;
    }
    return false;
}
export function getInstructionAmounts(currentSymbol, instruction) {
    const dataHex = instruction.data.toString("hex");
    const programId = instruction.programId.toBase58();
    let beforeInput = "";
    let beforeOutput = "";
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
    const beforeInputHex = beforeInput.match(/.{2}/g)?.reverse().join("") || "";
    const bigIntBeforeInput = BigInt("0x" + beforeInputHex);
    const beforeOutputHex = beforeOutput.match(/.{2}/g)?.reverse().join("") || "";
    const bigIntBeforeOutput = BigInt("0x" + beforeOutputHex);
    return { input: bigIntBeforeInput, output: bigIntBeforeOutput };
}
export function getInstructionReplaceDataHex(currentSymbol, programId, dataHex, inputHex, outputHex) {
    let replaceHex = inputHex.concat(outputHex);
    if ((programId == PUMP_PROGRAM_ID.toBase58() ||
        programId == PUMP_AMM_PROGRAM_ID.toBase58()) &&
        dataHex.startsWith(PUEM_INSTRUCTION_PREFIX) &&
        currentSymbol.isBuy) {
        replaceHex = outputHex.concat(inputHex);
    }
    const indexInSupportingArr = SUPPORT_CHANGE_PROGRAM_IDS.get(programId) ?? 0;
    let finalData;
    if (programId == JUPITER_PROGRAM_ID.toBase58()) {
        finalData = dataHex.slice(0, dataHex.length - indexInSupportingArr) +
            replaceHex +
            dataHex.slice(dataHex.length - indexInSupportingArr + 16 * 2);
    }
    else {
        finalData = dataHex.slice(0, indexInSupportingArr) +
            replaceHex +
            dataHex.slice(indexInSupportingArr + 16 * 2);
    }
    return finalData;
}
