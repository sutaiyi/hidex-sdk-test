import { CurrentSymbol, ITradeService, NetWorkFee, SendTransactionParams } from './interfaces';
import { OptionsCommon } from '../main/interfaces';
declare class TradeService implements ITradeService {
    app: ITradeService | null;
    chainId: number;
    errorCode: number;
    private HS;
    fun: any;
    constructor(options: OptionsCommon);
    networkChange: (chainID: number) => void;
    getBalance: (accountAddress: string, tokenAddress?: string) => Promise<string>;
    getBalanceMultiple: (chain: string, accountAddress: string, tokens: Array<string>) => Promise<Array<string>>;
    getNetWorkFees: (gasLimit?: number) => Promise<NetWorkFee[]>;
    getSendEstimateGas: (sendParams: SendTransactionParams) => Promise<{
        gasLimit: number;
    }>;
    getSendFees: (networkFee: NetWorkFee, gasLimit: number) => Promise<string>;
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
    getTradeEstimateGas: (currentSymbol: CurrentSymbol, path: string, accountAddress: string) => Promise<{
        gasLimit: number;
        data?: any;
    }>;
    getTradeFees: (networkFee: NetWorkFee, gasLimit: number) => Promise<string>;
    trade: (currentSymbol: CurrentSymbol, transaction: any, accountAddress: string) => Promise<{
        error: boolean | string | null;
        result: any;
    }>;
}
export default TradeService;
//# sourceMappingURL=TradeService.d.ts.map