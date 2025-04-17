import { PublicKey } from '@solana/web3.js';
import { PROGRAMID, SEED_SWAP } from '../sol/config';
import { zero } from '../../common/config';
export * from '../sol/utils';
export * from '../eth/utils';
export const getSingleContensBytes = (contents, signature) => {
    const contentsUint8Array = Buffer.from(contents.substring(2), 'hex');
    const signatureUint8Array = Buffer.from(signature.substring(2), 'hex');
    return {
        combinedBytes: contentsUint8Array,
        signReult: signatureUint8Array
    };
};
export const isSol = (chain) => {
    return (typeof chain === 'number' && chain === 102) || (typeof chain === 'string' && chain === 'SOLANA');
};
export const getInviterAddress = async (inviter, isSol) => {
    if (isSol && !inviter) {
        const programId = new PublicKey(PROGRAMID());
        const [swap_pda] = await PublicKey.findProgramAddress([Buffer.from(SEED_SWAP)], programId);
        return swap_pda;
    }
    if (isSol && inviter) {
        return new PublicKey(inviter);
    }
    return inviter || zero;
};
