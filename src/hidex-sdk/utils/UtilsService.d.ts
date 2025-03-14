import { IUtilsService } from "./interfaces";
import { Keypair } from "@solana/web3.js";
export default class UtilsService implements IUtilsService {
    constructor();
    getErrorMessage(error: any): {
        code: number;
        message: string;
    };
    ownerKeypair(key: string): Keypair;
}
//# sourceMappingURL=UtilsService.d.ts.map