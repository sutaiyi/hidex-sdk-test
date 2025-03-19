import HidexSDK from "@/hidexService"
import { ChainItem, CurrentSymbol } from "hidex-sdk";

const beforeTradeDataMap = new Map<string, any>();
const { trade, network, wallet, dexFee, utils } = HidexSDK;
const getCurrentSymbolTest = async (info: any, { isBuy, isPump, currentChain }: { isBuy: boolean, isPump: boolean, currentChain: ChainItem }): Promise<{
  currentSymbol: CurrentSymbol,
  currentChain: ChainItem,
  address: string
}> => {
  const { token, account, tokenBalanceStr, inviter } = info;
  const { address } = account;
  const tokenAddress = token.address;
  const decimals = token.decimals;
  const inToken = currentChain?.tokens[1]; // Wrapped 代币
  const outToken = {
    address: tokenAddress,
    decimals,
    name: '',
    symbol: '',
  }
  const testNumber = isPump ? 0.5 : 5;
  const buyTestAmount = (testNumber * Math.pow(10, inToken.decimals)).toString();
  const amountIn = isBuy ? buyTestAmount : tokenBalanceStr;
  const currentSymbol = {
    in: isBuy ? inToken : outToken,
    out: isBuy ? outToken : inToken,
    amountIn, // 兑换数量
    slipPersent: 0.05, // 滑点5%
    amountOutMin: '0', // 最少得到数量
    dexFeeAmount: '0', // 交易手续费
    priorityFee: (0.0001 * Math.pow(10, 9)).toString(), // 优先费
    inviter, // 邀请地址
    isBuy,
    networkFee: {
      value: 0, unit: '', gasPrice: '', gasLimit: 0
    },
    poolAddress: '',  // 池子地址
    bribeFee: '',  // 贿赂费给平台比如（jito...）
    tradeType: 1,
    isPump,
    TOKEN_2022: false,
  };
  return {
    currentSymbol,
    currentChain,
    address
  }
}
const setBeforeTradeData = async (info: any, { isBuy, isPump, currentChain }: { isBuy: boolean, isPump: boolean, currentChain: ChainItem }) => {
  const { token, tokenBalanceStr } = info;
  const { currentSymbol, address } = await getCurrentSymbolTest(info, { isBuy, isPump, currentChain });
  if (isBuy || (!isBuy && Number(tokenBalanceStr))) {
    const { success, swapTransaction } = await trade.defiApi.swapRoute(currentSymbol, address)
    if (!success) {
      return;
    }
    const compile = await trade.compileTransaction(swapTransaction)
    const mapItems = beforeTradeDataMap.get('compiles') || {};
    mapItems[`${isBuy ? 'buy' : 'sell'}_${currentChain.chain}_${token.address}`] = compile
    beforeTradeDataMap.set('compiles', mapItems);
  }
}


const getBeforeTradeData = (isBuy: boolean, chainName: string, tokenAddress: string) => {
  const mapItems = beforeTradeDataMap.get('compiles')
  return mapItems[`${isBuy ? 'buy' : 'sell'}_${chainName}_${tokenAddress}`];
}




export {
  getCurrentSymbolTest,
  setBeforeTradeData,
  getBeforeTradeData
}
