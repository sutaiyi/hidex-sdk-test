import { bnbTokens, solTokens } from '../common/config';
import NetworkService from '../network/NetworkService';
import CatcherService from '../catch';
import WalletService from '../wallet/WalletService';
import keysing from '../wallet/keysing';
import TradeService from '../trade/TradeService';
import DexFeeService from '../trade/utils/dexfee';
import { globalSet } from '../common/utils';
import UtilsService from '../utils/UtilsService';
import packageData from '../package.json';
export class HidexService {
    options;
    network;
    wallet;
    catcher;
    trade;
    dexFee;
    utils;
    constructor(options) {
        console.log(`HidexService constructor called and options are: `, options);
        let version = '';
        if (packageData) {
            version = `Hidex SDK Version: v${packageData.version}`;
            console.log(version);
        }
        this.options = options;
        this.utils = new UtilsService();
        this.catcher = new CatcherService(options.apparatus);
        const serveCommon = this.processOptions(options);
        this.network = new NetworkService(serveCommon);
        this.wallet = new WalletService(serveCommon);
        serveCommon.network = this.network;
        serveCommon.wallet = this.wallet;
        this.dexFee = new DexFeeService(serveCommon);
        this.trade = new TradeService(serveCommon);
        globalSet('HidexConfig', { ...options, rpcList: this.chains(), time: new Date().getTime(), version });
    }
    async init() {
        await keysing.keysingInitialized(this.catcher);
        this.wallet.eventSecretCode();
        await this.wallet.getWalletCatch(this.catcher);
        await this.wallet.getCloudBootedOss(this.processOptions(this.options));
        await this.wallet.walletInit();
    }
    processOptions(options) {
        return {
            ...options,
            options,
            catcher: this.catcher,
            environmental: this.environmental,
            chains: this.chains,
            networkChange: this.networkChange,
            init: this.init,
            network: this.network,
            wallet: this.wallet,
            dexFee: this.dexFee,
            utils: this.utils
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
        const restRpcItem = (chainID, rpcList, defaultRpc) => {
            const item = rpcList.find((r) => r.chainId === chainID);
            if (!item) {
                throw new Error(`Chain with ID ${chainID} not found`);
            }
            if (!item.rpc) {
                return defaultRpc;
            }
            return Array.from(new Set([...item.rpc.split(','), ...defaultRpc]));
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
                okxChainId: 501,
                token: 'SOL',
                tokens: solTokens,
                rpc: restRpcItem(102, rpcList, []),
                blockExplorerUrls: ['https://solscan.io'],
                blockExplorerName: 'Solscan',
                defaultPath: `m/44'/501'/0'/0`,
                swapName: 'Jupiter',
                deTrade: '',
                defaultLimit: 0,
                apieceOfTime: 2000
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
                okxChainId: 56,
                token: 'BNB',
                tokens: bnbTokens,
                rpc: restRpcItem(56, rpcList, ['https://bsc-dataseed.bnbchain.org']),
                blockExplorerUrls: ['https://bscscan.com'],
                blockExplorerName: 'Bscscan',
                defaultPath: `m/44'/60'/0'/0/0`,
                swapName: 'pancakeswap',
                deTrade: this.environmental('0xa079ACfE0CaCAC7C21457808354Ee876A330a79B', '0x4f10DAab76d78F53684270dc8A3E2c0a32d58b62', '0x4f10DAab76d78F53684270dc8A3E2c0a32d58b62'),
                defaultLimit: 500000,
                apieceOfTime: 2000
            }
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
    networkChange = (currentNetwork) => {
        this.trade.changeTradeService(currentNetwork);
    };
}
