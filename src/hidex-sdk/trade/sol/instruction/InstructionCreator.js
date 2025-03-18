import * as anchor from '@project-serum/anchor';
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { ComputeBudgetProgram, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import abis from '../../../common/abis';
import CustomWallet from '../../../wallet/custom';
import { sTokenAddress, zero } from '../../../common/config';
import { AssociateTokenProgram, PROGRAMID, SEED_DATA, SEED_SWAP, SEED_TRADE } from '../config';
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
export async function createSwapPrepareInstruction(currentSymbol, owner, network) {
    if (currentSymbol.isBuy) {
        return createBuySwapPrepareInstruction(currentSymbol, owner, network);
    }
    else {
        return createSaleSwapPrepareInstruction(currentSymbol, owner, network);
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
    const { program, tradePda, userAtaAccount } = await information(currentSymbol, owner, network);
    return program.methods
        .buySwapPrepare()
        .accounts({
        tradeConfigPda: tradePda,
        userTokenAtaAccount: userAtaAccount,
        user: owner.publicKey
    })
        .instruction();
}
export function signTransaction() {
}
export async function createBuySwapCompletedInstruction(currentSymbol, owner, network) {
    const { program, dataPda, swapPda, tradePda, amount, userAtaAccount, inviterPublic } = await information(currentSymbol, owner, network);
    const type = new anchor.BN(currentSymbol.isPump ? 2 : 1);
    const dexCommissionRateBN = new anchor.BN(currentSymbol.feeRate);
    const inviterCommissionRateBN = new anchor.BN((currentSymbol.commissionRate || 0) * 10000);
    return program.methods
        .buySwapCompleted(amount, type, dexCommissionRateBN, inviterCommissionRateBN)
        .accounts({
        swapPda: swapPda,
        configPda: dataPda,
        tradeConfigPda: tradePda,
        user: owner.publicKey,
        userAtaAccount: userAtaAccount,
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
export async function createTipTransferInstruction(from, to, lamports) {
    return SystemProgram.transfer({
        fromPubkey: from,
        toPubkey: to,
        lamports: lamports,
    });
}
