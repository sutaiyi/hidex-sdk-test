import axios from "axios";
import { codexUrl, axiosConfig, axiosResponse } from './config'

export const tokenPrices = async (inputs: string) => {
  const res = await axios.post(codexUrl, {
    query: `{
      getTokenPrices(
        inputs: ${inputs}
      ) {
        address
        networkId
        priceUsd
      }
    }`
  }, axiosConfig)
  return axiosResponse(res)
}
export const balances = async (accountAddress: string, chainId: number, cursor: any = null) => {
  const res = await axios.post(codexUrl, {
    query: `{
      balances(input: { walletId: "${accountAddress}:${chainId}", cursor: ${cursor}, includeNative: true}) {
        cursor
        items {
          walletId
          tokenId
          balance
          shiftedBalance
        }
      }
    }`
  }, axiosConfig)
  return axiosResponse(res)
}

