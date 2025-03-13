import { ICatcher } from "../interfaces";
declare class appCatcher implements ICatcher {
    private storage;
    constructor();
    setItem(key: string, value: any): Promise<boolean>;
    getItem(key: string): Promise<any>;
    removeItem(key: string): Promise<boolean>;
}
export default appCatcher;
//# sourceMappingURL=index.d.ts.map