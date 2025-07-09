import { ICatcherFun } from '../interfaces';
declare class IdbService implements ICatcherFun {
    private store;
    constructor();
    setItem(key: string, value: any, expiresInDays?: number): Promise<boolean>;
    getItem<T = any>(key: string): Promise<T | null>;
    removeItem(key: string): Promise<boolean>;
    clear(): Promise<boolean>;
}
declare const _default: IdbService;
export default _default;
//# sourceMappingURL=index.d.ts.map