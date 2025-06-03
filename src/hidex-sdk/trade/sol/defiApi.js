import axios from 'axios';
import bs58 from 'bs58';
import { Connection } from '@solana/web3.js';
import { JITO_SEND_URL, QUIKNODE_SEND_URL } from './config';
import { urlPattern } from './utils';
import { axiosErrorMessage } from '../../common/utils';
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
        const url = `/gmgn/defi/router/v1/sol/tx/get_swap_route?token_in_address=${inputToken}&token_out_address=${outputToken}&in_amount=${amountIn}&from_address=${fromAddress}&slippage=${slippage}&fee=${fee}&is_anti_mev=false`;
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
            const response = await axios.post('/gmgn/txproxy/v1/send_transaction', {
                chain: 'sol',
                signedTx: signedTx,
                isAntiMev: false
            });
            if (response.status === 200 && response.data?.code === 0) {
                return {
                    success: true,
                    hash: signatureBase58[0],
                    currentSymbol,
                    data: {
                        errorMessage: ''
                    }
                };
            }
            if (response.status === 200 && response.data?.code !== 0) {
                throw new Error(response.data.msg);
            }
            throw new Error('Error API submit_signed_transaction');
        }
        catch (error) {
            console.log('submitSwap error', error);
            return {
                success: false,
                hash: '',
                currentSymbol,
                data: {
                    errorMessage: `极速模式交易发送失败，Error url: /txproxy/v1/send_transaction；` + error + axiosErrorMessage(error)
                }
            };
        }
    }
    async submitSwapFastByBlox(currentSymbol, transaction) {
        try {
            const signedTx = Buffer.from(transaction.serialize()).toString('base64');
            const signatureBase58 = transaction.signatures.map((sig) => bs58.encode(sig));
            const response = await axios.post('/blox_api/api/v2/submit', {
                transaction: {
                    content: signedTx
                },
                skipPreFlight: true,
                frontRunningProtection: false,
                fastBestEffort: false,
                useStakedRPCs: true
            });
            console.log('submitSwapFastByBlox', response);
            if (response.status === 200 && response.data?.code === 0) {
                return {
                    success: true,
                    hash: signatureBase58[0],
                    currentSymbol,
                    data: {
                        errorMessage: ''
                    }
                };
            }
            if (response.status === 200 && response.data?.code !== 0) {
                throw new Error(response.data.msg);
            }
            throw new Error('Error API submit_signed_transaction');
        }
        catch (error) {
            console.log('submitSwap error', error);
            return {
                success: false,
                hash: '',
                currentSymbol,
                data: {
                    errorMessage: `极速模式交易发送失败，Error url: /blox_api/api/v2/submit；` + error + axiosErrorMessage(error)
                }
            };
        }
    }
    async submitByQuiknode() {
    }
    async submitSwapByJito(transactions) {
        const submitPostTime = new Date().getTime();
        let postPath = '';
        try {
            const endpoints = [...QUIKNODE_SEND_URL, ...JITO_SEND_URL];
            const signedTx = Buffer.from(transactions[0].serialize()).toString('base64');
            let signatureBase58 = transactions[0].signatures.map((sig) => bs58.encode(sig));
            let signatureBase58_swap = signatureBase58;
            const serializedTransactions = [];
            if (transactions.length >= 4) {
                for (const transaction of transactions) {
                    serializedTransactions.push(Buffer.from(transaction.serialize()).toString('base64'));
                }
                signatureBase58_swap = transactions[1].signatures.map((sig) => bs58.encode(sig));
                signatureBase58 = transactions[2].signatures.map((sig) => bs58.encode(sig));
            }
            const paramsData = transactions.length === 1
                ? {
                    method: 'sendTransaction',
                    params: [
                        signedTx,
                        {
                            encoding: 'base64'
                        }
                    ]
                }
                : {
                    method: 'sendBundle',
                    params: [
                        serializedTransactions,
                        {
                            encoding: 'base64'
                        }
                    ]
                };
            const params = {
                jsonrpc: '2.0',
                id: 1,
                ...paramsData
            };
            postPath = transactions.length === 1 ? 'transactions' : 'bundles';
            const requests = endpoints.map((url) => axios
                .post(`${url}/${url.includes('quiknode') ? '' : postPath}`, params)
                .then((res) => {
                Promise.resolve(res);
                return res;
            })
                .catch((error) => {
                console.log('submitSwapByJito error', error);
                return Promise.reject(error);
            }));
            const results = await Promise.any(requests);
            console.log('submitSwapByJito results', results);
            if (results.status === 200 && results?.data?.result) {
                return {
                    success: true,
                    hash: signatureBase58[0],
                    data: {
                        errorMessage: null,
                        swapHash: signatureBase58_swap[0],
                        jitoBundle: [results?.data?.result],
                        submitPostTime,
                        lastBlockHash: this.lastBlockHash
                    }
                };
            }
            return {
                success: false,
                hash: '',
                data: {
                    errorMessage: 'Error API submitSwapByJito',
                    lastBlockHash: this.lastBlockHash
                }
            };
        }
        catch (error) {
            console.log('SendBundle error', error);
            if (error instanceof AggregateError) {
                if (error?.errors?.length) {
                    const errRes = error.errors[0];
                    if (errRes?.response?.data) {
                        return {
                            success: false,
                            hash: '',
                            data: {
                                errorMessage: `防夹模式交易发送失败，Error url: ${postPath};` + JSON.stringify(errRes.response?.data),
                                lastBlockHash: this.lastBlockHash
                            }
                        };
                    }
                }
            }
            return {
                success: false,
                hash: '',
                data: {
                    errorMessage: `防夹模式交易发送失败，Error url: ${postPath}; error：${error}, ${axiosErrorMessage(error)}`,
                    lastBlockHash: this.lastBlockHash
                }
            };
        }
    }
    async submitSwapByBlox(transactions) {
        const submitPostTime = new Date().getTime();
        let postPath = '';
        try {
            const endpoints = ['/blox_api/api/v2/'];
            const signedTx = Buffer.from(transactions[0].serialize()).toString('base64');
            let signatureBase58 = transactions[0].signatures.map((sig) => bs58.encode(sig));
            let signatureBase58_swap = signatureBase58;
            const serializedTransactions = [];
            if (transactions.length >= 4) {
                for (const transaction of transactions) {
                    serializedTransactions.push({
                        transaction: {
                            content: Buffer.from(transaction.serialize()).toString('base64')
                        }
                    });
                }
                signatureBase58_swap = transactions[1].signatures.map((sig) => bs58.encode(sig));
                signatureBase58 = transactions[2].signatures.map((sig) => bs58.encode(sig));
            }
            const paramsData = transactions.length === 1
                ? {
                    transaction: {
                        content: signedTx
                    },
                    frontRunningProtection: true,
                    fastBestEffort: true,
                    skipPreFlight: true
                }
                : {
                    entries: serializedTransactions,
                    useBundle: true
                };
            postPath = transactions.length === 1 ? 'submit' : 'submi-batch';
            const requests = endpoints.map((url) => axios
                .post(url + postPath, paramsData)
                .then((res) => {
                Promise.resolve(res);
                return res;
            })
                .catch((error) => {
                console.log('submitSwapByBlox error', error);
                return Promise.reject(error);
            }));
            const results = await Promise.any(requests);
            console.log('submitSwapByBlox results', results);
            if (results.status === 200 && results?.data?.result) {
                return {
                    success: true,
                    hash: signatureBase58[0],
                    data: {
                        errorMessage: null,
                        swapHash: signatureBase58_swap[0],
                        jitoBundle: [results?.data?.result],
                        submitPostTime,
                        lastBlockHash: this.lastBlockHash
                    }
                };
            }
            return {
                success: false,
                hash: '',
                data: {
                    errorMessage: 'Error API submitSwapByBlox',
                    lastBlockHash: this.lastBlockHash
                }
            };
        }
        catch (error) {
            console.log('Blox Error', error);
            if (error instanceof AggregateError) {
                if (error?.errors?.length) {
                    const errRes = error.errors[0];
                    if (errRes?.response?.data) {
                        return {
                            success: false,
                            hash: '',
                            data: {
                                errorMessage: `防夹模式交易发送失败，Error url: ${postPath};` + JSON.stringify(errRes.response?.data),
                                lastBlockHash: this.lastBlockHash
                            }
                        };
                    }
                }
            }
            return {
                success: false,
                hash: '',
                data: {
                    errorMessage: `防夹模式交易发送失败，Error url: ${postPath}; error：${error}, ${axiosErrorMessage(error)}`,
                    lastBlockHash: this.lastBlockHash
                }
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
                    return Promise.reject('Pending');
                }
                if (data.success && !data.err) {
                    return 'Confirmed';
                }
                if (data.failed) {
                    return 'Failed';
                }
                return Promise.reject('Pending');
            }
            throw new Error('Get Transaction Status Error');
        }
        catch (error) {
            return Promise.reject('Pending');
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
            if ((result?.value?.confirmationStatus === 'confirmed' || result?.value?.confirmationStatus === 'finalized') && !result?.value?.err) {
                return 'Confirmed';
            }
            if (result?.value?.err) {
                return 'Failed';
            }
            return Promise.reject('Pending');
        }
        catch (error) {
            return Promise.reject('Pending');
        }
    }
    async rpcHeliusSwapStatus(hash) {
        const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=e1f7e962-4c6b-40c2-9852-f35189c3ccd7', {
            commitment: 'confirmed'
        });
        try {
            const result = await connection.getSignatureStatus(hash, { searchTransactionHistory: true });
            console.log('SOL RPC状态查询 confirmation===', result);
            if ((result?.value?.confirmationStatus === 'confirmed' || result?.value?.confirmationStatus === 'finalized') && !result?.value?.err) {
                return 'Confirmed';
            }
            if (result?.value?.err) {
                return 'Failed';
            }
            return Promise.reject('Pending');
        }
        catch (error) {
            return Promise.reject('Pending');
        }
    }
    establishingConnection() {
        const endpoints = [...QUIKNODE_SEND_URL, ...JITO_SEND_URL];
        endpoints.forEach((url) => {
            const ht = url.match(urlPattern);
            ht && axios.get(ht[0]);
        });
    }
}
export default new DefiApi();
