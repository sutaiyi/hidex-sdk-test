import { CurrentSymbol, NetWorkFee } from "@/hidex-sdk";
import { ownerKeypair } from "@/hidex-sdk/trade/sol/config";
import HidexSDK from "@/hidexService"
import { Keypair } from "@solana/web3.js";

const { trade, network, wallet, dexFee } = HidexSDK;
const tradeFun: any = {
  检测指令: async () => {
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
  
    const gasFee : NetWorkFee = {
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
      "slipPersent":10,
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
    const txArray  = await trade.getTransactionsSignature(resetResult, result["addressesLookup"], blockHash, currentSymbol, owner);
    console.log(txArray.length)
    console.log(Buffer.from(txArray[0].serialize()).toString("base64"))
    console.log(Buffer.from(txArray[1].serialize()).toString("base64"))
    console.log(Buffer.from(txArray[2].serialize()).toString("base64"))
    console.log(Buffer.from(txArray[3].serialize()).toString("base64"))

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
