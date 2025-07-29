import { codex } from '@/data';
import React, { useState, useEffect } from 'react';
import { HidexSDK } from '@/hidexService';
import { queryStringify, simpleAddress, strToNumberByDecimals } from '@/common/utils';
import { getChainsTokenPriceUsd, swapCommission } from '@/data/api';
import { getTokenInfo } from '@/data/codex/query';
import { ConnectedSolanaWallet, ConnectedWallet, useSolanaWallets, useWallets } from '@privy-io/react-auth';
import { UseSignTransactionInterface, useSignTransaction } from '@privy-io/react-auth/solana';

interface SearchComponentProps {
  onResultSelect: (result: any) => void;
}

const SearchComponent: React.FC<SearchComponentProps> = ({ onResultSelect }) => {
  const { wallets: solanaWallets } = useSolanaWallets();
  const { wallets } = useWallets();
  const { signTransaction } = useSignTransaction();

  const { network, trade, utils } = HidexSDK;
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState<any>([]);
  const [selected, setSelected] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [defalutAddresses, setDefalutAddresses] = useState<Array<{ chainName: string; address: string; symbol?: string }>>([
    {
      chainName: 'SOLANA',
      address: '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN',
    },
    {
      chainName: 'BSC',
      address: '0x19c018e13cff682e729cc7b5fb68c8a641bf98a4',
    },
    {
      chainName: 'BASE',
      address: '0x1c4cca7c5db003824208adda61bd749e55f463a3',
    },
    {
      chainName: 'ETH',
      address: '0x1121acc14c63f3c872bfca497d10926a6098aac5',
    },
  ]);

  const handleSearch = async (query: string) => {
    if (!query) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    const onSearch = async (query: string) => {
      const networks = network.getCodexChainIds();
      const results = await codex.filterTokens(query, networks);
      return results.map((v: any, index: number) => {
        return {
          id: index + 1,
          token: v.token,
          pair: v.pair.address,
          priceUSD: v.priceUSD,
        };
      });
    };

    try {
      const searchResults = await onSearch(query);
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(false);
    if (inputValue.trim()) {
      setIsLoading(true);
      setShowDropdown(true);
    }
    if (timerId) clearTimeout(timerId);
    const newTimerId = setTimeout(() => {
      handleSearch(inputValue);
    }, 800);
    setTimerId(newTimerId);
    return () => {
      if (newTimerId) clearTimeout(newTimerId);
    };
  }, [inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleResultClick = async (result: any) => {
    setSelected(result);
    setInputValue('');
    setShowDropdown(false);
    if (result && result?.token) {
      try {
        const chainName = network.getChainNameByChainId(result?.token?.networkId);
        const currentNetwork = await network.choose(chainName);
        if (!wallets?.length) {
          alert('请先登录Privy');
          return;
        }

        let account: ConnectedSolanaWallet | ConnectedWallet | { useSignTransaction: UseSignTransactionInterface['signTransaction'] } = solanaWallets[0];
        (account as any).useSignTransaction = signTransaction;
        console.log('account', account);

        const commissionPro = swapCommission({ chainId: currentNetwork.chainID, walletAddress: account.address });

        let IS_TOKEN_2022 = false;
        let userWsolAtaLamports = '0';
        let tokenAtaLamports = '0';

        console.log(wallets);

        if (utils.trade.isSol(chainName)) {
          IS_TOKEN_2022 = await utils.trade?.isToken2022(result?.token.address, network.getProviderByChain(102));

          const wsolAtaAddress = await utils.trade?.getUserTokenAtaAddress(account.address, currentNetwork.tokens[1].address, IS_TOKEN_2022);

          const tokenAtaAddress = await utils.trade?.getUserTokenAtaAddress(account.address, result?.token.address, IS_TOKEN_2022);

          console.log('wsolAtaAddress==>', wsolAtaAddress, 'tokenAtaAddress==>', tokenAtaAddress);
          const [userWsolAtaLamportsP, tokenAtaLamportsP] = await Promise.all([
            trade.getBalance(account.address, wsolAtaAddress, true),
            trade.getBalance(account.address, tokenAtaAddress, true),
            getChainsTokenPriceUsd(network.getChainIds()),
          ]);
          userWsolAtaLamports = userWsolAtaLamportsP;
          tokenAtaLamports = tokenAtaLamportsP;
        }

        const [balance, tokenBalance, wbalance, priceWeiItem, tokenInfo, commissionData] = await Promise.all([
          trade.getBalance(account.address),
          trade.getBalance(account.address, result?.token.address),
          trade.getBalance(account.address, currentNetwork.tokens[1].address),
          getChainsTokenPriceUsd(network.getChainIds()),
          getTokenInfo(queryStringify({ address: result?.token.address, networkId: network.getCodexChainIdByChain(currentNetwork.chain) })),
          commissionPro,
        ]);
        localStorage.setItem('commissionData', JSON.stringify(commissionData));

        const isPump = tokenInfo?.data?.token?.launchpad?.completed === false;
        const cryptoPriceUSD = (1 / Number(priceWeiItem[currentNetwork.chainID])) * 10 ** currentNetwork.tokens[0].decimals;
        const tradeInfo = {
          ...result,
          account,
          chainName,
          chainId: network.getChainIdByChainName(chainName),
          balance: strToNumberByDecimals(balance, currentNetwork.tokens[0].decimals),
          wbalance: strToNumberByDecimals(wbalance, currentNetwork.tokens[1].decimals),
          tokenBalance: strToNumberByDecimals(tokenBalance, result?.token.decimals),
          balanceStr: balance,
          wbalanceStr: wbalance,
          userWsolAtaLamportsStr: userWsolAtaLamports,
          tokenAtaLamportsStr: tokenAtaLamports,
          cryptoPriceUSD,
          tokenBalanceStr: tokenBalance,
          IS_TOKEN_2022,
          symbol: network.get(chainName).tokens[0].symbol,
          wSymbol: network.get(chainName).tokens[1].symbol,
          isPump,
          commissionData,
          wallet: account,
        };
        setSelected(tradeInfo);
        onResultSelect(tradeInfo);
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const handleBlur = () => {
    // setTimeout(() => {
    //   setShowDropdown(false);
    // }, 200);
  };

  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ fontSize: '16px', marginTop: '10px', marginBottom: '5px', color: '#999' }}>搜索/选择代币</div>
      <div style={{ position: 'relative', width: '360px' }}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder="输入代币地址..."
          style={{
            width: '100%',
            padding: '8px',
            color: '#333',
            fontSize: '16px',
            borderRadius: '4px',
            boxSizing: 'border-box',
            border: '1px solid #ccc',
          }}
        />

        {(showDropdown || isLoading) && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              width: '100%',
              right: 0,
              maxHeight: '300px',
              overflowY: 'auto',
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              marginTop: '4px',
              fontSize: '16px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            {isLoading ? (
              <div style={{ padding: '8px', color: '#666' }}>Loading...</div>
            ) : results.length > 0 ? (
              results.map((result: any) => (
                <div
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  style={{
                    padding: '8px',
                    cursor: 'pointer',
                    color: '#333',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                      【{network.getChainNameByChainId(result.token.networkId)}】{result.token.symbol}
                    </span>
                    <span>价格：${result.priceUSD}</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '8px', color: '#666' }}>No results found</div>
            )}
          </div>
        )}
      </div>
      {defalutAddresses && defalutAddresses.length > 0 && (
        <div style={{ display: 'flex', marginTop: '10px', justifyContent: 'left', gap: '20px', alignItems: 'center' }}>
          {defalutAddresses.map((item: any) => {
            return (
              <div
                key={item.address}
                style={{ cursor: 'pointer', color: '#666', fontSize: '14px' }}
                onClick={() => {
                  setInputValue(item.address);
                }}
              >
                <span style={{ color: '#999' }}>
                  {item.chainName}
                  {item.symbol ? `(${item.symbol})` : ''}
                </span>
                ：{simpleAddress(item.address, 2)}
              </div>
            );
          })}
        </div>
      )}
      {selected && (
        <div>
          <div style={{ fontSize: '16px', marginTop: '10px', marginBottom: '5px', color: '#999' }}>
            当前交易信息：
            <span
              style={{ cursor: 'pointer', color: '#1890ff', marginLeft: '10px' }}
              onClick={async () => {
                await handleResultClick(selected);
                console.log('刷新完成!');
              }}
            >
              刷新
            </span>
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '14px', margin: '0 0 10px 0' }}>
            代币名称：{selected?.token?.symbol} <br />
            代币地址：{selected?.token?.address} <br />
            代币精度：{selected?.token?.decimals} <br />
            代币价格：${selected?.priceUSD} <br />
            所属链：{network.getChainNameByChainId(selected?.token?.networkId)} (母币价格：${selected.cryptoPriceUSD?.toFixed(6)})<br />
            是否为Pump未毕业：{selected?.isPump ? '是' : '否'}
            <br />
            <br />
            当前钱包地址：{selected?.account?.address}
            <br />
            钱包余额：{selected?.balance} {selected.symbol}
            <br />
            {selected?.wSymbol}余额：{selected?.wbalance} {selected.wSymbol}
            <br />
            代币余额：{utils.common.formatNumberWithPrecision(selected?.tokenBalance, 4)} {selected?.token?.symbol}
          </pre>
        </div>
      )}
    </div>
  );
};

export default SearchComponent;
