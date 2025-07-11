import { Connection } from '@solana/web3.js';
import { defaultChain, defaultChainID, quiknodeRpcs } from '../common/config';
import { getSolanaRpcHeard, getSolRpcOrigin } from './utils';
import LoggingProvider from './provider';
import axios from 'axios';
import EventEmitter from '../common/eventEmitter';
class NetworkController extends EventEmitter {
    network;
    provider;
    _sysProviderRpcs;
    myProviders;
    rpcs;
    HS;
    constructor(options) {
        super();
        this.network = options.chains(defaultChainID);
        this.provider = this.getProvider();
        this._sysProviderRpcs = {};
        this.myProviders = {};
        this.rpcs = (() => {
            const rpcs = {};
            for (const chainItem of options.chains()) {
                rpcs[chainItem.chain] = chainItem.rpc;
            }
            return rpcs;
        })();
        this.HS = options;
    }
    getChainNameByChainId(chainId) {
        let name = this.HS.chains(chainId)?.chain;
        if (!name) {
            const item = this.HS.chains().find((v) => v.codexChainId === chainId);
            if (item) {
                name = item.chain;
            }
        }
        return name || defaultChain;
    }
    getChainIdByChainName(chainName) {
        return this.HS.chains(chainName)?.chainID || defaultChainID;
    }
    getCodexChainIdByChain(chain) {
        let item = this.HS.chains(chain);
        if (item) {
            return item.codexChainId;
        }
        throw new Error('chain not found');
    }
    getOkxChainIdByChain(chain) {
        let item = this.HS.chains(chain);
        if (item) {
            return item.okxChainId;
        }
        throw new Error('chain not found');
    }
    get sysProviderRpcs() {
        if (this._sysProviderRpcs['BSC'] === undefined || this._sysProviderRpcs['BSC'].length === 0) {
            for (const chain of Object.keys(this.rpcs)) {
                this._sysProviderRpcs[chain] = this.getChainProviderFromRpcs(chain);
            }
        }
        else {
            this._sysProviderRpcs['SOLANA'] = this.getChainProviderFromRpcs('SOLANA');
        }
        return this._sysProviderRpcs;
    }
    set sysProviderRpcs(value) {
        this._sysProviderRpcs = value;
    }
    async choose(chain) {
        try {
            this.network = this.HS.chains(chain);
            this.HS.networkChange(this.network);
            this.provider = this.getProvider(true);
            return this.network;
        }
        catch (error) {
            throw new Error('Choose network error');
        }
    }
    get(chain) {
        if (chain) {
            return this.HS.chains(chain);
        }
        return this.network;
    }
    getProvider(reload = false) {
        try {
            let rpc = this.network?.rpc[0];
            if (this.myProviders[this.network.chain.toLowerCase()] && !reload && this.network.chain.toLowerCase() !== 'solana') {
                this.provider = this.myProviders[this.network.chain.toLowerCase()];
                return this.provider;
            }
            if (this.network.chainID === 102) {
                if (rpc === '/solana_new') {
                    rpc = `${getSolRpcOrigin(this.HS.env, this.HS.apparatus)}/solana_new`;
                }
                this.provider = this.solanaConnect(rpc, 'confirmed');
                this.myProviders[this.network.chain.toLowerCase()] = this.provider;
                return this.provider;
            }
            this.provider = new LoggingProvider(rpc, this.network.chainID);
            this.myProviders[this.network.chain.toLowerCase()] = this.provider;
            return this.provider;
        }
        catch (error) {
            return new Error(error.message || 'Network error');
        }
    }
    getProviderByChain(chain, commitment = 'confirmed') {
        try {
            const currentChain = this.HS.chains(chain);
            let rpc = currentChain.rpc[0];
            const chainID = currentChain.chainID;
            const chainName = this.getChainNameByChainId(chainID);
            if (this._sysProviderRpcs[chainName]?.length > 0) {
                return this.sysProviderRpcs[chainName][0];
            }
            if (chainID === 102) {
                if (rpc === '/solana_new') {
                    rpc = `${getSolRpcOrigin(this.HS.env, this.HS.apparatus)}/solana_new`;
                }
                const currentProvider = this.solanaConnect(rpc, commitment);
                return currentProvider;
            }
            const currentProvider = new LoggingProvider(rpc, chainID);
            return currentProvider;
        }
        catch (error) {
            return null;
        }
    }
    getClipProviderByChain(chain) {
        try {
            const currentChain = this.HS.chains(chain);
            const chainName = currentChain.chain;
            let rpc = quiknodeRpcs[chainName];
            const chainID = currentChain.chainID;
            const currentProvider = new LoggingProvider(rpc, chainID);
            return currentProvider;
        }
        catch (error) {
            return null;
        }
    }
    getProviderByChainByRpc(chain, rpc) {
        try {
            const currentChain = this.HS.chains(chain);
            const chainID = currentChain.chainID;
            if (chainID === 102) {
                if (rpc === '/solana_new') {
                    rpc = `${getSolRpcOrigin(this.HS.env, this.HS.apparatus)}/solana_new`;
                }
                const currentProvider = this.solanaConnect(rpc);
                return currentProvider;
            }
            const currentProvider = new LoggingProvider(rpc, chainID);
            return currentProvider;
        }
        catch (error) {
            console.error('GetProviderByChainByRpc Error', error);
            return null;
        }
    }
    async getFastestProviderByChain(chain, commitment = 'confirmed') {
        try {
            let rpc = await this.getFastestRpc(chain);
            const currentChain = this.HS.chains(chain);
            const chainID = currentChain.chainID;
            if (chainID === 102) {
                if (rpc === '/solana_new') {
                    rpc = `${getSolRpcOrigin(this.HS.env, this.HS.apparatus)}/solana_new`;
                }
                const currentProvider = this.solanaConnect(rpc, commitment);
                return currentProvider;
            }
            const currentProvider = new LoggingProvider(rpc, chainID);
            return currentProvider;
        }
        catch (error) {
            return null;
        }
    }
    async getFastestRpc(chain) {
        let method = 'eth_blockNumber';
        const currentChain = this.HS.chains(chain);
        const chainID = currentChain.chainID;
        if (chainID === 102) {
            method = 'getLatestBlockhash';
        }
        const rpcs = currentChain.rpc;
        const testRpcSpeed = async (url) => {
            if (url === '/solana_new') {
                url = `${getSolRpcOrigin(this.HS.env, this.HS.apparatus)}/solana_new`;
            }
            try {
                return await axios.post(url, { jsonrpc: '2.0', method, params: [], id: 1 }, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...getSolanaRpcHeard()
                    }
                });
            }
            catch (error) {
                throw new Error(error.message || 'Network error');
            }
        };
        const promises = rpcs.map((rpc) => testRpcSpeed(rpc)
            .then((res) => {
            if (res.status === 200 && res.data.id && !res.data.error) {
                Promise.resolve(rpc);
                return rpc;
            }
            throw new Error('Network error');
        })
            .catch((error) => {
            return Promise.reject(error);
        }));
        const fasteRpc = await Promise.any(promises);
        return fasteRpc;
    }
    async rpcProviderInit() {
        for (const chainItem of this.HS.chains()) {
            const arr = chainItem.rpc;
            if (arr && arr.length > 0) {
                this.rpcs[chainItem.chain] = arr;
            }
            else {
                this.rpcs[chainItem.chain] = chainItem.rpc;
            }
            const rpcp = this.getChainProviderFromRpcs(chainItem.chain);
            this._sysProviderRpcs[chainItem.chain] = rpcp;
        }
        return this._sysProviderRpcs;
    }
    getChainProviderFromRpcs(chain) {
        const rpcp = [];
        for (const rkey in this.rpcs[chain]) {
            const rpc = this.rpcs[chain][rkey];
            if (rpc) {
                const rProvider = this.getProviderByChainByRpc(chain, rpc);
                if (rProvider) {
                    rpcp.push(rProvider);
                }
            }
        }
        return rpcp;
    }
    solanaConnect(rpc, commitment = 'confirmed') {
        const currentProvider = new Connection(rpc, {
            commitment,
            httpHeaders: {
                'Content-Type': 'application/json',
                ...getSolanaRpcHeard()
            },
            confirmTransactionInitialTimeout: 15000
        });
        return currentProvider;
    }
    getChainIds = () => {
        return this.HS.chains().map((item) => item.chainID);
    };
    getCodexChainIds = () => {
        return this.HS.chains().map((item) => item.codexChainId);
    };
    getChainList = () => {
        return this.HS.chains();
    };
}
export default NetworkController;
