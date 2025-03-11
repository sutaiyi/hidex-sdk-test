import { IUtilsService } from "./interfaces";
export default class UtilsService implements IUtilsService {
    constructor();
    getErrorMessage(error: any): {
        code: number;
        message: string;
    };
}
//# sourceMappingURL=UtilsService.d.ts.map