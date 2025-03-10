import { environmental } from '../../common/utils';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
export const TOKEN_LIST_API_URL = 'https://token.jup.ag/all';
export const SwapChillApi = environmental('https://app.hidex.pro/solApi', 'https://hidex.open.name/solApi', '/solApi');
export const SwapJupiterApi = environmental('https://app.hidex.pro/solPub', 'https://hidex.open.name/solPub', '/solPub');
export const SwapJupiterQuoteApi = 'https://quote-api.jup.ag/v6';
export const SwapApi = SwapJupiterApi;
export const OUT_TIME = 2500;
export const PROGRAMID = environmental('FwtH3pYAC3QwAZNw6ZBnVd358ysPGdWx57TQAKQSEAjx', '6cvxe8KqAss1pY2xgXuB7yAn2Rb8ETXSjdfCC4UYbZr1', '6cvxe8KqAss1pY2xgXuB7yAn2Rb8ETXSjdfCC4UYbZr1');
export const commissionSignatureAddress = environmental('BFACRra5Q2uMPUphaUgcHxZN2dCFDc7r8NVd5amwv76a', '6hf6dpkKg1dBQYFPefZScXJL8gmkrtfNQBVcd6SPP8qF', '6hf6dpkKg1dBQYFPefZScXJL8gmkrtfNQBVcd6SPP8qF');
export const AssociateTokenProgram = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
export const AddressTable = '5ZF8nmsRMPB24j5UDU7ztjvxVBJ7pprZJvzbujZ5nKpQ';
export const TOKEN_2022_OWNER = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
export const simulateConfig = {
    sigVerify: true,
    replaceRecentBlockhash: false,
    commitment: 'processed',
};
export const ownerKeypair = (key) => {
    return Keypair.fromSecretKey(bs58.decode(key));
};
export const owner = ownerKeypair('KJWXrT2D971hYPydn8M9CV22Hdh7M8hVAHQP5buQZWZ6WRsqNh9GRLg8XecFW5fdCZLLFwT19DU9rkkSFLfAAYw');
export const SEED_SWAP = 'chill_swap';
export const SEED_DATA = 'chill_data';
