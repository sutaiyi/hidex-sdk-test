export interface ICatcher {
    getItem(key: string): Promise<any>;
    setItem(key: string, value: any): Promise<boolean>;
    removeItem(key: string): Promise<boolean>;
}
//# sourceMappingURL=interfaces.d.ts.map