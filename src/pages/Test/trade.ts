import HidexSDK from "@/hidexService"
import { swapSign } from "./utils";

const { trade, network, wallet, dexFee, utils } = HidexSDK;
const tradeFun: any = {
  检测指令: async () => {
    const result = await trade.instructionsCheck('test')
    console.log(result)
  },
  重置指令: async () => {
    const result = await trade.instructionReset('test')
    console.log(result)
  },
  获取转账网络费用列表: async (info: any) => {
    try {
      const chain = 'BSC'
      if (!info || info.chainName !== chain) {
        alert(`请选择${chain}代币`);
        return;
      }
      const { token, account } = info;
      // 选择链网络
      await network.choose(chain);
      // 先预估交易
      const { gasLimit } = await trade.getSendEstimateGas({
        from: account.address,
        to: '0x8588511aac7Ee60c0833529BF39Dc3e0E0736f3f',
        amount: String(0.000001 * Math.pow(10, token.decimals)), // 模拟交易数量
        tokenAddress: token.address,  // 发送母币种地址或者其他代币地址  注意：为空代表母币种
      })
      console.log('预估交易费用===>', gasLimit);
      const feeArray = await trade.getNetWorkFees(gasLimit);
      console.log(`网络费用列表===>`, feeArray);
      return feeArray;
    } catch (error) {
      alert(utils.getErrorMessage(error).code + '-' + utils.getErrorMessage(error).message)
    }
  },
  ETH系转账: async (info: any) => {
    try {
      // 假设用户选择了网络费用列表中的第一档
      const networkFeeList = await tradeFun.获取转账网络费用列表(info);
      const networkFee = networkFeeList[0];
      console.log(networkFee)
      const { token, account } = info;


      const totalFee = await trade.getSendFees(networkFee)
      console.log('总的手续费' + totalFee)

      // 判断母币是否足够
      // ...TODO: 
      // 1、如果是转母必币，需要将“总的手续费” 加上 “转出的母币数量”  判断母币余额是否足够
      // 2、如果是转代币，判断余额是否大于“总的手续费”

      const data = await trade.sendTransaction({
        from: account.address,
        to: '0x996AfF191D128b8f36b828573Fb02944cD1b357e', // 自己转给自己
        amount: String(0.0001 * Math.pow(10, token.decimals)), // 实际转转数量
        tokenAddress: token.address,  // 发送母币种地址或者其他代币地址  注意：为空代表母币种
        currentNetWorkFee: networkFee,
      })
      console.log('转账结果===>', data);
      if (!data.error) {
        throw new Error(data.error?.toString());
      }
      alert('发送成功' + data.result.hash)
    } catch (error) {
      alert(utils.getErrorMessage(error).code + '-' + utils.getErrorMessage(error).message)
    }
  },
  SOL转账: async () => {
  },
  检测代币授权情况: async (info: any) => {
    if (!info) {
      alert(`请选择代币`);
      return;
    }
    try {
      console.log('授权数量查询...');
      const { chainName, account, token } = info;
      const currentNetWork = await network.choose(chainName);
      const { tokenAddress, accountAddress, authorizedAddress } = {
        tokenAddress: token.address,
        accountAddress: account.address,
        // uat: 0x8D349A8a122b14a5fDd7f8AEe085AD47605395D8
        // pro: 0xd59Dca2923AC747bbe478032F61C00202cfED5D8
        authorizedAddress: currentNetWork.deTrade
      };
      const allowance = await trade.getAllowance(tokenAddress, accountAddress, authorizedAddress);
      console.log(`===>${chainName}链，账户地址 ${accountAddress}，给合约地址 ${authorizedAddress}, 授权了 ${allowance} 个的代币`);
    } catch (error) {
      console.log('error==>', error);
    }
  },

  '买入0.0001': async (info: any) => {
    try {
      if (!info) {
        alert('请选择代币');
      }
      console.time('tradeTimer');
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
        networkFee: {
          value: 0, unit: '', gasPrice: '', gasLimit: 0
        },
        poolAddress: '',  // 池子地址
        bribeFee: '',  // 贿赂费给平台比如（jito...）
        tradeType: 0,
        isPump: false,
        TOKEN_2022: false,
      };
      console.time('swapPath&swapSignTimer');
      const [swapPath, signRes] = await Promise.all([
        trade.getSwapPath(currentSymbol),
        swapSign(currentChain.chainID, account.address),
      ]);
      console.timeEnd('swapPath&swapSignTimer');

      console.time('dexFeeTimer')
      currentSymbol.amountOutMin = await dexFee.getAmountOutMin(currentSymbol, swapPath.minOutAmount.toString());
      currentSymbol.dexFeeAmount = await dexFee.getDexFeeAmount(currentSymbol, swapPath.minOutAmount.toString());
      console.timeEnd('dexFeeTimer')


      console.time('approveTimer')
      // 交易授权
      if (!currentSymbol.isBuy) {
        await trade.approve.execute(currentSymbol.in.address, address, currentChain.deTrade);
        console.log('Swapp Approved');
      }
      console.timeEnd('approveTimer')


      // ETH系需要获取交易签名
      Object.assign(currentSymbol, {
        inviter: signRes.inviterAddress,
        feeRate: signRes.feeRate,
        commissionRate: signRes.commissionRate,
        contents: signRes.contents,
        signature: signRes.signature
      });


      console.time('getSwapEstimateGasTimer');
      const estimateResult = await trade.getSwapEstimateGas(currentSymbol, swapPath, address);
      console.timeEnd('getSwapEstimateGasTimer');


      console.time('getNetWorkFeesTimer');
      const networkFeeArr = await trade.getNetWorkFees(estimateResult.gasLimit)
      currentSymbol.networkFee = networkFeeArr[1];
      const minBalance = await trade.getSwapFees(currentSymbol);
      console.log('最少得有多少余额==>', minBalance);
      console.timeEnd('getNetWorkFeesTimer');

      console.time('tradeswapTimer');
      const { error, result } = await trade.swap(currentSymbol, estimateResult, address);
      console.timeEnd('tradeswapTimer');
      if (!error) {
        alert('交易成功' + result.hash)
      }
      console.log('交易结果==>', error, result);
    } catch (error) {
      console.log(utils.getErrorMessage(error).message)
      alert(utils.getErrorMessage(error).code + '-' + utils.getErrorMessage(error).message)
    }
  },


}

export default tradeFun