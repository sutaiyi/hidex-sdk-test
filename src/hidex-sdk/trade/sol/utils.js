import { PublicKey, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { simulateConfig, TOKEN_2022_OWNER } from './config';
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
export async function getTokenOwner(tokenAddress, connection) {
    const tokenAccountPubkey = new PublicKey(tokenAddress);
    const accountInfo = await connection.getAccountInfo(tokenAccountPubkey);
    if (!accountInfo || !accountInfo.owner) {
        throw new Error('Token account does not exist');
    }
    const owner = accountInfo.owner.toBase58();
    return owner;
}
export async function isToken2022(tokenAddress, connection) {
    const owner = await getTokenOwner(tokenAddress, connection);
    return owner === TOKEN_2022_OWNER;
}
export async function sendSolanaTransaction(connection, sender, instructions, blockhash) {
    const message = new TransactionMessage({
        payerKey: sender.publicKey,
        recentBlockhash: blockhash,
        instructions
    }).compileToV0Message();
    const versionedTx = new VersionedTransaction(message);
    versionedTx.sign([sender]);
    const simulateResponse = await connection.simulateTransaction(versionedTx, simulateConfig);
    console.log('sendSolanaTransaction 预估结果==>', simulateResponse);
    if (simulateResponse?.value?.err) {
        throw new Error(JSON.stringify(simulateResponse.value.logs));
    }
    const rawTransaction = versionedTx.serialize();
    return await connection.sendRawTransaction(rawTransaction);
}
export async function getUserTokenAtaAddress(userAddress, tokenAddress, TOKEN_2022) {
    const mintPublic = new PublicKey(tokenAddress);
    const publicOwner = new PublicKey(userAddress);
    let userAtaAccount = await getAssociatedTokenAddress(mintPublic, publicOwner, false);
    if (TOKEN_2022) {
        userAtaAccount = await getAssociatedTokenAddress(mintPublic, publicOwner, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
    }
    return userAtaAccount.toBase58();
}
export function vertransactionsToBase64(transactions) {
    try {
        return transactions.map((tx) => Buffer.from(tx.serialize()).toString('base64'));
    }
    catch (error) {
        console.log('vertransactionsToBase64 error==>', error);
    }
}
export async function hashFailedMessage(connection, hash) {
    const hashStatus = await connection.getParsedTransaction(hash, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
    });
    console.log('链上hash状态异常，再次查询异常错误信息', hashStatus);
    if (hashStatus) {
        const { meta } = hashStatus || {};
        if (meta && meta?.err) {
            return meta.logMessages?.toString() || 'Unknown error';
        }
    }
    return 'Hash Error, Unknown error message';
}
export const urlPattern = /https?:\/\/([a-zA-Z0-9.-]+)/;
