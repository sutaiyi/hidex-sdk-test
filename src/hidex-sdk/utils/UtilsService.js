import ErrorService from './error';
import bs58 from 'bs58';
import { Keypair } from "@solana/web3.js";
export default class UtilsService {
    constructor() {
    }
    getErrorMessage(error) {
        console.error(error.message);
        return ErrorService(error);
    }
    ownerKeypair(key) {
        return Keypair.fromSecretKey(bs58.decode(key));
    }
    ;
}
