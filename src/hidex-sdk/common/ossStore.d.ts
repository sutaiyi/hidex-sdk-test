import { Apparatus } from '..';
import { BootedOssStore, WalletCacheResult } from '../wallet/interfaces';
import { ICatcher } from '../catch/interfaces';
export declare const ossStore: {
    getWalletItem: (catcher: ICatcher, key?: string) => Promise<WalletCacheResult>;
    setWalletItem: (catcher: ICatcher, key: string, value: WalletCacheResult) => Promise<boolean>;
    getBootedOssItem: (token: string, apparatus: Apparatus, key?: string) => Promise<BootedOssStore>;
    setBootedOssItem: (token: string, apparatus: Apparatus, key: string, value: BootedOssStore) => Promise<boolean>;
    getWalletCacheMap: () => Map<any, any>;
    getBootedOssCacheMap: () => Map<any, any>;
};
//# sourceMappingURL=ossStore.d.ts.map