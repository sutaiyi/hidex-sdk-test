import { Apparatus } from '../main/interfaces';
import { ICatcher } from './interfaces';
declare class CatcherService implements ICatcher {
    private catch;
    constructor(apparatus: Apparatus);
    setItem(key: string, value: any): Promise<boolean>;
    getItem(key: string): Promise<any>;
}
export default CatcherService;
//# sourceMappingURL=index.d.ts.map