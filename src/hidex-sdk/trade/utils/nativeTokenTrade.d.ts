import { CurrentSymbol } from '../interfaces';
import { INetworkService } from '../../network/interfaces';
import { OptionsCommon } from '../../main/interfaces';
export declare const isMotherTrad: (currentSymbol: CurrentSymbol, network: INetworkService) => "" | "MBTOWMB" | "WMBTOMB";
export declare function wExchange(chain: string | number, owner: any, type: number, priorityFee: string, amount: string, HS: OptionsCommon): Promise<{
    error: any;
    result: {
        hash: string | null;
    } & any;
}>;
//# sourceMappingURL=nativeTokenTrade.d.ts.map