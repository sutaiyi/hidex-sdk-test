import { IHidexService, Options, INetworkService, ChainItem } from './interfaces';
import { ICatcher } from '../catch/interfaces';
import { IWalletService } from '../wallet/interfaces';
export declare class HidexService implements IHidexService {
    options: Options;
    network: INetworkService;
    wallet: IWalletService;
    catcher: ICatcher;
    constructor(options: Options);
    private processOptions;
    environmental(production: any, uat: any, development: any): any;
    chains(chain?: string | number): ChainItem | ChainItem[];
}
//# sourceMappingURL=HidexService.d.ts.map