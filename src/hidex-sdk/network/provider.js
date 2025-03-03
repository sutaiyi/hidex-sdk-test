import { providers, utils } from 'ethers';
export default class LoggingProvider extends providers.JsonRpcProvider {
    chainId;
    constructor(rpc, chainId) {
        super(rpc);
        this.chainId = chainId;
    }
    async send(method, params) {
        if (method === 'eth_chainId') {
            return utils.hexValue(this.chainId);
        }
        try {
            const response = await super.send(method, params);
            return response;
        }
        catch (error) {
            console.error(`Error in request: ${method}`, error);
            throw error;
        }
    }
}
