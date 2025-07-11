import { AddressLookupTableAccount, BlockhashWithExpiryBlockHeight, Connection, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { ChainItem, INetworkService } from '../network/interfaces';
import { ICatcher } from '../catch/interfaces';
import EventEmitter from '../common/eventEmitter';
import { OptionsCommon } from '../main/interfaces';
export type HashStatus = 'Confirmed' | 'Pending' | 'Failed' | 'Expired';
export interface ITradeOthersFunction {
    defiApi: IDefiApi;
    changeTradeService(currentNetwork: ChainItem): void;
    resetInstructions(currentSymbol: CurrentSymbol, transactionMessage: TransactionMessage, newInputAmount: bigint, newOutputAmount: bigint): TransactionMessage;
    isInstructionsSupportReset(transactionMessage: TransactionMessage, currentSymbol: CurrentSymbol): boolean;
    compileTransaction(swapBase64Str: string): Promise<{
        message: TransactionMessage;
        addressesLookup: AddressLookupTableAccount[];
    }>;
    getAddressLookup(swapBase64Str: string): Promise<{
        addressesLookup: AddressLookupTableAccount[];
    }>;
    getOwnerTradeNonce(accountAddress: string): Promise<number>;
    getTransactionsSignature(transactionMessage: TransactionMessage, addressLookupTableAccounts: AddressLookupTableAccount[], recentBlockhash: string, currentSymbol: CurrentSymbol, owner: any, HS: OptionsCommon): Promise<Array<VersionedTransaction>>;
    getHashStatus(hash: string, chain: string | number): Promise<{
        status: HashStatus;
        message?: any;
    }>;
    getHashsStatus(hashs: Array<string[]>, chain: string | number): Promise<{
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
        };
    }>;
}
export interface ITradeService extends ITradeFunctions, ITradeOthersFunction, EventEmitter {
    approve: IApproveService;
    checkHash: ITradeHashStatusService;
}
export interface ITradeFunctions {
    getBalance(accountAddress: string, tokenAddress?: string, isAta?: boolean): Promise<string>;
    getBalanceMultiple(chain: string, accountAddress: string, tokens: Array<string>): Promise<Array<string>>;
    getNetWorkFees(gasLimit: number, tradeType: number): Promise<NetWorkFee[]>;
    getAllowance(tokenAddress: string, accountAddress: string, authorizedAddress: string): Promise<number>;
    toApprove(tokenAddress: string, accountAddress: string, authorizedAddress: string, amountToApprove?: number): Promise<boolean>;
    getSendEstimateGas(sendParams: SendTransactionParams): Promise<{
        gasLimit: number;
    }>;
    getSendFees(networkFee: NetWorkFee, toAddress: string, tokenAddress: string): Promise<number>;
    sendTransaction(sendParams: SendTransactionParams & {
        currentNetWorkFee: NetWorkFee;
    }): Promise<{
        error: boolean | string | null;
        result: any;
    }>;
    getSwapPath(currentSymbol: CurrentSymbol): Promise<{
        fullAmoutOut: string;
        data: any;
        authorizationTarget?: string;
    }>;
    getSwapEstimateGas(currentSymbol: CurrentSymbol, path: any, accountAddress: string): Promise<{
        gasLimit: number;
        data?: any;
    }>;
    getSwapFees(currentSymbol: CurrentSymbol): Promise<number>;
    swap(currentSymbol: CurrentSymbol, transaction: any, accountAddress: string): Promise<{
        error: boolean | string | null;
        result: any;
    }>;
    claimCommission(params: {
        chainId: number;
        walletAddress: string;
        amount: string;
    }): Promise<WithdrawSign>;
}
export interface ITradeAbout extends ITradeFunctions {
    hashStatus(hash: string, chain?: string | number, bundles?: Array<string>): Promise<{
        status: HashStatus;
        message?: string;
    }>;
    hashsStatus(hashs: Array<string[]>, chain?: string | number, bundles?: Array<string>): Promise<{
        status: HashStatus;
        message?: string;
    }>;
}
export interface ITradeHashStatusService extends EventEmitter {
    getHashes: () => Promise<Array<HashStatusParams>>;
    setHash: (catcher: ICatcher, hashItem: HashStatusParams) => Promise<boolean>;
    action: (hashItem: HashStatusParams) => Promise<void>;
    hashsAction: (hashItem: HashStatusParams) => Promise<void>;
}
export type HashStatusParams = {
    hash: string;
    chain: string | number;
    status?: HashStatus;
    createTime: number;
    updateTime?: number;
    timer?: any;
    data?: any;
    message?: any;
    tradeType: number;
    bundles?: Array<string>;
    failedType?: number;
    fetchCount?: number;
    hashs?: Array<string[]>;
};
export interface IDexFeeService {
}
export interface IDefiApi {
    lastBlockHash: BlockhashWithExpiryBlockHeight;
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
    submitSwapByJito(transactions: Array<VersionedTransaction>): Promise<{
        success: boolean;
        hash: string;
        data?: any;
    }>;
    getSwapStatus(hash: string): Promise<any>;
    bundlesStatuses(bundles: Array<string>): Promise<HashStatus>;
    rpcSwapStatus(hash: string, connection: Connection): Promise<HashStatus>;
    rpcHeliusSwapStatus(hash: string, connection: Connection): Promise<HashStatus>;
    establishingConnection(): void;
}
export interface IApproveService {
    execute(tokenAddress: string, accountAddress: string, authorizedAddress: string, chain: string | number): Promise<boolean>;
}
export type SendTransactionParams = {
    from: string;
    to: string;
    amount: string;
    tokenAddress?: string;
};
export type CurrentSymbol = {
    chain: string | number;
    in: TokenInfo;
    out: TokenInfo;
    amountIn: string;
    amountOutMin: string;
    amountOut?: string;
    poolFee?: number;
    slipPersent: number;
    poolAddress: string;
    networkFee?: NetWorkFee | null;
    priorityFee: string;
    bribeFee: string;
    dexFeeAmount: string;
    isBuy: boolean;
    tradeType: number;
    isPump: boolean;
    TOKEN_2022: Boolean;
    balanceBuy?: string;
    balanceSell?: string;
    inviter?: string;
    contents?: string;
    signature?: string;
    feeRate?: number;
    commissionRate?: number;
    compile?: any;
    currentPrice: number;
    okxPrice?: number;
    cryptoPriceUSD: number;
    preAmountIn: string;
    preAmountOut: string;
    tokenBalance: string;
    solLamports: string;
    userwsolAtaAmount: string;
    userWsolAtaLamports: string;
    tokenAtaLamports: string;
    fireworks?: boolean | undefined;
    otherTokenInfo?: any;
    tradeNonce?: number;
};
export type TokenInfo = {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
    chainId?: number;
};
export type NetWorkFee = {
    value: number;
    unit: string;
    gasPrice: string;
    gasLimit: number;
    rate?: number;
    maxPriorityFeePerGas?: string;
    maxFeePerGas?: string;
};
export type PumpDetail = {
    mint: string;
    name: string;
    symbol: string;
    description: string;
    image_uri: string;
    metadata_uri: string;
    twitter: string;
    telegram: string;
    bonding_curve: string;
    associated_bonding_curve: string;
    creator: string;
    created_timestamp: number;
    raydium_pool: string | null;
    complete: boolean;
    virtual_sol_reserves: string;
    virtual_token_reserves: string;
    total_supply: string;
    website: string;
    show_name: string;
    king_of_the_hill_timestamp: number;
    market_cap: string;
    reply_count: number;
    last_reply: string;
    nsfw: boolean;
    market_id: string | null;
    inverted: string | null;
    is_currently_live: boolean;
    username: string;
    profile_image: string | null;
    usd_market_cap: number;
};
export type WithdrawSign = {
    code: number;
    message: string;
    txhash?: string;
    success?: boolean;
    data: {
        amount: string;
        contents: string;
        signature: string;
        sendTs: number;
        id: string;
        signer: string;
        walletAddress?: string;
        nonce: number;
    } | null;
};
//# sourceMappingURL=interfaces.d.ts.map