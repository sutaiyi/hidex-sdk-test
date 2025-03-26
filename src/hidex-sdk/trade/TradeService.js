import { ethService } from './eth/index';
import { solService } from './sol/index';
import { defaultChainID, ETH_SERIES } from '../common/config';
import ApproveService from './utils/approve';
import { compileTransaction, resetInstructions, getTransactionsSignature, isInstructionsSupportReset } from './sol/instruction/index';
import EventEmitter from '../common/eventEmitter';
import DefiApi from './sol/defiApi';
import TradeHashStatusService from './TradeHashStatusService';
import { wExchange } from './utils/nativeTokenTrade';
import { simulateConfig } from './sol/config';
class TradeService extends EventEmitter {
    app;
    chainId;
    errorCode = 9800;
    HS;
    approve;
    defiApi;
    checkHash;
    constructor(options) {
        super();
        this.chainId = defaultChainID;
        this.app = defaultChainID === 102 ? solService(options) : ethService(options);
        this.HS = options;
        this.approve = new ApproveService({ ...options, trade: this });
        this.checkHash = new TradeHashStatusService({ ...options, trade: this });
        this.defiApi = DefiApi;
        this.defiApi.getLatestBlockhash(this.HS.network);
    }
    resetInstructions = (currentSymbol, transactionMessage, newInputAmount, newOutputAmount) => {
        return resetInstructions(currentSymbol, transactionMessage, newInputAmount, newOutputAmount);
    };
    getTransactionsSignature = (transactionMessage, addressLookupTableAccounts, recentBlockhash, currentSymbol, owner) => {
        return getTransactionsSignature(transactionMessage, addressLookupTableAccounts, recentBlockhash, currentSymbol, owner, this.HS);
    };
    compileTransaction = (swapBase64Str) => {
        return compileTransaction(swapBase64Str, this.HS);
    };
    isInstructionsSupportReset = (transactionMessage, currentSymbol) => {
        return isInstructionsSupportReset(transactionMessage, currentSymbol);
    };
    changeTradeService = (currentNetwork) => {
        this.chainId = currentNetwork.chainID;
        switch (this.chainId) {
            case 1:
            case 56:
            case 8453:
                this.app = ethService(this.HS);
                break;
            default:
                this.app = solService(this.HS);
        }
    };
    getBalance = async (accountAddress, tokenAddress, isAta) => {
        try {
            const balance = await this.app?.getBalance(accountAddress, tokenAddress, isAta);
            return balance || '0';
        }
        catch (error) {
            return '0';
        }
    };
    getBalanceMultiple = async (chain, accountAddress, tokens) => {
        const balanceMultiple = await this.app?.getBalanceMultiple(chain, accountAddress, tokens);
        return balanceMultiple || [];
    };
    getNetWorkFees = async (gasLimit = 21000) => {
        const fees = await this.app?.getNetWorkFees(gasLimit);
        return fees;
    };
    getSendEstimateGas = async (sendParams) => {
        console.log('发送前预估参数', sendParams);
        const result = await this.app?.getSendEstimateGas(sendParams);
        if (result) {
            return result;
        }
        throw new Error('app undefined');
    };
    getSendFees = async (networkFee, toAddress, tokenAddress) => {
        console.log('获取发送手续费参数', networkFee);
        const result = await this.app?.getSendFees(networkFee, toAddress, tokenAddress);
        if (result) {
            return result;
        }
        throw new Error('app undefined');
    };
    sendTransaction = async (sendParams) => {
        console.log('发送代币执行参数', sendParams);
        const result = await this.app?.sendTransaction(sendParams);
        if (result) {
            return result;
        }
        throw new Error('app undefined');
    };
    getAllowance = async (tokenAddress, accountAddress, authorizedAddress) => {
        const result = await this.app?.getAllowance(tokenAddress, accountAddress, authorizedAddress);
        if (result) {
            return result;
        }
        throw new Error('app undefined');
    };
    toApprove = async (tokenAddress, accountAddress, authorizedAddress, amountToApprove) => {
        console.log('授权参数', tokenAddress, accountAddress, authorizedAddress, amountToApprove);
        const result = await this.app?.toApprove(tokenAddress, accountAddress, authorizedAddress, amountToApprove);
        if (result) {
            return result;
        }
        throw new Error('app undefined');
    };
    getSwapPath = async (currentSymbol) => {
        console.log('路由参数', currentSymbol);
        const result = await this.app?.getSwapPath(currentSymbol);
        if (result) {
            return result;
        }
        throw new Error('app undefined');
    };
    getSwapEstimateGas = async (currentSymbol, path, accountAddress) => {
        console.log('预估参数', currentSymbol, path, accountAddress);
        const result = await this.app?.getSwapEstimateGas(currentSymbol, path, accountAddress);
        if (result) {
            return result;
        }
        throw new Error('app undefined');
    };
    getSwapFees = async (currentSymbol) => {
        const result = await this.app?.getSwapFees(currentSymbol);
        if (result) {
            return result;
        }
        throw new Error('app undefined');
    };
    swap = async (currentSymbol, transaction, accountAddress) => {
        console.log('Swap执行参数');
        console.log(currentSymbol, transaction, accountAddress);
        const result = await this.app?.swap(currentSymbol, transaction, accountAddress);
        if (result) {
            return result;
        }
        throw new Error('app undefined');
    };
    getHashStatus(hash, chain) {
        if (ETH_SERIES.includes(this.HS.network.get(chain).chain)) {
            return ethService(this.HS).hashStatus(hash, chain);
        }
        return solService(this.HS).hashStatus(hash);
    }
    async wrappedExchange(chain, accountAddress, type, priorityFee, amount = '0') {
        const privateKey = await this.HS.wallet.ownerKey(accountAddress);
        return await wExchange(chain, privateKey, type, priorityFee, amount, this.HS);
    }
    async sendSimulateTransaction(accountAddress, vertransaction) {
        const privateKey = await this.HS.wallet.ownerKey(accountAddress);
        const sender = this.HS.utils.ownerKeypair(privateKey);
        const connection = await this.HS.network.getProviderByChain(102);
        if (connection) {
            const simulateResponse = await connection.simulateTransaction(vertransaction, simulateConfig);
            console.log('第二次交易 - 预估', simulateResponse);
            if (simulateResponse && simulateResponse?.value?.err) {
                throw new Error(JSON.stringify(simulateResponse.value.logs));
            }
            vertransaction.sign([sender]);
            const rawTransaction = vertransaction.serialize();
            const hash = await connection.sendRawTransaction(rawTransaction);
            ;
            if (hash) {
                const result = { error: null, result: { hash, data: [vertransaction] } };
                console.log('第二次交易结果：', result);
                return { error: null, result: { hash, data: [vertransaction] } };
            }
        }
        throw new Error('sendSimulateTransaction error');
    }
}
export default TradeService;
