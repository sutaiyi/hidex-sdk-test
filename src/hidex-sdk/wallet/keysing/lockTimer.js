import keysing from './index';
class LockTimerController {
    defaultLockTime;
    constructor() {
        this.defaultLockTime = 60000;
    }
    async consideration(lockTime, catcher) {
        const lockTimeHistory = localStorage.getItem('lockTimeHistory');
        if (lockTimeHistory) {
            const time = parseFloat(lockTimeHistory);
            const now = new Date().getTime();
            console.log(now, time, now - time, now - time > this.defaultLockTime);
            if (now - time > lockTime * 1000) {
                keysing.lock(catcher);
            }
        }
    }
}
export const lockController = new LockTimerController();
