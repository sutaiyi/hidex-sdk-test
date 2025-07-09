import axios from 'axios';
import { defaluBoootedOss, defalutWalletStore, HIDEXKEYWORD } from './config';
import passworder from './browser/passworder';
import { environmental } from './utils';
const requireConfig = (apparatus, token) => {
    return {
        headers: {
            'Content-Type': 'application/json',
            Authorization: apparatus ? token : token,
            dev: environmental('', true, true)
        }
    };
};
const walletMap = new Map();
const getBootedOssItem = async (token, apparatus) => {
    try {
        const result = await axios.get('/api/frontend/app/personal/getItem', requireConfig(apparatus, token));
        if (result?.status === 200 && result?.data?.code === 200) {
            if (result.data?.data?.putBooted) {
                const encryptedWallet = await passworder.decrypt(HIDEXKEYWORD, result.data.data.putBooted);
                const data = JSON.parse(encryptedWallet);
                walletMap.set('WalletBooted', data);
                return {
                    ...data,
                    passwordStatus: data.booted ? 1 : 0,
                    walletStatus: Object.keys(data.walletBooted).length ? 1 : 0
                };
            }
            walletMap.set('WalletBooted', defaluBoootedOss);
            return defaluBoootedOss;
        }
        throw new Error(JSON.stringify(result?.data));
    }
    catch (error) {
        console.log('s3 get error', typeof error === 'string', error);
        return {
            ...defaluBoootedOss,
            passwordStatus: undefined,
            walletStatus: undefined,
            error: error?.toString()?.indexOf('"code":401') !== -1 ? 'failed get s3 code 401' : undefined
        };
    }
};
const setBootedOssItem = async (token, apparatus, key, value, isClear) => {
    if (!token) {
        return {
            ...defaluBoootedOss,
            passwordStatus: undefined,
            walletStatus: undefined
        };
    }
    try {
        let walletPutData = await getBootedOssItem(token, apparatus);
        if (walletPutData?.walletStatus === undefined) {
            throw new Error('Failed get s3 store');
        }
        if (walletPutData && key !== 'all' && value) {
            walletPutData[key] = value;
        }
        if (key == 'all' && value) {
            if (isClear) {
                walletPutData = defaluBoootedOss;
            }
            else {
                if (walletPutData.walletBooted && !value.walletBooted) {
                    throw new Error('[Failed set s3 store] 数据比对异常');
                }
                walletPutData = value;
            }
        }
        walletMap.set('WalletBooted', walletPutData);
        const putBooted = await passworder.encrypt(HIDEXKEYWORD, JSON.stringify(walletPutData));
        const result = await axios.post('/api/frontend/app/personal/setItem', { putBooted }, requireConfig(apparatus, token));
        if (result?.status === 200 && result?.data && result?.data?.code === 200) {
            return walletPutData;
        }
        throw new Error('Failed set s3 store');
    }
    catch (error) {
        throw new Error('Failed set s3 store' + error);
    }
};
const getWalletStoreItem = async (catcher, key) => {
    const result = await catcher.getItem('dataCache');
    if (result && typeof result === 'object') {
        const encryptedWallet = await passworder.decrypt(HIDEXKEYWORD, JSON.stringify(result));
        const data = JSON.parse(encryptedWallet);
        walletMap.set('WalletStore', data);
        if (key) {
            return data[key];
        }
        return data;
    }
    walletMap.set('WalletStore', defalutWalletStore);
    return defalutWalletStore;
};
const setWalletStoreItem = async (catcher, key, value) => {
    let walletPutData = walletMap.get('WalletStore');
    if (!walletPutData) {
        walletPutData = await getWalletStoreItem(catcher);
    }
    if (walletPutData && key !== 'all' && value) {
        walletPutData[key] = value;
    }
    if (key == 'all' && value) {
        walletPutData = value;
    }
    walletMap.set('WalletStore', walletPutData);
    const putBooted = await passworder.encrypt(HIDEXKEYWORD, JSON.stringify(walletPutData));
    const result = await catcher.setItem('dataCache', putBooted);
    return result;
};
const clearWalletMap = () => {
    walletMap.clear();
};
const getWalletMap = () => {
    return walletMap;
};
export const ossStore = {
    getWalletStoreItem,
    setWalletStoreItem,
    getBootedOssItem,
    setBootedOssItem,
    clearWalletMap,
    getWalletMap
};
