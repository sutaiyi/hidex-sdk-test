export default (error) => {
    let strMessage = error.toString();
    if (error instanceof AggregateError) {
        strMessage = (error.errors).toString();
    }
    if (strMessage.includes('Incorrect password')) {
        return {
            code: 13001,
            message: '密码错误/丢失'
        };
    }
    if (strMessage.includes('transfer amount exceeds balance')) {
        return {
            code: 14001,
            message: '转账金额超过余额'
        };
    }
    if (strMessage.includes('transaction may fail or may require manual gas limit')) {
        return {
            code: 14002,
            message: '交易可能失败或可能需要手动限制 gas'
        };
    }
    return {
        code: 14000,
        message: 'Unknown error' + strMessage
    };
};
