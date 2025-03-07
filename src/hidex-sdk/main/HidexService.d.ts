import { IHidexService, Options, INetworkService, ChainItem } from './interfaces';
import { ICatcher } from '../catch/interfaces';
import { IWalletService } from '../wallet/interfaces';
import { ITradeService } from '../trade/interfaces';
export declare class HidexService implements IHidexService {
    options: Options;
    network: INetworkService;
    wallet: IWalletService;
    catcher: ICatcher;
    trade: ITradeService;
    constructor(options: Options);
    init(): Promise<void>;
    private processOptions;
    environmental(production: any, uat: any, development: any): any;
    chains(chain?: string | number): ChainItem | ChainItem[];
    networkChange: (currentNetwork: ChainItem) => void;
}
//# sourceMappingURL=HidexService.d.ts.map