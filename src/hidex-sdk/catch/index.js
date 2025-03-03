import webCatcher from './web';
import appCatcher from './app';
class CatcherService {
    catch;
    constructor(apparatus) {
        if (apparatus === 'web') {
            this.catch = webCatcher;
        }
        else if (apparatus === 'app') {
            this.catch = appCatcher;
        }
        throw new Error('Catch constructor error');
    }
    async setItem(key, value) {
        return await this.catch.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    }
    async getItem(key) {
        try {
            const value = await this.catch.getItem(key);
            if (!value && value !== 'undefined' && value !== 'null') {
                return JSON.parse(value);
            }
            throw new Error(`Invalid value: ${value}`);
        }
        catch (error) {
            console.error(error);
            return null;
        }
    }
}
export default CatcherService;
