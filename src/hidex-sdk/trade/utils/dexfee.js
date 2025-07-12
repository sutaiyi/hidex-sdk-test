import * as anchor from '@project-serum/anchor';
import { Keypair, PublicKey } from '@solana/web3.js';
import abis from '../../common/abis';
import { ETH_SERIES, zero } from '../../common/config';
import { PROGRAMID, SEED_DATA } from '../sol/config';
import { ethers } from 'ethers';
import { initAnchor } from '../sol/instruction/InstructionCreator';
import { isSol } from './index';
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
    async getDexFee(chain) {
        const currentNetwork = this.network.get(chain);
        const dexFee = await this.get(currentNetwork.chainName);
        return dexFee;
    }
    getAmountOut(bigOut) {
        return bigOut;
    }
    async getDexFeeAmount(currentSymbol, buyAmount) {
        const { isBuy, inviter, chain } = currentSymbol;
        const { dexFee, inviterDiscount } = await this.getDexFee(chain);
        const useDexFee = inviter && inviter !== zero ? inviterDiscount : dexFee;
        if (isBuy) {
            const dexFeeAmount = Math.floor(Number(buyAmount) * useDexFee);
            return BigInt(dexFeeAmount).toString();
        }
        return '0';
    }
    async getAmountOutMin(currentSymbol, fullAmoutOut) {
        if (isSol(currentSymbol.chain)) {
            return fullAmoutOut;
        }
        const slip = currentSymbol.slipPersent;
        if (currentSymbol.isBuy) {
            const currentDexfee = await this.getDexFee(currentSymbol.chain);
            const df = currentSymbol.inviter === zero ? currentDexfee.dexFee : currentDexfee.inviterDiscount;
            const minAmountOut = Math.floor(Number(fullAmoutOut) * (1 - df - slip));
            return BigInt(minAmountOut).toString();
        }
        const minAmountOut = Math.floor(Number(fullAmoutOut) * (1 - slip));
        return BigInt(minAmountOut).toString();
    }
}
export default DexFeeService;
