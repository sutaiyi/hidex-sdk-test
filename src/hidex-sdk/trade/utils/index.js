export const getSingleContensBytes = (contents, signature) => {
    const contentsUint8Array = Buffer.from(contents.substring(2), "hex");
    const signatureUint8Array = Buffer.from(signature.substring(2), "hex");
    return {
        combinedBytes: contentsUint8Array,
        signReult: signatureUint8Array
    };
};
