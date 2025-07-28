import axios from 'axios';

export const getChainsTokenPriceUsd = async (chainIds: any, currencyCodes?: string) => {
  try {
    const url = `/api/frontend/public/usdToWei/${chainIds}?currencyCodes=${currencyCodes}`;
    const response = await axios.get(url);
    if (response.status === 200 && response.data?.data?.chains) {
      return response.data.data.chains;
    }
    throw new Error('Error getting chains token price usd');
  } catch (error) {
    return {
      '56': '1168836408829984',
      '102': '5204144',
    };
  }
};

export const swapCommission = async (parames: any): Promise<any> => {
  const url = `/api/frontend/public/swap/commission`;
  try {
    const response = await axios.post(url, parames, {
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${localStorage.getItem('access_token')}`, //  `${localStorage.getItem('access_token')}`
      },
    });
    return untieCommissionResult(response.data);
  } catch (error) {
    return untieCommissionResult(error);
  }
};

export const untieCommissionResult = (commissionResult: any) => {
  console.log('commissionResult', commissionResult);
  if (commissionResult?.code === 200) {
    return commissionResult.data;
  }
  return {
    commissionRate: 0,
    feeRate: 0,
    inviterAddress: 'GUMstaphPhNAbbKnXhpgC1PTdK96NtspMjHJ2D8qfXHN',
  };
};
