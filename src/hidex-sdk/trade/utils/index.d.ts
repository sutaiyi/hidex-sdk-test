import { PublicKey } from '@solana/web3.js';
export * from '../sol/utils';
export * from '../eth/utils';
export declare const getSingleContensBytes: (contents: string, signature: string) => {
    combinedBytes: Buffer<ArrayBuffer>;
    signReult: Buffer<ArrayBuffer>;
};
export declare const isSol: (chain: string | number) => chain is "SOLANA" | 102;
export declare const getInviterAddress: (inviter: string, isSol: boolean) => Promise<string | PublicKey>;
//# sourceMappingURL=index.d.ts.map