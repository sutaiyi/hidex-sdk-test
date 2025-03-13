import webCatcher from './web';
import appCatcher from './app';
class CatcherService {
    catch;
    constructor(apparatus) {
        if (apparatus === 'web') {
            this.catch = new webCatcher();
            return;
        }
        else if (apparatus === 'app') {
            this.catch = new appCatcher();
            return;
        }
        throw new Error('Catch constructor error');
    }
    async setItem(key, value) {
        return await this.catch.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    }
    async removeItem(key) {
        return await this.catch.removeItem(key);
    }
    async getItem(key) {
        try {
            const value = await this.catch.getItem(key);
            if (value && value !== 'undefined' && value !== 'null') {
                return JSON.parse(value);
            }
            return undefined;
        }
        catch (error) {
            console.error(error);
            return null;
        }
    }
}
export default CatcherService;
