import { mTokenAddress } from '../../common/config';
import { SystemProgram, Transaction } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, createCloseAccountInstruction, createSyncNativeInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { WSOL_MINT } from '../sol/config';
import { isSol } from './index';
import { priorityFeeInstruction } from '../sol/instruction/InstructionCreator';
export const isMotherTrad = (currentSymbol, network) => {
    const currentNetWork = network.get();
    const inAddress = currentSymbol.in.address.toLowerCase();
    const outAddress = currentSymbol.out.address.toLowerCase();
    console.log(currentNetWork, inAddress, outAddress);
    if (inAddress === currentNetWork.tokens[0].address.toLowerCase() && outAddress === currentNetWork.tokens[1].address.toLowerCase()) {
        return 'MBTOWMB';
    }
    if (inAddress === currentNetWork.tokens[1].address.toLowerCase() && outAddress === mTokenAddress.toLowerCase()) {
        return 'WMBTOMB';
    }
    return '';
};
const convertSolToWsol = async (amountIn, keyPair, priorityFee, network) => {
    console.log(`convert`, amountIn, keyPair, priorityFee, network);
    const connection = network.getProviderByChain(102);
    const publicKey = keyPair.publicKey;
    const lamports = BigInt(amountIn);
    const associatedTokenAccount = await getAssociatedTokenAddress(WSOL_MINT, publicKey, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
    const transaction = new Transaction();
    const accountInfo = await connection.getAccountInfo(associatedTokenAccount);
    const [addPriorityLimitIx, addPriorityPriceIx] = await priorityFeeInstruction(100000, Number(priorityFee));
    transaction.add(addPriorityPriceIx);
    transaction.add(addPriorityLimitIx);
    if (!accountInfo) {
        transaction.add(createAssociatedTokenAccountInstruction(publicKey, associatedTokenAccount, publicKey, WSOL_MINT, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID));
    }
    transaction.add(SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: associatedTokenAccount,
        lamports,
    }));
    transaction.add(createSyncNativeInstruction(associatedTokenAccount));
    const signature = await connection.sendTransaction(transaction, [keyPair], {
        skipPreflight: true,
        preflightCommitment: 'processed'
    });
    return {
        error: null,
        result: {
            hash: signature,
        }
    };
};
const convertWsolToSol = async (keyPair, priorityFee, network) => {
    const connection = network.getProviderByChain(102);
    const publicKey = keyPair.publicKey;
    try {
        const wsolAccount = await getAssociatedTokenAddress(WSOL_MINT, publicKey);
        const closeInstruction = createCloseAccountInstruction(wsolAccount, publicKey, publicKey, [], TOKEN_PROGRAM_ID);
        const [addPriorityLimitIx, addPriorityPriceIx] = await priorityFeeInstruction(100000, Number(priorityFee));
        const tx = new Transaction();
        tx.add(addPriorityPriceIx);
        tx.add(addPriorityLimitIx);
        tx.add(closeInstruction);
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        tx.feePayer = publicKey;
        tx.sign(keyPair);
        const txSignature = await connection.sendRawTransaction(tx.serialize(), {
            skipPreflight: true,
            preflightCommitment: 'processed'
        });
        return {
            error: null,
            result: {
                hash: txSignature,
            }
        };
    }
    catch (error) {
        console.error(error);
        throw new Error('交易失败请重试' + error);
    }
};
export async function wExchange(chain, owner, type, priorityFee, amount, HS) {
    if (isSol(chain)) {
        const keyPair = HS.utils.ownerKeypair(owner);
        if (type === 0) {
            return await convertSolToWsol(amount, keyPair, priorityFee, HS.network);
        }
        if (type === 1) {
            return await convertWsolToSol(keyPair, priorityFee, HS.network);
        }
    }
    return {
        error: null,
        result: { hash: null },
    };
}
