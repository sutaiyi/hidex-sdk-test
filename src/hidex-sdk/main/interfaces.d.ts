import { ICatcher } from "../catch/interfaces";
import { ChainItem, INetworkService } from "../network/interfaces";
import { IWalletService } from "../wallet/interfaces";
export { ChainItem, INetworkService } from '../network/interfaces';
export { WalletCache, WalletAccount, WalletList, WalletCacheResult, IWalletService } from '../wallet/interfaces';
export { ITradeService, CurrentSymbol, TokenInfo, NetWorkFee } from '../trade/interfaces';
type HidexService = {
    init(): Promise<void>;
    environmental(production: any, uat: any, development: any): any;
    chains(chain?: number | string): ChainItem | ChainItem[];
    networkChange(currentNetWork: ChainItem): void;
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
};
export type OptionsItem = {
    options: Options;
};
export type OptionsCommon = Options & OptionsItem & HidexService & {
    catcher: ICatcher;
    network: INetworkService;
    wallet: IWalletService;
};
//# sourceMappingURL=interfaces.d.ts.map