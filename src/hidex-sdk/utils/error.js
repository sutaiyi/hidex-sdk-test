import errorInfo from './errorInfo';
export default (error) => {
    let strMessage = error.toString();
    if (error instanceof AggregateError) {
        console.info('AggregateError', error, error.errors.toString());
        strMessage = error.errors.toString();
    }
    if (strMessage?.toLowerCase()?.includes('incorrect password') || strMessage?.toLowerCase()?.includes('decryption password')) {
        return { code: 13001, message: errorInfo['13001'] };
    }
    if (strMessage?.toLowerCase()?.includes('failed get s3 store') || strMessage?.toLowerCase()?.includes('failed get s3 code 401')) {
        return { code: 13002, message: errorInfo['13002'] };
    }
    if (strMessage?.toLowerCase()?.includes('bad secret key')) {
        const code = 13003;
        return { code, message: errorInfo[code] };
    }
    if (strMessage?.toLowerCase()?.includes('transfer amount exceeds balance')) {
        return { code: 14000, message: errorInfo['14000'] };
    }
    if (strMessage?.toLowerCase()?.includes('insufficient allowance')) {
        const code = 14008;
        return { code, message: errorInfo[code] };
    }
    if (strMessage?.toLowerCase()?.includes('pump-amm insufficient account balance')) {
        const code = 14009;
        return { code, message: errorInfo[code] };
    }
    if (strMessage?.toLowerCase()?.includes('insufficient') || strMessage?.toLowerCase()?.includes('insufficientfundsforfee')) {
        return { code: 14001, message: errorInfo['14001'] };
    }
    if (strMessage?.toLowerCase()?.includes('transaction may fail or may require manual gas limit')) {
        return { code: 14002, message: errorInfo['14002'] };
    }
    if (strMessage?.toLowerCase()?.includes('min tip:')) {
        return { code: 140061, message: errorInfo['140061'] };
    }
    if (strMessage?.toLowerCase()?.includes('slippage') ||
        strMessage?.toLowerCase()?.includes('minamountoutnotreached') ||
        strMessage?.toLowerCase()?.includes('program error: 0x1771') ||
        strMessage?.toLowerCase()?.includes('program error: 0x1772')) {
        return { code: 14003, message: errorInfo['14003'] };
    }
    if (strMessage?.toLowerCase()?.includes('swap txarray is empty')) {
        return { code: 14004, message: errorInfo['14004'] };
    }
    if (strMessage?.toLowerCase()?.includes('toosmallinputoroutputamount')) {
        return { code: 14005, message: errorInfo['14005'] };
    }
    if (strMessage?.toLowerCase()?.includes('aggregateerror') || strMessage?.toLowerCase()?.includes('e.getmultipleaccountsinfo is not a function')) {
        const code = 14007;
        return { code, message: errorInfo[code] };
    }
    if (strMessage?.toLowerCase()?.includes('sol estimate error')) {
        const code = 14010;
        return { code, message: errorInfo[code] };
    }
    if (strMessage?.toLowerCase()?.includes('not support transaction')) {
        const code = 14011;
        return { code, message: errorInfo[code] };
    }
    if (strMessage?.toLowerCase()?.includes('signaturehasexpired')) {
        const code = 14012;
        return { code, message: errorInfo[code] };
    }
    if (strMessage?.toLowerCase()?.includes('repeatedrequests')) {
        const code = 14013;
        return { code, message: errorInfo[code] };
    }
    if (strMessage?.toLowerCase()?.includes('invalidsignature')) {
        const code = 14014;
        return { code, message: errorInfo[code] };
    }
    if (strMessage?.toLowerCase()?.includes('jupiter has no route')) {
        const code = 14015;
        return { code, message: errorInfo[code] };
    }
    if (strMessage?.toLowerCase()?.includes('network error') || strMessage?.toLowerCase()?.includes('timeout')) {
        const code = 14016;
        return { code, message: errorInfo[code] };
    }
    if (strMessage?.toLowerCase()?.includes('little pool')) {
        const code = 14017;
        return { code, message: errorInfo[code] };
    }
    if (strMessage?.toLowerCase()?.includes('300001:sign expired')) {
        const code = 14018;
        return { code, message: errorInfo[code] };
    }
    if (strMessage?.toLowerCase()?.includes('program error: 0x1775')) {
        const code = 14019;
        return { code, message: errorInfo[code] };
    }
    if (strMessage?.toLowerCase()?.includes('axioserror: request failed')) {
        const code = 14006;
        return { code, message: errorInfo[code] };
    }
    return { code: 13000, message: errorInfo['13000'] + strMessage };
};
