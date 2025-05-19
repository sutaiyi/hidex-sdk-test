import axios from 'axios';
import bs58 from 'bs58';
class DefiApi {
    clearTimer;
    maxBlockHashCount;
    currentBlockHashCount;
    lastBlockHash;
    constructor() {
        this.clearTimer = null;
        this.lastBlockHash = {
            blockhash: '',
            lastValidBlockHeight: 0
        };
        this.currentBlockHashCount = 0;
        this.maxBlockHashCount = 10;
    }
    async getLatestBlockhash(network) {
        await this.updateLatestBlockhash(network);
        this.clearTimer && global.clearInterval(this.clearTimer);
        this.clearTimer = global.setInterval(() => {
            this.getLatestBlockhash(network);
        }, 25000);
        return this.lastBlockHash;
    }
    async updateLatestBlockhash(network) {
        try {
            if (network.get().chainID !== 102) {
                return this.lastBlockHash;
            }
            const connection = await network.getProviderByChain(102);
            if (connection) {
                const blockhash = await connection.getLatestBlockhash();
                if (blockhash && blockhash.blockhash) {
                    this.lastBlockHash = blockhash;
                    this.currentBlockHashCount = 0;
                    return blockhash;
                }
            }
            throw new Error("Can't get latest blockhash");
        }
        catch (error) {
            if (this.currentBlockHashCount < this.maxBlockHashCount) {
                return new Promise((resolve) => {
                    setTimeout(async () => {
                        try {
                            this.currentBlockHashCount++;
                            const res = await this.updateLatestBlockhash(network);
                            resolve(res);
                            return res;
                        }
                        catch (error) { }
                    }, 1000);
                });
            }
            else {
                return this.lastBlockHash;
            }
        }
    }
    stopLatestBlockhash() {
        this.clearTimer && global?.clearInterval(this.clearTimer);
    }
    startLatestBlockhash(network) {
        this.getLatestBlockhash(network);
    }
    async swapRoute(currentSymbol, fromAddress) {
        const amountIn = BigInt(currentSymbol.amountIn) - BigInt(currentSymbol.dexFeeAmount);
        const inputToken = currentSymbol.in.address;
        const outputToken = currentSymbol.out.address;
        let slippage = currentSymbol.slipPersent * 100;
        const fee = 0.0001;
        const url = `/gmgn/defi/router/v1/sol/tx/get_swap_route?token_in_address=${inputToken}&token_out_address=${outputToken}&in_amount=${amountIn}&from_address=${fromAddress}&slippage=${slippage}&fee=${fee}`;
        const response = await axios.get(url);
        if (response.status === 200 && response.data?.code === 0) {
            const { quote, raw_tx } = response.data.data;
            return {
                success: true,
                swapTransaction: raw_tx.swapTransaction,
                outAmount: quote.outAmount,
                data: { ...quote }
            };
        }
        if (response.status === 200 && response.data?.code !== 0) {
            throw new Error(response.data.msg);
        }
        throw new Error('Error API get_swap_route');
    }
    async submitSwap(currentSymbol, transaction) {
        try {
            const signedTx = Buffer.from(transaction.serialize()).toString('base64');
            const signatureBase58 = transaction.signatures.map((sig) => bs58.encode(sig));
            const response = await axios.post('/gmgn/defi/router/v1/sol/tx/submit_signed_transaction', {
                signed_tx: signedTx
            });
            if (response.status === 200 && response.data?.code === 0) {
                return {
                    success: true,
                    hash: signatureBase58[0],
                    currentSymbol
                };
            }
            if (response.status === 200 && response.data?.code !== 0) {
                throw new Error(response.data.msg);
            }
            throw new Error('Error API submit_signed_transaction');
        }
        catch (error) {
            throw new Error(JSON.stringify(error));
        }
    }
    async submitByQuiknode() {
    }
    async submitSwapByJito(transactions) {
        const jitoPostTime = new Date().getTime();
        try {
            const endpointsByQuiknode = ['https://sleek-thrilling-owl.solana-mainnet.quiknode.pro/ad3162ba7f548c9dfc2215e4614036e6e2787ecb'];
            const endpoints = [
                ...endpointsByQuiknode,
                'https://mainnet.block-engine.jito.wtf/api/v1/transactions',
                'https://amsterdam.mainnet.block-engine.jito.wtf/api/v1/transactions',
                'https://frankfurt.mainnet.block-engine.jito.wtf/api/v1/transactions',
                'https://ny.mainnet.block-engine.jito.wtf/api/v1/transactions',
                'https://tokyo.mainnet.block-engine.jito.wtf/api/v1/transactions'
            ];
            const signedTx = Buffer.from(transactions[0].serialize()).toString('base64');
            const signatureBase58 = transactions[0].signatures.map((sig) => bs58.encode(sig));
            const signatureBase58_swap = signatureBase58;
            const params = {
                jsonrpc: '2.0',
                id: 1,
                method: 'sendTransaction',
                params: [
                    signedTx,
                    {
                        encoding: 'base64'
                    }
                ]
            };
            const requests = endpoints.map((url) => axios
                .post(url, params, {
                timeout: 3000
            })
                .then((res) => {
                Promise.resolve(res);
                return res;
            })
                .catch((error) => {
                return Promise.reject(error);
            }));
            const results = await Promise.any(requests);
            console.log('submitSwapByJito results', results);
            if (results.status === 200 && results?.data?.result) {
                return {
                    success: true,
                    hash: signatureBase58[0],
                    data: {
                        swapHash: signatureBase58_swap[0],
                        jitoBundle: [results?.data?.result],
                        jitoPostTime
                    }
                };
            }
            return {
                success: false,
                hash: ''
            };
        }
        catch (error) {
            console.log('sendBundle error', error);
            if (error instanceof AggregateError) {
                if (error?.errors?.length) {
                    const errRes = error.errors[1];
                    if (errRes?.response?.data?.error?.message) {
                        throw new Error(errRes.response.data.error.message);
                    }
                }
            }
            return {
                success: false,
                hash: ''
            };
        }
    }
    async handlerJitoPost(endpoints, params) {
        for (const url of endpoints) {
            try {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                await axios.post(url, params);
            }
            catch (error) {
                console.log('handlerJitoPost error', error);
            }
        }
    }
    async getSwapStatus(hash) {
        try {
            const latestBlockhash = this.lastBlockHash;
            const url = `/gmgn/defi/router/v1/sol/tx/get_transaction_status?hash=${hash}&last_valid_height=${latestBlockhash?.lastValidBlockHeight}`;
            const response = await axios.get(url, {
                timeout: 1000
            });
            if (response.status === 200 && response.data?.code === 0) {
                const { data } = response.data;
                if (data.expired) {
                    return 'Expired';
                }
                if (data.success && !data.err) {
                    return 'Confirmed';
                }
                if (data.failed) {
                    return 'Failed';
                }
                return 'Pending';
            }
            throw new Error('Get Transaction Status Error');
        }
        catch (error) {
            return 'Pending';
        }
    }
    async bundlesStatuses(bundles) {
        try {
            console.log('bundlesStatuses --data', bundles);
            if (!bundles?.length)
                return 'Pending';
            const res = await (await fetch('https://mainnet.block-engine.jito.wtf/api/v1/getBundleStatuses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getBundleStatuses',
                    params: [bundles]
                })
            })).json();
            if (res?.result?.value?.length) {
                const status = ['processed', 'confirmed', 'finalized'];
                const statusRes = status.includes(res.result.value[0]?.confirmation_status) ? 'Confirmed' : 'Pending';
                if (statusRes === 'Confirmed') {
                    return 'Confirmed';
                }
                return 'Pending';
            }
            return 'Failed';
        }
        catch (error) {
            console.log('bundlesStatuses --error', error);
            return 'Failed';
        }
    }
    async rpcSwapStatus(hash, connection) {
        try {
            const result = await connection.getSignatureStatus(hash, { searchTransactionHistory: true });
            console.log('SOL RPC状态查询 confirmation===', result);
            if (result?.value?.confirmationStatus === 'confirmed' || result?.value?.confirmationStatus === 'finalized') {
                return 'Confirmed';
            }
            return 'Pending';
        }
        catch (error) {
            return 'Pending';
        }
    }
}
export default new DefiApi();
