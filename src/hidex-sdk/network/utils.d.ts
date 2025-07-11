import { Apparatus, Env } from '../main/interfaces';
export declare function randoxHex(length?: number): string;
export declare function shiftEncrypt(input: string, shiftAmount: number): string;
export declare function toHex(num: number): string;
export declare function sign(key: string, ts: number): string;
export declare function getServerTime(): number;
export declare function getSolanaRpcHeard(shiftAmount?: number): any;
export declare function getSolRpcOrigin(env: Env, apparatus: Apparatus): any;
//# sourceMappingURL=utils.d.ts.map