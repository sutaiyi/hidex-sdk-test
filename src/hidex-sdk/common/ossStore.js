import axios from 'axios';
import { defaluBoootedOss, defalutWalletStore, HIDEXKEYWORD } from './config';
import passworder from './browser/passworder';
const requireConfig = (apparatus, token) => {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': apparatus ? token : token
        }
    };
};
const bootedOssMap = new Map();
const getBootedOssItem = async (token, apparatus, key) => {
    const result = await axios.get('/api/frontend/app/personal/getItem', requireConfig(apparatus, token));
    if (result?.status === 200 && result?.data?.code === 200) {
        if (result.data.data?.putBooted) {
            const encryptedWallet = await passworder.decrypt(HIDEXKEYWORD, result.data.data.putBooted);
            const data = JSON.parse(encryptedWallet);
            bootedOssMap.set('bootedOssByMap', data);
            if (key) {
                return data[key];
            }
            return data;
        }
        return defaluBoootedOss;
    }
    throw new Error('Failed get s3 store');
};
const setBootedOssItem = async (token, apparatus, key, value) => {
    let walletPutData = bootedOssMap.get('bootedOssByMap');
    if (!walletPutData) {
        walletPutData = await getBootedOssItem(token, apparatus);
    }
    if (walletPutData && key !== 'all' && value) {
        walletPutData[key] = value;
    }
    if (key == 'all' && value) {
        walletPutData = value;
    }
    bootedOssMap.set('bootedOssByMap', walletPutData);
    const putBooted = await passworder.encrypt(HIDEXKEYWORD, JSON.stringify(walletPutData));
    const result = await axios.post('/api/frontend/app/personal/setItem', { putBooted }, requireConfig(apparatus, token));
    if (result?.status === 200 && result?.data && result?.data?.code === 200) {
        return true;
    }
    throw new Error('Failed set s3 store');
};
const getBootedOssCacheMap = () => {
    return bootedOssMap;
};
const walletCacheMap = new Map();
const getWalletItem = async (catcher, key) => {
    const result = await catcher.getItem('dataCache');
    if (result && typeof result === 'object') {
        const encryptedWallet = await passworder.decrypt(HIDEXKEYWORD, JSON.stringify(result));
        const data = JSON.parse(encryptedWallet);
        walletCacheMap.set('walletDataByMap', data);
        if (key) {
            return data[key];
        }
        return data;
    }
    walletCacheMap.set('walletDataByMap', defalutWalletStore);
    return defalutWalletStore;
};
const setWalletItem = async (catcher, key, value) => {
    let walletPutData = walletCacheMap.get('walletDataByMap');
    if (!walletPutData) {
        walletPutData = await getWalletItem(catcher);
    }
    if (walletPutData && key !== 'all' && value) {
        walletPutData[key] = value;
    }
    if (key == 'all' && value) {
        walletPutData = value;
    }
    walletCacheMap.set('walletDataByMap', walletPutData);
    const putBooted = await passworder.encrypt(HIDEXKEYWORD, JSON.stringify(walletPutData));
    const result = await catcher.setItem('dataCache', putBooted);
    return result;
};
const getWalletCacheMap = () => {
    return walletCacheMap;
};
export const ossStore = {
    getWalletItem,
    setWalletItem,
    getBootedOssItem,
    setBootedOssItem,
    getWalletCacheMap,
    getBootedOssCacheMap
};
