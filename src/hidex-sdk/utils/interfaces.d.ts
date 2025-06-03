import { Keypair } from '@solana/web3.js';
export interface IUtilsService {
    getErrorMessage(error: any): {
        code: number;
        message: string;
    };
    ownerKeypair(key: string): Keypair;
    trade: any;
    common: any;
    getStatistics(timerKey: string): number;
    setStatistics({ timerKey, isBegin }: {
        timerKey: string;
        isBegin: boolean;
    }): number;
    clearStatistics(timerKey: string): void;
}
//# sourceMappingURL=interfaces.d.ts.map