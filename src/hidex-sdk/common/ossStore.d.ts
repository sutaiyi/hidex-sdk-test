import { Apparatus } from '..';
import { BootedOssStore, WalletStore, WalletStoreKeyOf } from '../wallet/interfaces';
import { ICatcher } from '../catch/interfaces';
export declare const ossStore: {
    getWalletStoreItem: (catcher: ICatcher, key?: string) => Promise<WalletStore>;
    setWalletStoreItem: (catcher: ICatcher, key: string, value: WalletStoreKeyOf) => Promise<boolean>;
    getBootedOssItem: (token: string, apparatus: Apparatus) => Promise<BootedOssStore>;
    setBootedOssItem: (token: string, apparatus: Apparatus, key: string, value: BootedOssStore, isClear?: boolean) => Promise<BootedOssStore>;
    clearWalletMap: () => void;
    getWalletMap: () => Map<any, any>;
};
//# sourceMappingURL=ossStore.d.ts.map