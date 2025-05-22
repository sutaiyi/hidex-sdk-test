import axios from 'axios';
export async function getWithdrawSign(params) {
    try {
        const url = `/api/frontend/app/withdraw/sign`;
        const response = await axios.post(url, params, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('access_token')}`
            }
        });
        return response?.data;
    }
    catch (error) {
        return { code: -1, message: 'Network error', data: null };
    }
}
