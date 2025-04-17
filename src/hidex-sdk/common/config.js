export const dexWalletFee = 0.01;
export const mTokenAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export const smTokenAddress = 'SoEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export const sTokenAddress = 'So11111111111111111111111111111111111111112';
export const zero = '0x0000000000000000000000000000000000000000';
export const ethRpcKey = '952c535fa7d7487a80eb600457d80ea0';
export const defaultChain = 'SOLANA';
export const defaultChainID = 102;
export const ethSeries = [1, 8453, 11155111, 56];
export const SORT_SERIES = ['ETH', 'BASE', 'SOL', 'SOLANA', 'BSC'];
export const ETH_SERIES = ['ETH', 'BASE', 'BSC'];
export const NOAPPROVE_CHAINID = [102];
export const priorityFeeOnChain = 0.0015;
export const HIDEXKEYWORD = 'HIDEXSAFETY';
export function swaps(swapName) {
    const swapList = [
        {
            name: 'pancakeswap',
            chains: {
                BSC: {
                    chainName: 'BSC',
                    factoryAddress: {
                        v1: '',
                        v2: '0xca143ce32fe78f1f7019d7d551a6402fc5350c73',
                        v3: ''
                    }
                }
            },
            icon: '',
            url: 'https://pancakeswap.finance',
            isShow: true,
            fee: 0.0025
        },
        {
            name: 'uniswap',
            chains: {
                ETH: {
                    chainName: 'ETH',
                    factoryAddress: {
                        v1: '',
                        v2: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
                        v3: '0x1F98431c8aD98523631AE4a59f267346ea31F984'
                    }
                },
                BASE: {
                    chainName: 'BASE',
                    factoryAddress: {
                        v1: '',
                        v2: '0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6',
                        v3: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD'
                    }
                }
            },
            icon: '',
            url: 'https://app.uniswap.org',
            isShow: true,
            fee: 0.003
        }
    ];
    if (swapName) {
        const swapItem = swapList.find((v) => v.name.toLowerCase() === swapName.toLowerCase());
        if (swapItem) {
            return swapItem;
        }
    }
    return swapList;
}
export const CurrentInTokenDefalut = 0;
export const ethTokens = [
    {
        symbol: 'ETH',
        name: 'Ether',
        address: mTokenAddress,
        decimals: 18
    },
    {
        symbol: 'WETH',
        name: 'Wrapped Ether',
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        decimals: 18
    },
    {
        symbol: 'USDC',
        name: 'USDC',
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        decimals: 6
    },
    {
        symbol: 'USDT',
        name: 'Tether USD',
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        decimals: 6
    }
];
export const baseTokens = [
    {
        symbol: 'ETH',
        name: 'Ether',
        address: mTokenAddress,
        decimals: 18
    },
    {
        symbol: 'WETH',
        name: 'Wrapped Ether',
        address: '0x4200000000000000000000000000000000000006',
        decimals: 18
    },
    {
        symbol: 'USDC',
        name: 'USDC',
        address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        decimals: 6
    },
    {
        symbol: 'USDT',
        name: 'Tether USD',
        address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
        decimals: 6
    }
];
export const bnbTokens = [
    {
        symbol: 'BNB',
        name: 'BNB Smart',
        address: mTokenAddress,
        decimals: 18
    },
    {
        symbol: 'WBNB',
        name: 'Wrapped Bnber',
        address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
        decimals: 18
    },
    {
        symbol: 'BUSD',
        name: 'BUSD',
        address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
        decimals: 18
    },
    {
        symbol: 'USDT',
        name: 'Tether USD',
        address: '0x55d398326f99059fF775485246999027B3197955',
        decimals: 18
    }
];
export const solTokens = [
    {
        symbol: 'SOL',
        name: 'Solana',
        address: smTokenAddress,
        decimals: 9
    },
    {
        symbol: 'WSOL',
        name: 'Wrapped SOL',
        address: sTokenAddress,
        decimals: 9
    },
    {
        symbol: 'USDT',
        name: 'USDT',
        address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        decimals: 6
    },
    {
        symbol: 'USDC',
        name: 'USDC',
        address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        decimals: 6
    }
];
export const arbitrumTokens = [
    {
        symbol: 'ETH',
        name: 'Ether',
        address: mTokenAddress,
        decimals: 18
    },
    {
        symbol: 'WETH',
        name: 'Wrapped Ether',
        address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        decimals: 18
    }
];
export const quiknodeRpcs = {
    BSC: 'https://summer-skilled-waterfall.bsc.quiknode.pro/6f175483760776b1110b93d57290c19b1f8ec5aa'
};
export const website = ['https://dexscreener.com', 'https://birdeye.so', 'https://ave.ai', 'https://www.dextools.io'];
export const twitterUrl = 'https://twitter.com';
export const newTwitterUrl = 'https://x.com';
export const quoteTokens = () => {
    return [
        ...solTokens.map((v) => v.address.toLowerCase()),
        ...bnbTokens.map((v) => v.address.toLowerCase()),
        ...ethTokens.map((v) => v.address.toLowerCase()),
        ...baseTokens.map((v) => v.address.toLowerCase()),
        ...arbitrumTokens.map((v) => v.address.toLowerCase())
    ];
};
export const NAMES = {
    accountName: 'Wallet ',
    walletName: 'Wallet ',
    usePrividerName: 'Private Key'
};
export const keysingMessage = {
    get: 'KEYSING_PASSWORD_GET',
    set: 'KEYSING_PASSWORD_SET',
    key: 'KEYSING_PASSWORD'
};
export const ENCRYPTION_NAME = {
    0: 'ADDRESS_',
    1: 'MNEMONIC_HASH_'
};
export const defalutWalletStore = { pathIndex: 0, walletList: [], isUnlocked: false, upgrade: false };
export const defaluBoootedOss = {
    walletBooted: {},
    pathIndex: 0,
    currentWalletId: '0&0',
    booted: ''
};
