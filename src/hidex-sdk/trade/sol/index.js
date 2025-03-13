import { PublicKey, SystemProgram } from "@solana/web3.js";
import { smTokenAddress, sTokenAddress } from "../../common/config";
import { getTokenOwner, sendSolanaTransaction } from "./utils";
import { AccountLayout, ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { ownerKeypair, TOKEN_2022_OWNER } from "./config";
import { priorityFeeInstruction } from "./instruction/InstructionCreator";
import DefiApi from "./defiApi";
export const solService = (HS) => {
    const { network, wallet } = HS;
    const defiApi = new DefiApi();
    return {
        getBalance: async (accountAddress, tokenAddress = '') => {
            const currentNetwork = network.get();
            try {
                if ((tokenAddress && (tokenAddress === smTokenAddress || tokenAddress === sTokenAddress)) || !tokenAddress) {
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
                const senderKeypair = ownerKeypair(ownerKey);
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
            if (currentSymbol.transactions?.length === 1) {
            }
            if (currentSymbol.transactions?.length === 2) {
            }
            if (currentSymbol.transactions?.length === 4) {
            }
            return {
                minOutAmount: '0',
                data: null
            };
        },
        getSwapEstimateGas: async () => {
            return {
                gasLimit: 0,
            };
        },
        getSwapFees: async (currentSymbol) => {
            const { networkFee, dexFeeAmount } = currentSymbol;
            const netFee = networkFee ? networkFee.value * 4 : 0.000024;
            const dexFee = Number(dexFeeAmount) / Math.pow(10, 9);
            const mitToken = (2139280 * 2) / Math.pow(10, 9);
            const accountSave = 890880 / Math.pow(10, 9);
            const priorityFee = Number(currentSymbol.priorityFee) / Math.pow(10, 9);
            return netFee + dexFee + mitToken + accountSave + priorityFee;
        },
        swap: async (currentSymbol) => {
            if (currentSymbol.transactions?.length === 1) {
                const result = await defiApi.submitSwap(currentSymbol, currentSymbol.transactions[0]);
                if (result.success) {
                    return { error: null, result: { hash: result.hash, message: 'SUCCESS' } };
                }
                return { error: true, result };
            }
            if (currentSymbol.transactions?.length === 2) {
            }
            if (currentSymbol.transactions?.length === 4) {
            }
            return { error: true, result: null };
        }
    };
};
