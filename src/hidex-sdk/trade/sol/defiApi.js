import axios from 'axios';
import bs58 from 'bs58';
class DefiApi {
    clearTimer;
    lastBlockHash;
    constructor() {
        this.clearTimer = null;
        this.lastBlockHash = {
            blockhash: '',
            lastValidBlockHeight: 0
        };
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
        if (network.get().chainID !== 102) {
            return this.lastBlockHash;
        }
        const connection = await network.getProviderByChain(102);
        if (connection) {
            const blockhash = await connection.getLatestBlockhash();
            this.lastBlockHash = blockhash;
            return blockhash;
        }
        return this.lastBlockHash;
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
    async submitSwapByJito(transactions) {
        const jitoPostTime = new Date().getTime();
        try {
            const endpoints = [
                'https://mainnet.block-engine.jito.wtf/api/v1/bundles',
                'https://amsterdam.mainnet.block-engine.jito.wtf/api/v1/bundles',
                'https://frankfurt.mainnet.block-engine.jito.wtf/api/v1/bundles',
                'https://ny.mainnet.block-engine.jito.wtf/api/v1/bundles',
                'https://tokyo.mainnet.block-engine.jito.wtf/api/v1/bundles'
            ];
            const serializedTransactions = [];
            for (const transaction of transactions) {
                serializedTransactions.push(bs58.encode(transaction.serialize()));
            }
            const signatureBase58 = transactions[3].signatures.map((sig) => bs58.encode(sig));
            const signatureBase58_swap = transactions[2].signatures.map((sig) => bs58.encode(sig));
            const params = {
                jsonrpc: '2.0',
                id: 1,
                method: 'sendBundle',
                params: [serializedTransactions]
            };
            const requests = endpoints.map((url) => axios
                .post(url, params)
                .then((res) => {
                Promise.resolve(res);
                return res;
            })
                .catch((error) => {
                return Promise.reject(error);
            }));
            const results = await Promise.any(requests);
            if (results.status === 200 && results?.data?.result) {
                this.handlerJitoPost(endpoints, params);
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
                    const errRes = error.errors[0];
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
        try {
            endpoints.forEach((url) => {
                axios.post(url, params);
            });
        }
        catch (error) {
            console.log('handlerJitoPost error', error);
        }
        try {
            for (const url of endpoints) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                await axios.post(url, params);
            }
        }
        catch (error) {
            console.log('handlerJitoPost error', error);
        }
    }
    async getSwapStatus(hash) {
        const latestBlockhash = this.lastBlockHash;
        const url = `/gmgn/defi/router/v1/sol/tx/get_transaction_status?hash=${hash}&last_valid_height=${latestBlockhash?.lastValidBlockHeight}`;
        const response = await axios.get(url);
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
    async bundlesStatuses(bundles) {
        try {
            console.log('bundlesStatuses --data', bundles);
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
                return status.includes(res.result.value[0]?.confirmation_status) ? 'Confirmed' : 'Pending';
            }
            return 'Failed';
        }
        catch (error) {
            console.log('bundlesStatuses --error', error);
            return 'Failed';
        }
    }
}
export default new DefiApi();
