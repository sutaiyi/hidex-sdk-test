import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './assets/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { serviceInit } from './hidexService';
import Loading from './pages/Loading';
import TokenSet from './pages/TokenSet/Index';
import { getChainsTokenPriceUsd } from './data/api';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const Rend = () => {
  const [loading, setLoading] = React.useState(true);
  const [hasToken, setHasToken] = React.useState(true);

  useEffect(() => {
    const initLoading = async () => {
      await getChainsTokenPriceUsd([1, 102]);
      const HidexSDK = serviceInit();
      const { utils, trade } = HidexSDK;
      try {
        await HidexSDK.init();
        trade.checkHash.on('HashStatusEvent', (data) => {
          console.log('----tradeFullTimer----', utils.setStatistics({ timerKey: 'tradeFull', isBegin: false }));
          console.log('----HashStatusTimer----', utils.setStatistics({ timerKey: 'HashStatus', isBegin: false }));
          console.log('HashStatusEvent', data);
          console.timeEnd('tradeFullTimer');
          console.timeEnd('HashStatusTimer');
          if (data.status === 'Confirmed') {
            const { accountAddress, vertransactions } = data.data;
            if (vertransactions && vertransactions.length === 2) {
              // 执行第二笔交易
              console.log('执行第二笔交易');
              trade.sendSimulateTransaction(accountAddress, vertransactions[1]);
            }
          }
          alert('交易状态: ' + data.status);
        });
        setLoading(false);
      } catch (error) {
        setLoading(false);
        const { code, message } = utils.getErrorMessage(error);
        if (code === 13001) {
          alert(message + ', 进入《Hidex SDK 调试》点击 Wallet 下的解锁即可');
          return;
        }
        if (code === 13002) {
          setHasToken(false);
          return;
        }
        alert(code + '-' + message);
      }
    };
    initLoading();
  }, []);
  return loading ? <Loading /> : hasToken ? <App /> : <TokenSet />;
};

root.render(<Rend />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
