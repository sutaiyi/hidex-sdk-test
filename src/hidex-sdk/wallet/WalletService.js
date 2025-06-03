import keysing from './keysing';
import { checkAddressChain, getUseToken, isValidSHA256, numberToCharCode, sha256 } from '../common/utils';
import { deepCopy, findAndIncrementMax, isValidEthPrivateKey, isValidSolanaPrivateKey, whosePrivater } from '../common/utils';
import { defaluBoootedOss, defalutWalletStore, ENCRYPTION_NAME, ETH_SERIES, HIDEXKEYWORD, NAMES } from '../common/config';
import { ossStore } from '../common/ossStore';
import passworder from '../common/browser/passworder';
import { ethers } from 'ethers';
import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import bs58 from 'bs58';
import { derivePath } from 'ed25519-hd-key';
import nacl from 'tweetnacl';
class WalletService {
    password;
    atpkeys;
    ADDRESS_PATH_TYPE;
    HS;
    walletMap = new Map();
    walletStore;
    bootedOss;
    constructor(options) {
        this.password = '';
        this.atpkeys = [];
        this.HS = options;
        this.ADDRESS_PATH_TYPE = this.getChainsPath();
        this.walletStore = defalutWalletStore;
        this.bootedOss = defaluBoootedOss;
    }
    async getCloudBootedOss(HS) {
        try {
            const { apparatus } = HS;
            const token = getUseToken();
            const res = await ossStore.getBootedOssItem(token, apparatus);
            this.walletMap = ossStore.getWalletMap();
            this.bootedOss = res;
            return res;
        }
        catch (error) {
            throw new Error(error);
        }
    }
    async setCloudBootedOss(HS, key, value, isClear) {
        try {
            const { apparatus } = HS;
            const token = getUseToken();
            const res = await ossStore.setBootedOssItem(token, apparatus, key, value, isClear);
            this.walletMap = ossStore.getWalletMap();
            this.bootedOss = res;
            return res;
        }
        catch (error) {
            throw new Error(error);
        }
    }
    async getWalletCatch(catcher, key) {
        try {
            const res = await ossStore.getWalletStoreItem(catcher, key);
            this.walletMap = ossStore.getWalletMap();
            this.walletStore = this.walletMap.get('WalletStore');
            return res;
        }
        catch (error) {
            throw new Error(error);
        }
    }
    async setWalletCatch(catcher, key, value) {
        await ossStore.setWalletStoreItem(catcher, key, value);
        this.walletMap = ossStore.getWalletMap();
        this.walletStore = this.walletMap.get('WalletStore');
    }
    getWalletStore() {
        return this.walletStore;
    }
    async setWalletStore(walletStore) {
        this.walletStore = walletStore;
        this.setWalletCatch(this.HS.catcher, 'all', walletStore);
    }
    getBootedOss() {
        return this.bootedOss;
    }
    async setBootedOss(bootedOssStore, isClear) {
        this.bootedOss = bootedOssStore;
        await this.setCloudBootedOss(this.HS, 'all', bootedOssStore, isClear);
    }
    async walletInit() {
        const walletStore = this.getWalletStore();
        const bootedOss = deepCopy(this.getBootedOss());
        console.log('walletInit...');
        console.log('walletStore', walletStore);
        console.log('bootedOss', bootedOss);
        if (bootedOss && (!walletStore.walletList?.length || walletStore.pathIndex !== bootedOss.pathIndex)) {
            console.log('WalletResting...');
            const maxPathIndex = bootedOss.pathIndex;
            let id = 0;
            const walletBootedArr = Object.keys(bootedOss.walletBooted);
            for (const key of walletBootedArr) {
                if (key.includes('MNEMONIC_HASH')) {
                    id++;
                    const hash = key.split('_')[2];
                    const mmcoi = await this.getEncryptionWallet(this.password, 1, hash);
                    for (const pathIndex of Array.from({ length: maxPathIndex + 1 }, (_, i) => i)) {
                        console.log('pathIndex', pathIndex);
                        await this.createMnemonicWallet(mmcoi, pathIndex, '', id, true);
                    }
                }
            }
            console.log('WalletRested');
        }
    }
    async createPassword(password, oldPassword) {
        const walletStore = this.getWalletStore();
        const bootedOss = this.getBootedOss();
        const hasBooted = bootedOss?.booted;
        if (hasBooted && !oldPassword) {
            throw new Error(JSON.stringify({ code: 10009, message: 'Password already exists!' }));
        }
        if (password.length >= 256) {
            throw new Error(JSON.stringify({ code: 10000, message: 'Wrong, < 256 Characters!' }));
        }
        this.password = await sha256(password);
        const booted = await passworder.encrypt(this.password, 'true');
        let updataWalletBootedResult = null;
        if (oldPassword) {
            updataWalletBootedResult = await this.updateWalletBooted(oldPassword, bootedOss);
        }
        const update = { ...walletStore, isUnlocked: true };
        if (updataWalletBootedResult) {
            bootedOss.walletBooted = updataWalletBootedResult;
        }
        bootedOss.booted = booted;
        await this.setBootedOss(bootedOss);
        await this.setWalletStore(update);
        return true;
    }
    async resetPassword(oldPassword, password) {
        if (password.length >= 256) {
            throw new Error(JSON.stringify({ code: 10000, message: 'Wrong, < 256 Characters!' }));
        }
        await this.verifyPassword(oldPassword);
        await this.createPassword(password, oldPassword);
        return true;
    }
    async updateWalletBooted(oldPassword, bootedOss) {
        let shaOldPassword = oldPassword;
        if (!isValidSHA256(oldPassword)) {
            shaOldPassword = await sha256(oldPassword);
        }
        const walletBooted_cloud = bootedOss?.walletBooted;
        const newWalletBooted_cloud = {};
        if (walletBooted_cloud && typeof walletBooted_cloud === 'object') {
            for (const key of Object.keys(walletBooted_cloud)) {
                const booted = walletBooted_cloud[key];
                const decryptBooted = await passworder.decrypt(shaOldPassword, booted);
                newWalletBooted_cloud[key] = await passworder.encrypt(this.password, decryptBooted);
            }
        }
        return newWalletBooted_cloud;
    }
    async verifyPassword(password) {
        let shaPassword = password;
        if (!isValidSHA256(password)) {
            shaPassword = await sha256(password);
        }
        const encryptedBooted = this.getBootedOss().booted;
        if (!encryptedBooted) {
            throw new Error(JSON.stringify({ code: 10001, message: 'Cannot find password set' }));
        }
        await passworder.decrypt(shaPassword, encryptedBooted);
        this.password = shaPassword;
        const expires = await this.getUnLockedExpires();
        keysing.booted(this.password, this.HS.catcher, expires);
    }
    async unlock(password) {
        await this.verifyPassword(password);
        await this.setUnlocked();
    }
    async setUnlocked() {
        await this.setWalletStore({ ...this.getWalletStore(), isUnlocked: true });
    }
    async setUnLockedExpires(expires) {
        if (this.password) {
            await keysing.booted(this.password, this.HS.catcher, expires);
            await this.HS.catcher.setItem('unLockedExpiresDay', expires || 7);
            return true;
        }
        throw new Error(JSON.stringify({ code: 10002, message: 'Password is empty' }));
    }
    async getUnLockedExpires() {
        let expires = await this.HS.catcher.getItem('unLockedExpiresDay');
        if (!expires) {
            expires = Number(expires);
        }
        return expires || 7;
    }
    async setLocked() {
        this.password = '';
        keysing.lock(this.HS.catcher);
        await this.setWalletStore({ ...this.getWalletStore(), isUnlocked: false });
    }
    async ownerKey(address) {
        await this.verifyPassword(this.password);
        const key = await this.getEncryptionWallet(this.password, 0, address);
        return key;
    }
    generateMnemonic() {
        const result = ethers.Wallet.createRandom();
        if (result === null || result.mnemonic === null) {
            return '';
        }
        const mnemonic = result.mnemonic.phrase;
        return mnemonic;
    }
    getChainsPath(whoChain = '') {
        const apt = {};
        this.HS.chains().map((v) => {
            if (whoChain === 'SOLANA' && v.chain === 'SOLANA') {
                apt[v.chain] = v.defaultPath;
            }
            if (whoChain === 'ETH' && ETH_SERIES.indexOf(v.chain) !== -1) {
                apt[v.chain] = v.defaultPath;
            }
            if (!whoChain) {
                apt[v.chain] = v.defaultPath;
            }
        });
        return apt;
    }
    async createWallet(mnemonic, pathIndex = 0, walletName = '', id = 0) {
        if (!isValidSHA256(mnemonic)) {
            const isWalletTrue = await this.hasWallet();
            if (isWalletTrue) {
                throw new Error(JSON.stringify({ code: 10018, message: '助记词账户已创建' }));
            }
        }
        const bootedOss = this.getBootedOss();
        let useMnemonic = mnemonic;
        const walletBootedArr = Object.keys(bootedOss.walletBooted);
        if (walletBootedArr.length > 0) {
            const item = walletBootedArr.find((v) => v.includes('MNEMONIC_HASH_'));
            if (item && item.split('_')[2] !== useMnemonic) {
                throw new Error(JSON.stringify({ code: 10018, message: '助记词账户已创建' }));
            }
            if (isValidSHA256(useMnemonic)) {
                useMnemonic = await this.getEncryptionWallet(this.password, 1, useMnemonic);
            }
        }
        return await this.createMnemonicWallet(useMnemonic, pathIndex, walletName, id);
    }
    async createMnemonicWallet(mnemonic, pathIndex = 0, walletName = '', id = 0, generate = false) {
        await this.verifyPassword(this.password);
        const account = {};
        const items = [];
        for (const key of Object.keys(this.ADDRESS_PATH_TYPE)) {
            const getPath = this.getPathByChain(key, pathIndex);
            if (key.toUpperCase() === 'SOLANA' || ETH_SERIES.includes(key.toUpperCase())) {
                items.push(this.createByMnemonicAndSave(key, mnemonic, getPath.path, pathIndex, key));
            }
        }
        console.log('createByMnemonicAndSave', items, this.ADDRESS_PATH_TYPE);
        for (const key of Object.keys(this.ADDRESS_PATH_TYPE)) {
            let item = {};
            if (key === 'SOLANA') {
                item = items.find((v) => v.chain.toUpperCase() === 'SOLANA');
            }
            else {
                const itemEth = items.find((v) => ETH_SERIES.includes(v.chain));
                if (itemEth) {
                    item = deepCopy(itemEth);
                    item.chain = key;
                }
            }
            account[key] = item;
            const jsonItem = JSON.parse(JSON.stringify(item));
            if (key.toUpperCase() === 'SOLANA' || ETH_SERIES.includes(key.toUpperCase())) {
                this.atpkeys.push(this.setEncryptionWallet(this.password, 0, jsonItem.address, jsonItem.privateKey));
            }
            if (account[key] && account[key].privateKey) {
                delete account[key].privateKey;
            }
        }
        const mha = await sha256(mnemonic);
        this.atpkeys.push(this.setEncryptionWallet(this.password, 1, mha, mnemonic));
        account.id = pathIndex;
        const walletList = {
            mnemonic: mha,
            usePrivateKey: false,
            accountList: [account],
            id
        };
        return await this.setWalletList(walletList, pathIndex, walletName, generate);
    }
    async createPrivateWallet(privateKey) {
        await this.verifyPassword(this.password);
        const account = {};
        if (!isValidEthPrivateKey(privateKey) && !isValidSolanaPrivateKey(privateKey)) {
            throw new Error(JSON.stringify({ code: 10002, message: 'Invalid private key' }));
        }
        const whoChain = whosePrivater(privateKey);
        let str = '';
        const ADDRESS_PATH_TYPE_CHAIN = this.getChainsPath(whoChain);
        for (const index in Object.keys(ADDRESS_PATH_TYPE_CHAIN)) {
            const key = Object.keys(ADDRESS_PATH_TYPE_CHAIN)[index];
            const createFu = await this.createByPrivate();
            const item = await createFu[key.toUpperCase()](privateKey, key, whoChain);
            str += item.address;
            account[key] = item;
            await this.setEncryptionWallet(this.password, 0, item.address, item.privateKey);
            delete account[key].privateKey;
        }
        account.id = 0;
        account.key = str;
        account.whoChain = whoChain;
        const walletList = {
            mnemonic: '',
            usePrivateKey: true,
            accountList: [account],
            id: 0
        };
        return await this.setWalletList(walletList);
    }
    async setWalletList(walletList, mnemonicPathIndex = 0, walletName = '', generate = false) {
        const pow = this.getWalletList() || [];
        const powList = deepCopy(pow);
        let backWallet = walletList;
        backWallet.isRepeat = false;
        if (walletList.mnemonic) {
            const powItem = powList.find((v) => v.mnemonic === walletList.mnemonic);
            if (powItem) {
                const hasAccount = powItem.accountList.findIndex((v) => v.id === walletList.accountList[0].id);
                if (hasAccount === -1) {
                    powItem.accountList.push(...walletList.accountList);
                }
                else {
                    return Object.assign(powItem, { isRepeat: true });
                }
            }
            else {
                const numIndex = powList.find((v) => v.usePrivateKey) ? powList.length : powList.length + 1;
                walletList.walletName = walletName || `${NAMES['walletName']}${numberToCharCode(numIndex)}`;
                walletList.id = findAndIncrementMax(powList.map((v) => v.id));
                powList.push(walletList);
            }
        }
        else if (walletList.usePrivateKey) {
            const powItem = powList.find((v) => v.usePrivateKey === walletList.usePrivateKey);
            const currentAddAccountItem = walletList?.accountList[0];
            const walletHas = await this.getWalletByAddress(currentAddAccountItem[currentAddAccountItem.whoChain || 'ETH'].address);
            if (powItem) {
                const hasAccount = powItem.accountList.find((v) => v.key === currentAddAccountItem.key);
                if (!hasAccount) {
                    if (walletHas.has && walletHas.walletId !== undefined && walletHas.accountId !== undefined) {
                        backWallet.isRepeat = true;
                    }
                    else {
                        walletList.accountList[0].id = findAndIncrementMax(powItem.accountList.map((v) => v.id));
                        backWallet.id = powItem.id;
                        powItem.accountList.push(...walletList.accountList);
                    }
                }
                else {
                    backWallet.isRepeat = true;
                }
            }
            else {
                walletList.walletName = NAMES['usePrividerName'];
                if (walletHas.has && walletHas.walletId !== undefined && walletHas.accountId !== undefined) {
                    backWallet.isRepeat = true;
                }
                else {
                    walletList.id = findAndIncrementMax(powList.map((v) => v.id));
                    powList.push(walletList);
                    backWallet = walletList;
                }
            }
        }
        if (!backWallet.isRepeat) {
            let atpbooted = [];
            if (!generate) {
                atpbooted = await Promise.all(this.atpkeys);
                const params = { ...this.getBootedOss(), pathIndex: mnemonicPathIndex };
                if (atpbooted[atpbooted.length - 1]) {
                    params.walletBooted = atpbooted[atpbooted.length - 1];
                }
                await this.setBootedOss(params);
            }
            await this.setWalletStore({ ...this.getWalletStore(), walletList: powList, pathIndex: mnemonicPathIndex });
        }
        this.atpkeys = [];
        return backWallet;
    }
    async setWalletName(walletId, name) {
        const walletItem = await this.getWalletById(walletId);
        const item = deepCopy(walletItem);
        item.walletName = name;
        this.updatedWallet(item);
        return true;
    }
    async updatedWallet(wallet) {
        const pow = this.getWalletList() || [];
        const walletList = deepCopy(pow);
        const walletItem = walletList.find((v) => v.id === wallet.id);
        if (walletItem) {
            Object.assign(walletItem, wallet);
            await this.setWalletStore({ ...this.getWalletStore(), walletList: walletList });
            return wallet;
        }
        throw new Error('wallet not found');
    }
    async getWalletByAddress(address) {
        const pow = this.getWalletList() || [];
        const walletList = deepCopy(pow);
        if (walletList.length === 0) {
            return { has: false };
        }
        for (const wallet of walletList) {
            for (const account of wallet.accountList) {
                for (const accountChain of Object.keys(account)) {
                    if (account[accountChain] && typeof account[accountChain] === 'object' && account[accountChain].address === address) {
                        return { has: true, walletId: wallet.id, accountId: account.id };
                    }
                }
            }
        }
        return { has: false };
    }
    getWalletList() {
        const walletStore = this.getWalletStore() || {};
        return walletStore.walletList || [];
    }
    async getCurrentWallet() {
        const bootedOss = this.getBootedOss();
        const [currentWalletId, currentAccountId] = bootedOss.currentWalletId?.split('&');
        const walletItem = await this.getWalletById(Number(currentWalletId));
        let accountItem = walletItem.accountList.find((v) => v.id === Number(currentAccountId));
        if (!accountItem) {
            accountItem = walletItem.accountList[0];
        }
        if (walletItem && accountItem) {
            return { walletItem, accountItem };
        }
        throw new Error(JSON.stringify({ code: 10003, message: 'Getting wallet error' }));
    }
    async getWalletById(id) {
        try {
            const walletItem = this.getWalletList().find((v) => v.id === Number(id));
            if (!walletItem) {
                return this.getDefaultWallet();
            }
            return walletItem;
        }
        catch (error) {
            throw new Error(JSON.stringify({ code: 10004, message: 'Wallet not found' }));
        }
    }
    async getDefaultWallet() {
        try {
            const defaultWallet = this.getWalletList()[0];
            if (defaultWallet) {
                return defaultWallet;
            }
            throw new Error(JSON.stringify({ code: 10004, message: 'Wallet not found' }));
        }
        catch (error) {
            throw error;
        }
    }
    async getWalletAndAccount(walletId, accountId) {
        const walletItem = await this.getWalletById(walletId);
        const accountItem = walletItem.accountList.find((v) => v.id === accountId);
        if (!accountItem) {
            throw new Error(JSON.stringify({ code: 10005, message: 'Account not found' }));
        }
        const backWallet = deepCopy(walletItem);
        backWallet.accountList = [accountItem];
        return backWallet;
    }
    async getAccountById(walletId, accountId) {
        const walletItem = await this.getWalletById(walletId);
        const accountItem = walletItem.accountList.find((v) => v.id === Number(accountId));
        if (!accountItem) {
            throw new Error(JSON.stringify({ code: 10005, message: 'Account not found' }));
        }
        return accountItem;
    }
    async getWalletCurrentPathIndex() {
        const bootpro = await this.getCloudBootedOss(this.HS);
        return bootpro?.pathIndex || 0;
    }
    async setCurrentWallet(walletId = 0, accountId = 0) {
        await this.setBootedOss({
            ...this.getBootedOss(),
            currentWalletId: `${walletId}&${accountId}`
        });
        return await this.getCurrentWallet();
    }
    async deleteWallet(password, walletId) {
        try {
            await this.verifyPassword(password);
            const pow = this.getWalletList() || [];
            const walletList = deepCopy(pow);
            const index = walletList.findIndex((v) => v.id === walletId);
            if (index !== -1) {
                walletList.splice(index, 1);
                await this.setWalletStore({ ...this.getWalletStore(), walletList });
                return true;
            }
            throw new Error('wallet not found');
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async deleteWalletAccount(password, walletId, accountId) {
        try {
            await this.verifyPassword(password);
            const pow = this.getWalletList() || [];
            const walletList = deepCopy(pow);
            const walletItem = walletList.find((v) => v.id === walletId);
            if (walletItem) {
                const index = walletItem.accountList.findIndex((v) => v.id === accountId);
                if (index !== -1) {
                    walletItem.accountList.splice(index, 1);
                    if (walletItem.accountList.length === 0) {
                        await this.deleteWallet(password, walletId);
                        return true;
                    }
                    await this.setWalletStore({ ...this.getWalletStore(), walletList });
                    return true;
                }
                throw new Error('account not found');
            }
            throw new Error('wallet not found');
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async clearWallet() {
        const res = await this.clearLocalWallet();
        if (res) {
            const isClear = true;
            await this.setBootedOss(defaluBoootedOss, isClear);
        }
        this.password = '';
        return true;
    }
    async clearLocalWallet() {
        console.log('clearLocalWallet....');
        await this.setWalletStore(defalutWalletStore);
        await this.HS.catcher.removeItem('dataStorage');
        await this.HS.catcher.removeItem('dataCache');
        await this.HS.catcher.removeCookie('dataStorage', { secure: true });
        ossStore.clearWalletMap();
        this.walletStore = defalutWalletStore;
        this.bootedOss = defaluBoootedOss;
        this.password = '';
        console.log('clearLocalWallet success');
        return true;
    }
    eventSecretCode() {
        const secret = (code) => {
            this.password = code ? code : keysing.get();
            if (!this.password) {
                this.setLocked();
            }
        };
        secret('');
        keysing.on('EventSecretCode', secret);
    }
    async exportMnemonics(password, walletId) {
        await this.verifyPassword(password);
        const walletItem = await this.getWalletById(walletId);
        if (walletItem.mnemonic) {
            return await this.getEncryptionWallet(this.password, 1, walletItem.mnemonic);
        }
        throw new Error('mnemonic not found');
    }
    async exportPrivateKey(password, walletId, accountId, chainName) {
        try {
            await this.verifyPassword(password);
            const walletItem = await this.getWalletById(walletId);
            const accountItem = walletItem.accountList.find((v) => v.id === accountId);
            if (accountItem) {
                const key = await this.ownerKey(accountItem[chainName].address);
                if (key) {
                    return key;
                }
            }
            throw new Error('account not found');
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    }
    async getEncryptionWallet(password, type, key) {
        const walletBooted = this.getBootedOss().walletBooted;
        if (walletBooted) {
            const name = ENCRYPTION_NAME;
            const booted = walletBooted[`${name[type]}${key.toLowerCase()}`];
            if (booted) {
                return await passworder.decrypt(password, booted);
            }
        }
        return '';
    }
    async setEncryptionWallet(password, way, key, value) {
        try {
            const walletStore = this.getBootedOss();
            const walletBooted = walletStore.walletBooted || {};
            const name = ENCRYPTION_NAME;
            const booted = await passworder.encrypt(password, value);
            walletBooted[`${name[way]}${key.toLowerCase()}`] = booted;
            return walletBooted;
        }
        catch (error) {
            console.error('setEncryptionWallet - error', error);
            return {};
        }
    }
    getPathByChain(chainName, pathIndex = 0) {
        let path = this.ADDRESS_PATH_TYPE[chainName];
        if (pathIndex) {
            path = path.replace(/\/0$/, `/${pathIndex}`);
        }
        return {
            path
        };
    }
    createByMnemonicAndSave(chain, mnemonic, path, pathIndex, chainName) {
        if (chain === 'SOLANA') {
            return this.createByMnemonicFunBySol(mnemonic, pathIndex, chainName);
        }
        return this.createByMnemonicFun(mnemonic, path, pathIndex, chainName);
    }
    createByMnemonicFun(mnemonic, path, pathIndex, chainName) {
        const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic);
        const wallet = hdNode.derivePath(path);
        const { address, privateKey, publicKey } = wallet;
        const block = 0;
        console.log('---账户创建---', {
            pathIndex,
            path,
            address,
            publicKey,
            privateKey,
            chain: chainName,
            block
        });
        return {
            pathIndex,
            path,
            address,
            publicKey,
            privateKey,
            chain: chainName,
            block
        };
    }
    createByMnemonicFunBySol(mnemonic, pathIndex, chainName) {
        const newPath = `${this.ADDRESS_PATH_TYPE[chainName].replace(/0'(?=\/0$)/, `${pathIndex}'`)}'`;
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const derivedKey = derivePath(newPath, seed.toString('hex')).key;
        const keypair = Keypair.fromSeed(derivedKey);
        const publicKey = keypair.publicKey.toString();
        const secretKey = bs58.encode(Buffer.from(keypair.secretKey));
        return {
            pathIndex,
            path: newPath,
            address: publicKey,
            publicKey,
            privateKey: secretKey,
            chain: 'SOLANA',
            block: 0
        };
    }
    async createByPrivate() {
        return {
            ETH: async (privateKey, key, chain) => {
                if (key)
                    return await this.createEthSeriesPrivateKey(privateKey, key, chain, 'ETH');
            },
            BASE: async (privateKey, key, chain) => {
                if (key)
                    return await this.createEthSeriesPrivateKey(privateKey, 'ETH', chain, 'BASE');
            },
            ARBITRUM: async (privateKey, key, chain) => {
                if (key)
                    return await this.createEthSeriesPrivateKey(privateKey, 'ETH', chain, 'ARBITRUM');
            },
            BSC: async (privateKey, key, chain) => {
                if (key)
                    return await this.createEthSeriesPrivateKey(privateKey, 'ETH', chain, 'BSC');
            },
            SEPOLIA: async (privateKey, key, chain) => {
                if (key)
                    return await this.createEthSeriesPrivateKey(privateKey, 'ETH', chain, 'SEPOLIA');
            },
            SOLANA: async (privateKey, key, chain) => {
                if (key === chain) {
                    const decodedPrivateKey = bs58.decode(privateKey);
                    const keypair = Keypair.fromSecretKey(decodedPrivateKey);
                    const { publicKey } = keypair;
                    const address = publicKey.toBase58();
                    return {
                        pathIndex: 0,
                        path: '',
                        privateKey,
                        address,
                        publicKey: address,
                        chain,
                        block: 0
                    };
                }
                else {
                    const chainName = 'SOLANA';
                    const { address, publicKey, outPrivateKey, block } = await this.generatePrivateKeyByChain(privateKey, chainName);
                    return {
                        pathIndex: 0,
                        path: '',
                        address,
                        publicKey,
                        privateKey: outPrivateKey,
                        chain: chainName,
                        block
                    };
                }
            }
        };
    }
    async createEthSeriesPrivateKey(privateKey, key, chain, chainName) {
        if (key === chain) {
            if (!privateKey.startsWith('0x')) {
                privateKey = '0x' + privateKey;
            }
            const block = 0;
            const wallet = new ethers.Wallet(privateKey);
            const { address, publicKey } = wallet;
            return {
                pathIndex: 0,
                path: '',
                address,
                publicKey,
                privateKey,
                chain: chainName,
                block
            };
        }
        else {
            const { address, publicKey, outPrivateKey, block } = await this.generatePrivateKeyByChain(privateKey, key);
            return {
                pathIndex: 0,
                path: '',
                address,
                publicKey,
                privateKey: outPrivateKey,
                chain: chainName,
                block
            };
        }
    }
    async generatePrivateKeyByChain(privateKey, chainName) {
        let account = {
            address: '',
            outPrivateKey: '',
            publicKey: '',
            block: 0
        };
        if (chainName === 'SOLANA') {
            const restoredEthWallet = new ethers.Wallet(privateKey);
            const restoredEthPrivateKeyArray = Uint8Array.from(Buffer.from(restoredEthWallet.privateKey.slice(2), 'hex'));
            const restoredSolanaKeypair = Keypair.fromSeed(restoredEthPrivateKeyArray.slice(0, 32));
            const restoredSolanaPrivateKey = restoredSolanaKeypair.secretKey;
            const restoredSolanaPrivateKeyBase58 = bs58.encode(restoredSolanaPrivateKey);
            const restoredSolanaAddress = restoredSolanaKeypair.publicKey.toBase58();
            account = {
                address: restoredSolanaAddress,
                publicKey: restoredSolanaAddress,
                outPrivateKey: restoredSolanaPrivateKeyBase58,
                block: 0
            };
        }
        if (ETH_SERIES.indexOf(chainName.toUpperCase()) !== -1) {
            const solanaPrivateKeyArray = bs58.decode(privateKey);
            const keypair = Keypair.fromSecretKey(solanaPrivateKeyArray);
            const solanaPrivateKey = keypair.secretKey.slice(0, 32);
            const ethPrivateKeyBuffer = Buffer.from(solanaPrivateKey);
            const ethWallet = new ethers.Wallet(ethPrivateKeyBuffer);
            const ethAddress = ethWallet.address;
            const ethPrivateKey = ethWallet.privateKey;
            const block = 0;
            account = {
                address: ethAddress,
                outPrivateKey: ethPrivateKey,
                publicKey: this.getPublicKey(ethPrivateKey),
                block
            };
        }
        return account;
    }
    getPublicKey(privateKey) {
        const walletPrivate = new ethers.Wallet(privateKey);
        return walletPrivate.publicKey;
    }
    async isUnlocked() {
        const cl = await keysing.isLocked(this.HS.catcher);
        if (cl) {
            return this.getWalletStore().isUnlocked;
        }
        this.setWalletStore({ ...this.getWalletStore(), isUnlocked: false });
        return false;
    }
    async isSetPassword() {
        const data = await this.getWalletStatus();
        return data.isSetPassword;
    }
    async hasWallet() {
        const data = await this.getWalletStatus();
        return data.hasWallet;
    }
    async getWalletStatus() {
        const [isUnlocked, { pathIndex, walletStatus, passwordStatus }] = await Promise.all([this.isUnlocked(), this.getCloudBootedOss(this.HS)]);
        return {
            isUnlocked,
            isSetPassword: passwordStatus,
            pathIndex: pathIndex || 0,
            hasWallet: walletStatus
        };
    }
    async signMessage(message, address) {
        const privateKey = await this.ownerKey(address);
        if (checkAddressChain(address) === 'ETH') {
            const wallet = new ethers.Wallet(privateKey);
            const signature = await wallet.signMessage(message);
            return signature;
        }
        const messageUint8 = new TextEncoder().encode(message);
        const signature = nacl.sign.detached(messageUint8, this.HS.utils.ownerKeypair(privateKey).secretKey);
        return bs58.encode(signature);
    }
    async decryptionS3Data(text, password) {
        const encryptedWallet = await passworder.decrypt(HIDEXKEYWORD, text);
        const jsonData = JSON.parse(encryptedWallet);
        let shaPassword = password;
        if (!isValidSHA256(password)) {
            shaPassword = await sha256(password);
        }
        await passworder.decrypt(shaPassword, jsonData.booted);
        const walletBootedArr = Object.keys(jsonData.walletBooted);
        const maxPathIndex = jsonData.pathIndex;
        let id = 0;
        let walletList = null;
        const creatWalletTest = async (mnemonic, pathIndex = 0, id = 0) => {
            const account = {};
            const items = [];
            for (const key of Object.keys(this.ADDRESS_PATH_TYPE)) {
                const getPath = this.getPathByChain(key, pathIndex);
                if (key.toUpperCase() === 'SOLANA' || key.toUpperCase() === 'ETH') {
                    items.push(this.createByMnemonicAndSave(key, mnemonic, getPath.path, pathIndex, key));
                }
            }
            for (const key of Object.keys(this.ADDRESS_PATH_TYPE)) {
                let item = {};
                if (key === 'SOLANA') {
                    item = items.find((v) => v.chain.toUpperCase() === 'SOLANA');
                }
                else {
                    const itemEth = items.find((v) => v.chain.toUpperCase() === 'ETH');
                    if (itemEth) {
                        item = deepCopy(itemEth);
                        item.chain = key;
                    }
                }
                account[key] = item;
                const jsonItem = JSON.parse(JSON.stringify(item));
                if (key.toUpperCase() === 'SOLANA' || key.toUpperCase() === 'ETH') {
                    this.atpkeys.push(this.setEncryptionWallet(this.password, 0, jsonItem.address, jsonItem.privateKey));
                }
                if (account[key] && account[key].privateKey) {
                    delete account[key].privateKey;
                }
            }
            const mha = await sha256(mnemonic);
            this.atpkeys.push(this.setEncryptionWallet(this.password, 1, mha, mnemonic));
            account.id = pathIndex;
            if (!walletList) {
                walletList = {
                    mnemonic,
                    usePrivateKey: false,
                    accountList: [account],
                    id
                };
            }
            else {
                walletList.accountList.push(account);
            }
        };
        for (const key of walletBootedArr) {
            if (key.includes('MNEMONIC_HASH')) {
                id++;
                const hash = key.split('_')[2];
                const mmcoiBooted = jsonData.walletBooted[`${ENCRYPTION_NAME[1]}${hash.toLowerCase()}`];
                const mmcoi = await passworder.decrypt(shaPassword, mmcoiBooted);
                for (const pathIndex of Array.from({ length: maxPathIndex + 1 }, (_, i) => i)) {
                    console.log('pathIndex', pathIndex);
                    await creatWalletTest(mmcoi, pathIndex, id);
                }
            }
        }
        return walletList;
    }
}
export default WalletService;
