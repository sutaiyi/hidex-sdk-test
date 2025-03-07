import { codexChainId } from './config';
import CodexSDK from './subscriptions'
import { APIKEY } from "./config";
import { Codex } from '@codex-data/sdk';
import { TokenEventsOptions } from './sdk';

const codexSDK = new CodexSDK(APIKEY)

class CodexDataService {
  constructor() {
  }

  async getTokenEvents(tokenAddress: string, chainId: number, options?: TokenEventsOptions): Promise<any> {
    const networkId = codexChainId(chainId)
    const result = await codexSDK.getTokenEvents(tokenAddress, networkId, options)
    return result
  }
  async subscribeSDK(): Promise<Codex> {
    return await codexSDK.subscribeSDK();
  }
  async getChartData(options: any): Promise<any> {
    const data = await codexSDK.getChartData(options)
    const barsResult: any = []
    if (data?.data?.getBars?.c) {
      const bars = data.data.getBars;
      for (let i = 0; i < bars.c.length; i++) {
        if (bars.c[i]) {
          barsResult.push({
            open: bars.o[i],
            high: bars.h[i],
            low: bars.l[i],
            close: bars.c[i],
            time: bars.t[i],
            volume: Number(bars.volume[i])
          })
        }
      }
    }
    return barsResult
  }

  async getHolders(tokenAddress: string, networkId: number, sort: any, cursor: any = null): Promise<any> {
    return await codexSDK.getHolders(`${tokenAddress}:${codexChainId(networkId)}`, sort, cursor)
  }
  async getTokenInfo(address: string, networkId: number): Promise<any> {
    return await codexSDK.getTokenInfo(address, codexChainId(networkId))
  }

  async filterTokens(tokenAddress: string, networks: number[] = []) {
    try {
      const result = await codexSDK.filterTokens(tokenAddress, networks)
      if (result.data && result.data?.filterTokens?.results?.length > 0) {
        return result.data.filterTokens.results
      }
      throw new Error('No Datas')
    } catch (error) {
      console.log('ERROR filterTokens: ' + error)
      return null;
    }
  }
}

export default new CodexDataService()