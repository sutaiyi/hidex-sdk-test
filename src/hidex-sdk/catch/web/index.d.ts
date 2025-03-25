import { ICatcherFun } from "../interfaces";
declare class webCatcher implements ICatcherFun {
    constructor();
    setItem(key: string, value: any): Promise<boolean>;
    getItem(key: string): Promise<any>;
    removeItem(key: string): Promise<boolean>;
}
export default webCatcher;
//# sourceMappingURL=index.d.ts.map