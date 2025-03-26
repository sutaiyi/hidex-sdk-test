import { Connection, Keypair } from "@solana/web3.js";
export declare function getTokenOwner(tokenAddress: string, connection: Connection): Promise<string>;
export declare function isToken2022(tokenAddress: string, connection: Connection): Promise<boolean>;
export declare function sendSolanaTransaction(connection: Connection, sender: Keypair, instructions: any[], blockhash: any): Promise<string>;
export declare function getUserTokenAtaAddress(userAddress: string, tokenAddress: string, TOKEN_2022: boolean): Promise<string>;
//# sourceMappingURL=utils.d.ts.map