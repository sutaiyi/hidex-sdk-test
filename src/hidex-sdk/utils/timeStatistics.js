const TIME_STATISTICS = new Map();
export const getStatistics = (timerKey) => {
    const beginKey = `begin${timerKey}`;
    const endKey = `end${timerKey}`;
    if (TIME_STATISTICS.has(beginKey) && TIME_STATISTICS.has(endKey)) {
        const beginTime = TIME_STATISTICS.get(beginKey) || 0;
        const endTime = TIME_STATISTICS.get(endKey) || 0;
        const duration = endTime - beginTime;
        TIME_STATISTICS.delete(beginKey);
        TIME_STATISTICS.delete(endKey);
        return duration;
    }
    return 0;
};
export const setStatistics = ({ timerKey, isBegin }) => {
    const beginKey = `begin${timerKey}`;
    const endTime = Math.floor(Date.now());
    const key = isBegin ? beginKey : `end${timerKey}`;
    TIME_STATISTICS.set(key, endTime);
    if (!isBegin && TIME_STATISTICS.has(beginKey)) {
        const beginTime = TIME_STATISTICS.get(beginKey) || 0;
        const endTime = Math.floor(Date.now());
        const duration = endTime - beginTime;
        return duration;
    }
    return -1;
};
export const clearStatistics = (timerKey = 'all') => {
    if (timerKey === 'all') {
        TIME_STATISTICS.clear();
    }
    else {
        const beginKey = `begin${timerKey}`;
        const endKey = `end${timerKey}`;
        TIME_STATISTICS.delete(beginKey);
        TIME_STATISTICS.delete(endKey);
    }
};
