import { ICatcher } from '../../catch/interfaces';
declare class LockTimerController {
    private defaultLockTime;
    constructor();
    consideration(lockTime: number, catcher: ICatcher): Promise<void>;
}
export declare const lockController: LockTimerController;
export {};
//# sourceMappingURL=lockTimer.d.ts.map