export * from '../sol/utils';
export * from '../eth/utils';
export const getSingleContensBytes = (contents, signature) => {
    const contentsUint8Array = Buffer.from(contents.substring(2), "hex");
    const signatureUint8Array = Buffer.from(signature.substring(2), "hex");
    return {
        combinedBytes: contentsUint8Array,
        signReult: signatureUint8Array
    };
};
export const isSol = (chain) => {
    return (typeof chain === 'number' && chain === 102) || (typeof chain === 'string' && chain === 'SOLANA');
};
