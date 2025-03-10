import { CurrentSymbol } from '../interfaces';
import { INetworkService } from '../../network/interfaces';
export declare const isMotherTrad: (currentSymbol: CurrentSymbol, network: INetworkService) => "" | "MBTOWMB" | "WMBTOMB";
export declare function motherCurrencyTrade(currentSymbol: CurrentSymbol, privateKey: string, way: string, network: INetworkService): Promise<{
    error: any;
    result: {
        hash: string | null;
    } & any;
}>;
//# sourceMappingURL=nativeTokenTrade.d.ts.map