import { CurrentSymbol, OptionsCommon } from '../../main/interfaces';
export interface FeeInfo {
    inviterDiscount: number;
    dexFee: number;
    inviterCommision: number;
}
declare class DexFeeService {
    private store;
    defaultFeeInfo: FeeInfo;
    private network;
    constructor(optins: OptionsCommon);
    execute(chain: string): Promise<FeeInfo>;
    getEthDexFee(chain: string): Promise<FeeInfo>;
    getDexFeeByChain(chain: string): Promise<FeeInfo>;
    set(key: string, value: FeeInfo): Promise<boolean>;
    get(key: string): Promise<FeeInfo>;
    getDexFee(): Promise<FeeInfo>;
    getAmountOut(bigOut: string): string;
    getSlipAmountOut(currentSymbol: CurrentSymbol, amountOut: number): number;
    getDexFeeAmountOut(amountOut: number): number;
    getDexFeeAmount(currentSymbol: CurrentSymbol, buyAmount: string): Promise<string>;
    getAmountOutMin(currentSymbol: CurrentSymbol, minOutAmount: string): Promise<string>;
}
export default DexFeeService;
//# sourceMappingURL=dexfee.d.ts.map