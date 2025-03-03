import storage from '@react-native-async-storage/async-storage';
class appCatcher {
    constructor() {
    }
    async setItem(key, value) {
        try {
            await storage.setItem(key, value);
            return true;
        }
        catch (error) {
            console.error('app catch setItem error', error);
            return false;
        }
    }
    async getItem(key) {
        try {
            return await storage.getItem(key);
        }
        catch (error) {
            console.error('app catch getItem error', error);
            return null;
        }
    }
}
export default new appCatcher();
