import { HidexSDK } from '@/hidexService';
import { swapSign } from './utils';

import { getBeforeTradeData, getCurrentSymbolTest, setBeforeTradeData } from './solTrade';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

const tradeFun = () => {
  const { trade, network, wallet, dexFee, utils } = HidexSDK;
  return {
    获取ETH系转账网络费用列表: async (info: any) => {
      try {
        const chain = 'BSC';
        if (!info || info.chainName !== chain) {
          alert(`请选择${chain}代币`);
          throw new Error(`请选择${chain}代币`);
        }
        const { token, account } = info;
        // 选择链网络
        await network.choose(chain);
        // 先预估交易
        const { gasLimit } = await trade.getSendEstimateGas({
          from: account.address,
          to: '0x8588511aac7Ee60c0833529BF39Dc3e0E0736f3f',
          amount: String(0.000001 * Math.pow(10, token.decimals)), // 模拟交易数量
          tokenAddress: token.address, // 发送母币种地址或者其他代币地址  注意：为空代表母币种
        });
        console.log('预估交易费用===>', gasLimit);
        const feeArray = await trade.getNetWorkFees(gasLimit, 10);
        console.log(`网络费用列表===>`, feeArray);
        return feeArray;
      } catch (error) {
        alert(utils.getErrorMessage(error).code + '-' + utils.getErrorMessage(error).message);
      }
      throw new Error('');
    },
    获取SOL转账网络费用列表: async (info: any) => {
      try {
        // SOL 转账
        const chain = 'SOLANA';
        if (!info || info.chainName !== chain) {
          alert(`请选择${chain}代币`);
          throw new Error(`请选择${chain}代币`);
        }
        const { account } = info;
        // 选择链网络
        await network.choose(chain);
        // 先预估交易
        const { gasLimit } = await trade.getSendEstimateGas({
          from: account.address,
          to: '74fonSdF1PXNZ8WyucrP9eDBxgyjUigA5EjgXcPuC7rm',
          amount: String(0.016 * Math.pow(10, 9)), // 模拟交易数量，具体需要按照代币精度来
          tokenAddress: '', // 发送母币地址或者其他代币地址  注意：为空代表母币种
        });
        console.log('预估交易费用===>', gasLimit);
        const feeArray = await trade.getNetWorkFees(gasLimit, 10);
        console.log(`网络费用列表===>`, feeArray);
        return feeArray;
      } catch (error) {
        alert(utils.getErrorMessage(error).code + '-' + utils.getErrorMessage(error).message);
      }
      throw new Error('');
    },

    ETH系转账: async (info: any) => {
      try {
        // 假设用户选择了网络费用列表中的第一档
        const networkFeeList = await tradeFun().获取ETH系转账网络费用列表(info);
        const networkFee = networkFeeList[0];
        console.log(networkFee);
        const { token, account } = info;
        const toAddress = '0x996AfF191D128b8f36b828573Fb02944cD1b357e';
        const totalFee = await trade.getSendFees(networkFee, toAddress, token.address);
        console.log('总的手续费' + totalFee);
        // 判断母币是否足够
        // ...TODO:
        // 1、如果是转母必币，需要将“总的手续费” 加上 “转出的母币数量”  判断母币余额是否足够
        // 2、如果是转代币，判断余额是否大于“总的手续费”

        const data = await trade.sendTransaction({
          from: account.address,
          to: toAddress, // 自己转给自己
          amount: String(0.0001 * Math.pow(10, token.decimals)), // 实际转转数量
          tokenAddress: token.address, // 发送母币种地址或者其他代币地址  注意：为空代表母币种
          currentNetWorkFee: networkFee,
        });
        console.log('转账结果===>', data);
        if (data.error) {
          throw new Error(data.error?.toString());
        }
        alert('发送成功， 请链上确认' + data.result.hash);
      } catch (error) {
        alert(utils.getErrorMessage(error).code + '-' + utils.getErrorMessage(error).message);
      }
    },
    SOL转账: async (info: any) => {
      try {
        // 假设用户选择了网络费用列表中的第一档
        const networkFeeList = await tradeFun().获取SOL转账网络费用列表(info);
        const networkFee = networkFeeList[0];
        console.log(networkFee);
        const { token, account } = info;
        const toAddress = '74fonSdF1PXNZ8WyucrP9eDBxgyjUigA5EjgXcPuC7rm';
        const totalFee = await trade.getSendFees(networkFee, toAddress, token.address);
        console.log('总的手续费' + totalFee);
        // 判断母币是否足够
        // ...TODO:
        // 1、如果是转母必币，需要将“总的手续费” 加上 “转出的母币数量”  判断母币余额是否足够
        // 2、如果是转代币，判断余额是否大于“总的手续费”

        const data = await trade.sendTransaction({
          from: account.address,
          to: toAddress, // 自己转给自己
          amount: String(0.016 * Math.pow(10, 9)), // 实际转转数量
          tokenAddress: '', // 发送母币种地址或者其他代币地址  注意：为空代表母币种
          currentNetWorkFee: networkFee,
        });
        console.log('转账结果===>', data);
        if (data.error) {
          throw new Error(data.error?.toString());
        }
        alert('发送成功,请链上确认' + data.result.hash);
      } catch (error) {
        alert(utils.getErrorMessage(error).code + '-' + utils.getErrorMessage(error).message);
      }
    },

    获取交易网络费用列表: async (info: any) => {
      try {
        await network.choose('ETH');
        const feeArrayEth = await trade.getNetWorkFees(21000, 0);
        console.log(`ETH网络费用列表===>`, feeArrayEth);

        await network.choose('SOLANA');
        const feeArraySol = await trade.getNetWorkFees(0, 3);
        console.log(`SOL网络费用列表(极速)===>`, feeArraySol);
        const feeArraySol_ = await trade.getNetWorkFees(0, 0);
        console.log(`SOL网络费用列表（防夹）===>`, feeArraySol_);
      } catch (error) {
        alert(utils.getErrorMessage(error).code + '-' + utils.getErrorMessage(error).message);
      }
    },
    'SOL换WSOL(0.001)': async () => {
      try {
        console.time('tradeFullTimer');
        const RENT_EXEMPTION_MIN = 2_039_280;
        const chain = 'SOLANA';
        const type = 0; // 0: SOL换WSOL 1: WSOL换SOL
        const amount = 0.001;

        const { accountItem } = await wallet.getCurrentWallet();
        console.log(accountItem);
        const currentBalance = trade.getBalance(accountItem[chain].address);
        const priorityFee = 0.0002 * Math.pow(10, 9); // 优先费
        const maxTransferLamports = Number(currentBalance) - RENT_EXEMPTION_MIN - 5000 - priorityFee;
        const requestedLamports = amount * LAMPORTS_PER_SOL;

        if (maxTransferLamports < requestedLamports) {
          alert(`余额不足。最大可转换金额：${maxTransferLamports / LAMPORTS_PER_SOL} SOL`);
        }

        const { error, result } = await trade.wrappedExchange(chain, accountItem[chain].address, type, priorityFee.toString(), requestedLamports.toString());
        if (!error) {
          const hashItem = {
            chain,
            hash: result.hash,
            createTime: new Date().getTime(),
            data: result.data,
          };
          trade.checkHash.action(hashItem);
        }
      } catch (error) {
        console.error(error);
      }
    },
    WSOL换SOL: async () => {
      try {
        console.time('tradeFullTimer');
        const chain = 'SOLANA';
        const type = 1; // 0: SOL换WSOL 1: WSOL换SOL
        const { accountItem } = await wallet.getCurrentWallet();
        const currentBalance = trade.getBalance(accountItem[chain].address);
        const priorityFee = 0.0002 * Math.pow(10, 9); // 优先费
        const maxTransferLamports = Number(currentBalance);
        const requestedLamports = 5000 + priorityFee;
        if (maxTransferLamports < requestedLamports) {
          alert('燃料费用不足，请充值SOL大于 ' + (requestedLamports / Math.pow(10, 9)).toFixed(6));
        }
        const { error, result } = await trade.wrappedExchange(chain, accountItem[chain].address, type, priorityFee.toString());
        if (!error) {
          const hashItem = {
            chain,
            hash: result.hash,
            createTime: new Date().getTime(),
            data: result.data,
          };
          trade.checkHash.action(hashItem);
        }
      } catch (error) {
        console.error(error);
      }
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
          authorizedAddress: currentNetWork.deTrade,
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
        console.time('tradeFullTimer');
        console.time('tradeTimer');
        const { chainName, account, token, balance, balanceStr, tokenBalanceStr, priceUSD, cryptoPriceUSD } = info;
        const isBuy = true; // 买入
        const { address } = account;
        const currentNetwork = await network.choose(chainName);
        const { currentSymbol } = await getCurrentSymbolTest(info, { isBuy, isPump: false, currentNetwork });
        // 实际买入金额
        const buyAmount = (0.0001 * Math.pow(10, currentNetwork.tokens[1].decimals)).toString();
        currentSymbol.chain = currentNetwork.chain;
        currentSymbol.slipPersent = 0.05; // 滑点5%
        const { compile, preAmountIn, preAmountOut } = getBeforeTradeData(isBuy, chainName, token.address);
        currentSymbol.compile = compile;
        currentSymbol.preAmountIn = preAmountIn;
        currentSymbol.preAmountOut = preAmountOut;
        // 交易手续费用
        currentSymbol.dexFeeAmount = await dexFee.getDexFeeAmount(currentSymbol, buyAmount);

        // 实际购买金额
        currentSymbol.amountIn = (BigInt(buyAmount) - BigInt(currentSymbol.dexFeeAmount)).toString();

        // 当前代币时时价格
        currentSymbol.currentPrice = priceUSD;
        // 当前母币时时价格
        currentSymbol.cryptoPriceUSD = cryptoPriceUSD;

        console.time('swapPath&swapSignTimer');
        const [swapPath, signRes] = await Promise.all([trade.getSwapPath(currentSymbol), swapSign(currentNetwork.chainID, account.address)]);
        console.timeEnd('swapPath&swapSignTimer');
        console.time('dexFeeTimer');
        currentSymbol.amountOutMin = await dexFee.getAmountOutMin(currentSymbol, swapPath.fullAmoutOut);
        console.timeEnd('dexFeeTimer');

        console.time('approveTimer');
        // 交易授权
        if (!currentSymbol.isBuy) {
          await trade.approve.execute(currentSymbol.in.address, address, swapPath.authorizationTarget || currentNetwork.deTrade, currentSymbol.chain);
          console.log('Swapp Approved');
        }
        console.timeEnd('approveTimer');

        // ETH系需要获取交易签名
        Object.assign(currentSymbol, {
          inviter: currentSymbol.inviter ? currentSymbol.inviter : signRes.inviterAddress || '',
          feeRate: signRes.feeRate || 0,
          commissionRate: signRes.commissionRate || 0,
          contents: signRes.contents || '',
          signature: signRes.signature || '',
        });

        console.time('getSwapEstimateGasTimer');
        const estimateResult = await trade.getSwapEstimateGas(currentSymbol, swapPath, address);
        console.timeEnd('getSwapEstimateGasTimer');

        console.time('getNetWorkFeesTimer');
        const networkFeeArr = await trade.getNetWorkFees(estimateResult.gasLimit, currentSymbol.tradeType);
        currentSymbol.networkFee = networkFeeArr[1];
        const needFee = await trade.getSwapFees(currentSymbol);
        console.log('最少得有多少母币余额（未加上用户支付的母币数量）==>', needFee);
        console.timeEnd('getNetWorkFeesTimer');
        console.time('tradeswapTimer');
        const { error, result } = await trade.swap(currentSymbol, estimateResult, address);
        console.timeEnd('tradeswapTimer');
        if (!error) {
          console.log('交易已提交：', result);
          const hashItem = {
            chain: currentNetwork.chain,
            hash: result.hash,
            createTime: new Date().getTime(),
            data: result.data,
          };
          trade.checkHash.action(hashItem);
          // 更新交易预请求数据
          setBeforeTradeData(info, { isBuy, isPump: currentSymbol.isPump, currentNetwork });
        }
        console.log('交易HASH：', result);
      } catch (error) {
        console.log(utils.getErrorMessage(error).message);
        alert(utils.getErrorMessage(error).code + '-' + utils.getErrorMessage(error).message);
      }
    },
    '卖出20%': async (info: any) => {
      try {
        if (!info) {
          alert('请选择代币');
        }
        console.time('tradeFullTimer');
        console.time('tradeTimer');
        const { chainName, account, token, balance, priceUSD, cryptoPriceUSD, balanceStr, tokenBalanceStr } = info;
        const isBuy = false; // 卖出
        const { address } = account;
        const currentNetwork = await network.choose(chainName);
        const { currentSymbol } = await getCurrentSymbolTest(info, { isBuy, isPump: false, currentNetwork });
        currentSymbol.chain = currentNetwork.chain;
        currentSymbol.slipPersent = 0.05; // 滑点5%
        // 实际卖出金额
        const buyAmount = utils.common.formatNumberWithPrecision(Number(tokenBalanceStr) * 0.2, 0);
        console.log('实际卖出金额：', buyAmount, tokenBalanceStr);
        const { compile, preAmountIn, preAmountOut } = getBeforeTradeData(isBuy, chainName, token.address);
        currentSymbol.compile = compile;
        currentSymbol.preAmountIn = preAmountIn;
        currentSymbol.preAmountOut = preAmountOut;
        // 交易手续费用
        currentSymbol.dexFeeAmount = await dexFee.getDexFeeAmount(currentSymbol, buyAmount);
        // 实际卖出金额
        currentSymbol.amountIn = buyAmount; // tokenBalanceStr// (BigInt(buyAmount) - BigInt(currentSymbol.dexFeeAmount)).toString();

        // 当前代币时时价格
        currentSymbol.currentPrice = priceUSD;
        // 当前母币时时价格
        currentSymbol.cryptoPriceUSD = cryptoPriceUSD;

        // 实际卖出金额
        currentSymbol.amountIn = (BigInt(buyAmount) - BigInt(currentSymbol.dexFeeAmount)).toString();

        // 当前代币时时价格
        currentSymbol.currentPrice = priceUSD;
        // 当前母币时时价格
        currentSymbol.cryptoPriceUSD = cryptoPriceUSD;

        console.time('swapPath&swapSignTimer');
        const [swapPath, signRes] = await Promise.all([trade.getSwapPath(currentSymbol), swapSign(currentNetwork.chainID, account.address)]);
        console.timeEnd('swapPath&swapSignTimer');
        console.time('dexFeeTimer');
        currentSymbol.amountOutMin = await dexFee.getAmountOutMin(currentSymbol, swapPath.fullAmoutOut);
        console.timeEnd('dexFeeTimer');

        console.time('approveTimer');
        // ETH系交易授权
        if (!currentSymbol.isBuy) {
          await trade.approve.execute(currentSymbol.in.address, address, swapPath.authorizationTarget || currentNetwork.deTrade, currentSymbol.chain);
          console.log('Swapp Approved');
        }
        console.timeEnd('approveTimer');

        // ETH系需要获取交易签名
        Object.assign(currentSymbol, {
          inviter: currentSymbol.inviter ? currentSymbol.inviter : signRes.inviterAddress || '',
          feeRate: signRes.feeRate || 0,
          commissionRate: signRes.commissionRate || 0,
          contents: signRes.contents || '',
          signature: signRes.signature || '',
        });

        console.time('getSwapEstimateGasTimer');
        const estimateResult = await trade.getSwapEstimateGas(currentSymbol, swapPath, address);
        console.timeEnd('getSwapEstimateGasTimer');

        console.time('getNetWorkFeesTimer');
        const networkFeeArr = await trade.getNetWorkFees(estimateResult.gasLimit, currentSymbol.tradeType);
        currentSymbol.networkFee = networkFeeArr[1];
        const needFee = await trade.getSwapFees(currentSymbol);
        console.log('最少得有多少母币余额（未加上用户支付的母币数量）==>', needFee);
        console.timeEnd('getNetWorkFeesTimer');
        console.time('tradeswapTimer');
        const { error, result } = await trade.swap(currentSymbol, estimateResult, address);
        console.timeEnd('tradeswapTimer');
        if (!error) {
          console.log('交易已提交：', result);
          const hashItem = {
            chain: currentNetwork.chain,
            hash: result.hash,
            createTime: new Date().getTime(),
            data: result.data,
          };
          trade.checkHash.action(hashItem);
          // 更新交易预请求数据
          setBeforeTradeData(info, { isBuy, isPump: currentSymbol.isPump, currentNetwork });
        }
        console.log('交易HASH：', result);
      } catch (error) {
        console.log(utils.getErrorMessage(error).message);
        alert(utils.getErrorMessage(error).code + '-' + utils.getErrorMessage(error).message);
      }
    },
    后台多条Hash状态查询: async () => {
      try {
        const hashItem1 = {
          chain: 56,
          hash: '0x1190a8c49883fb1c4e02bea72b7df2596d3db42aab6390a9e23ae7c03086747a',
          createTime: new Date().getTime(),
          data: {},
        };
        const hashItem2 = {
          chain: 102,
          hash: '27Nhtf5dp6D8F4nmuAX5akXbwtMAiDViHyH9afVB2sdsdvNHgGHsahyGpj43AdUpZcdnmhRMtZJA6vPiY63yLPGL',
          createTime: new Date().getTime(),
          data: {},
        };
        trade.checkHash.action(hashItem1);

        setTimeout(() => {
          trade.checkHash.action(hashItem2);
        }, 1000);
      } catch (error) {
        const { code, message } = utils.getErrorMessage(error);
        alert(code + '-' + message);
      }
    },
    单次Hash状态查询: async () => {
      try {
        const hashArr = ['SOLANA', '5MomLq6AtJJ14s1pN4P5QhWV4AjgEYbDeZXaPsy4JfR6RtM4Awt6FCe6DHUdGpaKYkAaxriAzn6GCHadjuJZrueC']; // SOLANA
        // const hashArr = ['BASE', '0x78c2a5f7e7f8e40fc96492575e6794dc3976b81e21c7ed4e060b82ef9c7f3903'] // BASE
        const result = await trade.getHashStatus(hashArr[1], hashArr[0]);
        console.log('Hash状态查询结果==>', result);
      } catch (error) {
        const { code, message } = utils.getErrorMessage(error);
        alert(code + '-' + message);
      }
    },
    大整型的数据转换问题: async () => {
      try {
        const test = [
          1.35e-16, 1.5e-9, 0.0000123456, -0.000000000000000135, 1.2658951809134445e22, 1.486661759245081e22, 1000000000000000.9999, 10000000000000000.9999,
          0.00000000000000000000000019999,
        ];
        test.forEach((v) => {
          console.log(utils.common.formatNumberWithPrecision(v, 0));
          // console.log(utils.common.toFixed(v, 3))
        });
      } catch (error) {
        const { code, message } = utils.getErrorMessage(error);
        alert(code + '-' + message);
      }
    },
    获取邀请地址: async () => {
      try {
        const inviter = await utils.trade.getInviterAddress(undefined, true);
        console.log('邀请地址==>', inviter);
      } catch (error) {
        const { code, message } = utils.getErrorMessage(error);
        alert(code + '-' + message);
      }
    },
    获取BlockHash: async () => {
      try {
        const blockHash = await trade.defiApi.updateLatestBlockhash(network);
        console.log('blockHash==>', blockHash);
      } catch (error) {
        const { code, message } = utils.getErrorMessage(error);
        alert(code + '-' + message);
      }
    },
  };
};
export default tradeFun;
