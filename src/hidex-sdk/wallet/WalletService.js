import keysing from './keysing';
import { isValidSHA256, sha256 } from '../common/utils';
import { deepCopy, findAndIncrementMax, isValidEthPrivateKey, isValidSolanaPrivateKey, whosePrivater } from '../common/utils';
import { ENCRYPTION_NAME, ETH_SERIES, NAMES } from '../common/config';
import { ossStore } from '../common/ossStore';
import passworder from '../common/browser/passworder';
import { ethers } from 'ethers';
import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import bs58 from 'bs58';
import { derivePath } from 'ed25519-hd-key';
class WalletService {
    password;
    atpkeys;
    ADDRESS_PATH_TYPE;
    HS;
    mapWalletCache = new Map();
    constructor(options) {
        this.password = '';
        this.atpkeys = [];
        this.ADDRESS_PATH_TYPE = this.getChainsPath();
        this.HS = options;
        this.mapWalletCache = ossStore.getWalletCacheMap();
    }
    cloudWalletStore() {
        const apiUrl = this.HS.apiUrl;
        const token = this.HS.token;
        const apparatus = this.HS.apparatus;
        return {
            getWalletItem: async (key) => {
                const res = await ossStore.getWalletItem(apiUrl, token, apparatus, key);
                this.mapWalletCache = ossStore.getWalletCacheMap();
                return res;
            },
            setWalletItem: async (key, value) => {
                const res = await ossStore.setWalletItem(apiUrl, token, apparatus, key, value);
                this.mapWalletCache = ossStore.getWalletCacheMap();
                return res;
            },
        };
    }
    async createPassword(password, oldPassword) {
        const walletStore = await this.getWalletStore();
        const hasBooted = walletStore?.booted;
        if (hasBooted && !oldPassword) {
            throw new Error(JSON.stringify({ code: 10009, message: 'Password already exists!' }));
        }
        if (password.length >= 256) {
            throw new Error(JSON.stringify({ code: 10000, message: 'Wrong, < 256 Characters!' }));
        }
        this.password = await sha256(password);
        const booted = await passworder.encrypt(this.password, 'true');
        await this.setWalletStore({ ...walletStore, booted });
        keysing.booted(this.password, this.HS.catcher);
        let updataWalletBootedResult = null;
        if (oldPassword) {
            updataWalletBootedResult = await this.updateWalletBooted(oldPassword, walletStore);
        }
        const update = { ...walletStore, booted, isUnlocked: true, isBooted: true, createTime: Date.now() };
        if (updataWalletBootedResult) {
            update.walletBooted = updataWalletBootedResult;
        }
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
    async updateWalletBooted(oldPassword, walletStore) {
        let shaOldPassword = oldPassword;
        if (!isValidSHA256(oldPassword)) {
            shaOldPassword = await sha256(oldPassword);
        }
        const walletBooted_cloud = walletStore?.walletBooted;
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
        const encryptedBooted = await this.getWalletStore().booted;
        console.log('encryptedBooted====>', encryptedBooted, shaPassword);
        if (!encryptedBooted) {
            throw new Error(JSON.stringify({ code: 10001, message: 'Cannot find password set' }));
        }
        await passworder.decrypt(shaPassword, encryptedBooted);
        this.password = shaPassword;
        keysing.booted(this.password, this.HS.catcher);
    }
    async unlock(password) {
        await this.verifyPassword(password);
        await this.setUnlocked();
    }
    async setUnlocked() {
        await this.setWalletStore({ ...this.getWalletStore(), isUnlocked: true });
    }
    async setLocked() {
        this.password = '';
        keysing.lock(this.HS.catcher);
        await this.setWalletStore({ ...this.getWalletStore(), isUnlocked: false });
    }
    async hasWalletVault() {
        const hasWallet = !!(this.getWalletList() && this.getWalletList().length > 0);
        await this.setWalletStore({ ...this.getWalletStore(), hasWallet });
        return hasWallet;
    }
    async ownerKey(address) {
        const key = await this.getEncryptionWallet(this.password, 0, address);
        return key;
    }
    getMaxPathIndex(num) {
        const pathIndex = localStorage.getItem('pathIndex') || 0;
        if (num > Number(pathIndex)) {
            localStorage.setItem('pathIndex', num.toString());
            return num;
        }
        return Number(pathIndex);
    }
    getChainsPath(whoChain = '') {
        console.log('whoChain--->', whoChain);
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
    async createWallet(mnemonic, pathIndex = 0, id) {
        console.time('createWallet_time');
        const account = {};
        this.getMaxPathIndex(pathIndex);
        if (isValidSHA256(mnemonic)) {
            console.time('isValidSHA256Mnemonic_time');
            mnemonic = await this.getEncryptionWallet(this.password, 1, mnemonic);
            console.timeEnd('isValidSHA256Mnemonic_time');
        }
        console.time('FOR_ADDRESS_PATH_TYPE_time');
        const currArr = [];
        for (const index in Object.keys(this.ADDRESS_PATH_TYPE)) {
            const key = Object.keys(this.ADDRESS_PATH_TYPE)[index];
            const createFu = await this.createByMnemonic(mnemonic, key, pathIndex);
            if (key.toUpperCase() === 'SOLANA' || key.toUpperCase() === 'ETH') {
                currArr.push(this.createByMnemonicAndSave(key, createFu.mnemonic, createFu.path, createFu.pathIndex, key));
            }
        }
        console.time('createFu_time');
        const itmes = await Promise.all(currArr);
        console.timeEnd('createFu_time');
        for (const index in Object.keys(this.ADDRESS_PATH_TYPE)) {
            const key = Object.keys(this.ADDRESS_PATH_TYPE)[index];
            console.log('setEncryptionWallet', key);
            let item = {};
            if (key === 'SOLANA') {
                item = itmes.find((v) => v.chain?.toLowerCase() === 'solana');
            }
            else {
                const itemob = itmes.find((v) => v.chain?.toLowerCase() === 'eth');
                if (itemob) {
                    item = deepCopy(itemob);
                    item.chain = key;
                }
            }
            account[key] = item;
            if (key.toUpperCase() === 'SOLANA' || key.toUpperCase() === 'ETH') {
                this.atpkeys.push(this.setEncryptionWallet(this.password, 0, item.address, item.privateKey));
            }
            if (account[key] && account[key].privateKey) {
                delete account[key].privateKey;
            }
        }
        console.log('setEncryptionWallet', account);
        console.timeEnd('FOR_ADDRESS_PATH_TYPE_time');
        account.accountName = `${NAMES['accountName']}${pathIndex + 1}`;
        account.id = pathIndex;
        console.log('pathIndex', pathIndex);
        const walletList = {
            mnemonic: await sha256(mnemonic),
            usePrivateKey: false,
            accountList: [account],
            id: id || 0,
            isBackup: false,
        };
        this.setEncryptionWallet(this.password, 1, walletList.mnemonic, mnemonic);
        console.timeEnd('createWallet_time');
        return this.setWalletList(walletList);
    }
    async createPrivateWallet(privateKey, accountName) {
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
        account.accountName = accountName || undefined;
        account.key = str;
        account.whoChain = whoChain;
        const walletList = {
            mnemonic: '',
            usePrivateKey: true,
            accountList: [account],
            id: 0,
            isBackup: true,
        };
        return await this.setWalletList(walletList);
    }
    async setWalletList(walletList) {
        console.time('setWalletList_time');
        const pow = this.getWalletList() || [];
        const powList = deepCopy(pow);
        let backWallet = walletList;
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
                        const currentWallet = await this.getWalletAndAccount(walletHas.walletId, walletHas.accountId);
                        currentWallet.isRepeat = true;
                        await this.setCurrentWallet(walletHas.walletId, walletHas.accountId);
                        return currentWallet;
                    }
                    walletList.accountList[0].id = findAndIncrementMax(powItem.accountList.map((v) => v.id));
                    backWallet = walletList;
                    backWallet.id = powItem.id;
                    powItem.accountList.push(...walletList.accountList);
                }
                else {
                    const currentWallet = await this.getWalletAndAccount(powItem.id, hasAccount.id);
                    currentWallet.isRepeat = true;
                    return currentWallet;
                }
            }
            else {
                if (walletHas.has && walletHas.walletId !== undefined && walletHas.accountId !== undefined) {
                    const currentWallet = await this.getWalletAndAccount(walletHas.walletId, walletHas.accountId);
                    currentWallet.isRepeat = true;
                    return currentWallet;
                }
                walletList.walletName = NAMES['usePrividerName'];
                walletList.id = findAndIncrementMax(powList.map((v) => v.id));
                backWallet = walletList;
                powList.push(walletList);
            }
        }
        this.hasWalletVault();
        await this.setWalletStore({ ...this.getWalletStore(), walletList: powList });
        console.timeEnd('setWalletList_time');
        return backWallet;
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
        const walletStore = this.mapWalletCache.get('walletDataByMap') || {};
        return walletStore.walletList || [];
    }
    getWalletStore() {
        const walletStore = this.mapWalletCache.get('walletDataByMap') || {};
        return walletStore;
    }
    async setWalletStore(walletStore) {
        this.mapWalletCache.set('walletDataByMap', walletStore);
        this.cloudWalletStore().setWalletItem('all', walletStore);
    }
    async getCurrentWallet() {
        const { currentWalletId, currentAccountId } = this.getWalletStore();
        const walletItem = await this.getWalletById(currentWalletId);
        let accountItem = walletItem.accountList.find((v) => v.id === currentAccountId);
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
            throw new Error(JSON.stringify({ code: 10004, message: 'Wallet not found' }));
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
    async setCurrentWallet(walletId = 0, accountId = 0) {
        await this.setWalletStore({
            ...this.getWalletStore(),
            currentWallet: `${walletId}&${accountId}`,
            currentWalletId: walletId,
            currentAccountId: accountId,
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
    eventSecretCode() {
        keysing.on('EventSecretCode', (value) => {
            console.log('eventSecretCode=====>', value);
            this.password = value;
            if (!value) {
                this.setLocked();
            }
        });
        keysing.getSecretCode(this.HS.catcher);
    }
    async exportMnemonics(password, walletId) {
        await this.verifyPassword(password);
        const walletItem = await this.getWalletById(walletId);
        if (walletItem.mnemonic) {
            return await this.getEncryptionWallet(this.password, 1, walletItem.mnemonic);
        }
        throw new Error('mnemonic not found');
    }
    async exportPrivateKey(password, walletId, accountId, chain) {
        try {
            await this.verifyPassword(password);
            const walletItem = await this.getWalletById(walletId);
            const accountItem = walletItem.accountList.find((v) => v.id === accountId);
            if (accountItem) {
                const key = await this.ownerKey(accountItem[chain].address);
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
        const walletBooted = this.getWalletStore().walletBooted;
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
            const walletStore = this.getWalletStore();
            const walletBooted = walletStore.walletBooted || {};
            const name = ENCRYPTION_NAME;
            const booted = await passworder.encrypt(password, value);
            walletBooted[`${name[way]}${key.toLowerCase()}`] = booted;
            this.setWalletStore({ ...walletStore, walletBooted });
            return walletBooted;
        }
        catch (error) {
            console.error('setEncryptionWallet - error', error);
            return {};
        }
    }
    async createByMnemonic(mnemonic, chainName, pathIndex = 0) {
        let path = this.ADDRESS_PATH_TYPE[chainName];
        if (pathIndex) {
            path = path.replace(/\/0$/, `/${pathIndex}`);
        }
        return {
            path,
            pathIndex,
            mnemonic,
            ETH: async (mnemonic, path, pathIndex, chainName) => {
                return await this.createByMnemonicFun(mnemonic, path, pathIndex, chainName);
            },
            BASE: async (mnemonic, path, pathIndex, chainName) => {
                if (chainName)
                    return await this.createByMnemonicFun(mnemonic, path, pathIndex, 'BASE');
            },
            ARBITRUM: async (mnemonic, path, pathIndex, chainName) => {
                if (chainName)
                    return await this.createByMnemonicFun(mnemonic, path, pathIndex, 'ARBITRUM');
            },
            BSC: async (mnemonic, path, pathIndex, chainName) => {
                if (chainName)
                    return await this.createByMnemonicFun(mnemonic, path, pathIndex, 'BSC');
            },
            SEPOLIA: async (mnemonic, path, pathIndex, chainName) => {
                if (chainName)
                    return await this.createByMnemonicFun(mnemonic, path, pathIndex, 'SEPOLIA');
            },
            SOLANA: async (mnemonic, path, pathIndex) => {
                if (path)
                    return await this.createByMnemonicFunBySol(mnemonic, pathIndex, 'SOLANA');
            },
        };
    }
    async createByMnemonicAndSave(chain, mnemonic, path, pathIndex, chainName) {
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
        return {
            pathIndex,
            path,
            address,
            publicKey,
            privateKey,
            chain: chainName,
            block,
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
            block: 0,
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
                        block: 0,
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
                        block,
                    };
                }
            },
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
                block,
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
                block,
            };
        }
    }
    async generatePrivateKeyByChain(privateKey, chainName) {
        let account = {
            address: '',
            outPrivateKey: '',
            publicKey: '',
            block: 0,
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
                block: 0,
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
                block,
            };
        }
        return account;
    }
    getPublicKey(privateKey) {
        const walletPrivate = new ethers.Wallet(privateKey);
        return walletPrivate.publicKey;
    }
}
export default WalletService;
