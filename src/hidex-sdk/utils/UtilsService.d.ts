import { IUtilsService } from "./interfaces";
import { Keypair } from "@solana/web3.js";
import * as tradeUtils from "../trade/utils";
import * as commonUtils from "../common/utils";
export default class UtilsService implements IUtilsService {
    constructor();
    getErrorMessage(error: any): {
        code: number;
        message: string;
    };
    ownerKeypair(key: string): Keypair;
    trade: typeof tradeUtils;
    common: typeof commonUtils;
}
//# sourceMappingURL=UtilsService.d.ts.map