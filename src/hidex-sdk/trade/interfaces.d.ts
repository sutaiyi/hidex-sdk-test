import { ChainItem, Provider } from '../network/interfaces';
export interface ITradeOthersFunction {
    changeTradeService(currentNetwork: ChainItem): void;
}
export interface ITradeService extends ITradeFunctions, ITradeOthersFunction {
    approve: IApproveService;
}
export interface ITradeFunctions {
    getBalance(accountAddress: string, tokenAddress?: string, provider?: Provider): Promise<string>;
    getBalanceMultiple(chain: string, accountAddress: string, tokens: Array<string>): Promise<Array<string>>;
    getNetWorkFees(gasLimit: number): Promise<NetWorkFee[]>;
    getAllowance(tokenAddress: string, accountAddress: string, authorizedAddress: string): Promise<number>;
    toApprove(tokenAddress: string, accountAddress: string, authorizedAddress: string, amountToApprove?: number): Promise<boolean>;
    getSendEstimateGas(sendParams: SendTransactionParams): Promise<{
        gasLimit: number;
    }>;
    getSendFees(networkFee: NetWorkFee): Promise<number>;
    sendTransaction(sendParams: SendTransactionParams & {
        currentNetWorkFee: NetWorkFee;
    }): Promise<{
        error: boolean | string | null;
        result: any;
    }>;
    getSwapPath(currentSymbol: CurrentSymbol): Promise<{
        minOutAmount: string;
        data: any;
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
}
export interface IDexFeeService {
}
export interface IApproveService {
    execute(tokenAddress: string, accountAddress: string, authorizedAddress: string): Promise<boolean>;
}
export type SendTransactionParams = {
    from: string;
    to: string;
    amount: string;
    tokenAddress?: string;
};
export type CurrentSymbol = {
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
//# sourceMappingURL=interfaces.d.ts.map