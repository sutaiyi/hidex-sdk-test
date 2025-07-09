import axios from 'axios';
import { environmental } from '../../common/utils';
export async function getWithdrawSign(params) {
    try {
        const url = `/api/frontend/app/withdraw/sign`;
        const response = await axios.post(url, params, {
            headers: {
                'Content-Type': 'application/json',
                dev: environmental('', true, true)
            }
        });
        return response?.data;
    }
    catch (error) {
        return { code: -1, message: 'Network error', data: null };
    }
}
