export interface ICatcher extends ICatcherFun, ICatcherIndexDBFun {
    getCookie(key: string): Promise<any>;
    setCookie(key: string, value: any, options: {
        expires: number;
        path?: string;
        secure?: boolean;
    }): Promise<boolean>;
    removeCookie(key: string, options: {
        path?: string;
        secure?: boolean;
    }): Promise<any>;
}
export interface ICatcherFun {
    getItem(key: string): Promise<any>;
    setItem(key: string, value: any): Promise<boolean>;
    removeItem(key: string): Promise<boolean>;
}
export interface ICatcherIndexDBFun {
    getIdbItem(key: string): Promise<any>;
    setIdbItem(key: string, value: any, expiresInDays?: number): Promise<boolean>;
    removeIdbItem(key: string): Promise<boolean>;
}
export interface StoredValue<T = any> {
    data: T;
    expiresAt?: number;
}
//# sourceMappingURL=interfaces.d.ts.map