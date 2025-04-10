import { PublicKey } from '@solana/web3.js';
import * as CryptoJS from 'crypto-js';
import bs58 from 'bs58';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
export function isHexString(str) {
    return /^[a-fA-F0-9]+$/.test(str);
}
export function isEthereumAddress(address) {
    return address.startsWith('0x') && address.length === 42 && isHexString(address.slice(2));
}
export function isSolanaAddress(address) {
    try {
        new PublicKey(address);
        return true;
    }
    catch (e) {
        return false;
    }
}
export function checkAddressChain(address) {
    try {
        if (isSolanaAddress(address)) {
            return 'SOLANA';
        }
        if (isEthereumAddress(address)) {
            return 'ETH';
        }
        return 'Invalid address';
    }
    catch (error) {
        throw new Error('Invalid address');
    }
}
export async function sha256(message) {
    return CryptoJS.SHA256(message).toString(CryptoJS.enc.Hex);
}
export function isValidSHA256(hash) {
    const sha256Regex = /^[a-fA-F0-9]{64}$/;
    return sha256Regex.test(hash);
}
export function fillZeroNumber(index) {
    return index < 10 ? `0${index}` : `${index}`;
}
export function numberToCharCode(num) {
    if (num < 0) {
        throw new Error('The number must be greater than or equal to 0');
    }
    return String.fromCharCode(64 + num);
}
export function deepCopy(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }
    const newObj = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            newObj[key] = deepCopy(obj[key]);
        }
    }
    return newObj;
}
export function copyJson(obj) {
    let newObj = JSON.stringify(obj);
    newObj = JSON.parse(newObj);
    return newObj;
}
export function isValidEthPrivateKey(key) {
    if (key.startsWith('0x')) {
        key = key.slice(2);
    }
    const ethPrivateKeyRegex = /^[0-9a-fA-F]{64}$/;
    return ethPrivateKeyRegex.test(key);
}
export function isValidSolanaPrivateKey(key) {
    try {
        bs58.decode(key);
        return true;
    }
    catch (error) {
        throw new Error('Invalid private key');
    }
}
export function whosePrivater(privateKey) {
    if (isValidEthPrivateKey(privateKey)) {
        return 'ETH';
    }
    if (isValidSolanaPrivateKey(privateKey)) {
        return 'SOLANA';
    }
    throw new Error('Invalid private key');
}
export function findAndIncrementMax(arr) {
    if (arr.length === 0)
        return 0;
    const max = Math.max(...arr);
    return max + 1;
}
export function noIntersection(arr1, arr2) {
    const set1 = new Set(arr1);
    return arr2.some((item) => set1.has(item));
}
export function tokenDecode(encodedData) {
    const types = ['address', 'string', 'string', 'uint8'];
    const abiCoder = new ethers.utils.AbiCoder();
    const decodedData = abiCoder.decode(types, encodedData);
    return {
        address: decodedData[0],
        name: decodedData[1],
        symbol: decodedData[2],
        decimals: decodedData[3],
    };
}
export async function bundlesStatuses(data) {
    const res = await (await fetch('https://mainnet.block-engine.jito.wtf/api/v1/bundles', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getBundleStatuses',
            params: [[data]],
        }),
    })).json();
    if (res && res.result && res.result.value) {
        return {
            context: res.result.context,
            value: res.result.value.length > 0 ? { ...res.result.value[0], confirmationStatus: res.result.value[0].confirmation_status } : null,
        };
    }
    else {
        return {
            context: '',
            value: null,
        };
    }
}
export function addUniqueItem(arr, item, id) {
    const ids = new Set(arr.map((i) => i[id]));
    if (!ids.has(item[id])) {
        arr.push(item);
    }
    return arr;
}
export function removeDuplicateObjects(arr, id) {
    return arr.filter((item, index, self) => index === self.findIndex((t) => t[id] === item[id]));
}
export function mergeAndDeduplicateObjects(arr1, arr2, id) {
    const merged = [...arr1, ...arr2];
    const uniqueItems = Array.from(new Map(merged.map((item) => [item[id], item])).values());
    return uniqueItems;
}
export function mergedRepeat(arr1, arr2, id) {
    const uniqueItems = [];
    arr1.forEach((item) => {
        const index = arr2.findIndex((i) => i[id] === item[id]);
        if (index === -1) {
            uniqueItems.push(item);
        }
    });
    return uniqueItems;
}
export function toLzString(input) {
    return btoa(unescape(encodeURIComponent(input)));
}
export function lzStringTo(input) {
    return decodeURIComponent(escape(atob(input)));
}
export function environmental(production, uat, development) {
    if (global.window?.HidexConfig?.env === 'production') {
        return production;
    }
    else if (global.window?.HidexConfig?.env === 'development') {
        return development;
    }
    else if (global.window?.HidexConfig?.env === 'uat') {
        return uat;
    }
    return production;
}
export function globalSet(key, value) {
    global.window[key] = value;
}
export const isValidJSON = (str) => {
    try {
        JSON.parse(str);
        return true;
    }
    catch (e) {
        return false;
    }
};
export function strToNumberByDecimals(str, decimals) {
    if (!str)
        return 0;
    return Number(str) / Math.pow(10, decimals);
}
export function formatNumberWithPrecision(numValue, precision) {
    let num = Number(numValue);
    if (isNaN(num)) {
        return num.toString();
    }
    if (precision < 0) {
        return numValue.toString();
    }
    if (num === 0) {
        return precision === 0 ? '0' : '0.' + '0'.repeat(precision);
    }
    if (precision < 0)
        throw new Error('Precision must be non-negative');
    const bigNum = new BigNumber(num);
    if (precision === 0) {
        return bigNum.integerValue(BigNumber.ROUND_CEIL).toFixed();
    }
    const fullStr = bigNum.toFixed(100, BigNumber.ROUND_DOWN);
    const [intPart, decimalRaw = ''] = fullStr.split('.');
    let firstValidIndex = decimalRaw.search(/[1-9]/);
    if (firstValidIndex === -1) {
        return `${intPart}.${'0'.repeat(precision)}`;
    }
    const effectivePart = decimalRaw.slice(firstValidIndex, firstValidIndex + precision);
    const prefixZeros = decimalRaw.slice(0, firstValidIndex);
    const finalDecimal = (prefixZeros + effectivePart).padEnd(firstValidIndex + precision, '0');
    return `${intPart}.${finalDecimal}`;
}
