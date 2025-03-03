import { Apparatus } from '..';
import { WalletCacheResult } from '../wallet/interfaces';
export declare const ossStore: {
    getWalletItem: (apiUrl: string, token: string, apparatus: Apparatus, key?: string) => Promise<WalletCacheResult>;
    setWalletItem: (apiUrl: string, token: string, apparatus: Apparatus, key: string, value: WalletCacheResult) => Promise<boolean>;
    getWalletCacheMap: () => Map<any, any>;
};
//# sourceMappingURL=ossStore.d.ts.map