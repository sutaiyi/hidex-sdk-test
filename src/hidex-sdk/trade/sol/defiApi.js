import axios from 'axios';
import bs58 from 'bs58';
const LastBlockHashMap = new Map();
class DefiApi {
    constructor() {
    }
    async getLatestBlockhash(network) {
        const connection = await network.getProviderByChain(102);
        if (connection) {
            const blockhash = await connection.getLatestBlockhash();
            LastBlockHashMap.set('lastBlockHash', blockhash);
            return blockhash;
        }
        setInterval(() => this.getLatestBlockhash, 30000);
    }
    async swapRoute(currentSymbol, amountIn, fromAddress) {
        try {
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
                    lastValidBlockHeight: raw_tx.lastValidBlockHeight
                };
            }
            if (response.status === 200 && response.data?.code !== 0) {
                throw new Error(response.data.msg);
            }
            throw new Error('Error API get_swap_route');
        }
        catch (error) {
            return {
                success: false,
                error
            };
        }
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
                    transaction
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
            const latestBlockhash = LastBlockHashMap.get('lastBlockHash');
            const url = `/gmgn/defi/router/v1/sol/tx/get_transaction_status?hash=${hash}&last_valid_height=${latestBlockhash?.lastValidBlockHeight}`;
            const response = await axios.get(url);
            if (response.status === 200 && response.data?.code === 0) {
                const { data } = response.data;
                if (data.expired) {
                    return 'expired';
                }
                if (data.success) {
                    return 'success';
                }
            }
            throw new Error('Error');
        }
        catch (error) {
            return 'error' + error;
        }
    }
}
export default DefiApi;
