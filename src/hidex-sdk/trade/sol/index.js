import { PublicKey, SystemProgram } from '@solana/web3.js';
import { smTokenAddress } from '../../common/config';
import { getTokenOwner, sendSolanaTransaction, vertransactionsToBase64 } from './utils';
import { AccountLayout, ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { simulateConfig, TOKEN_2022_OWNER } from './config';
import { priorityFeeInstruction } from './instruction/InstructionCreator';
import defiApi from './defiApi';
import UtilsService from '../../utils/UtilsService';
import { compileTransaction, getClainSignature, getTransactionsSignature, isInstructionsSupportReset, resetInstructions } from './instruction';
import { NETWORK_FEE_RATES } from '../eth/config';
import { getWithdrawSign } from '../../api/hidex';
import { setStatistics } from '../../utils/timeStatistics';
const utils = new UtilsService();
export const solService = (HS) => {
    const { network, wallet } = HS;
    const getBalance = async (accountAddress, tokenAddress = '', isAta = false) => {
        const currentNetwork = network.get(102);
        try {
            if ((tokenAddress && tokenAddress === smTokenAddress) || !tokenAddress || isAta) {
                const pk = !isAta ? new PublicKey(accountAddress) : new PublicKey(tokenAddress);
                const balanceProm = network.sysProviderRpcs[currentNetwork.chain].map((v) => v
                    .getBalance(pk)
                    .then((res) => {
                    return res;
                })
                    .catch((error) => {
                    return Promise.reject(error);
                }));
                const balance = await Promise.any(balanceProm);
                if (balance.error) {
                    return isAta ? '-1' : '0';
                }
                return balance.toString();
            }
            const apk = new PublicKey(accountAddress);
            const tpk = new PublicKey(tokenAddress);
            const connection = await network.getProviderByChain(102);
            const tokenOwnerAddress = await getTokenOwner(tokenAddress, connection);
            let userAta = await getAssociatedTokenAddress(tpk, apk, false);
            if (tokenOwnerAddress === TOKEN_2022_OWNER) {
                userAta = await getAssociatedTokenAddress(tpk, apk, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
            }
            const tokenBalanceProm = network.sysProviderRpcs[currentNetwork.chain].map((v) => v
                .getTokenAccountBalance(userAta)
                .then((res) => {
                return res;
            })
                .catch((error) => {
                return Promise.reject(error);
            }));
            const tokenBalance = await Promise.any(tokenBalanceProm);
            if (tokenBalance.error) {
                return isAta ? '-1' : '0';
            }
            return tokenBalance.value.amount;
        }
        catch (error) {
            console.error(error);
            return isAta ? '-1' : '0';
        }
    };
    return {
        getBalance,
        getBalanceMultiple: async (chain, accountAddress, tokens) => {
            const tokensAta = tokens.map((token) => token.toLowerCase() === smTokenAddress.toLowerCase()
                ? new PublicKey(accountAddress)
                : getAssociatedTokenAddress(new PublicKey(token), new PublicKey(accountAddress), false, TOKEN_PROGRAM_ID));
            const tokensAta_p = await Promise.all(tokensAta);
            const resultProm = network.sysProviderRpcs[chain].map((v) => v
                .getMultipleAccountsInfo(tokensAta_p)
                .then((res) => {
                return res;
            })
                .catch((error) => {
                return Promise.reject(error);
            }));
            const result = await Promise.any(resultProm);
            const balances = [];
            result.forEach((v) => {
                if (!v) {
                    balances.push('0');
                }
                else if (v.data && v.data.length) {
                    const accountData = AccountLayout.decode(v.data);
                    balances.push(accountData.amount.toString());
                }
                else {
                    balances.push(v.lamports.toString());
                }
            });
            return balances;
        },
        getNetWorkFees: async (gasLimit, tradeType) => {
            const networkFees = [];
            const gasPrice = 0.000005;
            let netVal = tradeType !== 3 ? 0.0055 : 0.003;
            let networkRate = tradeType !== 3 ? NETWORK_FEE_RATES['SOLANA_JITO'] : NETWORK_FEE_RATES['SOLANA'];
            if (tradeType === 10) {
                netVal = 0.00001;
                networkRate = NETWORK_FEE_RATES['SOLANA_SEND'];
            }
            for (let i = 0; i < networkRate.length; i++) {
                networkFees.push({
                    value: Number((netVal * networkRate[i]).toFixed(5)),
                    unit: 'SOL',
                    gasLimit,
                    gasPrice: gasPrice.toString(),
                    rate: networkRate[i]
                });
            }
            return networkFees;
        },
        getAllowance: async () => {
            return 10000;
        },
        toApprove: async () => {
            return true;
        },
        getSendEstimateGas: async () => {
            return { gasLimit: 100000 };
        },
        getSendFees: async (networkFee, toAddress, tokenAddress) => {
            const netFee = networkFee.value;
            const dexFee = 0;
            const priorityFee = 10000 / Math.pow(10, 9);
            let ataCreateFee = 0;
            const balanceWsol = await getBalance(toAddress, tokenAddress);
            if (Number(balanceWsol) === 0) {
                ataCreateFee = 2039280 / Math.pow(10, 9);
            }
            const accountSave = 890880 / Math.pow(10, 9);
            return netFee + dexFee + accountSave + priorityFee + ataCreateFee;
        },
        sendTransaction: async (sendParams) => {
            const { from, to, amount, tokenAddress, currentNetWorkFee } = sendParams;
            try {
                const ownerKey = await wallet.ownerKey(from);
                const senderKeypair = utils.ownerKeypair(ownerKey);
                const senderPublicKey = senderKeypair.publicKey;
                const receiverPublicKey = new PublicKey(to);
                const instructions = [];
                const connection = await network.getFastestProviderByChain(102);
                if (!tokenAddress || tokenAddress.toLowerCase() === smTokenAddress.toLowerCase()) {
                    instructions.push(SystemProgram.transfer({
                        fromPubkey: senderPublicKey,
                        toPubkey: receiverPublicKey,
                        lamports: BigInt(amount)
                    }));
                }
                else {
                    const tokenMintAddress = new PublicKey(tokenAddress);
                    const tokenOwnerAddress = await getTokenOwner(tokenAddress, connection);
                    const is2022 = tokenOwnerAddress === TOKEN_2022_OWNER;
                    const fromTokenAta = await getAssociatedTokenAddress(tokenMintAddress, senderPublicKey, false, is2022 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
                    const toTokenAta = await getAssociatedTokenAddress(tokenMintAddress, receiverPublicKey, false, is2022 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
                    const toTokenAtaInfo = await connection.getAccountInfo(toTokenAta);
                    if (toTokenAtaInfo == null || toTokenAtaInfo.data.length == 0) {
                        instructions.push(createAssociatedTokenAccountInstruction(senderPublicKey, toTokenAta, receiverPublicKey, tokenMintAddress, is2022 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID));
                    }
                    instructions.push(createTransferInstruction(fromTokenAta, toTokenAta, senderPublicKey, BigInt(amount), [], is2022 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID));
                }
                const insPriority = await priorityFeeInstruction(200000, currentNetWorkFee.value);
                instructions.unshift(...insPriority);
                const { blockhash } = await connection.getLatestBlockhash();
                const result = await sendSolanaTransaction(connection, senderKeypair, instructions, blockhash);
                console.timeEnd('sendTransaction');
                return { error: null, result: { hash: result, message: 'SUCCESS' } };
            }
            catch (error) {
                return {
                    error,
                    result: null
                };
            }
        },
        getSwapPath: async (currentSymbol) => {
            if (parseFloat(currentSymbol.amountIn) <= 0) {
                throw new Error('amountIn must be greater than 0');
            }
            let outAmount = 0;
            if (currentSymbol.isBuy && currentSymbol.currentPrice) {
                const amountInUSD = (Number(currentSymbol.amountIn) / Math.pow(10, currentSymbol.in.decimals)) * currentSymbol.cryptoPriceUSD;
                outAmount = Math.floor((amountInUSD / Number(currentSymbol.currentPrice)) * Math.pow(10, currentSymbol.out.decimals));
            }
            if (!currentSymbol.isBuy && currentSymbol.currentPrice) {
                outAmount = Math.floor((((Number(currentSymbol.amountIn) / Math.pow(10, currentSymbol.in.decimals)) * currentSymbol.currentPrice) / currentSymbol.cryptoPriceUSD) *
                    Math.pow(10, currentSymbol.out.decimals));
            }
            return {
                fullAmoutOut: BigInt(outAmount).toString(),
                data: null
            };
        },
        getSwapEstimateGas: async (currentSymbol, path, accountAddress) => {
            const { compile, amountOutMin, amountIn } = currentSymbol;
            let compileUse = compile;
            let resetResult = null;
            let txArray = [];
            console.time('getOwnerKeyTimer');
            const owner = HS.utils.ownerKeypair(await wallet.ownerKey(accountAddress));
            console.timeEnd('getOwnerKeyTimer');
            console.log('------------isCompileUseTimer------------------', !!compileUse);
            if (compileUse) {
                const isSupport = isInstructionsSupportReset(compileUse['message'], currentSymbol);
                console.log('------------isSupportTimer------------------', isSupport);
                if (isSupport) {
                    console.time('SupportTrueTimer');
                    resetResult = resetInstructions(currentSymbol, compileUse['message'], BigInt(amountIn), BigInt(amountOutMin));
                    txArray = await getTransactionsSignature(resetResult, compileUse['addressesLookup'], defiApi.lastBlockHash.blockhash, currentSymbol, owner, HS);
                    console.timeEnd('SupportTrueTimer');
                }
            }
            if (txArray.length === 0) {
                console.time('AgainRouterTimer');
                setStatistics({ timerKey: 'SwapRoute', isBegin: true });
                const { success, swapTransaction, data } = await defiApi.swapRoute(currentSymbol, accountAddress);
                setStatistics({ timerKey: 'SwapRoute', isBegin: false });
                if (!success) {
                    throw new Error('Failed to swap' + path);
                }
                setStatistics({ timerKey: 'CompileTransaction', isBegin: true });
                compileUse = await compileTransaction(swapTransaction, HS);
                currentSymbol.preAmountIn = data.inAmount;
                currentSymbol.preAmountOut = data.otherAmountThreshold;
                let isSupport = false;
                if (!currentSymbol.compile) {
                    isSupport = isInstructionsSupportReset(compileUse['message'], currentSymbol);
                }
                if (isSupport) {
                    resetResult = resetInstructions(currentSymbol, compileUse['message'], BigInt(amountIn), BigInt(amountOutMin));
                }
                else {
                    resetResult = compileUse['message'];
                }
                txArray = await getTransactionsSignature(resetResult, compileUse['addressesLookup'], defiApi.lastBlockHash.blockhash, currentSymbol, owner, HS);
                setStatistics({ timerKey: 'CompileTransaction', isBegin: false });
                console.timeEnd('AgainRouterTimer');
            }
            if (txArray.length === 0) {
                throw new Error('Failed to swap txArray is empty');
            }
            console.log('txArray: ===>', txArray);
            return {
                gasLimit: 0,
                data: {
                    vertransactions: txArray
                }
            };
        },
        getSwapFees: async (currentSymbol) => {
            const { networkFee } = currentSymbol;
            const netFee = 0.00002;
            const dexFee = 0.0012;
            const mitToken = (2139280 * 2) / Math.pow(10, 9);
            const accountSave = 890880 / Math.pow(10, 9);
            const priorityFee = networkFee?.value || Number(currentSymbol.priorityFee) / Math.pow(10, 9);
            return netFee + dexFee + mitToken + accountSave + priorityFee;
        },
        swap: async (currentSymbol, transaction, accountAddress) => {
            setStatistics({ timerKey: 'SubmitSwap', isBegin: true });
            const { vertransactions } = transaction?.data;
            let submitResult = null;
            if (currentSymbol.tradeType === 3 && vertransactions.length === 1) {
                submitResult = await defiApi.submitSwapFastByBlox(currentSymbol, vertransactions[0]);
            }
            else {
                submitResult = await defiApi.submitSwapByBlox(vertransactions);
            }
            setStatistics({ timerKey: 'SubmitSwap', isBegin: false });
            return {
                error: !submitResult.success,
                result: { hash: submitResult.hash, data: { vertransactions: vertransactionsToBase64(vertransactions), accountAddress, currentSymbol, ...submitResult } }
            };
        },
        hashStatus: async (hash, chainId) => {
            try {
                const connection = network.getProviderByChain(chainId || 102);
                const gmgnStatusPro = () => defiApi.getSwapStatus(hash);
                const rpcHeliuPro = () => defiApi.rpcHeliusSwapStatus(hash);
                const rpcStatusPro = () => defiApi.rpcSwapStatus(hash, connection);
                const status = await Promise.any([gmgnStatusPro(), rpcStatusPro(), rpcHeliuPro()]);
                console.log('SOL状态查询===》', ['GMGN', 'RPC'], status);
                let message = 'HashStatus...';
                if (status === 'Failed') {
                    const hashStatus = await connection.getParsedTransaction(hash, {
                        commitment: 'confirmed',
                        maxSupportedTransactionVersion: 0
                    });
                    console.log('SOL 链上状态查询 confirmation===', hashStatus);
                    if (hashStatus) {
                        const { meta } = hashStatus || {};
                        if (meta && meta?.err) {
                            message = meta.logMessages?.toString() || 'Unknown error';
                        }
                    }
                }
                return { status, message };
            }
            catch (error) {
                return { status: 'Pending', message: 'HashStatus Pending' };
            }
        },
        claimCommission: async (params) => {
            try {
                const withdrawRes = await getWithdrawSign(params);
                console.log('withdrawRes', params, withdrawRes);
                if (withdrawRes.code === 200 && withdrawRes.data) {
                    const connection = network.getProviderByChain(102);
                    const owner = HS.utils.ownerKeypair(await wallet.ownerKey(params.walletAddress));
                    const { blockhash } = defiApi.lastBlockHash;
                    const { signer, contents: contentsHex, signature: claimSignHex } = withdrawRes.data;
                    const vsTransaction = await getClainSignature(signer, contentsHex.substring(2), claimSignHex.substring(2), blockhash, owner, HS);
                    const simulateResponse = await connection.simulateTransaction(vsTransaction, simulateConfig);
                    console.log('领取 预估结果==>', simulateResponse);
                    if (simulateResponse?.value?.err) {
                        return {
                            code: 4001,
                            message: 'Claim commission error in simulateTransaction: ' + JSON.stringify(simulateResponse?.value?.logs + JSON.stringify(simulateResponse?.value?.err)),
                            data: null
                        };
                    }
                    const rawTransaction = vsTransaction.serialize();
                    const txhash = await connection.sendRawTransaction(rawTransaction, { preflightCommitment: 'confirmed' });
                    return { code: 200, message: 'Claim commission success', data: null, txhash };
                }
                return withdrawRes;
            }
            catch (error) {
                return { code: 4001, message: 'Claim commission error: ' + JSON.stringify(error), data: null };
            }
        }
    };
};
