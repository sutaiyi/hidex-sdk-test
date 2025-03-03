import { ICatcher } from "../catch/interfaces";
import { ChainItem } from "../network/interfaces";
export { ChainItem, INetworkService } from '../network/interfaces';
export { WalletCache, WalletAccount, WalletList, WalletCacheResult, IWalletService } from '../wallet/interfaces';
type HidexService = {
    environmental(production: any, uat: any, development: any): any;
    chains(chain?: number | string): ChainItem | ChainItem[];
};
export type IHidexService = HidexService;
export type RpcItem = {
    chainId: number;
    chainName?: string;
    rpc: string;
};
export type RpcList = RpcItem[];
export type Env = 'development' | 'production' | 'uat';
export type Apparatus = 'web' | 'app' | 'h5' | 'telegram';
export type EventCallback = (data?: unknown) => void;
export type Options = {
    rpcList: RpcList;
    env: Env;
    apparatus: Apparatus;
    token: string;
    apiUrl: string;
};
export type OptionsCommon = Options & HidexService & {
    catcher: ICatcher;
};
//# sourceMappingURL=interfaces.d.ts.map