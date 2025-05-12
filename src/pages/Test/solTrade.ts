import { HidexSDK } from '@/hidexService';
import { utils } from 'ethers';
import { ChainItem, CurrentSymbol } from 'hidex-sdk';

const beforeTradeDataMap = new Map<string, any>();

const getCurrentSymbolTest = async (
  info: any,
  { isBuy, isPump, currentNetwork }: { isBuy: boolean; isPump: boolean; currentNetwork: ChainItem }
): Promise<{
  currentSymbol: CurrentSymbol;
  currentNetwork: ChainItem;
  address: string;
}> => {
  const { utils, network } = HidexSDK;
  const { token, account, tokenBalanceStr, balanceStr, balance, inviter, cryptoPriceUSD, wbalanceStr, userWsolAtaLamportsStr, tokenAtaLamportsStr, IS_TOKEN_2022 } = info;
  const { address } = account;
  const tokenAddress = token.address;
  const decimals = token.decimals;
  const inToken = utils.trade.isSol(currentNetwork.chain) ? currentNetwork?.tokens[1] : currentNetwork?.tokens[0];
  const outToken = {
    address: tokenAddress,
    decimals,
    name: '',
    symbol: '',
  };
  // const testNumber = isPump ? 0.5 : 5;
  const feeAccountStr = Math.floor(0.0055 * Math.pow(10, 9)).toString();
  const buyTestAmount = Math.floor((Number(balanceStr) - Number(feeAccountStr)) * 0.1).toString();
  const amountIn = isBuy ? buyTestAmount : tokenBalanceStr;

  const currentSymbol = {
    in: isBuy ? inToken : outToken,
    out: isBuy ? outToken : inToken,
    amountIn, // 兑换数量
    slipPersent: 0, // 兑换滑点
    amountOutMin: '0', // 最少得到数量
    dexFeeAmount: '0', // 交易手续费
    priorityFee: (0.0001 * Math.pow(10, 9)).toString(), // 优先费
    inviter, // 邀请地址
    isBuy,
    networkFee: {
      value: 0,
      unit: '',
      gasPrice: '',
      gasLimit: 0,
    },
    poolAddress: '', // 池子地址
    bribeFee: '', // 贿赂费给平台比如（jito...）
    tradeType: 0, // 0 防夹，3极速
    isPump,
    chain: currentNetwork.chain,
    cryptoPriceUSD,
    TOKEN_2022: IS_TOKEN_2022,
    preAmountIn: '0',
    preAmountOut: '0',
    tokenBalance: tokenBalanceStr,
    solLamports: balanceStr,
    currentPrice: info.priceUSD,
    userwsolAtaAmount: wbalanceStr,
    userWsolAtaLamports: userWsolAtaLamportsStr,
    tokenAtaLamports: tokenAtaLamportsStr,
  };
  return {
    currentSymbol,
    currentNetwork,
    address,
  };
};
const setBeforeTradeData = async (info: any, { isBuy, isPump, currentNetwork }: { isBuy: boolean; isPump: boolean; currentNetwork: ChainItem }) => {
  const { utils } = HidexSDK;
  if (utils.trade.isSol(currentNetwork.chain)) {
    const { trade } = HidexSDK;
    const { token, tokenBalanceStr } = info;
    const { currentSymbol, address } = await getCurrentSymbolTest(info, { isBuy, isPump, currentNetwork });
    if ((isBuy || (!isBuy && Number(tokenBalanceStr))) && currentSymbol.in.address !== currentSymbol.out.address) {
      const { success, swapTransaction, data } = await trade.defiApi.swapRoute(currentSymbol, address);
      if (!success) {
        return;
      }
      const compile = await trade.compileTransaction(swapTransaction);
      const mapItems = beforeTradeDataMap.get('compiles') || {};
      mapItems[`${isBuy ? 'buy' : 'sell'}_${currentNetwork.chain}_${token.address}`] = {
        compile,
        preAmountIn: data.inAmount,
        preAmountOut: data.otherAmountThreshold,
      };
      beforeTradeDataMap.set('compiles', mapItems);
    }
  }
};

const getBeforeTradeData = (isBuy: boolean, chainName: string, tokenAddress: string) => {
  const mapItems = beforeTradeDataMap.get('compiles');
  if (mapItems && typeof mapItems === 'object') {
    return mapItems[`${isBuy ? 'buy' : 'sell'}_${chainName}_${tokenAddress}`];
  }
  return {
    compile: null,
    preAmountIn: 0,
    preAmountOut: 0,
  };
};

export { getCurrentSymbolTest, setBeforeTradeData, getBeforeTradeData };
