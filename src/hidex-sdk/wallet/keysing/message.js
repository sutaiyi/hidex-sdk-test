import keysing from '.';
class KeyRuntimeController {
    dataStorage;
    constructor() {
        this.dataStorage = {};
    }
    async initKeyRuntime(catcher) {
        this.dataStorage = (await catcher.getItem('dataStorage')) || {};
    }
    async sendMessage(message, sendResponse, catcher) {
        if (keysing.messageConfirm(message.type)) {
            keysing.messageProcess(message, async (key, value) => {
                if (key === 'SET' && typeof value === 'object') {
                    Object.assign(this.dataStorage, value);
                    await catcher.setItem('dataStorage', this.dataStorage);
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
