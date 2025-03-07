import { Codex } from "@codex-data/sdk";
import { sdkResponse } from "./config";
import { EventType, HoldersInputSort, QuoteToken, RankingDirection, TokenRankingAttribute, TokenPairStatisticsType } from "@codex-data/sdk/dist/resources/graphql";

export interface TokenEventsOptions { limit: number, eventType: string, maker: string, quoteToken: QuoteToken }

class CodexSdk {
  shortLivedSdk: Codex | null;
  private sdk: Codex;
  private apiKey: string;
  constructor(apiKey: string) {
    this.sdk = new Codex(apiKey);
    this.apiKey = apiKey;
    this.shortLivedSdk = null;
    this.sdkInit();
  }
  async sdkInit() {
    // Create an api token
    const res = await this.sdk.mutations.createApiTokens({
      input: { expiresIn: 3600 * 1000 }, // 1 hour
    });
    const token = res.createApiTokens[0].token;
    this.shortLivedSdk = new Codex(this.apiKey); // new Codex(`Bearer ${token}`);
    return this.shortLivedSdk
  }
  async tokenPrices(inputs: Array<{ address: string, networkId: number }>) {
    try {
      if (!this.shortLivedSdk) {
        await this.sdkInit();
      }

      const res = await this.shortLivedSdk?.queries.getTokenPrices({
        inputs
      })
      return sdkResponse(res)
    } catch (error) {
      return sdkResponse(error)
    }
  }

  async balances(accountAddress: string, chainId: number, cursor: any = null, includeNative: boolean = true) {
    try {
      if (!this.shortLivedSdk) {
        await this.sdkInit();
      }
      const res = await this.shortLivedSdk?.queries.balances({
        input: { walletId: `${accountAddress}:${chainId}`, cursor, includeNative }
      })
      return sdkResponse(res)
    } catch (error) {
      return sdkResponse(error)
    }
  }
  async getTokenEvents(address: string, networkId: number, options?: TokenEventsOptions) {
    try {
      const { limit = 10, eventType = EventType.Swap, maker = '', quoteToken } = options || {}
      if (!this.shortLivedSdk) {
        await this.sdkInit();
      }
      const res = await this.shortLivedSdk?.queries.getTokenEvents({
        query: { address, networkId, eventType: eventType as EventType, maker, quoteToken },
        limit
      })
      return sdkResponse(res)
    } catch (error) {
      return sdkResponse(error)
    }
  }

  async getChartData(options: { symbol: string, from: number, to: number, resolution: string, quoteToken: QuoteToken }) {
    try {
      // const { symbol, from, to, resolution, quoteToken } = options;
      if (!this.shortLivedSdk) {
        await this.sdkInit();
      }
      const res = await this.shortLivedSdk?.queries.getBars(options)
      return sdkResponse(res)
    } catch (error) {
      return sdkResponse(error)
    }
  }

  async getHolders(tokenId: string, sort?: HoldersInputSort, cursor: any = null): Promise<any> {
    try {
      if (!this.shortLivedSdk) {
        await this.sdkInit();
      }
      const res = await this.shortLivedSdk?.queries.holders({
        input: { tokenId, cursor }
      })
      return sdkResponse(res)
    } catch (error) {
      return sdkResponse(error)
    }
  }

  async getTokenInfo(address: string, tokenId: number): Promise<any> {
    try {
      if (!this.shortLivedSdk) {
        await this.sdkInit();
      }
      const res = await this.shortLivedSdk?.queries.token({
        input: { address, networkId: tokenId }
      })
      return sdkResponse(res)
    } catch (error) {
      return sdkResponse(error)
    }
  }


  async filterTokens(tokenAddress: string, networks: number[]) {
    try {
      if (!this.shortLivedSdk) {
        await this.sdkInit();
      }
      const res = await this.shortLivedSdk?.queries.filterTokens({
        filters: {
          network: networks,
        },
        limit: networks.length + 1,
        phrase: tokenAddress,
        rankings: [{
          attribute: TokenRankingAttribute.Volume24,
          direction: RankingDirection.Desc,
        }],
        statsType: TokenPairStatisticsType.Filtered
      })
      return sdkResponse(res)
    } catch (error) {
      return sdkResponse(error)
    }
  }

}



export default CodexSdk;