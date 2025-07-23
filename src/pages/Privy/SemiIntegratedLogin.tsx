import React, { useEffect, useState } from 'react';
import { useLoginWithEmail, usePrivy, useSolanaWallets, useCreateWallet, useWallets, ConnectedSolanaWallet, ConnectedWallet } from '@privy-io/react-auth';

import { usePrivyTest } from './hooks/usePrivyTest';

const SemiIntegratedLogin = () => {
  const { ready, authenticated, user, logout, login, getAccessToken } = usePrivy();
  const [email, setEmail] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [authToken, setAuthToken] = useState<string | null>('');
  const [error, setError] = useState('');
  const [sendCodeStatus, setSendCodeStatus] = useState(false);
  const [code, setCode] = useState('');
  const { sendCode, loginWithCode } = useLoginWithEmail();
  const [activeWallet, setActiveWallet] = useState<ConnectedSolanaWallet | ConnectedWallet | undefined>();

  const { createWallet } = useCreateWallet();
  const { createWallet: createSolanaWallet, wallets: solanaWallets } = useSolanaWallets();
  const { wallets } = useWallets();

  const { handleEthSendTransaction, handleEthSignMessage, handleSolanaSignMessage, handleSolanaSendTransaction, handleSignSolanaTransaction } = usePrivyTest();

  // 切换活跃钱包
  const switchActiveWallet = (address: string) => {
    const walletLists = [...solanaWallets, ...wallets];
    setActiveWallet(walletLists.find((acc) => acc.address === address));
  };
  useEffect(() => {
    if (user && user?.wallet?.address && wallets && solanaWallets) {
      switchActiveWallet(user?.wallet?.address);
    }
  }, [user, solanaWallets, wallets]);
  if (!ready) {
    return <div>Loading...</div>;
  }

  console.log('用户信息：', user);
  console.log('当前选择的钱包：', activeWallet);
  console.log('ETH钱包：', wallets);
  console.log('Solana钱包：', solanaWallets);
  const handleSendTransaction = async (chainType: string) => {
    if (!activeWallet || activeWallet?.type !== chainType) {
      alert(`请先选择/创建${chainType}钱包`);
      return;
    }
    const actions: any = {
      ethereum: () => {
        console.log(1);
        handleEthSendTransaction({
          to: '0x2d51A363807E6077d3f8a421D5CFCB2092B07568',
          value: '1000000',
          activeWallet,
        });
      },
      solana: () => {
        console.log(1);
        handleSolanaSendTransaction({
          to: 'BrkuPGtpWHCcGR3hWtQcYYet53Tw2C6Hz3BMrSZwqgaU',
          value: '1000000',
          activeWallet,
        });
      },
    };

    actions[chainType]();
  };
  const handleSignMessage = async (chainType: string) => {
    if (!activeWallet || activeWallet?.type !== chainType) {
      alert(`请先选择/创建${chainType}钱包`);
      return;
    }
    const actions: any = {
      ethereum: () => {
        console.log(1);
        handleEthSignMessage(activeWallet);
      },
      solana: () => {
        console.log(1);
        handleSolanaSignMessage(activeWallet);
      },
    };

    actions[chainType]();
  };

  if (authenticated) {
    return (
      <div style={{ maxWidth: 520, margin: '20px auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h2>欢迎回来!</h2>
        <p>邮箱地址: {user?.email?.address}</p>
        {user?.wallet && <p style={{ wordBreak: 'break-all' }}>首个钱包地址: {user.wallet.address}</p>}
        {authToken && <p>Auth Token: {authToken}</p>}
        <button
          className="btn"
          onClick={async () => {
            const token = await getAccessToken();
            setAuthToken(token);
          }}
        >
          获取 Auth Token
        </button>

        {user?.linkedAccounts &&
          user.linkedAccounts
            .filter((account) => account.type === 'wallet')
            .map((account) => (
              <div key={account.id} style={{ wordBreak: 'break-all', background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                <div>钱包地址: {account.address}</div>
                <div>链类型: {account.chainType}</div>
                <div>钱包索引: {account.walletIndex}</div>
                <button
                  className="btn"
                  onClick={() => {
                    if (account.address === activeWallet?.address) return;
                    const walletLists = [...solanaWallets, ...wallets];
                    const currentWallet = walletLists.find((v) => v.address === account.address);
                    if (currentWallet && account.id) {
                      switchActiveWallet(account.address);
                    }
                  }}
                >
                  {account.address === activeWallet?.address ? '当前钱包' : '选择该钱包'}
                </button>
              </div>
            ))}

        <button className="btn" onClick={() => createSolanaWallet({ createAdditional: false })}>
          创建首个Solana钱包
        </button>
        <button className="btn" onClick={() => createSolanaWallet({ createAdditional: true })}>
          再次创建Solana钱包
        </button>

        <button className="btn" onClick={() => createWallet({ createAdditional: false })}>
          创建首个ETH钱包
        </button>
        <button className="btn" onClick={() => createWallet({ createAdditional: true })}>
          再次创建ETH钱包
        </button>

        <button
          className="btn"
          onClick={() => {
            handleSignMessage('ethereum');
          }}
        >
          ETH签名
        </button>
        <button
          className="btn"
          onClick={() => {
            handleSendTransaction('ethereum');
          }}
        >
          ETH转账
        </button>

        <button
          className="btn"
          onClick={() => {
            handleSignMessage('solana');
          }}
        >
          Solana签名
        </button>

        <button
          className="btn"
          onClick={() => {
            handleSendTransaction('solana');
          }}
        >
          Solana转账
        </button>

        <button
          className="btn"
          onClick={() => {
            if (!activeWallet || activeWallet?.type !== 'solana') {
              alert(`请先选择/创建Solana钱包`);
              return;
            }
            handleSignSolanaTransaction({ to: '9WGDbyZMtKbWXvMLg7YpUyZ5vBsdQXr6LBY5V5vPvn5X', value: '100000', activeWallet });
          }}
        >
          交易签名
        </button>
        <button className="btn" onClick={logout}>
          退出登录
        </button>
      </div>
    );
  }

  const handleLogin = async () => {
    try {
      await loginWithCode({ code });
      setSendCodeStatus(false);
      if (authenticated) {
        console.log('登录后信息：', user);
      }
    } catch (error) {
      console.log('登录异常', error);
      if (error?.toString().indexOf('Invalid email and code combination')) {
        alert('验证码错误或已过期');
        return;
      }
      alert('登录异常');
    }
  };
  const handleRegister = () => {};

  return (
    <div style={{ maxWidth: 320, margin: '20px auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <h2>使用邀请码登录</h2>
      <div>
        <label htmlFor="email">邮箱</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          required
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
        />
      </div>
      {email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
        <button
          className="btn"
          onClick={async () => {
            try {
              if (sendCodeStatus) return;
              const sendResult = await sendCode({ email });
              console.log(sendResult);
              setSendCodeStatus(true);
            } catch (error) {
              alert('验证码发送失败请重试');
              console.log('send code error', error);
            }
          }}
        >
          {sendCodeStatus ? '验证码已发送，请查收' : '发送验证码'}
        </button>
      )}

      {sendCodeStatus && (
        <div>
          <label htmlFor="invite-code">验证码</label>
          <input
            id="invite-code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="输入你的验证码"
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
      )}

      <div>
        <label htmlFor="invite-code">邀请码</label>
        <input
          id="invite-code"
          type="text"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="输入你的邀请码"
          required
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
        />
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="flex">
        <button
          className="btn"
          onClick={() => {
            handleLogin();
          }}
        >
          登录
        </button>
        <button
          className="btn"
          onClick={() => {
            handleRegister();
          }}
        >
          注册
        </button>
      </div>
      <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #ccc' }} />
      <button
        className="btn"
        onClick={() => {
          login({
            loginMethods: ['email', 'apple', 'twitter', 'telegram', 'google'],
          });
        }}
      >
        通过第三方平台
      </button>
      <button
        className="btn"
        onClick={() => {
          login({
            loginMethods: ['wallet'],
          });
        }}
      >
        插件钱包
      </button>
    </div>
  );
};

export default SemiIntegratedLogin;
