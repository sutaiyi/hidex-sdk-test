import { PublicKey, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { simulateConfig, TOKEN_2022_OWNER } from "./config";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
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
        instructions,
    }).compileToV0Message();
    const versionedTx = new VersionedTransaction(message);
    versionedTx.sign([sender]);
    const simulateResponse = await connection.simulateTransaction(versionedTx, simulateConfig);
    console.log('sendSolanaTransaction 预估', simulateResponse);
    if (simulateResponse?.value?.err) {
        throw new Error(JSON.stringify(simulateResponse.value.logs));
    }
    const rawTransaction = versionedTx.serialize();
    try {
        const result = await connection.sendRawTransaction(rawTransaction);
        return result;
    }
    catch (error) {
        throw new Error(JSON.stringify(error));
    }
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
