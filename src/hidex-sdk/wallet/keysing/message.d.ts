import { ICatcher } from '../../catch/interfaces';
declare class KeyRuntimeController {
    dataStorage: {
        [key: string]: string;
    };
    constructor();
    initKeyRuntime(catcher: ICatcher): Promise<{
        value: string;
    }>;
    sendMessage(message: any, sendResponse: any, catcher: ICatcher, expiresInDays: number): Promise<void>;
}
declare const _default: KeyRuntimeController;
export default _default;
//# sourceMappingURL=message.d.ts.map