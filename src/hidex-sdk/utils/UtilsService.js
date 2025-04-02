import ErrorService from './error';
import bs58 from 'bs58';
import { Keypair } from "@solana/web3.js";
import * as tradeUtils from "../trade/utils";
import * as commonUtils from "../common/utils";
export default class UtilsService {
    constructor() {
    }
    getErrorMessage(error) {
        console.error('Hidex SDK: ' + error.message);
        return ErrorService(error);
    }
    ownerKeypair(key) {
        return Keypair.fromSecretKey(bs58.decode(key));
    }
    ;
    trade = tradeUtils;
    common = commonUtils;
}
