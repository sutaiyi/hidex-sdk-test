import { ethers } from 'ethers';
import { wethAbi } from '../eth/abiFun';
import { mTokenAddress } from '../../common/config';
export const isMotherTrad = (currentSymbol, network) => {
    const currentNetWork = network.get();
    const inAddress = currentSymbol.in.address.toLowerCase();
    const outAddress = currentSymbol.out.address.toLowerCase();
    if (inAddress === mTokenAddress.toLowerCase() && outAddress === currentNetWork.tokens[1].address.toLowerCase()) {
        return 'MBTOWMB';
    }
    if (inAddress === currentNetWork.tokens[1].address.toLowerCase() && outAddress === mTokenAddress.toLowerCase()) {
        return 'WMBTOMB';
    }
    return '';
};
const convertEthToWeth = async (wethAddress, amountInWei, privateKey, network) => {
    const tx = {
        to: wethAddress,
        value: amountInWei,
    };
    console.log(tx);
    const currentNetWork = await network.get();
    const provider = network.getProviderByChain(currentNetWork.chain);
    const walletProvider = new ethers.Wallet(privateKey, provider);
    try {
        const txResponse = await walletProvider.sendTransaction(tx);
        await txResponse.wait();
        return txResponse;
    }
    catch (error) {
        console.error(error);
        throw new Error('交易失败请重试' + error);
    }
};
const convertWethToEth = async (wethAddress, amountInWei, privateKey, network) => {
    const currentNetWork = await network.get();
    const provider = network.getProviderByChain(currentNetWork.chain);
    const walletProvider = new ethers.Wallet(privateKey, provider);
    const wethContract = new ethers.Contract(wethAddress, wethAbi, walletProvider);
    try {
        const txResponse = await wethContract.withdraw(amountInWei);
        await txResponse.wait();
        return txResponse;
    }
    catch (error) {
        console.error(error);
        throw new Error('交易失败请重试' + error);
    }
};
export async function motherCurrencyTrade(currentSymbol, privateKey, way, network) {
    const { amountIn } = currentSymbol;
    const currentNetWork = network.get();
    if (way === 'MBTOWMB') {
        const tx = await convertEthToWeth(currentNetWork.tokens[1].address, amountIn, privateKey, network);
        return {
            error: null,
            result: { hash: tx },
        };
    }
    if (way === 'WMBTOMB') {
        const tx = await convertWethToEth(currentNetWork.tokens[1].address, amountIn, privateKey, network);
        return {
            error: null,
            result: { hash: tx },
        };
    }
    return {
        error: null,
        result: { hash: null },
    };
}
