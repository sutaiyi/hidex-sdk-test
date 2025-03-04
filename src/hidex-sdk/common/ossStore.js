import axios from 'axios';
import { defalutWalletStore } from './config';
const requireConfig = (apparatus, token) => {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': apparatus ? token : token
        }
    };
};
const walletCacheMap = new Map();
const getWalletItem = async (token, apparatus, key) => {
    console.log('getWalletItem....');
    const result = await axios.get('/api/frontend/app/personal/getItem', requireConfig(apparatus, token));
    if (result?.status === 200 && result?.data?.code === 200) {
        walletCacheMap.set('walletDataByMap', result.data.data);
        if (key) {
            return result.data.data[key];
        }
        return result.data.data || defalutWalletStore;
    }
    throw new Error('Failed get s3 store');
};
const setWalletItem = async (token, apparatus, key, value) => {
    let walletPutData = walletCacheMap.get('walletDataByMap');
    if (!walletPutData) {
        walletPutData = await getWalletItem(token, apparatus);
    }
    if (walletPutData && key !== 'all' && value) {
        walletPutData[key] = value;
    }
    if (key == 'all' && value) {
        walletPutData = value;
    }
    walletCacheMap.set('walletDataByMap', walletPutData);
    const result = await axios.post('/api/frontend/app/personal/setItem', walletPutData, requireConfig(apparatus, token));
    if (result?.status === 200 && result?.data && result?.data?.code === 200) {
        return true;
    }
    throw new Error('Failed set s3 store');
};
const getWalletCacheMap = () => {
    return walletCacheMap;
};
export const ossStore = {
    getWalletItem,
    setWalletItem,
    getWalletCacheMap
};
