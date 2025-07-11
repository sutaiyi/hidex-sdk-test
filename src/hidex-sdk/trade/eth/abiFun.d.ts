interface AbiFun {
    [key: string]: string[];
}
export declare const abiInFun: AbiFun;
export declare const wethAbi: string[];
interface ActionNameAndValue {
    action: string;
    value: string;
}
export declare const actionNameAndValue: (inAddress: string, outAddress: string, amountIn: string) => ActionNameAndValue;
export {};
//# sourceMappingURL=abiFun.d.ts.map