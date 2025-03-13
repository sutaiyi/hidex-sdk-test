class appCatcher {
    storage;
    constructor() {
        this.storage = require('@react-native-async-storage/async-storage');
    }
    async setItem(key, value) {
        try {
            await this.storage.setItem(key, value);
            return true;
        }
        catch (error) {
            console.error('app catch setItem error', error);
            return false;
        }
    }
    async getItem(key) {
        try {
            return await this.storage.getItem(key);
        }
        catch (error) {
            console.error('app catch getItem error', error);
            return null;
        }
    }
    async removeItem(key) {
        try {
            return await this.storage.removeItem(key);
        }
        catch (error) {
            console.error('app catch removeItem error', error);
            return false;
        }
    }
}
export default appCatcher;
