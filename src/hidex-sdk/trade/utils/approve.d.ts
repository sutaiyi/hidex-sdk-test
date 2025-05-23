import CatcherService from '../../catch';
import { OptionsCommon } from '../../main/interfaces';
import { IApproveService, ITradeFunctions } from '../interfaces';
declare class ApproveService extends CatcherService implements IApproveService {
    private trade;
    private network;
    constructor(options: OptionsCommon & {
        trade: ITradeFunctions;
    });
    private hasApprovedInLoca;
    private getApprovedVerify;
    execute(tokenAddress: string, accountAddress: string, authorizedAddress: string, chain: string | number): Promise<boolean>;
    set(key: string, accountAddress: string, tokenAddress: string, value: string): Promise<boolean>;
    get(key: string, accountAddress: string, tokenAddress: string): Promise<any>;
    getAll(): Promise<any>;
    remove(key: string, accountAddress: string, tokenAddress: string): Promise<boolean>;
}
export default ApproveService;
//# sourceMappingURL=approve.d.ts.map