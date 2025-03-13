import EventEmitter from '../../common/eventEmitter';
import keyRuntime from './message';
import { keysingMessage } from './config';
class KeysingController extends EventEmitter {
    secretCode = null;
    constructor() {
        super();
    }
    async keysingInitialized(catcher) {
        await keyRuntime.initKeyRuntime(catcher);
        this.getSecretCode(catcher);
    }
    messageConfirm(message) {
        return message === keysingMessage['get'] || message === keysingMessage['set'];
    }
    messageProcess(message, callback) {
        const key = message.type === keysingMessage['get'] ? 'GET' : 'SET';
        const dataValue = {};
        if (key === 'SET') {
            dataValue[keysingMessage['key']] = message.value;
        }
        callback(key, dataValue);
    }
    lock(catcher) {
        this.secretCode = null;
        keyRuntime.sendMessage({ type: keysingMessage['set'], key: keysingMessage['key'], value: null }, () => { }, catcher);
    }
    booted(password, catcher) {
        this.secretCode = password;
        keyRuntime.sendMessage({ type: keysingMessage['set'], key: keysingMessage['key'], value: this.secretCode }, () => { }, catcher);
    }
    getSecretCode(catcher) {
        try {
            keyRuntime.sendMessage({ type: keysingMessage['get'], key: keysingMessage['key'] }, (response) => {
                this.secretCode = response?.value;
                this.emit('EventSecretCode', this.secretCode);
            }, catcher);
            if (this.secretCode)
                return this.secretCode;
        }
        catch (error) {
            console.error(error);
        }
    }
}
export default new KeysingController();
