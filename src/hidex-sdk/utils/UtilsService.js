export default class UtilsService {
    constructor() {
    }
    getErrorMessage(error) {
        let strMessage = error.toString();
        if (error instanceof AggregateError) {
            strMessage = (error.errors).toString();
        }
        if (strMessage.includes('transfer amount exceeds balance')) {
            return {
                code: 14001,
                message: '转账金额超过余额'
            };
        }
        return {
            code: 14000,
            message: 'Unknown error' + strMessage
        };
    }
}
