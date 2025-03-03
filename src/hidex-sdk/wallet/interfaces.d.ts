export interface IWalletService {
    cloudWalletStore(): {
        getWalletItem: (key?: string) => Promise<WalletCacheResult>;
        setWalletItem: (key: string, value: WalletCacheResult) => Promise<boolean>;
    };
    createPassword(password: string, oldPassword?: string): Promise<boolean>;
    resetPassword(oldPassword: string, password: string): Promise<boolean>;
    verifyPassword(password: string): Promise<void>;
    unlock(password: string): Promise<void>;
    setLocked(): Promise<void>;
    hasWalletVault(): Promise<boolean>;
    createWallet(mnemonic: string, pathIndex?: number): Promise<WalletList>;
    createPrivateWallet(privateKey: string, accountName?: string): Promise<WalletList>;
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
    getDefaultWallet(): Promise<WalletList>;
    getWalletAndAccount(walletId: number, accountId: number): Promise<WalletList>;
    getAccountById(walletId: number, accountId: number): Promise<WalletAccount>;
    setCurrentWallet(walletId?: number, accountId?: number): Promise<{
        walletItem: WalletList;
        accountItem: WalletAccount;
    }>;
    deleteWallet(password: string, walletId: number): Promise<boolean>;
    eventSecretCode(): void;
    exportMnemonics(password: string, walletId: number): Promise<string>;
    exportPrivateKey(password: string, walletId: number, accountId: number, chain: string): Promise<string>;
}
export type WalletCache = {
    createTime: number;
    walletList: WalletList[];
    currentWalletId: number;
    currentAccountId: number;
    pathIndex: number;
    currentWallet: string;
    booted: string;
    walletBooted: {
        [key: string]: string;
    };
    isBooted: boolean;
    isUnlocked: boolean;
    hasWallet: boolean;
    upgrade: boolean;
};
export type WalletCacheResult = WalletCache | WalletCache[keyof WalletCache];
export type WalletAccount = {
    ARBITRUM?: AccountItem;
    BASE?: AccountItem;
    BSC?: AccountItem;
    ETH?: AccountItem;
    SOLANA?: AccountItem;
    accountName?: string;
    whoChain?: string;
    privateKey?: string;
    id?: number;
    key?: string;
    money?: number;
};
export type WalletList = {
    mnemonic?: string;
    usePrivateKey?: boolean;
    walletName?: string;
    accountList: WalletAccount[];
    id: number;
    isRepeat?: boolean;
};
export type AccountItem = {
    path?: string;
    address?: string;
    pathIndex?: number;
    publicKey?: string;
    chain?: string;
    value?: string;
    block?: number;
};
//# sourceMappingURL=interfaces.d.ts.map