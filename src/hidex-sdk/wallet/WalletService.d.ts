import { WalletAccount, WalletList, IWalletService, WalletCacheResult, BootedOssStore } from './interfaces';
import { OptionsCommon } from '..';
import { ICatcher } from '../catch/interfaces';
declare class WalletService implements IWalletService {
    private password;
    private atpkeys;
    private ADDRESS_PATH_TYPE;
    private HS;
    private setWalletTimer;
    private setBootdOsssTimer;
    private mapBootedOss;
    constructor(options: OptionsCommon);
    cloudBootedOss(): {
        getBootedOssItem: (HS: OptionsCommon, key?: string) => Promise<BootedOssStore>;
        setBootedOssItem: (HS: OptionsCommon, key: string, value: BootedOssStore) => Promise<boolean>;
    };
    getWalletCatch(catcher: ICatcher, key?: string): Promise<WalletCacheResult>;
    private setWalletCatch;
    walletInit(): Promise<void>;
    createPassword(password: string, oldPassword?: string): Promise<boolean>;
    resetPassword(oldPassword: string, password: string): Promise<boolean>;
    private updateWalletBooted;
    verifyPassword(password: string): Promise<void>;
    unlock(password: string): Promise<void>;
    private setUnlocked;
    setLocked(): Promise<void>;
    ownerKey(address: string): Promise<string>;
    generateMnemonic(): string;
    private getChainsPath;
    createWallet(mnemonic: string, pathIndex?: number, walletName?: string, id?: number): Promise<WalletList>;
    createPrivateWallet(privateKey: string): Promise<WalletList>;
    private setWalletList;
    setWalletName(walletId: number, name: string): Promise<boolean>;
    updatedWallet(wallet: WalletList): Promise<WalletList>;
    getWalletByAddress(address: string): Promise<{
        has: boolean;
        walletId?: number;
        accountId?: number;
    }>;
    getWalletList(): WalletList[];
    private getWalletStore;
    private setWalletStore;
    private getBootedOss;
    private setBootedOss;
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
    deleteWalletAccount(password: string, walletId: number, accountId: number): Promise<boolean>;
    clearWallet(password: string): Promise<boolean>;
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
    signMessage(message: string, address: string): Promise<string>;
}
export default WalletService;
//# sourceMappingURL=WalletService.d.ts.map