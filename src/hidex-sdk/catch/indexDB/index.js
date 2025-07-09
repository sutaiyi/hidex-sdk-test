import localforage from 'localforage';
class IdbService {
    store;
    constructor() {
        this.store = localforage.createInstance({
            name: 'hidex-sdk'
        });
    }
    async setItem(key, value, expiresInDays) {
        try {
            const wrapped = {
                data: value,
                expiresAt: expiresInDays ? Date.now() + expiresInDays * 24 * 60 * 60 * 1000 : undefined
            };
            await this.store.setItem(key, wrapped);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async getItem(key) {
        const wrapped = await this.store.getItem(key);
        if (!wrapped)
            return null;
        if (wrapped.expiresAt && Date.now() > wrapped.expiresAt) {
            await this.store.removeItem(key);
            return null;
        }
        return wrapped.data;
    }
    async removeItem(key) {
        try {
            await this.store.removeItem(key);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async clear() {
        try {
            await this.store.clear();
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
export default new IdbService();
