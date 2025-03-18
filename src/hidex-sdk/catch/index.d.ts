import { Apparatus } from '../main/interfaces';
import { ICatcher } from './interfaces';
declare class CatcherService implements ICatcher {
    private catch;
    private keyDefault;
    constructor(apparatus: Apparatus);
    setItem(key: string, value: any): Promise<boolean>;
    removeItem(key: string): Promise<boolean>;
    getItem(key: string): Promise<any>;
}
export default CatcherService;
//# sourceMappingURL=index.d.ts.map