import { CurrentSymbol, HashStatus, IDefiApi } from '../interfaces';
import { BlockhashWithExpiryBlockHeight, Transaction, VersionedTransaction } from '@solana/web3.js';
import { INetworkService } from '../../network/interfaces';
declare class DefiApi implements IDefiApi {
    clearTimer: NodeJS.Timeout | null;
    lastBlockHash: BlockhashWithExpiryBlockHeight;
    constructor();
    getLatestBlockhash(network: INetworkService): Promise<BlockhashWithExpiryBlockHeight>;
    updateLatestBlockhash(network: INetworkService): Promise<BlockhashWithExpiryBlockHeight>;
    stopLatestBlockhash(): void;
    startLatestBlockhash(network: INetworkService): void;
    swapRoute(currentSymbol: CurrentSymbol, fromAddress: string): Promise<{
        success: boolean;
        swapTransaction: string;
        outAmount: string;
        data: any;
    }>;
    submitSwap(currentSymbol: CurrentSymbol, transaction: VersionedTransaction): Promise<{
        success: boolean;
        hash: string;
        currentSymbol: CurrentSymbol;
    }>;
    submitSwapByJito(transactions: Array<Transaction>): Promise<{
        success: boolean;
        hash: string;
    }>;
    getSwapStatus(hash: string): Promise<HashStatus>;
}
declare const _default: DefiApi;
export default _default;
//# sourceMappingURL=defiApi.d.ts.map