import { BigNumber, ethers } from 'ethers';
export async function getBaseFeePerGas(network) {
    try {
        const currentNetWork = network.get();
        let latestBlock;
        const provider = await network.getFastestProviderByChain(currentNetWork.chain);
        if (Object.entries(network.sysProviderRpcs).length === 0 && !network.sysProviderRpcs[currentNetWork.chain]) {
            latestBlock = await provider.getBlock('latest');
        }
        else {
            const profun = network.sysProviderRpcs[currentNetWork.chain].map((v) => {
                return v
                    .getBlock('latest')
                    .then((res) => {
                    return res;
                })
                    .catch((err) => {
                    throw new Error(err);
                });
            });
            latestBlock = await Promise.any(profun);
        }
        const { baseFeePerGas } = latestBlock;
        if (baseFeePerGas) {
            console.log('Base Fee Per Gas:', baseFeePerGas.toString());
            return baseFeePerGas;
        }
        else {
            console.log('Base Fee Per Gas is not available.');
            return BigNumber.from(0);
        }
    }
    catch (error) {
        console.error('Error getting base fee per gas:', error);
        return BigNumber.from(0);
    }
}
export const getUseGasPrice = async (network, gasLimit) => {
    const currentNetWork = network.get();
    const provider = await network.getFastestProviderByChain(currentNetWork.chain);
    let gasPriceWei;
    if (Object.entries(network.sysProviderRpcs).length === 0 && !network.sysProviderRpcs[currentNetWork.chain]) {
        gasPriceWei = await provider.getGasPrice();
    }
    else {
        const profun = network.sysProviderRpcs[currentNetWork.chain].map((v) => {
            return v
                .getGasPrice()
                .then((res) => {
                return res;
            })
                .catch((err) => {
                throw new Error(err);
            });
        });
        gasPriceWei = await Promise.any(profun);
    }
    const gasFeeWei = gasPriceWei.mul(gasLimit);
    const gasFeeETH = ethers.utils.formatEther(gasFeeWei);
    console.log('gasFeeETH', gasFeeETH, gasFeeWei.toString(), gasPriceWei.toString());
    return {
        gasFeeETH,
        gasFeeWei: gasFeeWei.toString(),
        gasPriceWei: gasPriceWei.toString(),
    };
};
