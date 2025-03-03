import { providers } from 'ethers';
export default class LoggingProvider extends providers.JsonRpcProvider {
    chainId: number;
    constructor(rpc: string, chainId: number);
    send(method: string, params: any[]): Promise<any>;
}
//# sourceMappingURL=provider.d.ts.map