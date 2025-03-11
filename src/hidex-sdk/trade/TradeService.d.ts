import { CurrentSymbol, ITradeService, NetWorkFee, ITradeFunctions, SendTransactionParams, IApproveService } from './interfaces';
import { ChainItem, OptionsCommon } from '../main/interfaces';
import { instructionReset, instructionsCheck, instructionsEdit } from './sol/utils';
import EventEmitter from '../common/eventEmitter';
declare class TradeService extends EventEmitter implements ITradeService {
    app: ITradeFunctions | null;
    chainId: number;
    errorCode: number;
    private HS;
    approve: IApproveService;
    constructor(options: OptionsCommon);
    instructionReset: typeof instructionReset;
    instructionsCheck: typeof instructionsCheck;
    instructionsEdit: typeof instructionsEdit;
    changeTradeService: (currentNetwork: ChainItem) => void;
    getBalance: (accountAddress: string, tokenAddress?: string) => Promise<string>;
    getBalanceMultiple: (chain: string, accountAddress: string, tokens: Array<string>) => Promise<Array<string>>;
    getNetWorkFees: (gasLimit?: number) => Promise<NetWorkFee[]>;
    getSendEstimateGas: (sendParams: SendTransactionParams) => Promise<{
        gasLimit: number;
    }>;
    getSendFees: (networkFee: NetWorkFee) => Promise<number>;
    sendTransaction: (sendParams: SendTransactionParams & {
        currentNetWorkFee: NetWorkFee;
    }) => Promise<{
        error: boolean | string | null;
        result: any;
    }>;
    getAllowance: (tokenAddress: string, accountAddress: string, authorizedAddress: string) => Promise<number>;
    toApprove: (tokenAddress: string, accountAddress: string, authorizedAddress: string, amountToApprove?: number) => Promise<boolean>;
    getSwapPath: (currentSymbol: CurrentSymbol) => Promise<{
        minOutAmount: string;
        data: any;
    }>;
    getSwapEstimateGas: (currentSymbol: CurrentSymbol, path: string, accountAddress: string) => Promise<{
        gasLimit: number;
        data?: any;
    }>;
    getSwapFees: (networkFee: NetWorkFee, gasLimit: number) => Promise<string>;
    swap: (currentSymbol: CurrentSymbol, transaction: any, accountAddress: string) => Promise<{
        error: boolean | string | null;
        result: any;
    }>;
}
export default TradeService;
//# sourceMappingURL=TradeService.d.ts.map