import * as anchor from '@project-serum/anchor';
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { ComputeBudgetProgram, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction, Ed25519Program, SYSVAR_INSTRUCTIONS_PUBKEY } from '@solana/web3.js';
import abis from '../../common/abis';
import CustomWallet from '../../wallet/custom';
import { getSingleContensBytes } from '../utils';
import { sTokenAddress, zero } from '../../common/config';
import { AssociateTokenProgram, commissionSignatureAddress, PROGRAMID, SEED_DATA, SEED_SWAP } from './config';
import bs58 from 'bs58';
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
    const programId = new PublicKey(PROGRAMID);
    const program = new anchor.Program(abis.solanaIDL, programId);
    const [data_pda] = await PublicKey.findProgramAddress([Buffer.from(SEED_DATA)], programId);
    const [swap_pda, bump2] = await PublicKey.findProgramAddress([Buffer.from(SEED_SWAP)], programId);
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
    const swapAtaAccount = await getAssociatedTokenAddress(tokenOutMint, swap_pda, true);
    let userAtaAccount = await getAssociatedTokenAddress(tokenOutMint, owner.publicKey, false);
    if (currentSymbol.TOKEN_2022) {
        userAtaAccount = await getAssociatedTokenAddress(tokenOutMint, owner.publicKey, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
    }
    const wSol = new PublicKey(sTokenAddress);
    const swapWsolPdaAta = await getAssociatedTokenAddress(wSol, swap_pda, true);
    const userwSolAta = await getAssociatedTokenAddress(wSol, owner.publicKey, false);
    const info = {
        program,
        dataPda: data_pda,
        swapPda: swap_pda,
        bump2,
        associateTokenProgram,
        tokenOutMint,
        tokenInMint,
        amount,
        swapAtaAccount,
        userAtaAccount,
        inviterPublic,
        wSol,
        swapWsolPdaAta,
        userwSolAta,
    };
    console.log('GMGN/JUP 内部指令', info);
    return info;
}
export async function priorityFeeInstruction(limit, fee) {
    const addPriorityLimit = ComputeBudgetProgram.setComputeUnitLimit({
        units: limit,
    });
    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: Math.floor(fee * Math.pow(10, 15) / limit),
    });
    return [addPriorityLimit, addPriorityFee];
}
export async function transactionTx(owner, latestBlockhash, instruction, currentSymbol, ed25519Instruction) {
    const instructions = instruction;
    if (Number(currentSymbol.priorityFee) > 0) {
        const priorityfee = Math.floor(Number(currentSymbol.priorityFee) / 3);
        const [addPriorityLimit, addPriorityFee] = await priorityFeeInstruction(100000, priorityfee);
        if (ed25519Instruction) {
            instructions.unshift(ed25519Instruction, addPriorityLimit, addPriorityFee);
        }
        else {
            instructions.unshift(addPriorityLimit, addPriorityFee);
        }
    }
    return versionedTra(instructions, owner, latestBlockhash);
}
export async function versionedTra(instructions, owner, latestBlockhash) {
    const message = new TransactionMessage({
        payerKey: owner.publicKey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions,
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
export async function raydiumCreateBuy(currentSymbol, owner, network) {
    const { program, dataPda, swapPda, associateTokenProgram, tokenOutMint, amount, swapAtaAccount, inviterPublic } = await information(currentSymbol, owner, network);
    return program.methods
        .buyCreateTokenIdempotent(amount)
        .accounts({
        swapPda,
        detradeConfigPda: dataPda,
        user: owner.publicKey,
        swapAtaAccount,
        tokenMint: tokenOutMint,
        inviter: inviterPublic,
        associateTokenProgram: associateTokenProgram,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
    })
        .signers([owner])
        .instruction();
}
export async function raydiumCompleteBuy(currentSymbol, owner, network) {
    const { program, dataPda, swapPda, associateTokenProgram, tokenOutMint, amount, swapAtaAccount, inviterPublic, userAtaAccount } = await information(currentSymbol, owner, network);
    const ataAmountBefore = new anchor.BN(currentSymbol.balanceSell);
    return program.methods
        .buyComplete2(amount, ataAmountBefore)
        .accounts({
        swapPda: swapPda,
        detradeConfigPda: dataPda,
        user: owner.publicKey,
        swapAtaAccount,
        userAtaAccount,
        tokenMint: tokenOutMint,
        inviter: inviterPublic,
        associateTokenProgram,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
    })
        .signers([owner])
        .instruction();
}
export async function createTokenIdempotentAnchor(currentSymbol, owner, latestBlockhash, network, INSTRUCTION = false, RAYDIUM = false) {
    const { program, dataPda, swapPda, associateTokenProgram, tokenOutMint, amount, swapAtaAccount, inviterPublic, userAtaAccount, wSol } = await information(currentSymbol, owner, network);
    console.log('买卖方向===>isBuy :', isBuy(currentSymbol));
    console.log(JSON.stringify({
        swapPda,
        detradeConfigPda: dataPda,
        user: owner.publicKey,
        swapAtaAccount,
        tokenMint: tokenOutMint,
        inviter: inviterPublic,
        associateTokenProgram: associateTokenProgram,
        tokenProgram: TOKEN_PROGRAM_ID,
        userAtaAccount,
        systemProgram: SystemProgram.programId,
    }));
    if (isBuy(currentSymbol)) {
        let buyCreateTokenInstruction;
        if (RAYDIUM) {
            buyCreateTokenInstruction = await raydiumCreateBuy(currentSymbol, currentSymbol.inviter, owner);
        }
        else {
            buyCreateTokenInstruction = await program.methods
                .buyCreateTokenIdempotentByTg(amount)
                .accounts({
                detradeConfigPda: dataPda,
                user: owner.publicKey,
                systemProgram: SystemProgram.programId,
            })
                .signers([owner])
                .instruction();
        }
        if (INSTRUCTION) {
            return buyCreateTokenInstruction;
        }
        return transactionTx(owner, latestBlockhash, [buyCreateTokenInstruction], currentSymbol);
    }
    const sellCreateTokenInstruction = await program.methods
        .saleCreateWsolIdempotentByTg()
        .accounts({
        detradeConfigPda: dataPda,
        user: owner.publicKey,
        wsolMint: wSol,
        associateTokenProgram: associateTokenProgram,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
    })
        .signers([owner])
        .instruction();
    if (INSTRUCTION) {
        return sellCreateTokenInstruction;
    }
    return transactionTx(owner, latestBlockhash, [sellCreateTokenInstruction], currentSymbol);
}
export async function completeAnchor(currentSymbol, inviter, owner, network, latestBlockhash, INSTRUCTION = false, RAYDIUM = false) {
    const { program, dataPda, swapPda, associateTokenProgram, tokenOutMint, tokenInMint, amount, wSol, userAtaAccount, inviterPublic, } = await information(currentSymbol, owner, network);
    const type = new anchor.BN(currentSymbol.isPump ? 2 : 1);
    const { combinedBytes, signReult } = getSingleContensBytes(currentSymbol.contents || '', currentSymbol.signature || '');
    const ed25519Instruction = Ed25519Program.createInstructionWithPublicKey({
        publicKey: bs58.decode(commissionSignatureAddress()),
        message: combinedBytes,
        signature: signReult
    });
    console.log('ed25519Instruction', { ed25519Instruction });
    if (isBuy(currentSymbol)) {
        let buyCompleteInstruction;
        console.log('------------RAYDIUM-----------------', RAYDIUM);
        if (RAYDIUM) {
            buyCompleteInstruction = await raydiumCompleteBuy(currentSymbol, inviter, owner);
        }
        else {
            console.log('------------buyCompleteInstruction-----------------', INSTRUCTION, amount, type, combinedBytes, signReult);
            buyCompleteInstruction = await program.methods
                .buyCompleteSignVerifyByTg(amount, type, Buffer.from(new Uint8Array(combinedBytes)), Array.from(new Uint8Array(signReult)))
                .accounts({
                swapPda: swapPda,
                detradeConfigPda: dataPda,
                user: owner.publicKey,
                userAtaAccount,
                tokenMint: tokenOutMint,
                inviter: inviterPublic,
                ixSysvar: SYSVAR_INSTRUCTIONS_PUBKEY,
                associateTokenProgram: associateTokenProgram,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
                .signers([owner])
                .instruction();
            console.log('------------buyCompleteInstruction2-----------------');
        }
        if (INSTRUCTION) {
            return {
                completeTx: buyCompleteInstruction, ed25519Instruction
            };
        }
        return transactionTx(owner, latestBlockhash, [buyCompleteInstruction], currentSymbol, ed25519Instruction);
    }
    let sellCompleteInstruction;
    if (RAYDIUM) {
    }
    else {
        const totalFee = new anchor.BN(getTotalFee(currentSymbol));
        console.log('---> sell totalFee', totalFee.toString());
        sellCompleteInstruction = await program.methods
            .saleCompleteSignVerifyByTg(amount, totalFee, type, Buffer.from(new Uint8Array(combinedBytes)), Array.from(new Uint8Array(signReult)))
            .accounts({
            swapPda: swapPda,
            detradeConfigPda: dataPda,
            user: owner.publicKey,
            wsolMint: wSol,
            tokenMint: tokenInMint,
            inviter: inviterPublic,
            ixSysvar: SYSVAR_INSTRUCTIONS_PUBKEY,
            associateTokenProgram: associateTokenProgram,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        })
            .signers([owner])
            .instruction();
    }
    if (INSTRUCTION) {
        return {
            completeTx: sellCompleteInstruction, ed25519Instruction
        };
    }
    return transactionTx(owner, latestBlockhash, [sellCompleteInstruction], currentSymbol, ed25519Instruction);
}
export async function commissionComplete(currentSymbol, owner, network) {
    const { program, dataPda, swapPda, associateTokenProgram, tokenOutMint, tokenInMint, amount, userAtaAccount, inviterPublic, wSol, } = await information(currentSymbol, owner, network);
    const type = new anchor.BN(currentSymbol.isPump ? 2 : 1);
    const dexCommissionRateBN = new anchor.BN(currentSymbol.feeRate);
    const balanceOut = new anchor.BN(currentSymbol.balanceSell);
    const inviterCommissionRateBN = new anchor.BN((currentSymbol.commissionRate || 0) * 10000);
    if (isBuy(currentSymbol)) {
        const buyCompleteInstruction = await program.methods[currentSymbol.TOKEN_2022 ? 'buyToken2022CompletedEvent' : 'buyCompletedEvent'](amount, balanceOut, type, dexCommissionRateBN, inviterCommissionRateBN)
            .accounts({
            swapPda: swapPda,
            detradeConfigPda: dataPda,
            user: owner.publicKey,
            userAtaAccount,
            tokenMint: tokenOutMint,
            inviter: inviterPublic,
            associateTokenProgram: associateTokenProgram,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        })
            .signers([owner])
            .instruction();
        return buyCompleteInstruction;
    }
    const totalFee = new anchor.BN(getTotalFee(currentSymbol));
    console.log('---> sell totalFee', totalFee.toString());
    const sellCompleteInstruction = await program.methods[currentSymbol.TOKEN_2022 ? 'saleToken2022CompletedEvent' : 'saleCompletedEvent'](amount, balanceOut, totalFee, type, dexCommissionRateBN, inviterCommissionRateBN)
        .accounts({
        swapPda: swapPda,
        detradeConfigPda: dataPda,
        user: owner.publicKey,
        wsolMint: wSol,
        tokenMint: tokenInMint,
        inviter: inviterPublic,
        associateTokenProgram: associateTokenProgram,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
    })
        .signers([owner])
        .instruction();
    return sellCompleteInstruction;
}
export async function getRecipient(currentSymbol) {
    const tokenMint = new PublicKey(currentSymbol.out.address);
    const programId = new PublicKey(PROGRAMID);
    const [swap_pda] = await anchor.web3.PublicKey.findProgramAddress([Buffer.from(SEED_SWAP)], programId);
    const swapTokenMintPdaAta = await getAssociatedTokenAddress(tokenMint, swap_pda, true);
    return swapTokenMintPdaAta;
}
