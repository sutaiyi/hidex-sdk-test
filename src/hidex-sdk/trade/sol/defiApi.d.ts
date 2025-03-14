import { CurrentSymbol, IDefiApi } from '../interfaces';
import { BlockhashWithExpiryBlockHeight, Transaction } from '@solana/web3.js';
import { INetworkService } from '../../network/interfaces';
declare class DefiApi implements IDefiApi {
    clearTimer: NodeJS.Timeout | null;
    lastBlockHash: BlockhashWithExpiryBlockHeight;
    constructor();
    getLatestBlockhash(network: INetworkService): Promise<void>;
    swapRoute(currentSymbol: CurrentSymbol, fromAddress: string): Promise<{
        success: boolean;
        swapTransaction: string;
        outAmount: string;
    }>;
    submitSwap(currentSymbol: CurrentSymbol, transaction: Transaction): Promise<{
        success: boolean;
        hash: string;
        currentSymbol: CurrentSymbol;
        transaction: Transaction;
    }>;
    submitSwapByJito(transactions: Array<Transaction>): Promise<{
        success: boolean;
        hash: string;
    }>;
    getSwapStatus(hash: string): Promise<any>;
}
declare const _default: DefiApi;
export default _default;
//# sourceMappingURL=defiApi.d.ts.map