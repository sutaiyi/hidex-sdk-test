import { Connection, Keypair, TransactionInstruction, VersionedTransaction } from '@solana/web3.js';
export declare function getTokenOwner(tokenAddress: string, connection: Connection): Promise<string>;
export declare function isToken2022(tokenAddress: string, connection: Connection): Promise<boolean>;
export declare function sendSolanaTransaction(connection: Connection, sender: Keypair, instructions: TransactionInstruction[], blockhash: any): Promise<string>;
export declare function getUserTokenAtaAddress(userAddress: string, tokenAddress: string, TOKEN_2022: boolean): Promise<string>;
export declare function vertransactionsToBase64(transactions: Array<VersionedTransaction>): string[] | undefined;
//# sourceMappingURL=utils.d.ts.map