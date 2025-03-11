import { INetworkService } from '../../network/interfaces';
export declare function getBaseFeePerGas(network: INetworkService): Promise<string>;
export declare const getUseGasPrice: (network: INetworkService, gasLimit: number) => Promise<{
    gasFeeETH: string;
    gasFeeWei: string;
    gasPriceWei: string;
}>;
//# sourceMappingURL=utils.d.ts.map