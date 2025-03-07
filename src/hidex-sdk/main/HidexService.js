import { baseTokens, bnbTokens, ethTokens, solTokens } from '../common/config';
import NetworkService from '../network/NetworkService';
import CatcherService from '../catch';
import WalletService from '../wallet/WalletService';
import keysing from '../wallet/keysing';
import TradeService from '../trade/TradeService';
export class HidexService {
    options;
    network;
    wallet;
    catcher;
    trade;
    constructor(options) {
        console.log('HidexService constructor called and options are: ', options);
        this.options = options;
        this.catcher = new CatcherService(options.apparatus);
        const serveCommon = this.processOptions(options);
        this.network = new NetworkService(serveCommon);
        this.wallet = new WalletService(serveCommon);
        this.wallet.cloudWalletStore().getWalletItem(serveCommon);
        serveCommon.network = this.network;
        serveCommon.wallet = this.wallet;
        this.trade = new TradeService(serveCommon);
    }
    async init() {
        this.wallet.eventSecretCode();
        await keysing.keysingInitialized(this.catcher);
    }
    processOptions(options) {
        return {
            ...options,
            options,
            catcher: this.catcher,
            environmental: this.environmental,
            chains: this.chains
        };
    }
    environmental(production, uat, development) {
        if (this.options.env === 'production') {
            return production;
        }
        else if (this.options.env === 'development') {
            return development;
        }
        else if (this.options.env === 'uat') {
            return uat;
        }
        return production;
    }
    chains(chain) {
        const rpcList = this.options.rpcList;
        const findRpcItem = (chainID, rpcList) => {
            const item = rpcList.find(r => r.chainId === chainID);
            if (!item) {
                throw new Error(`Chain with ID ${chainID} not found`);
            }
            return item;
        };
        const chainsList = [
            {
                chainName: 'Solana',
                chain: 'SOLANA',
                dexscreenerChain: 'solana',
                aveChain: 'solana',
                gmgnChain: 'sol',
                aliasChain: ['SOL', 'SOLANA'],
                chainID: 102,
                codexChainId: 1399811149,
                token: 'SOL',
                tokens: solTokens,
                rpc: ['https://swr.xnftdata.com/rpc-proxy', ...(findRpcItem(102, rpcList).rpc.split(','))],
                blockExplorerUrls: ['https://solscan.io'],
                blockExplorerName: 'Solscan',
                defaultPath: `m/44'/501'/0'/0`,
                swapName: 'Jupiter',
                deTrade: '',
                defaultLimit: 0,
                apieceOfTime: 2000,
            },
            {
                chainName: 'Ethereum',
                chain: 'ETH',
                dexscreenerChain: 'ethereum',
                aveChain: 'eth',
                gmgnChain: 'eth',
                aliasChain: ['ETH', 'ETHEREUM', 'ETHER'],
                chainID: 1,
                codexChainId: 1,
                token: 'ETH',
                tokens: ethTokens,
                rpc: [
                    'https://rpc.ankr.com/eth',
                    ...(findRpcItem(1, rpcList).rpc.split(','))
                ],
                blockExplorerUrls: ['https://etherscan.io'],
                blockExplorerName: 'Etherscan',
                defaultPath: `m/44'/60'/0'/0/0`,
                swapName: 'Uniswap',
                deTrade: this.environmental('0x48c679449d77f064e72972EFA9c08c80CcCa759A', '0xe9B034cc80F7165c173aF212752aBF42f590C83B', '0xe9B034cc80F7165c173aF212752aBF42f590C83B'),
                defaultLimit: 500000,
                apieceOfTime: 12000,
            },
            {
                chainName: 'Base',
                chain: 'BASE',
                dexscreenerChain: 'base',
                aveChain: 'base',
                gmgnChain: 'base',
                aliasChain: ['BASE'],
                chainID: 8453,
                codexChainId: 8453,
                token: 'ETH',
                tokens: baseTokens,
                rpc: [
                    'https://1rpc.io/base',
                    ...(findRpcItem(8453, rpcList).rpc.split(','))
                ],
                blockExplorerUrls: ['https://basescan.org'],
                blockExplorerName: 'Basescan',
                defaultPath: `m/44'/60'/0'/0/0`,
                swapName: 'Uniswap',
                deTrade: this.environmental('0xd59Dca2923AC747bbe478032F61C00202cfED5D8', '0x8D349A8a122b14a5fDd7f8AEe085AD47605395D8', '0x8D349A8a122b14a5fDd7f8AEe085AD47605395D8'),
                defaultLimit: 500000,
                apieceOfTime: 2000,
            },
            {
                chainName: 'BSC',
                chain: 'BSC',
                dexscreenerChain: 'bsc',
                aveChain: 'bsc',
                gmgnChain: 'bsc',
                aliasChain: ['BSC', 'BNB'],
                chainID: 56,
                codexChainId: 56,
                token: 'BNB',
                tokens: bnbTokens,
                rpc: [
                    'https://bsc-dataseed.bnbchain.org',
                    ...(findRpcItem(8453, rpcList).rpc.split(','))
                ],
                blockExplorerUrls: ['https://bscscan.com'],
                blockExplorerName: 'Bscscan',
                defaultPath: `m/44'/60'/0'/0/0`,
                swapName: 'pancakeswap',
                deTrade: this.environmental('0xa079ACfE0CaCAC7C21457808354Ee876A330a79B', '0x4f10DAab76d78F53684270dc8A3E2c0a32d58b62', '0x4f10DAab76d78F53684270dc8A3E2c0a32d58b62'),
                defaultLimit: 500000,
                apieceOfTime: 2000,
            },
        ];
        if (chain) {
            if (typeof chain === 'string') {
                const chainItem = chainsList.find((v) => v.aliasChain.includes(chain.toUpperCase()));
                return chainItem;
            }
            else if (typeof chain === 'number') {
                const chainItem = chainsList.find((v) => v.chainID === chain);
                return chainItem;
            }
            else {
                throw new Error(`Error chain: ${chain}`);
            }
        }
        return chainsList;
    }
}
