import EventEmitter from '../../common/eventEmitter';
import { ICatcher } from '../../catch/interfaces';
declare class KeysingController extends EventEmitter {
    secretCode: string | null;
    constructor();
    keysingInitialized(catcher: ICatcher): Promise<void>;
    messageConfirm(message: string): boolean;
    messageProcess(message: {
        type: string;
        value: any;
    }, callback: (arg0: string, arg1: {}) => void): void;
    lock(catcher: ICatcher): void;
    booted(password: string, catcher: ICatcher): void;
    getSecretCode(catcher: ICatcher): string | undefined;
}
declare const _default: KeysingController;
export default _default;
//# sourceMappingURL=index.d.ts.map