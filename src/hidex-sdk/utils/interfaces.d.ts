import { Keypair } from "@solana/web3.js";
export interface IUtilsService {
    getErrorMessage(error: any): {
        code: number;
        message: string;
    };
    ownerKeypair(key: string): Keypair;
}
//# sourceMappingURL=interfaces.d.ts.map