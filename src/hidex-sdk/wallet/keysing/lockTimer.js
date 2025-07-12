import keysing from './index';
class LockTimerController {
    constructor() {
    }
    async consideration(lockTime, catcher) {
        const lockTimeHistory = localStorage.getItem('lockTimeHistory');
        if (lockTimeHistory) {
            const time = parseFloat(lockTimeHistory);
            const now = new Date().getTime();
            if (now - time > lockTime * 1000) {
                keysing.lock(catcher);
            }
        }
    }
}
export default LockTimerController;
