import { usePrivyTest } from '../Privy/hooks/usePrivyTest';

const PrivyTest = (usePrivy: any) => {
  const { login, logout, ready, authenticated, user } = usePrivy();
  const { handleEthSendTransaction, handleEthSignMessage, handleSolanaSignMessage, handleSolanaSendTransaction, handleSignSolanaTransaction } = usePrivyTest();
  console.log(user);
  const key = authenticated
    ? `已登录SOL账号${user?.linkedAccounts.find((v) => v.chainType === 'solana')?.address} - ETH账号 ${user?.linkedAccounts.find((v) => v.chainType === 'ethereum')?.address}`
    : '登录';
  const key2 = '退出登录';
  const value = async () => {
    try {
      if (authenticated) {
        logout();
        return;
      }
      await login();
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };
  const obj = {};

  obj[key] = value;
  if (authenticated) {
    obj[key2] = value;
  }
  obj['签名'] = () => {
    handleSolanaSignMessage();
  };
  return obj;
};

export default PrivyTest;
