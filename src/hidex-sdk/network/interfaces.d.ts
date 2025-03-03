import { TokenInfo } from '../common/interfaces';
import { Connection } from '@solana/web3.js';
import { providers } from 'ethers';
export interface INetworkService {
    choose(chain: string | number): Promise<ChainItem>;
    get(chain?: string | number): ChainItem;
    getProviderByChain(chain: string | number, commitment?: string): Provider | null;
    getFastestProviderByChain(chain: string | number, commitment?: string): Promise<Provider | null>;
    getChainNameByChainId(chainId: number): string;
    getChainIdByChainName(chainName: string): number;
    getFastestRpc(chain: string | number): Promise<string>;
    get sysProviderRpcs(): SysProviderRpcsFace;
    set sysProviderRpcs(value: SysProviderRpcsFace);
}
export type Provider = providers.Provider | Connection;
export type Rpcs = {
    [key: string]: Array<string>;
};
export type ChainItem = {
    chainName: string;
    chain: string;
    dexscreenerChain: string;
    aveChain: string;
    gmgnChain: string;
    chainID: number;
    token: string;
    tokens: TokenInfo[];
    aliasChain: string[];
    rpc: string[];
    blockExplorerUrls: string[];
    blockExplorerName: string;
    swapName: string;
    deTrade: string;
    defaultPath: string;
    defaultLimit?: number;
    apieceOfTime: number;
};
export type NetworkStore = {
    currentChain: ChainItem;
    chains: ChainItem[];
};
export type ProvidersFace = {
    [key: string]: Provider;
};
export type SysProviderRpcsFace = {
    [key: string]: Array<Provider | null>;
};
//# sourceMappingURL=interfaces.d.ts.map