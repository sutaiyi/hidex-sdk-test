import React from 'react';
import './assets/App.css';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import Home from './pages/Home/Index';
import Test from './pages/Test/Index';
import Login from './pages/Login/IIndex';
import DeepSeek from './pages/DeepSeek/Index';
import TokenSet from './pages/TokenSet/Index';
import PrivyView from './pages/Privy/Index';
import { PrivyProvider } from '@privy-io/react-auth';
// Replace this with any of the networks listed at https://github.com/wevm/viem/blob/main/src/chains/index.ts
import { bsc, base, berachain, polygon, arbitrum, story, mantle } from 'viem/chains';
const solanaConnectors = toSolanaWalletConnectors();
function App() {
  return (
    <PrivyProvider
      appId="cmdmgvko300shjs0jwjpvfqvm" // "cmd6re3jf00udju0mf6ryindi"
      config={{
        // defaultChain: bsc,
        // supportedChains: [bsc],
        appearance: {
          accentColor: '#6A6FF5',
          theme: '#1b1d2a',
          showWalletLoginFirst: false,
          logo: 'https://hidexfile.s3.ap-east-1.amazonaws.com/public/hidex-logo-dark.png',
          landingHeader: '欢迎来到Hidex',
          // loginMessage: 'Hidex message',
          walletChainType: 'ethereum-and-solana',
          walletList: ['metamask', 'phantom', 'okx_wallet', 'wallet_connect'],
        },
        externalWallets: {
          solana: {
            connectors: solanaConnectors,
          },
        },
        loginMethods: ['email', 'twitter', 'telegram', 'google', 'wallet'], // ['wallet'],
        // fundingMethodConfig: {
        //   moonpay: {
        //     useSandbox: true,
        //   },
        // },
        embeddedWallets: {
          requireUserPasswordOnCreate: false,
          showWalletUIs: false,
          ethereum: {
            createOnLogin: 'all-users', // createOnLogin 'all-users' | 'users-without-wallets' | 'off'default:"off"
          },
          solana: {
            createOnLogin: 'all-users',
          },
        },
        // mfa: {
        //   noPromptOnMfaRequired: false, // 关闭多因素认证（MFA, Multi-Factor Authentication）
        // },
        // solanaClusters: [{ name: 'mainnet-beta', rpcUrl: 'https://api.mainnet-beta.solana.com' }],
        // externalWallets: {
        //   solana: {
        //     connectors: {
        //       onMount: () => {
        //         console.log('onMount');
        //       },
        //       onUnmount: function (): void {
        //         // throw new Error('Function not implemented.');
        //       },
        //       get: function (): [] {
        //         // throw new Error('Function not implemented.');
        //         return [];
        //       },
        //     },
        //   },
        // },
      }}
    >
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/test" element={<Test />} />
            <Route path="/login" element={<Login />} />
            <Route path="/token-set" element={<TokenSet />} />
            <Route path="/deepseek" element={<DeepSeek />} />
            <Route path="/privy" element={<PrivyView />} />
          </Routes>
        </div>
      </Router>
    </PrivyProvider>
  );
}

export default App;
