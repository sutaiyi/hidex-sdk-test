declare const CookieStorage: {
    set: (key: string, value: string, expiresInDays?: number, path?: string, secure?: boolean) => Promise<boolean>;
    get: (key: string) => Promise<any>;
    remove: (key: string, options: {
        expires: number;
        path?: string;
        secure?: boolean;
    }) => Promise<boolean>;
};
export default CookieStorage;
//# sourceMappingURL=index.d.ts.map