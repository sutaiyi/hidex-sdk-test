export declare function isHexString(str: string): boolean;
export declare function isEthereumAddress(address: string): boolean;
export declare function isSolanaAddress(address: string): boolean;
export declare function checkAddressChain(address: string): string;
export declare function sha256(message: string): Promise<string>;
export declare function isValidSHA256(hash: string): boolean;
export declare function fillZeroNumber(index: number): string;
export declare function numberToCharCode(num: number): string;
export declare function deepCopy(obj: any): any;
export declare function copyJson<T>(obj: T): T;
export declare function isValidEthPrivateKey(key: string): boolean;
export declare function isValidSolanaPrivateKey(key: string): boolean;
export declare function whosePrivater(privateKey: string): string;
export declare function findAndIncrementMax(arr: number[]): number;
export declare function noIntersection(arr1: string[], arr2: string[]): boolean;
export declare function tokenDecode(encodedData: string): {
    address: any;
    name: any;
    symbol: any;
    decimals: any;
};
export declare function bundlesStatuses(data: string): Promise<{
    context: any;
    value: any;
}>;
export declare function addUniqueItem(arr: Array<any>, item: any, id: string): Array<any>;
export declare function removeDuplicateObjects(arr: Array<any>, id: string): Array<any>;
export declare function mergeAndDeduplicateObjects(arr1: Array<any>, arr2: Array<any>, id: string): Array<any>;
export declare function mergedRepeat(arr1: Array<any>, arr2: Array<any>, id: string): Array<any>;
export declare function toLzString(input: string): string;
export declare function lzStringTo(input: string): string;
//# sourceMappingURL=utils.d.ts.map