import { CurrentSymbol, IDefiApi } from '../interfaces';
import { BlockhashWithExpiryBlockHeight, Transaction } from '@solana/web3.js';
import { INetworkService } from '../../network/interfaces';
declare class DefiApi implements IDefiApi {
    constructor();
    getLatestBlockhash(network: INetworkService): Promise<BlockhashWithExpiryBlockHeight | undefined>;
    swapRoute(currentSymbol: CurrentSymbol, amountIn: bigint, fromAddress: string): Promise<any>;
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
export default DefiApi;
//# sourceMappingURL=defiApi.d.ts.map