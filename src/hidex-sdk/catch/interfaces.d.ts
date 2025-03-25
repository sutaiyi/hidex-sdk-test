export interface ICatcher extends ICatcherFun {
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
//# sourceMappingURL=interfaces.d.ts.map