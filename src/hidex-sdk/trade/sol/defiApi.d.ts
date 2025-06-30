import { CurrentSymbol, HashStatus, IDefiApi } from '../interfaces';
import { BlockhashWithExpiryBlockHeight, Connection, VersionedTransaction } from '@solana/web3.js';
import { INetworkService } from '../../network/interfaces';
declare class DefiApi implements IDefiApi {
    clearTimer: NodeJS.Timeout | null;
    maxBlockHashCount: number;
    currentBlockHashCount: number;
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
        recentBlockhash: string;
        data: any;
    }>;
    submitSwap(currentSymbol: CurrentSymbol, transaction: VersionedTransaction): Promise<{
        success: boolean;
        hash: string;
        currentSymbol: CurrentSymbol;
        data: any;
    }>;
    submitSwapFastByBlox(currentSymbol: CurrentSymbol, transaction: VersionedTransaction): Promise<{
        success: boolean;
        hash: string;
        currentSymbol: CurrentSymbol;
        data: any;
    }>;
    submitSwapFastByFlashblock(currentSymbol: CurrentSymbol, transaction: VersionedTransaction): Promise<{
        success: boolean;
        hash: string;
        currentSymbol: CurrentSymbol;
        data: any;
    }>;
    submitByQuiknode(): Promise<void>;
    submitSwapByJito(transactions: Array<VersionedTransaction>): Promise<{
        success: boolean;
        hash: string;
        data?: any;
    }>;
    submitSwapByBlox(transactions: Array<VersionedTransaction>): Promise<{
        success: boolean;
        hash: string;
        data?: any;
    }>;
    submitSwapByFlashblock(transactions: Array<VersionedTransaction>): Promise<{
        success: boolean;
        hash: string;
        data?: any;
    }>;
    submitSwapByFlashblockCommon(transactions: Array<VersionedTransaction>, mev?: boolean): Promise<{
        success: boolean;
        hash: string;
        data?: any;
    }>;
    submitSwapByAllPlatforms(currentSymbol: CurrentSymbol, transactions: Array<Array<VersionedTransaction>>): Promise<{
        success: boolean;
        hashs: Array<string[]>;
        data?: any;
    }>;
    handlerJitoPost(endpoints: Array<string>, params: any): Promise<void>;
    getSwapStatus(hash: string): Promise<HashStatus>;
    bundlesStatuses(bundles: Array<string>): Promise<HashStatus>;
    rpcSwapStatus(hash: string, connection: Connection): Promise<HashStatus>;
    rpcHeliusSwapStatus(hash: string): Promise<HashStatus>;
    establishingConnection(): void;
}
declare const _default: DefiApi;
export default _default;
//# sourceMappingURL=defiApi.d.ts.map