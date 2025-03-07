import { Connection } from "@solana/web3.js";
import { defaultChain, defaultChainID } from "../common/config";
import { getSolanaRpcHeard, getSolRpcOrigin } from "./utils";
import LoggingProvider from "./provider";
import axios from "axios";
class NetworkController {
    network;
    provider;
    _sysProviderRpcs;
    myProviders;
    rpcs;
    HS;
    constructor(options) {
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
    getCodexChainIdByChainName(chainName) {
        let name = this.HS.chains(chainName)?.chainID;
        if (!name) {
            const item = this.HS.chains().find((v) => v.chain === chainName);
            if (item) {
                name = item.codexChainId;
            }
        }
        return name || defaultChainID;
    }
    get sysProviderRpcs() {
        if (this._sysProviderRpcs['ETH'] === undefined || this._sysProviderRpcs['ETH'].length === 0) {
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
                this.provider = new Connection(rpc, {
                    commitment: 'confirmed',
                    httpHeaders: {
                        'Content-Type': 'application/json',
                        ...getSolanaRpcHeard(),
                    },
                });
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
            ;
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
                        ...getSolanaRpcHeard(),
                    },
                });
            }
            catch (error) {
                throw new Error(error.message || 'Network error');
            }
        };
        const promises = rpcs.map((rpc) => {
            return testRpcSpeed(rpc)
                .then((res) => {
                if (res.status === 200 && res.data.id && !res.data.error) {
                    Promise.resolve(rpc);
                    return rpc;
                }
                throw new Error('Network error');
            })
                .catch((error) => {
                throw new Error(error);
            });
        });
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
                ...getSolanaRpcHeard(),
            },
        });
        return currentProvider;
    }
    getChainIds = () => {
        return this.HS.chains().map((item) => item.chainID);
    };
    getCodexChainIds = () => {
        return this.HS.chains().map((item) => item.codexChainId);
    };
}
export default NetworkController;
