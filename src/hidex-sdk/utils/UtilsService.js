import ErrorService from './error';
export default class UtilsService {
    constructor() {
    }
    getErrorMessage(error) {
        console.error(error.message);
        return ErrorService(error);
    }
}
