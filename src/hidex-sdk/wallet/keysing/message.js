import keysing from '.';
class KeyRuntimeController {
    dataStorage;
    constructor() {
        this.dataStorage = {};
    }
    async initKeyRuntime(catcher) {
        this.dataStorage = (await catcher.getIdbItem('dataStorage')) || {};
        return { value: this.dataStorage['KEYSING_SECRETCODE'] };
    }
    async sendMessage(message, sendResponse, catcher, expiresInDays) {
        if (keysing.messageConfirm(message.type)) {
            keysing.messageProcess(message, async (key, value) => {
                if (key === 'SET' && typeof value === 'object') {
                    Object.assign(this.dataStorage, value);
                    await catcher.setIdbItem('dataStorage', this.dataStorage, expiresInDays);
                    sendResponse({ status: 'success' });
                }
                if (key === 'GET') {
                    sendResponse({ value: this.dataStorage[message.key] });
                }
            });
        }
    }
}
export default new KeyRuntimeController();
