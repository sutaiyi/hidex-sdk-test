import { CurrentSymbol, ITradeService, NetWorkFee, ITradeFunctions, SendTransactionParams, IApproveService, IDefiApi, HashStatus, ITradeHashStatusService } from './interfaces';
import { ChainItem, OptionsCommon } from '../main/interfaces';
import EventEmitter from '../common/eventEmitter';
import { AddressLookupTableAccount, TransactionMessage } from '@solana/web3.js';
declare class TradeService extends EventEmitter implements ITradeService {
    app: ITradeFunctions | null;
    chainId: number;
    errorCode: number;
    private HS;
    approve: IApproveService;
    defiApi: IDefiApi;
    checkHash: ITradeHashStatusService;
    constructor(options: OptionsCommon);
    resetInstructions: (currentSymbol: CurrentSymbol, transactionMessage: TransactionMessage, newInputAmount: bigint, newOutputAmount: bigint) => TransactionMessage;
    getTransactionsSignature: (transactionMessage: TransactionMessage, addressLookupTableAccounts: AddressLookupTableAccount[], recentBlockhash: string, currentSymbol: CurrentSymbol, owner: any) => Promise<import("@solana/web3.js").VersionedTransaction[]>;
    compileTransaction: (swapBase64Str: string) => Promise<{
        message: TransactionMessage;
        addressesLookup: AddressLookupTableAccount[];
    }>;
    isInstructionsSupportReset: (transactionMessage: TransactionMessage) => boolean;
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
    getSwapEstimateGas: (currentSymbol: CurrentSymbol, path: any, accountAddress: string) => Promise<{
        gasLimit: number;
        data?: any;
    }>;
    getSwapFees: (currentSymbol: CurrentSymbol) => Promise<number>;
    swap: (currentSymbol: CurrentSymbol, transaction: any, accountAddress: string) => Promise<{
        error: boolean | string | null;
        result: any;
    }>;
    getHashStatus(hash: string, chain: string | number): Promise<{
        status: HashStatus;
    }>;
    wrappedExchange(chain: string | number, accountAddress: string, type: number, amount?: string): Promise<{
        error: any;
        result: {
            hash: string | null;
        } & any;
    }>;
}
export default TradeService;
//# sourceMappingURL=TradeService.d.ts.map