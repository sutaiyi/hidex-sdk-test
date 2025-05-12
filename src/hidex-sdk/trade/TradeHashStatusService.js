import EventEmitter from '../common/eventEmitter';
import { isSol } from './utils';
const HashStatusMap = new Map();
export class TradeHashStatusService extends EventEmitter {
    DEFAULTKEY = 'TradeHashes';
    HS;
    trade;
    timeCount;
    maxTime;
    constructor(options) {
        super();
        this.trade = options.trade;
        this.HS = options;
        this.timeCount = 50;
        this.maxTime = 15000;
    }
    getHashes = async () => {
        const list = await this.HS.catcher.getItem(this.DEFAULTKEY);
        if (list && list.length > 0) {
            return list.filter((item) => item.status === 'Pending');
        }
        return [];
    };
    setHash = async (catcher, hashItem) => {
        const list = await this.getHashes();
        list.push(hashItem);
        return await catcher.setItem(this.DEFAULTKEY, hashItem);
    };
    action = async (hashItem) => {
        const checkCreate = async () => {
            const { hash, chain, tradeType, bundles } = hashItem;
            this.timeCount = 50;
            if (isSol(chain)) {
                this.timeCount = 50;
                this.maxTime = 15000;
            }
            else {
                this.timeCount = 1000;
                this.maxTime = 15000;
            }
            console.log('hash status checkTimer: ', hashItem);
            const { status, message } = await this.trade.getHashStatus(hash, chain);
            hashItem.message = message;
            if (status !== 'Pending') {
                hashItem.status = status;
                console.log('hash status checkTimer: ', hashItem);
                this.emit('HashStatusEvent', hashItem);
                hashItem.timer && global.clearTimeout(hashItem.timer);
                return;
            }
            if (new Date().getTime() - hashItem.createTime >= this.maxTime) {
                if (tradeType === 0 && bundles?.length) {
                    hashItem.status = await this.trade.defiApi.bundlesStatuses(bundles);
                }
                else {
                    hashItem.status = 'Failed';
                }
                if (hashItem.status === 'Failed') {
                    hashItem.failedType = 1;
                }
                this.emit('HashStatusEvent', hashItem);
                hashItem.timer && global.clearTimeout(hashItem.timer);
                return;
            }
            hashItem.timer && global.clearTimeout(hashItem.timer);
            hashItem.timer = global.setTimeout(checkCreate, this.timeCount);
        };
        HashStatusMap.set(hashItem.hash, checkCreate());
    };
}
export default TradeHashStatusService;
