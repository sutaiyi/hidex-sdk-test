class webCatcher {
    constructor() {
    }
    async setItem(key, value) {
        try {
            await global.localStorage.setItem(key, value);
            return true;
        }
        catch (error) {
            console.error('web/h5 catch setItem error', error);
            return false;
        }
    }
    async getItem(key) {
        try {
            return await global.localStorage.getItem(key);
        }
        catch (error) {
            console.error('web/h5 catch getItem error', error);
            return null;
        }
    }
    async removeItem(key) {
        try {
            await global.localStorage.removeItem(key);
            return true;
        }
        catch (error) {
            console.error('web/h5 catch removeItem error', error);
            return false;
        }
    }
}
export default webCatcher;
