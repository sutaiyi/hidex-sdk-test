import { ethService } from './eth/index';
import { solService } from './sol/index';
import { defaultChainID } from '../common/config';
import { instructionReset, instructionsCheck } from './sol/utils';
import EventEmitter from '../common/eventEmitter';
class TradeService extends EventEmitter {
    app;
    chainId;
    errorCode = 9800;
    HS;
    constructor(options) {
        super();
        this.chainId = defaultChainID;
        this.app = defaultChainID === 102 ? solService(options) : ethService(options);
        this.HS = options;
    }
    instructionReset = instructionReset;
    instructionsCheck = instructionsCheck;
    changeTradeService = (currentNetwork) => {
        this.chainId = currentNetwork.chainID;
        switch (this.chainId) {
            case 1:
            case 56:
            case 8453:
                this.app = ethService(this.HS);
                break;
            case 102:
                this.app = solService(this.HS);
                break;
            default:
                this.app = solService(this.HS);
        }
    };
    getBalance = async (accountAddress, tokenAddress) => {
        try {
            const balance = await this.app?.getBalance(accountAddress, tokenAddress);
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
        try {
            const result = await this.app?.getSendEstimateGas(sendParams);
            if (result) {
                return result;
            }
            throw new Error('app undefined');
        }
        catch (error) {
            throw new Error(`{code: ${this.errorCode + 6}, message: 'GetSendEstimateGas Error'}`);
        }
    };
    getSendFees = async (networkFee, gasLimit) => {
        console.log('获取发送手续费参数', networkFee, gasLimit);
        try {
            const result = await this.app?.getSendFees(networkFee, gasLimit);
            if (result) {
                return result;
            }
            throw new Error('app undefined');
        }
        catch (error) {
            throw new Error(`{code: ${this.errorCode + 7}, message: 'getSendFees Error'}`);
        }
    };
    sendTransaction = async (sendParams) => {
        console.log('发送代币执行参数', sendParams);
        try {
            const result = await this.app?.sendTransaction(sendParams);
            if (result) {
                return result;
            }
            throw new Error('app undefined');
        }
        catch (error) {
            throw new Error(`{code: ${this.errorCode + 8}, message: 'sendTransaction Error'}`);
        }
    };
    getAllowance = async (tokenAddress, accountAddress, authorizedAddress) => {
        try {
            const result = await this.app?.getAllowance(tokenAddress, accountAddress, authorizedAddress);
            if (result) {
                return result;
            }
            throw new Error('app undefined');
        }
        catch (error) {
            throw new Error(`{code: ${this.errorCode + 5}, message: 'getAllowance Error'}`);
        }
    };
    toApprove = async (tokenAddress, accountAddress, authorizedAddress, amountToApprove) => {
        console.log('授权参数', tokenAddress, accountAddress, authorizedAddress, amountToApprove);
        try {
            const result = await this.app?.toApprove(tokenAddress, accountAddress, authorizedAddress, amountToApprove);
            if (result) {
                return result;
            }
            throw new Error('app undefined');
        }
        catch (error) {
            throw new Error(`{code: ${this.errorCode + 10}, message: 'toApprove Error'}`);
        }
    };
    getSwapPath = async (currentSymbol) => {
        try {
            const result = await this.app?.getSwapPath(currentSymbol);
            if (result) {
                return result;
            }
            throw new Error('app undefined');
        }
        catch (error) {
            throw new Error(`{code: ${this.errorCode + 11}, message: 'getSwapPath Error'}`);
        }
    };
    getTradeEstimateGas = async (currentSymbol, path, accountAddress) => {
        try {
            const result = await this.app?.getTradeEstimateGas(currentSymbol, path, accountAddress);
            if (result) {
                return result;
            }
            throw new Error('app undefined');
        }
        catch (error) {
            throw new Error(`{code: ${this.errorCode + 14}, message: 'getTradeEstimateGas Error'}`);
        }
    };
    getTradeFees = async (networkFee, gasLimit) => {
        try {
            const result = await this.app?.getTradeFees(networkFee, gasLimit);
            if (result) {
                return result;
            }
            throw new Error('app undefined');
        }
        catch (error) {
            throw new Error(`{code: ${this.errorCode + 15}, message: 'getTradeFees Error'}`);
        }
    };
    trade = async (currentSymbol, transaction, accountAddress) => {
        console.log('执行参数');
        console.log(currentSymbol, transaction, accountAddress);
        try {
            const result = await this.app?.trade(currentSymbol, transaction, accountAddress);
            if (result) {
                return result;
            }
            throw new Error('app undefined');
        }
        catch (error) {
            throw new Error(`{code: ${this.errorCode + 16}, message: 'trade Error'}`);
        }
    };
}
export default TradeService;
