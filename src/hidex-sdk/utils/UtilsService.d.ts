import { IUtilsService } from './interfaces';
import { Keypair } from '@solana/web3.js';
import * as tradeUtils from '../trade/utils';
import * as commonUtils from '../common/utils';
export default class UtilsService implements IUtilsService {
    constructor();
    getErrorMessage(error: any): {
        code: number;
        message: string;
    };
    ownerKeypair(key: string): Keypair;
    environmental: typeof commonUtils.environmental;
    trade: typeof tradeUtils;
    common: typeof commonUtils;
    getStatistics: (timerKey: string) => number;
    setStatistics: ({ timerKey, isBegin }: {
        timerKey: string;
        isBegin: boolean;
    }) => number;
    clearStatistics: (timerKey?: string) => void;
}
//# sourceMappingURL=UtilsService.d.ts.map