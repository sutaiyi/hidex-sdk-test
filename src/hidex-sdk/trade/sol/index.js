import { PublicKey, SystemProgram } from "@solana/web3.js";
import { smTokenAddress } from "../../common/config";
import { getTokenOwner, sendSolanaTransaction } from "./utils";
import { AccountLayout, ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { simulateConfig, TOKEN_2022_OWNER } from "./config";
import { priorityFeeInstruction } from "./instruction/InstructionCreator";
import defiApi from "./defiApi";
import UtilsService from "../../utils/UtilsService";
import { compileTransaction, getTransactionsSignature, isInstructionsSupportReset, resetInstructions } from "./instruction";
const utils = new UtilsService();
export const solService = (HS) => {
    const { network, wallet } = HS;
    return {
        getBalance: async (accountAddress, tokenAddress = '') => {
            const currentNetwork = network.get();
            try {
                if ((tokenAddress && (tokenAddress === smTokenAddress)) || !tokenAddress) {
                    const pk = new PublicKey(accountAddress);
                    const balanceProm = network.sysProviderRpcs[currentNetwork.chain].map((v) => {
                        return v.getBalance(pk).then((res) => {
                            return res;
                        }).catch((error) => {
                            return Promise.reject(error);
                        });
                    });
                    const balance = await Promise.any(balanceProm);
                    if (balance.error) {
                        return '0';
                    }
                    return balance.toString();
                }
                const apk = new PublicKey(accountAddress);
                const tpk = new PublicKey(tokenAddress);
                const connection = await network.getFastestProviderByChain(102);
                const tokenOwnerAddress = await getTokenOwner(tokenAddress, connection);
                let userAta = await getAssociatedTokenAddress(tpk, apk, false);
                if (tokenOwnerAddress === TOKEN_2022_OWNER) {
                    userAta = await getAssociatedTokenAddress(tpk, apk, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
                }
                const tokenBalanceProm = network.sysProviderRpcs[currentNetwork.chain].map((v) => {
                    return v.getTokenAccountBalance(userAta)
                        .then((res) => {
                        return res;
                    })
                        .catch((error) => {
                        return Promise.reject(error);
                    });
                });
                const tokenBalance = await Promise.any(tokenBalanceProm);
                if (tokenBalance.error) {
                    return '0';
                }
                return tokenBalance.value.amount;
            }
            catch (error) {
                return '0';
            }
        },
        getBalanceMultiple: async (chain, accountAddress, tokens) => {
            const tokensAta = tokens.map((token) => token.toLowerCase() === smTokenAddress.toLowerCase()
                ? new PublicKey(accountAddress)
                : getAssociatedTokenAddress(new PublicKey(token), new PublicKey(accountAddress), false, TOKEN_PROGRAM_ID));
            const tokensAta_p = await Promise.all(tokensAta);
            const resultProm = network.sysProviderRpcs[chain].map((v) => {
                return v
                    .getMultipleAccountsInfo(tokensAta_p)
                    .then((res) => {
                    return res;
                })
                    .catch((error) => {
                    return Promise.reject(error);
                });
            });
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
        getNetWorkFees: async (gasLimit) => {
            const gasPrice = 0.000005;
            return [
                {
                    value: gasPrice,
                    unit: 'SOL',
                    gasLimit,
                    gasPrice: gasPrice.toString(),
                    rate: 1,
                },
            ];
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
        getSendFees: async (networkFee) => {
            const netFee = networkFee.value;
            const dexFee = 0;
            const accountSave = 890880 / Math.pow(10, 9);
            return netFee + dexFee + accountSave;
        },
        sendTransaction: async (sendParams) => {
            const { from, to, amount, tokenAddress } = sendParams;
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
                        lamports: BigInt(amount),
                    }));
                }
                else {
                    const tokenMintAddress = new PublicKey(tokenAddress);
                    const tokenOwnerAddress = await getTokenOwner(tokenAddress, connection);
                    console.log('tokenOwnerAddress', tokenOwnerAddress);
                    const is2022 = tokenOwnerAddress === TOKEN_2022_OWNER;
                    const fromTokenAta = await getAssociatedTokenAddress(tokenMintAddress, senderPublicKey, false, is2022 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
                    const toTokenAta = await getAssociatedTokenAddress(tokenMintAddress, receiverPublicKey, false, is2022 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
                    const toTokenAtaInfo = await connection.getAccountInfo(toTokenAta);
                    console.log('=====> ToTokenAtaInfo', toTokenAtaInfo);
                    if (toTokenAtaInfo == null || toTokenAtaInfo.data.length == 0) {
                        console.log('=====> 创建接收地址');
                        instructions.push(createAssociatedTokenAccountInstruction(senderPublicKey, toTokenAta, receiverPublicKey, tokenMintAddress, is2022 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID));
                    }
                    instructions.push(createTransferInstruction(fromTokenAta, toTokenAta, senderPublicKey, BigInt(amount), [], is2022 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID));
                }
                const insPriority = await priorityFeeInstruction(200000, 0.0002);
                instructions.unshift(...insPriority);
                const { blockhash } = await connection.getLatestBlockhash();
                const result = await sendSolanaTransaction(connection, senderKeypair, instructions, blockhash);
                console.timeEnd('sendTransaction');
                return { error: null, result: { hash: result, message: 'SUCCESS' } };
            }
            catch (error) {
                return {
                    error,
                    result: null,
                };
            }
        },
        getSwapPath: async (currentSymbol) => {
            let minOutAmount = '0';
            if (currentSymbol.isBuy && currentSymbol.currentPrice) {
                const amountInUSD = Number(currentSymbol.amountIn) * currentSymbol.cryptoPriceUSD;
                minOutAmount = (Math.floor(amountInUSD / Number(currentSymbol.currentPrice) * Math.pow(10, currentSymbol.out.decimals))).toString();
            }
            if (!currentSymbol.isBuy && currentSymbol.currentPrice) {
                minOutAmount = (Math.floor(Number(currentSymbol.amountIn) * Number(currentSymbol.currentPrice) / currentSymbol.cryptoPriceUSD * Math.pow(10, currentSymbol.in.decimals))).toString();
            }
            return {
                minOutAmount,
                data: null
            };
        },
        getSwapEstimateGas: async (currentSymbol, path, accountAddress) => {
            const { compile, amountOutMin, amountIn } = currentSymbol;
            let compileUse = compile;
            let resetResult = null;
            let txArray = [];
            const owner = HS.utils.ownerKeypair(await wallet.ownerKey(accountAddress));
            console.log('compileUse', compileUse);
            if (compileUse) {
                const isSupport = isInstructionsSupportReset(compileUse['message']);
                if (isSupport) {
                    resetResult = resetInstructions(currentSymbol, compileUse['message'], BigInt(amountIn), BigInt(amountOutMin));
                    txArray = await getTransactionsSignature(resetResult, compileUse['addressesLookup'], defiApi.lastBlockHash.blockhash, currentSymbol, owner, HS);
                }
            }
            if (txArray.length === 0) {
                const { success, swapTransaction } = await defiApi.swapRoute(currentSymbol, accountAddress);
                if (!success) {
                    throw new Error('Failed to swap' + path);
                }
                compileUse = await compileTransaction(swapTransaction, HS);
                const isSupport = isInstructionsSupportReset(compileUse['message']);
                if (isSupport) {
                    resetResult = resetInstructions(currentSymbol, compileUse['message'], BigInt(amountIn), BigInt(amountOutMin));
                }
                else {
                    resetResult = compileUse['message'];
                }
                txArray = await getTransactionsSignature(resetResult, compileUse['addressesLookup'], defiApi.lastBlockHash.blockhash, currentSymbol, owner, HS);
            }
            console.log('txArray: ===>', txArray);
            return {
                gasLimit: 0,
                data: {
                    vertransactions: txArray,
                }
            };
        },
        getSwapFees: async (currentSymbol) => {
            const { networkFee, dexFeeAmount } = currentSymbol;
            const netFee = networkFee ? networkFee.value * (currentSymbol.tradeType === 0 ? 4 : 2) : 0.000024;
            const dexFee = Number(dexFeeAmount) / Math.pow(10, 9);
            const mitToken = (2139280 * 2) / Math.pow(10, 9);
            const accountSave = 890880 / Math.pow(10, 9);
            const priorityFee = Number(currentSymbol.priorityFee) / Math.pow(10, 9);
            return netFee + dexFee + mitToken + accountSave + priorityFee;
        },
        swap: async (currentSymbol, transaction) => {
            const { vertransactions } = transaction?.data;
            let submitPro = null;
            if (vertransactions?.length >= 4) {
                submitPro = defiApi.submitSwapByJito(vertransactions.splice(0, 4));
            }
            else {
                submitPro = defiApi.submitSwap(currentSymbol, vertransactions[0]);
            }
            const connection = await network.getProviderByChain(102);
            const vertransaction = vertransactions.length === 5 ? vertransactions[4] : vertransactions[0];
            const simulateResponsePro = connection.simulateTransaction(vertransaction, simulateConfig);
            const [submitResult, simulateResponse] = await Promise.all([submitPro, simulateResponsePro]);
            console.log('交易 - 预估', simulateResponse);
            if (simulateResponse && simulateResponse?.value?.err) {
                throw new Error(JSON.stringify(simulateResponse.value.logs));
            }
            return { error: !submitResult.success, result: { hash: submitResult.hash, vertransactions } };
        },
        hashStatus: async (hash) => {
            const status = await defiApi.getSwapStatus(hash);
            return { status };
        }
    };
};
