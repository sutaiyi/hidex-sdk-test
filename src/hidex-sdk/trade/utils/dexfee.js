import * as anchor from '@project-serum/anchor';
import { Keypair, PublicKey } from '@solana/web3.js';
import abis from '../../common/abis';
import { dexWalletFee, ETH_SERIES, zero } from '../../common/config';
import { PROGRAMID, SEED_DATA } from '../sol/config';
import { initAnchor } from '../sol/instruction';
import { ethers } from 'ethers';
import { isMotherTrad } from './nativeTokenTrade';
class DexFeeService {
    store;
    defaultFeeInfo;
    network;
    constructor(optins) {
        this.store = optins.catcher;
        this.network = optins.network;
        this.defaultFeeInfo = {
            inviterDiscount: 0.009,
            dexFee: 0.01,
            inviterCommision: 0.025,
        };
    }
    async execute(chain) {
        try {
            const result = await this.getDexFeeByChain(chain);
            console.log(`${chain} 链上合约交易手续费率===>`, result);
            console.log(result);
            if (result.dexFee) {
                this.set(chain, result);
            }
            return result || this.defaultFeeInfo;
        }
        catch (error) {
            return this.defaultFeeInfo;
        }
    }
    async getEthDexFee(chain) {
        const currentNetwork = this.network.get(chain);
        const deTradeContract = new ethers.Contract(currentNetwork.deTrade, abis.chillSwapABI, this.network.getProviderByChain(chain));
        const dexCommissionRate = await deTradeContract.callStatic.getDexCommissionRate();
        const feeDiscountRatio = await deTradeContract.callStatic.getfeeDiscountRatio();
        const inviterCommissionRate = await deTradeContract.callStatic.getInviterCommissionRate();
        return {
            inviterDiscount: feeDiscountRatio / 10000,
            dexFee: dexCommissionRate / 10000,
            inviterCommision: inviterCommissionRate / 10000,
        };
    }
    async getDexFeeByChain(chain) {
        if (ETH_SERIES.indexOf(chain) !== -1) {
            return this.getEthDexFee(chain);
        }
        if (chain.toLowerCase() === 'SOLANA'.toLowerCase()) {
            const keypair = Keypair.generate();
            initAnchor(keypair, this.network);
            const programId = new PublicKey(PROGRAMID);
            const program = new anchor.Program(abis.solanaIDL, programId);
            const [data_pda] = await PublicKey.findProgramAddress([Buffer.from(SEED_DATA)], programId);
            const accountData = await program.account.configData.fetch(data_pda);
            console.log(accountData);
            return {
                inviterDiscount: accountData.commisionDiscountRatio.toNumber() / 10000,
                dexFee: accountData.dexCommisionRate.toNumber() / 10000,
                inviterCommision: accountData.inviterCommisionRate.toNumber() / 10000,
            };
        }
        return this.defaultFeeInfo;
    }
    async set(key, value) {
        return await this.store.setItem(`DexFeeInfo:${key.toLowerCase()}`, value);
    }
    async get(key) {
        const result = await this.store.getItem(`DexFeeInfo:${key.toLowerCase()}`);
        if (!result) {
            const feeInfo = await this.execute(key);
            return feeInfo;
        }
        return result;
    }
    async getDexFee() {
        const currentNetwork = this.network.get();
        const dexFee = await this.get(currentNetwork.chainName);
        return dexFee;
    }
    getAmountOut(bigOut) {
        return bigOut;
    }
    getSlipAmountOut(currentSymbol, amountOut) {
        const slip = currentSymbol.slipPersent || 0;
        const slipAmount = Number(amountOut) * (1 - slip);
        return Math.floor(slipAmount);
    }
    getDexFeeAmountOut(amountOut) {
        const dexFeeAmount = Number(amountOut) * (1 - dexWalletFee);
        return Math.floor(dexFeeAmount);
    }
    async getDexFeeAmount(currentSymbol, bigOut) {
        const { dexFee, inviterDiscount } = await this.getDexFee();
        const useDexFee = currentSymbol.inviter && currentSymbol.inviter !== zero ? inviterDiscount : dexFee;
        if (currentSymbol.isBuy) {
            const dexFeeAmount = Math.floor(Number(currentSymbol.amountIn) * useDexFee);
            return dexFeeAmount.toString();
        }
        const amountOut = bigOut.toString();
        const dexFeeAmount = Math.floor(Number(amountOut) * useDexFee);
        return dexFeeAmount.toString();
    }
    async getAmountOutMin(currentSymbol, minOutAmount) {
        console.log("getAmountOutMin", currentSymbol, minOutAmount);
        const amountOut = this.getAmountOut(minOutAmount);
        if (isMotherTrad(currentSymbol, this.network)) {
            return amountOut;
        }
        if (currentSymbol.isBuy) {
            const slip = currentSymbol.slipPersent;
            const minAmountOut = Number(amountOut) * (1 - dexWalletFee - slip);
            return minAmountOut.toString();
        }
        const slipAmount = this.getSlipAmountOut(currentSymbol, Number(amountOut));
        const minAmountOut = await this.getDexFeeAmountOut(slipAmount);
        return minAmountOut.toString();
    }
}
export default DexFeeService;
