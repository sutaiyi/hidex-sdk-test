import axios from "axios";

export const getChainsTokenPriceUsd = async (chainIds: any, currencyCodes?: string) => {
  try {
    const url = `/api/frontend/public/usdToWei/${chainIds}?currencyCodes=${currencyCodes}`;
    const response = await axios.get(url)
    if (response.status === 200 && response.data?.data?.chains) {
      return response.data.data.chains;
    }
    throw new Error('Error getting chains token price usd');
  } catch (error) {
    console.error(error);
    return '0'
  }

}