import { useSignMessage, useSendTransaction, ConnectedSolanaWallet, ConnectedWallet } from '@privy-io/react-auth';
import { useSendTransaction as useSolanaSendTransaction, useSignTransaction } from '@privy-io/react-auth/solana';
import { Connection, Transaction, VersionedTransaction, PublicKey, SystemProgram, TransactionMessage } from '@solana/web3.js';
import bs58 from 'bs58';
import { ethers } from 'ethers';
import { HidexSDK } from '@/hidexService';

export function usePrivyTest() {
  const { network } = HidexSDK;

  const { signMessage } = useSignMessage();
  const { sendTransaction } = useSendTransaction();
  const { signTransaction } = useSignTransaction();
  const { sendTransaction: solanaSendTransaction } = useSolanaSendTransaction();

  const handleSendTransaction = async ({
    to,
    value,
    activeWallet,
  }: {
    to: string;
    value: string; // 单位: ETH
    activeWallet: any;
  }) => {
    try {
      console.log(activeWallet);
      // 1. 获取 signer（EIP-1193 provider）
      const ethersProvider = await activeWallet.getEthereumProvider();
      console.log('ethersProvider', ethersProvider);
      const provider = await activeWallet.getProvider();
      console.log('provider', provider);
      const signer = ethersProvider.getSigner();
      // 2. 发起转账
      const tx = await signer.sendTransaction({
        to, // 接收方地址
        value: ethers.utils.parseEther('0.01'), // 转账金额
      });
      await tx.wait(); // 等待交易确认（可选）
    } catch (err: any) {
      console.log('执行失败' + err);
      throw err;
    }
  };

  const handleSolanaSignMessage = async (activeWallet: ConnectedSolanaWallet | ConnectedWallet) => {
    const message = 'Hello world';
    const signatureUint8Array = await signMessage(
      {
        message, // new TextEncoder().encode(message),
        // Optional: Specify the wallet to use for signing. If not provided, the first wallet will be used.
      },
      {
        address: activeWallet.address,
      }
    );
    const signature = bs58.encode(signatureUint8Array);
    console.log('signature', signature);
  };
  const handleEthSignMessage = async (activeWallet: ConnectedSolanaWallet | ConnectedWallet) => {
    const uiOptions = {
      title: 'You are voting for foobar project',
    };
    const { signature } = await signMessage({ message: 'I hereby vote for foobar' }, { uiOptions, address: activeWallet.address });
    console.log('signature', signature);
  };
  const handleEthSendTransaction = async ({
    to,
    value,
    activeWallet,
  }: {
    to: string;
    value: string; // 单位: ETH
    activeWallet: ConnectedSolanaWallet | ConnectedWallet;
  }) => {
    sendTransaction(
      {
        from: activeWallet.address,
        to: '0xE3070d3e4309afA3bC9a6b057685743CF42da77C',
        value: 100000,
      },
      {
        address: activeWallet.address,
      }
    );
  };
  const handleSolanaSendTransaction = async ({
    to,
    value,
    activeWallet,
  }: {
    to: string;
    value: string; // 单位: ETH
    activeWallet: any;
  }) => {
    // Configure your connection to point to the correct Solana network
    const connection = network.getProviderByChain('SOLANA') as Connection;

    // Create your transaction (either legacy Transaction or VersionedTransaction)
    const transaction = new Transaction(); // or new VersionedTransaction()

    // Build and add your instructions to the transaction...
    const transferInstruction = SystemProgram.transfer({
      fromPubkey: new PublicKey(activeWallet.address), // Replace with the sender's address
      toPubkey: new PublicKey(to), // Replace with the recipient's address
      lamports: BigInt(value), // Amount in lamports (1 SOL = 1,000,000,000 lamports)
    });
    transaction.add(transferInstruction);

    const latestBlockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = latestBlockhash.blockhash; // Replace with the latest blockhash

    // Set your address as the fee payer
    transaction.feePayer = new PublicKey(activeWallet.address); // Set fee payer

    // Send the transaction
    const receipt = await solanaSendTransaction({
      transaction: transaction,
      connection: connection,
    });

    console.log('Transaction sent with signature:', receipt.signature);
  };
  const handleSignSolanaTransaction = async ({ to, value, activeWallet }: { to: string; value: string; activeWallet: ConnectedSolanaWallet | ConnectedWallet }) => {
    try {
      const connection = network.getProviderByChain('SOLANA') as Connection;
      const accountPublic = new PublicKey(activeWallet.address);
      const toAccountPublic = new PublicKey(to);
      const latestBlockhash = await connection.getLatestBlockhash();
      const txFeeMessage = new TransactionMessage({
        payerKey: accountPublic,
        recentBlockhash: latestBlockhash.blockhash,
        instructions: [
          SystemProgram.transfer({
            fromPubkey: accountPublic,
            toPubkey: toAccountPublic,
            lamports: BigInt(value),
          }),
        ],
      }).compileToV0Message();

      const vTransaction = new VersionedTransaction(txFeeMessage);
      vTransaction.message.recentBlockhash = latestBlockhash.blockhash;

      const signedTransaction = await signTransaction({
        transaction: vTransaction,
        connection: connection,
        address: activeWallet.address,
        uiOptions: {
          showWalletUIs: false,
        },
      });

      console.log('Transaction signed successfully', signedTransaction);
    } catch (err: any) {
      console.log('执行失败' + err);
      throw err;
    }
  };

  return {
    handleSolanaSendTransaction,
    handleEthSendTransaction,
    handleEthSignMessage,
    handleSolanaSignMessage,
    handleSignSolanaTransaction,
    handleSendTransaction,
  };
}
