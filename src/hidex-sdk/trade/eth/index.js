import { BigNumber, ethers } from 'ethers';
import { mTokenAddress } from '../../common/config';
import abis from '../../common/abis';
import { getBaseFeePerGas, getUseGasPrice } from './utils';
import { NETWORK_FEE_RATES, networkWeight } from './config';
import { abiInFun, actionNameAndValue } from './abiFun';
export const ethService = (HS) => {
    const { network, wallet } = HS;
    return {
        getBalance: async (accountAddress, tokenAddress = '') => {
            const currentNetwork = network.get();
            if (!tokenAddress || tokenAddress.toLowerCase() === mTokenAddress.toLowerCase()) {
                const balanceProm = network.sysProviderRpcs[currentNetwork.chain].map((v) => {
                    return v
                        .getBalance(accountAddress)
                        .then((res) => {
                        return res;
                    })
                        .catch((error) => {
                        return Promise.reject(error);
                    });
                });
                const balance = await Promise.any(balanceProm);
                if (balance.error) {
                    return '0';
                }
                return balance.toString();
            }
            if (tokenAddress) {
                const balanceProm = network.sysProviderRpcs[currentNetwork.chain].map((v) => {
                    const tokenContract = new ethers.Contract(tokenAddress, abis.tokenABI, v);
                    return tokenContract
                        .balanceOf(accountAddress)
                        .then((res) => {
                        return res;
                    })
                        .catch((error) => {
                        return Promise.reject(error);
                    });
                });
                const balance = await Promise.any(balanceProm);
                if (balance.error) {
                    return '0';
                }
                return balance;
            }
            return '0';
        },
        getBalanceMultiple: async (chain, accountAddress, tokens) => {
            try {
                const currentNetWork = await network.get(chain);
                if (Object.entries(network.sysProviderRpcs).length === 0 && !network.sysProviderRpcs[chain]) {
                    const provider = await network.getFastestProviderByChain(chain);
                    const chillSwapContract = new ethers.Contract(currentNetWork.deTrade, abis.chillSwapABI, provider);
                    const balanceAll = await chillSwapContract.callStatic.getTokensBalance(accountAddress, tokens);
                    return balanceAll.map((bl) => bl.toString());
                }
                else {
                    const profun = network.sysProviderRpcs[chain].map((v) => {
                        const chillSwapContract = new ethers.Contract(currentNetWork.deTrade, abis.chillSwapABI, v);
                        return chillSwapContract.callStatic
                            .getTokensBalance(accountAddress, tokens)
                            .then((res) => {
                            if (res.length > 0) {
                                Promise.resolve(res);
                                return res;
                            }
                            else {
                                return Promise.reject([]);
                            }
                        })
                            .catch((error) => {
                            return Promise.reject(error);
                        });
                    });
                    const balanceAll = await Promise.any(profun);
                    if (balanceAll.error) {
                        throw new Error(balanceAll.error);
                    }
                    return balanceAll.map((bl) => bl.toString());
                }
            }
            catch (error) {
                console.log('getBalanceMultiple error', error);
                return tokens.map(() => '0');
            }
        },
        getNetWorkFees: async (gasLimit) => {
            const currentNetwork = network.get();
            const unit = currentNetwork.tokens[0].symbol;
            const baseFee = await getBaseFeePerGas(network);
            let gasFeeETH = '';
            let gasPriceWei = '0';
            if (baseFee === '0') {
                const gasresult = await getUseGasPrice(network, gasLimit);
                gasFeeETH = gasresult.gasFeeETH;
                gasPriceWei = gasresult.gasPriceWei;
            }
            const getTotalGasFee = (baseFee, rate) => {
                if (baseFee === '0') {
                    return { value: parseFloat(gasFeeETH) * rate, maxFeePerGas: BigNumber.from(0), maxPriorityFeePerGas: BigNumber.from(0) };
                }
                const maxPriorityFeePerGas = ethers.utils.parseUnits(((Number(baseFee) / 10 ** 9) * rate).toFixed(4), 'gwei');
                const maxFeePerGas = BigNumber.from(baseFee)
                    .add(maxPriorityFeePerGas)
                    .mul(BigNumber.from(Math.floor(networkWeight * 100).toString()))
                    .div('100');
                const totalGasFee = currentNetwork.chain === 'ETH' ? maxFeePerGas.mul(gasLimit) : maxFeePerGas.mul(gasLimit).mul(BigNumber.from((150).toString())).div('100');
                return {
                    value: Number(ethers.utils.formatEther(totalGasFee)),
                    maxFeePerGas: maxFeePerGas.toString(),
                    maxPriorityFeePerGas: maxPriorityFeePerGas.toString()
                };
            };
            const getGasPrice = (baseFee, gasPriceWei, rate) => {
                if (baseFee.toString() === '0') {
                    return String(Math.floor(parseFloat(gasPriceWei.toString()) * rate));
                }
                return '0';
            };
            const amountRate = 1;
            const currentChain = network.get();
            const networkRate = NETWORK_FEE_RATES[currentChain.chain];
            return [
                {
                    value: getTotalGasFee(baseFee, networkRate[0])['value'] * amountRate,
                    maxPriorityFeePerGas: getTotalGasFee(baseFee, networkRate[0])['maxPriorityFeePerGas'],
                    maxFeePerGas: getTotalGasFee(baseFee, networkRate[0])['maxFeePerGas'],
                    gasPrice: getGasPrice(baseFee, gasPriceWei, networkRate[0]),
                    gasLimit: gasLimit,
                    unit,
                    rate: networkRate[0]
                },
                {
                    value: getTotalGasFee(baseFee, networkRate[1])['value'] * amountRate,
                    maxPriorityFeePerGas: getTotalGasFee(baseFee, networkRate[1])['maxPriorityFeePerGas'],
                    maxFeePerGas: getTotalGasFee(baseFee, networkRate[1])['maxFeePerGas'],
                    gasPrice: getGasPrice(baseFee, gasPriceWei, networkRate[1]),
                    gasLimit: gasLimit,
                    unit,
                    rate: networkRate[1]
                },
                {
                    value: getTotalGasFee(baseFee, networkRate[2])['value'] * amountRate,
                    maxPriorityFeePerGas: getTotalGasFee(baseFee, networkRate[2])['maxPriorityFeePerGas'],
                    maxFeePerGas: getTotalGasFee(baseFee, networkRate[2])['maxFeePerGas'],
                    gasPrice: getGasPrice(baseFee, gasPriceWei, networkRate[2]),
                    gasLimit: gasLimit,
                    unit,
                    rate: networkRate[2]
                }
            ];
        },
        getAllowance: async (tokenAddress, accountAddress, authorizedAddress) => {
            if (tokenAddress.toLowerCase() === mTokenAddress.toLowerCase()) {
                return ethers.constants.MaxUint256.toNumber();
            }
            const currentNetWork = network.get();
            const profun = network.sysProviderRpcs[currentNetWork.chain].map((v) => {
                const Brc20TokenContract = new ethers.Contract(tokenAddress, abis.tokenABI, v);
                return Brc20TokenContract.allowance(accountAddress, authorizedAddress)
                    .then((res) => {
                    return res;
                })
                    .catch((err) => {
                    return Promise.reject(err);
                });
            });
            const allowance = await Promise.any(profun);
            if (allowance.error) {
                throw new Error(allowance.error);
            }
            return allowance;
        },
        toApprove: async (tokenAddress, accountAddress, authorizedAddress, amountToApprove) => {
            try {
                const currentNetWork = network.get();
                const amount = amountToApprove || ethers.constants.MaxUint256;
                const ownerKey = await wallet.ownerKey(accountAddress);
                const profun = network.sysProviderRpcs[currentNetWork.chain].map((v) => {
                    const Brc20TokenContract = new ethers.Contract(tokenAddress, abis.tokenABI, v);
                    const walletProvider = new ethers.Wallet(ownerKey, v);
                    const tokenWithSigner = Brc20TokenContract.connect(walletProvider);
                    return tokenWithSigner
                        .approve(authorizedAddress, amount)
                        .then((res) => {
                        return res;
                    })
                        .catch((error) => {
                        return Promise.reject(error);
                    });
                });
                const tx = await Promise.any(profun);
                console.log('Approve tx:', tx);
                if (tx.error) {
                    throw new Error(tx.error);
                }
                await tx.wait();
                return true;
            }
            catch (error) {
                console.error('Approval failed:', error);
                throw new Error(error.message || 'Approval failed');
            }
        },
        getSendEstimateGas: async (sendParams) => {
            const { from, to, amount, tokenAddress } = sendParams;
            const defaultLimit = {
                gasLimit: 21000
            };
            const currentNetWork = network.get();
            if (tokenAddress && tokenAddress !== currentNetWork.tokens[0].address) {
                const profun = network.sysProviderRpcs[currentNetWork.chain].map((v) => {
                    const tokenContract = new ethers.Contract(tokenAddress, abis.tokenABI, v);
                    const txData = tokenContract.interface.encodeFunctionData('transfer', [to, amount]);
                    const transaction = {
                        to: tokenAddress,
                        data: txData,
                        from
                    };
                    return v
                        .estimateGas(transaction)
                        .then((res) => {
                        return res;
                    })
                        .catch((error) => {
                        return Promise.reject(error);
                    });
                });
                const gasEstimate = await Promise.any(profun);
                if (gasEstimate.error) {
                    throw new Error(gasEstimate.error);
                }
                return {
                    gasLimit: Math.floor(gasEstimate.toNumber() * 1.01)
                };
            }
            else {
                return defaultLimit;
            }
        },
        getSendFees: async (networkFee) => {
            const { value } = networkFee;
            return value;
        },
        sendTransaction: async (sendParams) => {
            const { from, to, amount, tokenAddress, currentNetWorkFee } = sendParams;
            console.time('sendTransaction');
            const { gasLimit, maxPriorityFeePerGas, maxFeePerGas, gasPrice } = currentNetWorkFee;
            const currentChain = network.get();
            const ownerKey = await wallet.ownerKey(from);
            const provider = await network.getFastestProviderByChain(currentChain.chain);
            const walletProvider = new ethers.Wallet(ownerKey, provider);
            let params = {};
            const upLimit = Math.floor(gasLimit);
            if (gasPrice === '0') {
                params = {
                    gasLimit: upLimit,
                    type: 2,
                    maxPriorityFeePerGas,
                    maxFeePerGas
                };
            }
            else {
                params = {
                    gasLimit: upLimit,
                    gasPrice
                };
            }
            if (tokenAddress && tokenAddress !== currentChain.tokens[0].address) {
                const contract = new ethers.Contract(tokenAddress, abis.tokenABI, walletProvider);
                const txData = contract.interface.encodeFunctionData('transfer', [to, amount]);
                const transaction = {
                    to: tokenAddress,
                    data: txData
                };
                const response = await walletProvider.sendTransaction({
                    ...transaction,
                    ...params
                });
                console.timeEnd('sendTransaction');
                return { error: null, result: response };
            }
            else {
                const transaction = {
                    to,
                    value: amount
                };
                const response = await walletProvider.sendTransaction({
                    ...transaction,
                    ...params
                });
                console.timeEnd('sendTransaction');
                return { error: null, result: response };
            }
        },
        getSwapPath: async (currentSymbol) => {
            if (parseFloat(currentSymbol?.amountIn.toString()) <= 0) {
                throw new Error('amountIn must be greater than 0');
            }
            const currentNetWork = network.get();
            let inAddress = currentSymbol.in.address;
            let outAddress = currentSymbol.out.address;
            if (currentSymbol.in.address.toLowerCase() === mTokenAddress.toLowerCase()) {
                inAddress = currentNetWork.tokens[1].address;
            }
            if (currentSymbol.out.address.toLowerCase() === mTokenAddress.toLowerCase()) {
                outAddress = currentNetWork.tokens[1].address;
            }
            const profun = network.sysProviderRpcs[currentNetWork.chain].map((v) => {
                const chillSwapContract = new ethers.Contract(currentNetWork.deTrade, abis.chillSwapABI, v);
                return chillSwapContract.callStatic
                    .getOptimalPath(inAddress, currentSymbol.amountIn, outAddress)
                    .then((res) => {
                    return res;
                })
                    .catch((error) => {
                    return Promise.reject(error);
                });
            });
            const path = await Promise.any(profun);
            if (path.error) {
                throw new Error(path.error);
            }
            if (path?.length === 2) {
                const data = path[0];
                let authorizationTarget = '';
                if (data?.length === 84) {
                    authorizationTarget = data.substring(0, 42);
                }
                return {
                    fullAmoutOut: path[1],
                    data: path[0],
                    authorizationTarget
                };
            }
            throw new Error('getSwapPath Error');
        },
        getSwapEstimateGas: async (currentSymbol, path, accountAddress) => {
            const ownerKey = await wallet.ownerKey(accountAddress);
            const currentNetWork = network.get();
            const { amountIn, amountOutMin } = currentSymbol;
            const { action, value } = actionNameAndValue(currentSymbol.in.address, currentSymbol.out.address, amountIn);
            const iface = new ethers.utils.Interface(abiInFun[action]);
            const data = iface.encodeFunctionData(action, [amountIn, amountOutMin, path.data, currentSymbol.signature, currentSymbol.contents]);
            const defaultParams = {
                chainId: currentNetWork.chainID,
                from: accountAddress,
                to: currentNetWork.deTrade,
                value,
                data
            };
            const params = defaultParams;
            const profunGetLimit = network.sysProviderRpcs[currentNetWork.chain].map((v) => {
                const walletProvider = new ethers.Wallet(ownerKey, v);
                return walletProvider
                    .estimateGas(params)
                    .then((res) => {
                    return res;
                })
                    .catch((error) => {
                    return Promise.reject(error);
                });
            });
            const getLimit = await Promise.any(profunGetLimit);
            if (getLimit.error) {
                throw new Error(getLimit.error);
            }
            if (getLimit) {
                const result = {
                    data,
                    path,
                    gasLimit: Math.floor(getLimit.toNumber() * 1)
                };
                return result;
            }
            throw new Error('GetLimit Error');
        },
        getSwapFees: async (currentSymbol) => {
            const { networkFee, dexFeeAmount } = currentSymbol;
            if (networkFee) {
                return networkFee.value + Number(dexFeeAmount) / Math.pow(10, currentSymbol.isBuy ? currentSymbol.in.decimals : currentSymbol.out.decimals);
            }
            return 0;
        },
        swap: async (currentSymbol, transaction, accountAddress) => {
            const currentNetWork = network.get();
            const provider = await network.getClipProviderByChain(currentNetWork.chain);
            const { gasLimit, data } = transaction;
            const ownerKey = await wallet.ownerKey(accountAddress);
            const walletProvider = new ethers.Wallet(ownerKey, provider);
            const { amountIn, networkFee } = currentSymbol;
            const { value } = actionNameAndValue(currentSymbol.in.address, currentSymbol.out.address, amountIn);
            const defaultParams = {
                chainId: currentNetWork.chainID,
                from: accountAddress,
                to: currentNetWork.deTrade,
                value,
                data
            };
            const gasPrice = networkFee?.gasPrice;
            let params = {};
            if (gasPrice && gasPrice !== '0') {
                params = { ...defaultParams, gasPrice: gasPrice };
            }
            else {
                params = {
                    ...defaultParams,
                    maxFeePerGas: networkFee?.maxFeePerGas,
                    maxPriorityFeePerGas: networkFee?.maxPriorityFeePerGas,
                    type: 2
                };
            }
            const sendParams = {
                ...params,
                gasLimit: Math.floor(gasLimit * 1.05)
            };
            const submitResult = await walletProvider.sendTransaction(sendParams);
            console.timeEnd('tradeTimer');
            return { error: !submitResult.hash, result: { hash: submitResult.hash, data: { accountAddress, currentSymbol } } };
        },
        hashStatus: async (hash, chain) => {
            let chainName = chain;
            if (typeof chain === 'number') {
                chainName = network.getChainNameByChainId(chain);
            }
            const profun = network.sysProviderRpcs[chainName].map((v) => {
                return v
                    .getTransaction(hash)
                    .then((res) => {
                    if (res && res.hash) {
                        return res;
                    }
                    return Promise.reject('error hash');
                })
                    .catch((error) => {
                    return Promise.reject(error);
                });
            });
            const statusResult = await Promise.any(profun);
            console.log('statusResult===>', statusResult);
            if (statusResult?.confirmations >= 2) {
                return { status: 'Confirmed' };
            }
            return { status: 'Pending' };
        }
    };
};
