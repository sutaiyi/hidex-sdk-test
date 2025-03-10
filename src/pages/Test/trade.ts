import HidexSDK from "@/hidexService"

const { trade, network, wallet, dexFee } = HidexSDK;
const tradeFun: any = {
  检测指令: async () => {
    const result = await trade.instructionsCheck('test')
    console.log(result)
  },
  重置指令: async () => {
    const result = await trade.instructionReset('test')
    console.log(result)
  },
  '买入0.0001': async (info: any) => {
    try {
      if (!info) {
        alert('请选择BNB网络的代币');
      }
      const { chainName, account, token, balance } = info;
      const currentChain = await network.choose(chainName);
      const { address } = account
      const isBuy = true; // 买入
      const tokenAddress = token.address;
      const decimals = token.decimals;
      console.log('买入Token地址===>', tokenAddress);
      if (balance <= 0.001) {
        alert('余额不足');
        return;
      }
      const amountIn = '100000000000000'; // 买入 0.0001 BNB
      const feeArray = await trade.getNetWorkFees(currentChain.defaultLimit as number);
      console.log(`网络费用===>`, feeArray);

      const inToken = currentChain?.tokens[0];
      const currentSymbol = {
        in: inToken,
        out: {
          address: tokenAddress,
          decimals,
          name: '',
          symbol: '',
        },
        amountIn, // 兑换数量
        slipPersent: 0.05, // 滑点5%
        amountOutMin: '', // 最少得到数量
        dexFeeAmount: '', // 交易手续费
        priorityFee: (0.003 * Math.pow(10, 18)).toString(), // 优先费
        inviter: '', // 邀请地址
        isBuy,
        networkFee: feeArray[0],
        poolAddress: '',  // 池子地址
        bribeFee: '',  // 贿赂费给平台比如（jito...）
        tradeType: 0,
        isPump: false,
        TOKEN_2022: false,
      };
      const swapPath = await trade.getSwapPath(currentSymbol);
      console.log('交易路径===>', swapPath);
      currentSymbol.amountOutMin = await dexFee.getAmountOutMin(currentSymbol, swapPath.minOutAmount.toString());
      currentSymbol.dexFeeAmount = await dexFee.getDexFeeAmount(currentSymbol, swapPath.minOutAmount.toString());
      console.log('交易数据==>', currentSymbol);
      // await approve.execute(currentSymbol.in.address, address, currentChain.deTrade);
      // console.log('Swapping Approved');
      // const transaction = await trade.getTradeEstimateGas(currentSymbol, swapPath[0], address);
      // console.log(transaction);

      // const minBalance = await swap.minTransactionBalance(currentSymbol);
      // console.log('最少得有多少余额==>', minBalance);

      // // 买入按钮执行
      // const { error, result } = await swap.trade(currentSymbol, transaction, address);
      // console.log('交易结果==>', error, result);
    } catch (error) {
      console.log('error==>', error);
    }
  }
}

export default tradeFun