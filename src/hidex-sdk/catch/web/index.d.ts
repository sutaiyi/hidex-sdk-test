import { ICatcher } from "../interfaces";
declare class webCatcher implements ICatcher {
    constructor();
    setItem(key: string, value: any): Promise<boolean>;
    getItem(key: string): Promise<any>;
}
declare const _default: webCatcher;
export default _default;
//# sourceMappingURL=index.d.ts.map