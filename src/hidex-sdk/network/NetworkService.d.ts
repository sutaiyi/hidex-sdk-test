import { Commitment } from "@solana/web3.js";
import { OptionsCommon } from "../main/interfaces";
import { ChainItem, Provider, INetworkService, SysProviderRpcsFace } from "./interfaces";
declare class NetworkController implements INetworkService {
    private network;
    private provider;
    private _sysProviderRpcs;
    private myProviders;
    private rpcs;
    private HS;
    constructor(options: OptionsCommon);
    getChainNameByChainId(chainId: number): string;
    getChainIdByChainName(chainName: string): number;
    get sysProviderRpcs(): SysProviderRpcsFace;
    set sysProviderRpcs(value: SysProviderRpcsFace);
    choose(chain: string | number): Promise<ChainItem>;
    get(chain?: string | number): ChainItem;
    private getProvider;
    getProviderByChain(chain: string | number, commitment?: Commitment): Provider | null;
    getProviderByChainByRpc(chain: string | number, rpc: string): Provider | null;
    getFastestProviderByChain(chain: string | number, commitment?: Commitment): Promise<Provider | null>;
    getFastestRpc(chain: string | number): Promise<string>;
    rpcProviderInit(): Promise<SysProviderRpcsFace>;
    getChainProviderFromRpcs(chain: string): Provider[];
    private solanaConnect;
}
export default NetworkController;
//# sourceMappingURL=NetworkService.d.ts.map