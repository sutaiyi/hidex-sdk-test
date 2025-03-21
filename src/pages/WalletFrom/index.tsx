import {HidexSDK} from '@/hidexService';
import { useEffect, useState } from 'react';





interface SearchComponentProps {
  onResultSelect: (result: any) => void;
}

const SearchComponent: React.FC<SearchComponentProps> = ({ onResultSelect }) => {
  const { network, wallet, trade } = HidexSDK;
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState<any>([]);

  const handleImport = async (value: string) => {
    if (!value) {
      return;
    }
    try {
      let walletInfo: any = null;
      if (value && value.split(' ').length === 12) {
        walletInfo = await wallet.createWallet(value, 0);
      } else {
        walletInfo = await wallet.createPrivateWallet(value);
      }
      await wallet.setCurrentWallet(walletInfo.id, walletInfo.accountList[0].id);
      console.log('导入成功', walletInfo);
      alert('导入成功，' + `账号地址为：${value.split(' ').length === 12 ? '【ETH】: ' + walletInfo.accountList[0]['ETH'].address + ', 【SOL】: '+ walletInfo.accountList[0]['SOLANA']?.address : walletInfo.accountList[0]['ETH'] ? walletInfo.accountList[0]['ETH'].address: walletInfo.accountList[0]['SOLANA'].address}`)
      setInputValue('');
    } catch (error: any) {
      alert('导入失败：' + error.message);
    }
  }

  useEffect(() => {
    handleImport(inputValue);
  }, [inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };



  return (
    <div>
      <div style={{fontSize: '16px', marginTop: '10px', marginBottom: '5px', color: '#999'}}>导入私钥/助记词</div>
      <div style={{ position: 'relative', width: '360px', marginBottom: '10px'}}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="输入私钥/助记词..."
        style={{
          width: '100%',
          padding: '8px',
          fontSize: '16px',
          borderRadius: '4px',
          boxSizing: 'border-box',
          border: '1px solid #ccc'
        }}
      />
      </div>
    </div>
  );
};

export default SearchComponent;