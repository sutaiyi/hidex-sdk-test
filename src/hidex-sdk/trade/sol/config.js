import { environmental } from '../../common/utils';
import { PublicKey } from '@solana/web3.js';
export const TOKEN_LIST_API_URL = 'https://token.jup.ag/all';
export const SwapChillApi = () => environmental('https://app.hidex.pro/solApi', 'https://hidex.open.name/solApi', '/solApi');
export const SwapJupiterApi = () => environmental('https://app.hidex.pro/solPub', 'https://hidex.open.name/solPub', '/solPub');
export const SwapJupiterQuoteApi = 'https://quote-api.jup.ag/v6';
export const SwapApi = SwapJupiterApi;
export const OUT_TIME = 2500;
export const PROGRAMID = () => environmental('FwtH3pYAC3QwAZNw6ZBnVd358ysPGdWx57TQAKQSEAjx', '6cvxe8KqAss1pY2xgXuB7yAn2Rb8ETXSjdfCC4UYbZr1', '6cvxe8KqAss1pY2xgXuB7yAn2Rb8ETXSjdfCC4UYbZr1');
export const commissionSignatureAddress = () => environmental('BFACRra5Q2uMPUphaUgcHxZN2dCFDc7r8NVd5amwv76a', '6hf6dpkKg1dBQYFPefZScXJL8gmkrtfNQBVcd6SPP8qF', '6hf6dpkKg1dBQYFPefZScXJL8gmkrtfNQBVcd6SPP8qF');
export const AssociateTokenProgram = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
export const AddressTable = '5ZF8nmsRMPB24j5UDU7ztjvxVBJ7pprZJvzbujZ5nKpQ';
export const TOKEN_2022_OWNER = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
export const simulateConfig = {
    sigVerify: true,
    replaceRecentBlockhash: false,
    commitment: 'processed',
};
export const SEED_SWAP = 'chill_swap';
export const SEED_DATA = 'chill_data';
export const SEED_TRADE = "trade_config_data";
export const WSOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");
export const SUPPORT_CHANGE_PROGRAM_IDS = new Map([
    ["675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8", 2],
    ["CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK", 16],
    ["CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C", 16],
    ["whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc", 16],
    ["LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo", 16],
    ["Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB", 16],
    ["JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4", 38],
    ["6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P", 16],
    ["pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA", 16],
]);
export const NEED_CHANGE_SLIPPAGE_PROGRAM_IDS = [
    "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
];
export const TOKEN_PROGRAM_OWNS = [
    "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
];
export const JITO_FEE_ACCOUNT = [
    "HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe",
    "DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh",
    "96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5",
    "Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY",
    "DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL",
    "ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49",
    "3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT",
    "ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt"
];
export const HIDEX_ADDRESS_LOOK_UP = new PublicKey("5ZF8nmsRMPB24j5UDU7ztjvxVBJ7pprZJvzbujZ5nKpQ");
export const SOLANA_SYSTEM_PROGRAM_ID = new PublicKey("11111111111111111111111111111111");
export const PUMP_PROGRAM_ID = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");
export const JUPITER_PROGRAM_ID = new PublicKey("JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4");
export const PUMP_AMM_PROGRAM_ID = new PublicKey("pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA");
export const GMGN_PRIORITY_FEE_Collect_ID = new PublicKey("BB5dnY55FXS1e1NXqZDwCzgdYJdMCj3B92PU6Q5Fb6DT");
export const PUEM_INSTRUCTION_PREFIX = "66063d1201daebea";
export const SOLANA_SYSTEM_PROGRAM_TRANSFER_ID = 0X02;
export const SOLANA_CREATE_ACCOUNT_WITH_SEED_ID = 0X03;
export const SOLANA_MAX_TX_SERIALIZE_SIGN = 1232;
export const DEFAULT_SWAP_SOL_LAMPORTS = BigInt("5000000000");
export const DEFAULT_SWAP_PUMP_LAMPORTS = BigInt("500000000");
export const BASE_ACCOUNT_INIT_FEE = BigInt("2039280");
export const TIP_MINI_IN_PRIORITY = BigInt("2000000");
export const DEFAULD_SOLANA_SWAP_LIMIT = Number("500000");
export const DEFAULD_SOLANA_GAS_LIMIT = Number("100000");
export const DEFAULD_BASE_GAS_FEE = Number("5000");
