import { ICatcher } from '../catch/interfaces';
import { OptionsCommon } from '../main/interfaces';
export interface IWalletService {
    walletInit(): Promise<void>;
    getWalletCatch(catcher: ICatcher, key?: string): Promise<WalletStore>;
    getCloudBootedOss(HS: OptionsCommon, key?: string): Promise<BootedOssStore>;
    createPassword(password: string, oldPassword?: string): Promise<boolean>;
    resetPassword(oldPassword: string, password: string): Promise<boolean>;
    verifyPassword(password: string): Promise<void>;
    unlock(password: string): Promise<void>;
    setLocked(): Promise<void>;
    setUnLockedExpires(expires: number): Promise<boolean>;
    getUnLockedExpires(): Promise<number>;
    generateMnemonic(): string;
    createWallet(mnemonic: string, pathIndex: number, walletName?: string, id?: number): Promise<WalletList>;
    createPrivateWallet(privateKey: string): Promise<WalletList>;
    getWalletByAddress(address: string): Promise<{
        has: boolean;
        walletId?: number;
        accountId?: number;
    }>;
    getWalletList(): WalletList[];
    getCurrentWallet(): Promise<{
        walletItem: WalletList;
        accountItem: WalletAccount;
    }>;
    getWalletById(id: number): Promise<WalletList>;
    updatedWallet(wallet: WalletList): Promise<WalletList>;
    getDefaultWallet(): Promise<WalletList>;
    getWalletAndAccount(walletId: number, accountId: number): Promise<WalletList>;
    getAccountById(walletId: number, accountId: number): Promise<WalletAccount>;
    getWalletCurrentPathIndex(): Promise<number>;
    setCurrentWallet(walletId?: number, accountId?: number): Promise<{
        walletItem: WalletList;
        accountItem: WalletAccount;
    }>;
    setWalletName(walletId: number, name: string): Promise<boolean>;
    deleteWallet(password: string, walletId: number): Promise<boolean>;
    deleteWalletAccount(password: string, walletId: number, accountId: number): Promise<boolean>;
    clearWallet(): Promise<boolean>;
    clearLocalWallet(): Promise<boolean>;
    eventSecretCode(): void;
    ownerKey(accountAddress: string): Promise<string>;
    exportMnemonics(password: string, walletId: number): Promise<string>;
    exportPrivateKey(password: string, walletId: number, accountId: number, chainName: string): Promise<string>;
    isUnlocked(): Promise<boolean>;
    isSetPassword(): Promise<number | undefined>;
    hasWallet(): Promise<number | undefined>;
    getWalletStatus(): Promise<{
        isUnlocked: boolean;
        isSetPassword: number | undefined;
        hasWallet: number | undefined;
        pathIndex: number;
    }>;
    signMessage(message: string, address: string): Promise<string>;
    decryptionS3Data(text: any, password: string): Promise<any>;
}
export type WalletStore = {
    walletList: WalletList[];
    isUnlocked: boolean;
    upgrade: boolean;
    pathIndex: number;
};
export type BootedOssStore = {
    walletBooted: any;
    pathIndex: number;
    currentWalletId: string;
    booted: string;
    walletStatus: number | undefined;
    passwordStatus: number | undefined;
    error?: any;
};
export type WalletStoreKeyOf = WalletStore | WalletStore[keyof WalletStore];
export type WalletAccount = {
    ARBITRUM?: AccountItem;
    BASE: AccountItem;
    BSC: AccountItem;
    ETH: AccountItem;
    SOLANA: AccountItem;
    whoChain?: string;
    privateKey?: string;
    id?: number;
    key?: string;
    money?: number;
} & Record<string, any>;
export type WalletList = {
    mnemonic: string;
    usePrivateKey?: boolean;
    walletName?: string;
    accountList: WalletAccount[];
    id: number;
    isRepeat?: boolean;
};
export type AccountItem = {
    path: string;
    address: string;
    pathIndex: number;
    publicKey: string;
    privateKey?: string;
    chain: string;
    value?: string;
    block?: number;
};
//# sourceMappingURL=interfaces.d.ts.map