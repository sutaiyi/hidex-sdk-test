import { ICatcher } from '../catch/interfaces';
import { ITradeService } from './interfaces';
import { HashStatusParams, ITradeHashStatusService } from './interfaces';
import { OptionsCommon } from '../main/interfaces';
import EventEmitter from '../common/eventEmitter';
export declare class TradeHashStatusService extends EventEmitter implements ITradeHashStatusService {
    private DEFAULTKEY;
    private HS;
    private trade;
    private timeCount;
    private maxTime;
    constructor(options: OptionsCommon & {
        trade: ITradeService;
    });
    getHashes: () => Promise<Array<HashStatusParams>>;
    setHash: (catcher: ICatcher, hashItem: HashStatusParams) => Promise<boolean>;
    action: (hashItem: HashStatusParams) => Promise<void>;
    hashsAction: (hashItem: HashStatusParams) => Promise<void>;
}
export default TradeHashStatusService;
//# sourceMappingURL=TradeHashStatusService.d.ts.map