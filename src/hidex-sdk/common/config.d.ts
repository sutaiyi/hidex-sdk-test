import { BootedOssStore, WalletStore } from '../wallet/interfaces';
import { SwapItem } from './interfaces';
export declare const dexWalletFee = 0.01;
export declare const mTokenAddress = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
export declare const smTokenAddress = "SoEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
export declare const sTokenAddress = "So11111111111111111111111111111111111111112";
export declare const zero = "0x0000000000000000000000000000000000000000";
export declare const ethRpcKey: string;
export declare const defaultChain: string;
export declare const defaultChainID: number;
export declare const ethSeries: number[];
export declare const SORT_SERIES: string[];
export declare const ETH_SERIES: string[];
export declare const NOAPPROVE_CHAINID: number[];
export declare const priorityFeeOnChain = 0.0015;
export declare const HIDEXKEYWORD: string;
export declare function swaps(swapName?: string): SwapItem | SwapItem[];
export declare const CurrentInTokenDefalut = 0;
export declare const ethTokens: {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
}[];
export declare const baseTokens: {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
}[];
export declare const bnbTokens: {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
}[];
export declare const solTokens: {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
}[];
export declare const arbitrumTokens: {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
}[];
export declare const quiknodeRpcs: Record<string, string>;
export declare const website: Array<string>;
export declare const twitterUrl = "https://twitter.com";
export declare const newTwitterUrl = "https://x.com";
export declare const quoteTokens: () => Array<string>;
export declare const NAMES: {
    accountName: string;
    walletName: string;
    usePrividerName: string;
};
export declare const keysingMessage: {
    get: string;
    set: string;
    key: string;
};
export declare const ENCRYPTION_NAME: {
    0: string;
    1: string;
};
export declare const defalutWalletStore: WalletStore;
export declare const defaluBoootedOss: BootedOssStore;
//# sourceMappingURL=config.d.ts.map