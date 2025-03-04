import { WalletAccount, WalletList, IWalletService, WalletCacheResult } from './interfaces';
import { OptionsCommon } from '..';
declare class WalletService implements IWalletService {
    private password;
    private atpkeys;
    private ADDRESS_PATH_TYPE;
    private HS;
    private setWalletTimer;
    private mapWalletCache;
    constructor(options: OptionsCommon);
    cloudWalletStore(): {
        getWalletItem: (HS: OptionsCommon, key?: string) => Promise<WalletCacheResult>;
        setWalletItem: (HS: OptionsCommon, key: string, value: WalletCacheResult) => Promise<boolean>;
    };
    createPassword(password: string, oldPassword?: string): Promise<boolean>;
    resetPassword(oldPassword: string, password: string): Promise<boolean>;
    private updateWalletBooted;
    verifyPassword(password: string): Promise<void>;
    unlock(password: string): Promise<void>;
    private setUnlocked;
    setLocked(): Promise<void>;
    hasWalletVault(): Promise<boolean>;
    private ownerKey;
    generateMnemonic(): string;
    private getChainsPath;
    createWallet(mnemonic: string, pathIndex?: number): Promise<WalletList>;
    createPrivateWallet(privateKey: string): Promise<WalletList>;
    private setWalletList;
    getWalletByAddress(address: string): Promise<{
        has: boolean;
        walletId?: number;
        accountId?: number;
    }>;
    getWalletList(): WalletList[];
    private getWalletStore;
    private setWalletStore;
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
    clearWallet(password: string): Promise<boolean>;
    clearWalletAccount(): Promise<boolean>;
    deleteWalletAccount(password: string, walletId: number, accountId: number): Promise<boolean>;
    eventSecretCode(): void;
    exportMnemonics(password: string, walletId: number): Promise<string>;
    exportPrivateKey(password: string, walletId: number, accountId: number, chainName: string): Promise<string>;
    private getEncryptionWallet;
    private setEncryptionWallet;
    private getPathByChain;
    private createByMnemonicAndSave;
    private createByMnemonicFun;
    private createByMnemonicFunBySol;
    private createByPrivate;
    private createEthSeriesPrivateKey;
    private generatePrivateKeyByChain;
    private getPublicKey;
    isUnlocked(): boolean;
    isSetPassword(): boolean;
    hasWallet(): boolean;
}
export default WalletService;
//# sourceMappingURL=WalletService.d.ts.map