import EventEmitter from '../../common/eventEmitter';
import keyRuntime from './message';
import { keysingMessage } from './config';
class KeysingController extends EventEmitter {
    secretCode = null;
    constructor() {
        super();
    }
    async keysingInitialized(catcher) {
        const { value } = await keyRuntime.initKeyRuntime(catcher);
        this.getSecretCode(catcher);
        this.secretCode = value;
    }
    get() {
        return this.secretCode || '';
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
        keyRuntime.sendMessage({ type: keysingMessage['set'], key: keysingMessage['key'], value: null }, () => { }, catcher, 0);
    }
    async isLocked(catcher) {
        const result = await keyRuntime.initKeyRuntime(catcher);
        return !!result?.value;
    }
    booted(password, catcher, expires) {
        this.secretCode = password;
        keyRuntime.sendMessage({ type: keysingMessage['set'], key: keysingMessage['key'], value: this.secretCode }, () => { }, catcher, expires);
    }
    getSecretCode(catcher) {
        try {
            keyRuntime.sendMessage({ type: keysingMessage['get'], key: keysingMessage['key'] }, (response) => {
                this.secretCode = response?.value;
                this.emit('EventSecretCode', this.secretCode);
            }, catcher, 0);
            if (this.secretCode)
                return this.secretCode;
        }
        catch (error) {
            console.error(error);
        }
    }
}
export default new KeysingController();
