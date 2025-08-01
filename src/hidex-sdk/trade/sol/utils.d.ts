import { Connection, Keypair, TransactionInstruction, VersionedTransaction } from '@solana/web3.js';
import { ConnectedSolanaWallet } from '@privy-io/react-auth/solana';
export declare function getTokenOwner(tokenAddress: string, connection: Connection): Promise<string>;
export declare function isToken2022(tokenAddress: string, connection: Connection): Promise<boolean>;
export declare function sendSolanaTransaction(connection: Connection, sender: Keypair, instructions: TransactionInstruction[], blockhash: any): Promise<string>;
export declare function sendSolanaTransactionByPrviy(connection: Connection, wallet: ConnectedSolanaWallet, instructions: TransactionInstruction[], blockhash: any): Promise<string>;
export declare function getUserTokenAtaAddress(userAddress: string, tokenAddress: string, TOKEN_2022: boolean): Promise<string>;
export declare function vertransactionsToBase64(transactions: Array<VersionedTransaction>): string[] | undefined;
export declare function hashFailedMessage(connection: Connection, hash: string): Promise<string>;
export declare const urlPattern: RegExp;
//# sourceMappingURL=utils.d.ts.map