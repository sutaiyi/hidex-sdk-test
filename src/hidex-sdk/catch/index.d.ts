import { Apparatus } from '../main/interfaces';
import { ICatcher } from './interfaces';
declare class CatcherService implements ICatcher {
    private catch;
    private keyDefault;
    constructor(apparatus: Apparatus);
    getItem(key: string): Promise<any>;
    setItem(key: string, value: any): Promise<boolean>;
    removeItem(key: string): Promise<boolean>;
    getCookie(key: string): Promise<any>;
    setCookie(key: string, value: any, options: {
        expires: number;
        path?: string;
        secure?: boolean;
    }): Promise<boolean>;
    removeCookie(key: string): Promise<boolean>;
}
export default CatcherService;
//# sourceMappingURL=index.d.ts.map