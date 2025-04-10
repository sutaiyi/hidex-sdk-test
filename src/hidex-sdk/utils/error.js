import errorInfo from './errorInfo';
export default (error) => {
    let strMessage = error.toString();
    if (error instanceof AggregateError) {
        console.info('AggregateError', error, (error.errors).toString());
        strMessage = (error.errors).toString();
    }
    if (strMessage?.toLowerCase()?.includes('incorrect password')) {
        return { code: 13001, message: errorInfo['13001'] };
    }
    if (strMessage?.toLowerCase()?.includes('failed get s3 store')) {
        return { code: 13002, message: errorInfo['13002'] };
    }
    if (strMessage?.toLowerCase()?.includes('transfer amount exceeds balance')) {
        return { code: 14000, message: errorInfo['14000'] };
    }
    if (strMessage?.toLowerCase()?.includes('insufficient') || strMessage?.toLowerCase()?.includes('insufficientfundsforfee')) {
        return { code: 14001, message: errorInfo['14001'] };
    }
    if (strMessage?.toLowerCase()?.includes('transaction may fail or may require manual gas limit')) {
        return { code: 14002, message: errorInfo['14002'] };
    }
    if (strMessage?.toLowerCase()?.includes('slippage')) {
        return { code: 14003, message: errorInfo['14003'] };
    }
    if (strMessage?.toLowerCase()?.includes('swap txarray is empty')) {
        return { code: 14004, message: errorInfo['14004'] };
    }
    if (strMessage?.toLowerCase()?.includes('toosmallinputoroutputamount')) {
        return { code: 14005, message: errorInfo['14005'] };
    }
    if (strMessage?.toLowerCase()?.includes('axioserror: request failed')) {
        const code = 14006;
        return { code, message: errorInfo[code] };
    }
    if (strMessage?.toLowerCase()?.includes('aggregateerror')
        || strMessage?.toLowerCase()?.includes('e.getmultipleaccountsinfo is not a function')) {
        const code = 14007;
        return { code, message: errorInfo[code] };
    }
    if (strMessage?.toLowerCase()?.includes('insufficient allowance')) {
        const code = 14008;
        return { code, message: errorInfo[code] };
    }
    return { code: 13000, message: errorInfo['13000'] + strMessage };
};
