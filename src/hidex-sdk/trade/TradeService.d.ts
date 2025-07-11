import { CurrentSymbol, ITradeService, NetWorkFee, ITradeFunctions, SendTransactionParams, IApproveService, IDefiApi, HashStatus, ITradeHashStatusService, WithdrawSign } from './interfaces';
import { ChainItem, OptionsCommon } from '../main/interfaces';
import EventEmitter from '../common/eventEmitter';
import { AddressLookupTableAccount, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
declare class TradeService extends EventEmitter implements ITradeService {
    app: ITradeFunctions | null;
    chainId: number;
    errorCode: number;
    private HS;
    private solService;
    private ethService;
    approve: IApproveService;
    defiApi: IDefiApi;
    checkHash: ITradeHashStatusService;
    constructor(options: OptionsCommon);
    resetInstructions: (currentSymbol: CurrentSymbol, transactionMessage: TransactionMessage, newInputAmount: bigint, newOutputAmount: bigint) => TransactionMessage;
    getTransactionsSignature: (transactionMessage: TransactionMessage, addressLookupTableAccounts: AddressLookupTableAccount[], recentBlockhash: string, currentSymbol: CurrentSymbol, owner: any, HS: OptionsCommon) => Promise<VersionedTransaction[]>;
    compileTransaction: (swapBase64Str: string) => Promise<{
        message: TransactionMessage;
        addressesLookup: AddressLookupTableAccount[];
    }>;
    getAddressLookup: (swapBase64Str: string) => Promise<{
        addressesLookup: AddressLookupTableAccount[];
    }>;
    getOwnerTradeNonce: (accountAddress: string) => Promise<number>;
    isInstructionsSupportReset: (transactionMessage: TransactionMessage, currentSymbol: CurrentSymbol) => boolean;
    changeTradeService: (currentNetwork: ChainItem) => void;
    getBalance: (accountAddress: string, tokenAddress?: string, isAta?: boolean) => Promise<string>;
    getBalanceMultiple: (chain: string, accountAddress: string, tokens: Array<string>) => Promise<Array<string>>;
    getNetWorkFees: (gasLimit: number | undefined, tradeType: number) => Promise<NetWorkFee[]>;
    getSendEstimateGas: (sendParams: SendTransactionParams) => Promise<{
        gasLimit: number;
    }>;
    getSendFees: (networkFee: NetWorkFee, toAddress: string, tokenAddress: string) => Promise<number>;
    sendTransaction: (sendParams: SendTransactionParams & {
        currentNetWorkFee: NetWorkFee;
    }) => Promise<{
        error: boolean | string | null;
        result: any;
    }>;
    getAllowance: (tokenAddress: string, accountAddress: string, authorizedAddress: string) => Promise<number>;
    toApprove: (tokenAddress: string, accountAddress: string, authorizedAddress: string, amountToApprove?: number) => Promise<boolean>;
    getSwapPath: (currentSymbol: CurrentSymbol) => Promise<{
        fullAmoutOut: string;
        data: any;
        authorizationTarget?: string;
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
    claimCommission: (params: {
        chainId: number;
        walletAddress: string;
        amount: string;
    }) => Promise<WithdrawSign>;
    getHashStatus(hash: string, chain: string | number, bundles?: Array<string>): Promise<{
        status: HashStatus;
        message?: any;
    }>;
    getHashsStatus(hashs: Array<string[]>, chain: string | number, bundles?: Array<string>): Promise<{
        status: HashStatus;
        message?: any;
    }>;
    wrappedExchange(chain: string | number, accountAddress: string, type: number, priorityFee: string, amount?: string): Promise<{
        error: any;
        result: {
            hash: string | null;
        } & any;
    }>;
    sendSimulateTransaction(accountAddress: string, vertransaction: VersionedTransaction): Promise<{
        error: any;
        result: {
            hash: string | null;
            data: any;
        } & any;
    }>;
}
export default TradeService;
//# sourceMappingURL=TradeService.d.ts.map