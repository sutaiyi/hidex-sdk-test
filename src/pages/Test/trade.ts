import HidexSDK from "@/hidexService"
import { swapSign } from "./utils";
import { getBeforeTradeData, getCurrentSymbolTest } from './solTrade'

const { trade, network, wallet, dexFee, utils } = HidexSDK;
const tradeFun: any = {
  指令调试: async () => {
    const swapBase64Str =
      "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAQAFCQtBD6bU58nclkm/Bmm9dztX13TEkZyT3kTshhJZtc+35+sRwZG+FAmslmG5GOEyM8kdtkieyaUMSBSjijCLEkJ5/f3z/y6DYV6qShd68DAYic45gTgcm5TTuPJ8CAeYLPyKVwr+r3J5up0tnL9GQ98lvzfM18cn9wmoO3wwLgL2AwZGb+UhFzL/7K26csOb57yM5bvF9xJrLEObOkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAbd9uHXZaGT2cvhRs7reawctIXtX1s3kTqM9YV+/wCpBpuIV/6rgYT7aH9jRhjANdrEOdwa6ztVmKDwAAAAAAFL2UnENgLDPyB3kO0Wo1JMobmXXPEhoqkM/+x9+LaKzY8e7OFPxreMN7nBQV31k+Wl/uBPNohXir2HpdKMd0HQBwQACQMVFgUAAAAAAAQABQLgkwQABQIAAXwDAAAAC0EPptTnydyWSb8Gab13O1fXdMSRnJPeROyGElm1z7cgAAAAAAAAADZSc2Jjdmk0MWhnR21jTE5BVDJqREJDN01TaG5kcVlvkKQgAAAAAAClAAAAAAAAAAbd9uHXZaGT2cvhRs7reawctIXtX1s3kTqM9YV+/wCpBgQBBwAUAQEIEgYKFgsCDA0VDg8QERITFwEDABEJoIYBAAAAAAAIu4EAAAAAAAYDAQAAAQkFAgAJDAIAAADoAwAAAAAAAAJ4IuyAOJt4qzcglYTn50/yPCmhVsyTy5UUULyyMxWHGwEYAgULGzPgjqDRvs3YSwvQXTcmyUVHRlb0i/86R62WPdutZVkKKiwtLjAxMjM0NQIBNg==";
    const result = await trade.compileTransaction(swapBase64Str)
    console.log(result)
    const isSupport = trade.isInstructionsSupportReset(result["message"]);
    console.log(isSupport)
    const resetResult = trade.resetInstructions(result["message"], BigInt("100001"), BigInt("3156130"))
    console.log(resetResult)

    const owner: Keypair = ownerKeypair(
      ''
    );

    const gasFee: NetWorkFee = {
      value: 100,
      unit: "string",
      gasPrice: "string",
      gasLimit: 100,
    }

    const currentSymbol: CurrentSymbol = {
      in: {
        name: "SOL",
        symbol: "SOL",
        decimals: 9,
        address: "So11111111111111111111111111111111111111112",
      },
      out: {
        name: "Bome",
        symbol: "Bome",
        decimals: 6,
        address: "ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82",
      },
      "amountIn": "100000",
      "amountOutMin": "10000",
      "slipPersent": 10,
      "poolAddress": "",
      "networkFee": gasFee, // 网络费
      "priorityFee": "200000", // 优先费给链上
      "bribeFee": "100000", // 贿赂费给平台比如（jito...）
      "dexFeeAmount": "1000", // 交易手续费用
      "isBuy": false, // 是否买入
      "tradeType": 1, // 0 Jup(默认) | 1 raydium | 2 Pump | 3 极速（gmgn）
      "isPump": false, // 是否是pump
      "TOKEN_2022": false, // 是否是2022代币
    };

    // transactionMessage: TransactionMessage, addressLookupTableAccounts: AddressLookupTableAccount[], recentBlockhash: string, currentSymbol: CurrentSymbol,
    // owner: any
    // const { blockhash } = await connection.getLatestBlockhash();
    const blockHash = "8nkE1y7xzwSXbDMj5CRFazjfaTQL1ua5rv9skJyocCnB";
    const txArray = await trade.getTransactionsSignature(resetResult, result["addressesLookup"], blockHash, currentSymbol, owner);
    console.log(txArray.length)
    console.log(Buffer.from(txArray[0].serialize()).toString("base64"))
    console.log(Buffer.from(txArray[1].serialize()).toString("base64"))
    console.log(Buffer.from(txArray[2].serialize()).toString("base64"))
    console.log(Buffer.from(txArray[3].serialize()).toString("base64"))

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
      const { chainName, account, token, balance, priceUSD } = info;
      const isBuy = true; // 买入
      const { address } = account
      const currentChain = await network.choose(chainName);
      const { currentSymbol } = await getCurrentSymbolTest(info, { isBuy, isPump: false, currentChain });


      console.log('currentChain', currentChain);
      // 实际买入金额
      const buyAmount = (0.0001 * Math.pow(10, currentChain.tokens[1].decimals)).toString();
      currentSymbol.compile = getBeforeTradeData(isBuy, chainName, token.address)
      // 交易费用
      currentSymbol.dexFeeAmount = await dexFee.getDexFeeAmount({ isBuy, buyAmount, inviter: currentSymbol.inviter });

      // 实际购买金额
      currentSymbol.amountIn = (BigInt(buyAmount) - BigInt(currentSymbol.dexFeeAmount)).toString();

      // 当前时时价格
      currentSymbol.currentPrice = (Math.floor(priceUSD * Math.pow(10, currentChain.tokens[1].decimals))).toString();

      console.time('swapPath&swapSignTimer');
      const [swapPath, signRes] = await Promise.all([
        trade.getSwapPath(currentSymbol),
        swapSign(currentChain.chainID, account.address),
      ]);
      console.timeEnd('swapPath&swapSignTimer');

      console.time('dexFeeTimer')
      currentSymbol.amountOutMin = await dexFee.getAmountOutMin(currentSymbol, swapPath.minOutAmount);
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
        inviter: currentSymbol.inviter ? currentSymbol.inviter : signRes.inviterAddress || '',
        feeRate: signRes.feeRate || 0,
        commissionRate: signRes.commissionRate || 0,
        contents: signRes.contents || '',
        signature: signRes.signature || ''
      });


      console.time('getSwapEstimateGasTimer');
      const estimateResult = await trade.getSwapEstimateGas(currentSymbol, swapPath, address);
      console.timeEnd('getSwapEstimateGasTimer');


      console.time('getNetWorkFeesTimer');
      const networkFeeArr = await trade.getNetWorkFees(estimateResult.gasLimit)
      currentSymbol.networkFee = networkFeeArr[1];
      const needFee = await trade.getSwapFees(currentSymbol);
      console.log('最少得有多少母币余额（未加上用户支付的母币数量）==>', needFee);
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
  '卖出0.01': async (info: any) => {
    try {
      if (!info) {
        alert('请选择代币');
      }
      console.time('tradeTimer');
      const { chainName, account, token, balanceToken } = info;
      const currentChain = await network.choose(chainName);
      const { address } = account
      const isBuy = false; // 卖出
      const tokenAddress = token.address;
      const decimals = token.decimals;
      console.log('卖出Token地址===>', tokenAddress);
      if (balanceToken < 0.01) {
        alert('余额不足');
        return;
      }
      const amountIn = (0.01 * Math.pow(10, decimals)).toString(); // 卖出 0.01 Token

      const inToken = currentChain?.tokens[0]; // 具体以页面显示的代币为主
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
      console.log('最少得有多少母币余额==>', minBalance);
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