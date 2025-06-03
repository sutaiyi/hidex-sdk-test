import { ethers } from 'ethers';
export async function getBaseFeePerGas(network) {
    try {
        const currentNetWork = network.get();
        const profun = network.sysProviderRpcs[currentNetWork.chain].map((v) => v
            .getBlock('latest')
            .then((res) => {
            return res;
        })
            .catch((error) => {
            return Promise.reject(error);
        }));
        const latestBlock = await Promise.any(profun);
        const { baseFeePerGas } = latestBlock;
        if (baseFeePerGas) {
            return baseFeePerGas.toString();
        }
        throw new Error('baseFeePerGas is null');
    }
    catch (error) {
        return '0';
    }
}
export const getUseGasPrice = async (network, gasLimit) => {
    const currentNetWork = network.get();
    const profun = network.sysProviderRpcs[currentNetWork.chain].map((v) => {
        return v
            .getGasPrice()
            .then((res) => {
            return res;
        })
            .catch((error) => {
            return Promise.reject(error);
        });
    });
    const gasPriceWei = await Promise.any(profun);
    const gasFeeWei = gasPriceWei.mul(gasLimit);
    const gasFeeETH = ethers.utils.formatEther(gasFeeWei);
    return {
        gasFeeETH,
        gasFeeWei: gasFeeWei.toString(),
        gasPriceWei: gasPriceWei.toString()
    };
};
