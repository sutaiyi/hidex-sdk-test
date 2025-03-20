import EventEmitter from "../common/eventEmitter";
const HashStatusMap = new Map();
export class TradeHashStatusService extends EventEmitter {
    DEFAULTKEY = 'TradeHashes';
    HS;
    trade;
    constructor(options) {
        super();
        this.trade = options.trade;
        this.HS = options;
    }
    ;
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
            const { hash, chain } = hashItem;
            console.log('hash status checkTimer: ' + hash);
            const { status } = await this.trade.getHashStatus(hash, chain);
            if (status !== 'Pending') {
                hashItem.status = status;
                console.log('hash status checkTimer: ', hashItem);
                this.emit('HashStatusEvent', hashItem);
                hashItem.timer && global.clearTimeout(hashItem.timer);
                return;
            }
            if (new Date().getTime() - hashItem.createTime >= 15000) {
                hashItem.status = 'Failed';
                this.emit('HashStatusEvent', hashItem);
                hashItem.timer && global.clearTimeout(hashItem.timer);
                return;
            }
            hashItem.timer && global.clearTimeout(hashItem.timer);
            hashItem.timer = global.setTimeout(checkCreate, 50);
        };
        HashStatusMap.set(hashItem.hash, checkCreate());
    };
}
export default TradeHashStatusService;
