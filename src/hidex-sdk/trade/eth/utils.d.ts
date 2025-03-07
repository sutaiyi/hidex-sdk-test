import { BigNumber } from 'ethers';
import { INetworkService } from '../../network/interfaces';
export declare function getBaseFeePerGas(network: INetworkService): Promise<BigNumber>;
export declare const getUseGasPrice: (network: INetworkService, gasLimit: number) => Promise<{
    gasFeeETH: string;
    gasFeeWei: any;
    gasPriceWei: any;
}>;
//# sourceMappingURL=utils.d.ts.map