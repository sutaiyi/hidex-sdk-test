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
        const connection = await network.getProviderByChain(102);
        if (connection) {
            const blockhash = await connection.getLatestBlockhash();
            this.lastBlockHash = blockhash;
        }
        this.clearTimer && global.clearInterval(this.clearTimer);
        this.clearTimer = global.setInterval(() => { this.getLatestBlockhash(network); }, 25000);
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
                signed_tx: signedTx,
            });
            if (response.status === 200 && response.data?.code === 0) {
                return {
                    success: true,
                    hash: signatureBase58[0],
                    currentSymbol,
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
        const endpoints = [
            'https://mainnet.block-engine.jito.wtf/api/v1/bundles',
            'https://amsterdam.mainnet.block-engine.jito.wtf/api/v1/bundles',
            'https://frankfurt.mainnet.block-engine.jito.wtf/api/v1/bundles',
            'https://ny.mainnet.block-engine.jito.wtf/api/v1/bundles',
            'https://tokyo.mainnet.block-engine.jito.wtf/api/v1/bundles',
        ];
        const serializedTransactions = [];
        for (const transaction of transactions) {
            serializedTransactions.push(bs58.encode(transaction.serialize()));
        }
        const signatureBase58 = transactions[3].signatures.map((sig) => bs58.encode(sig));
        const requests = endpoints.map((url) => axios
            .post(url, {
            jsonrpc: '2.0',
            id: 1,
            method: 'sendBundle',
            params: [serializedTransactions],
        })
            .then((res) => {
            Promise.resolve(res);
            return res;
        })
            .catch((error) => {
            return Promise.reject(error);
        }));
        const results = await Promise.any(requests);
        if (results.status === 200 && results.data && results.data.result) {
            return {
                success: true,
                hash: signatureBase58[0],
            };
        }
        throw new Error('Error submitSwapByJito api data error');
    }
    async getSwapStatus(hash) {
        try {
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
            }
            throw new Error('Get Transaction Status Error');
        }
        catch (error) {
            return 'Pending';
        }
    }
}
export default new DefiApi;
