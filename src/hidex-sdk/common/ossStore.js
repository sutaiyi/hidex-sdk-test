import axios from 'axios';
const requireConfig = (apparatus, token) => {
    const appBearer = apparatus !== 'app' ? global.localStorage.getItem('token') : '';
    const bearer = token || appBearer;
    return {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + bearer
        }
    };
};
const walletCacheMap = new Map();
const getWalletItem = async (apiUrl, token, apparatus, key) => {
    const result = await axios.post(apiUrl + '/api/frontend/app/personal/getItem', {}, requireConfig(apparatus, token));
    if (result?.status === 200 && result?.data?.data?.code === 200) {
        walletCacheMap.set('walletDataByMap', result.data.data);
        if (key) {
            return result.data.data[key];
        }
        return result.data.data;
    }
    throw new Error('Failed get s3 store');
};
const setWalletItem = async (apiUrl, token, apparatus, key, value) => {
    let walletPutData = walletCacheMap.get('walletDataByMap');
    if (!walletPutData) {
        walletPutData = await getWalletItem(apiUrl, token, apparatus);
    }
    if (walletPutData && key && value) {
        walletPutData[key] = value;
    }
    if (key == 'all' && value) {
        walletPutData = value;
    }
    walletCacheMap.set('walletDataByMap', walletPutData);
    const result = await axios.post(apiUrl + '/api/frontend/app/personal/getItem', walletPutData, requireConfig(apparatus, token));
    if (result?.status === 200 && result?.data?.data?.code === 200) {
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
