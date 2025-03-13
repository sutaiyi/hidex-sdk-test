import { Connection, Keypair } from "@solana/web3.js";
export declare function getTokenOwner(tokenAddress: string, connection: Connection): Promise<string>;
export declare function sendSolanaTransaction(connection: Connection, sender: Keypair, instructions: any[], blockhash: any): Promise<string>;
//# sourceMappingURL=utils.d.ts.map