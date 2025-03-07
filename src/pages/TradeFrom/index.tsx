import { codex } from '@/data';
import React, { useState, useEffect, useCallback } from 'react';
import hidexService from '@/hidexService';
import { simpleAddress, strToNumberByDecimals } from '@/common/utils';





interface SearchComponentProps {
  onResultSelect: (result: any) => void;
}

const SearchComponent: React.FC<SearchComponentProps> = ({ onResultSelect }) => {
  const { network, wallet, trade } = hidexService;
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState<any>([]);
  const [selected, setSelected] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  const handleSearch = async (query: string) => {
    if (!query) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    const onSearch = async (query: string) => {
      const networks = network.getCodexChainIds();
      const results = await codex.filterTokens(query, networks);
      console.log(results, '----');
      return results.map((v: any, index: number) => {
        return {
          id: index + 1,
          token: v.token,
          pair: v.pair.address,
          priceUSD: v.priceUSD
        }
      })
    }

    try {
      const searchResults = await onSearch(query);
      setResults(searchResults);
      
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }

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
        const chainName = network.getChainNameByChainId(result?.token?.networkId)
        const currentNetwork = await network.choose(chainName)
        const { accountItem }: {accountItem: any} = await wallet.getCurrentWallet()
        const account = accountItem[chainName]
        console.log(account)

        const balance = await trade.getBalance(account.address);
        const tokenBalance = await trade.getBalance(account.address, result?.token.address);
        const tradeInfo = {
          ...result, 
          account: account,
          chainName,
          chainId: network.getChainIdByChainName(chainName),
          balance: strToNumberByDecimals(balance, currentNetwork.tokens[0].decimals), 
          tokenBalance: strToNumberByDecimals(tokenBalance, result?.token.decimals)
        }
        setSelected(tradeInfo)
        onResultSelect(tradeInfo);
      } catch (error:any) {
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
    <div style={{marginBottom: '10px'}}>
      <div style={{fontSize: '16px', marginTop: '10px', marginBottom: '5px', color: '#999'}}>搜索并选择代币</div>
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
          fontSize: '16px',
          borderRadius: '4px',
          boxSizing: 'border-box',
          border: '1px solid #ccc'
        }}
      />

      {(showDropdown || isLoading) && (
        <div style={{
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
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
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
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span>
                    【{network.getChainNameByChainId(result.token.networkId)}】{result.token.symbol}
                  </span>
                  <span>
                    {result.priceUSD}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '8px', color: '#666' }}>No results found</div>
          )}
        </div>
      )}
    </div>
    {
      selected && <div>
        <div style={{fontSize: '16px', marginTop: '10px', marginBottom: '5px', color: '#999'}}>当前交易信息：</div>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '14px', margin: '0 0 10px 0'}}>
          代币名称：{selected?.token?.symbol} <br/>
          代币地址：{selected?.token?.address} <br/>
          代币精度：{selected?.token?.decimals} <br/>
          所属链：{network.getChainNameByChainId(selected?.token?.networkId)} <br/>
          当前钱包地址：{selected?.account?.address}
          <br/>
          钱包余额：{selected?.balance} {network.get().tokens[0].symbol}<br/>
          代币余额：{selected?.tokenBalance} {selected?.token?.symbol}
        </pre>
      </div>
    }
    </div>
  );
};

export default SearchComponent;