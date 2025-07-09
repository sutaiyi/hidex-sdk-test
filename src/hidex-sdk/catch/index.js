import webCatcher from './web';
import appCatcher from './app';
import CookieStorage from './cookie';
import IdbService from './indexDB';
import { isValidJSON } from '../common/utils';
class CatcherService {
    catch;
    keyDefault = 'hidex-sdk-store';
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
    async getItem(key) {
        try {
            const value = await this.catch.getItem(`${this.keyDefault}-${key}`);
            const isParse = isValidJSON(value);
            if (value && isParse && value !== 'undefined' && value !== 'null') {
                return JSON.parse(value);
            }
            return value;
        }
        catch (error) {
            console.error(error);
            return null;
        }
    }
    async setItem(key, value) {
        return await this.catch.setItem(`${this.keyDefault}-${key}`, typeof value === 'string' ? value : JSON.stringify(value));
    }
    async removeItem(key) {
        return await this.catch.removeItem(`${this.keyDefault}-${key}`);
    }
    async getCookie(key) {
        try {
            const value = await CookieStorage.get(`${this.keyDefault}-${key}`);
            const isParse = isValidJSON(value);
            if (value && isParse && value !== 'undefined' && value !== 'null') {
                return JSON.parse(value);
            }
            return value;
        }
        catch (error) {
            console.error(error);
            return null;
        }
    }
    async setCookie(key, value, options) {
        const { expires, path, secure } = options;
        return await CookieStorage.set(`${this.keyDefault}-${key}`, typeof value === 'string' ? value : JSON.stringify(value), expires, path, secure);
    }
    async removeCookie(key, options) {
        return await CookieStorage.remove(`${this.keyDefault}-${key}`, options);
    }
    async getIdbItem(key) {
        try {
            return await IdbService.getItem(`${this.keyDefault}-${key}`);
        }
        catch (error) {
            console.error(error);
            return null;
        }
    }
    async setIdbItem(key, value, expiresInDays) {
        return await IdbService.setItem(`${this.keyDefault}-${key}`, value, expiresInDays);
    }
    async removeIdbItem(key) {
        return await IdbService.removeItem(`${this.keyDefault}-${key}`);
    }
}
export default CatcherService;
