import { ethService } from './eth/index';
import { solService } from './sol/index';
import { defaultChainID } from '../common/config';
import ApproveService from './utils/approve';
import { compileTransaction, resetInstructions, getTransactionsSignature, isInstructionsSupportReset, getAddressLookup, getOwnerTradeNonce } from './sol/instruction/index';
import EventEmitter from '../common/eventEmitter';
import DefiApi from './sol/defiApi';
import TradeHashStatusService from './TradeHashStatusService';
import { wExchange } from './utils/nativeTokenTrade';
import { isSol } from './utils';
class TradeService extends EventEmitter {
    app;
    chainId;
    errorCode = 9800;
    HS;
    solService;
    ethService;
    approve;
    defiApi;
    checkHash;
    constructor(options) {
        super();
        this.chainId = defaultChainID;
        this.solService = solService(options);
        this.ethService = ethService(options);
        this.app = defaultChainID === 102 ? this.solService : this.ethService;
        this.HS = options;
        this.approve = new ApproveService({ ...options, trade: this });
        this.checkHash = new TradeHashStatusService({ ...options, trade: this });
        this.defiApi = DefiApi;
        this.defiApi.getLatestBlockhash(this.HS.network);
    }
    resetInstructions = (currentSymbol, transactionMessage, newInputAmount, newOutputAmount) => {
        return resetInstructions(currentSymbol, transactionMessage, newInputAmount, newOutputAmount);
    };
    getTransactionsSignature = (transactionMessage, addressLookupTableAccounts, recentBlockhash, currentSymbol, owner, HS) => {
        return getTransactionsSignature(transactionMessage, addressLookupTableAccounts, recentBlockhash, currentSymbol, owner, HS);
    };
    compileTransaction = (swapBase64Str) => {
        return compileTransaction(swapBase64Str, this.HS);
    };
    getAddressLookup = (swapBase64Str) => {
        return getAddressLookup(swapBase64Str, this.HS);
    };
    getOwnerTradeNonce = async (accountAddress) => {
        return getOwnerTradeNonce(this.HS.utils.ownerKeypair(accountAddress), this.HS);
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
                this.ethService = ethService(this.HS);
                this.app = this.ethService;
                break;
            default:
                this.solService = solService(this.HS);
                this.app = this.solService;
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
    getNetWorkFees = async (gasLimit = 21000, tradeType) => {
        const fees = await this.app?.getNetWorkFees(gasLimit, tradeType);
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
    getSwapEstimateGas = async (currentSymbol, path, wallet) => {
        console.log('预估参数', currentSymbol, path, wallet);
        const result = await this.app?.getSwapEstimateGas(currentSymbol, path, wallet);
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
        console.log('Swap执行参数===>', currentSymbol, transaction, accountAddress);
        const result = await this.app?.swap(currentSymbol, transaction, accountAddress);
        if (result) {
            return result;
        }
        throw new Error('app undefined');
    };
    claimCommission = async (params) => {
        const result = await this.app?.claimCommission(params);
        if (result) {
            return result;
        }
        throw new Error('app undefined');
    };
    getHashStatus(hash, chain, bundles = []) {
        if (isSol(chain)) {
            return this.solService.hashStatus(hash, chain, bundles);
        }
        return this.ethService.hashStatus(hash, chain);
    }
    getHashsStatus(hashs, chain, bundles = []) {
        if (isSol(chain)) {
            return this.solService.hashsStatus(hashs, chain, bundles);
        }
        return this.ethService.hashsStatus(hashs, chain, bundles);
    }
    async wrappedExchange(chain, accountAddress, type, priorityFee, amount = '0') {
        const privateKey = accountAddress;
        return await wExchange(chain, privateKey, type, priorityFee, amount, this.HS);
    }
    async sendSimulateTransaction(accountAddress, vertransaction) {
        console.log(accountAddress, vertransaction);
        throw new Error('sendSimulateTransaction error');
    }
}
export default TradeService;
