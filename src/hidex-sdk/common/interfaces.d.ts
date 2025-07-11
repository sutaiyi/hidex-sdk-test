export type TokenInfo = {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
    chainId?: number;
};
export interface SwapItem {
    name: string;
    chains: {
        [key: string]: SwapChainItem | undefined;
    };
    icon: string;
    url: string;
    isShow: boolean;
    fee: number;
}
export interface SwapChainItem {
    chainName: string;
    factoryAddress: {
        v1: string;
        v2: string;
        v3: string;
    };
}
//# sourceMappingURL=interfaces.d.ts.map