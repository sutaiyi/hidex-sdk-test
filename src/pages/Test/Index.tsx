import React, { useEffect, useState } from 'react';
import logo from '../../assets/logo.svg';
import './Test.css';
import tradeTest from './trade'
import networkTest from './network';
import walletTest from './wallet';
import catcherTest from './catcher';
import TradeFrom from '../TradeFrom';
import WalletFrom from '../WalletFrom';
import { setBeforeTradeData } from './solTrade'
import { HidexSDK } from '@/hidexService'

const Test = React.memo( () => {
  const { network } = HidexSDK;
  const [tradeInfo, setTradeInfo] = useState<any>(null);
  useEffect(() => {
    (async () => {
      if (tradeInfo?.token?.address) {
        const currentNetwork = await network.choose(tradeInfo.chainName)
        console.log('代币信息：', tradeInfo)
        setBeforeTradeData(tradeInfo, { isBuy: true, isPump: tradeInfo.isPump, currentNetwork });
        setBeforeTradeData(tradeInfo, { isBuy: false, isPump: tradeInfo.isPump, currentNetwork });
      }
    })()
  }, [tradeInfo]);

  const btns:any = {
    network: networkTest(),
    wallet: walletTest(),
    trade: tradeTest(),
    catcher: catcherTest(),
  }

  return (
    <div className="Test">
      <div className='logo-content'>
        <div className='logo-box'><img src={logo} className="logo-img" alt="logo" /></div>
      </div>
      <div className='btn-content'>
        <div style={{flex: '1 1 100%', width: '100%', textAlign: 'center'}}>Hidex SDK 调试
          <span className='tip'>打开控制台查看调试信息</span>
        </div>
        {
          Object.keys(btns).map((value: any, key: number) =>
          <div style={{flex: '1 1 100%', width: '100%', textAlign: 'left'}} key={key}>
            <h3 style={{'textTransform': 'capitalize'}}>{value} {value === 'trade' && <span className='lh-trade'>灵活交易</span>}</h3>
            {value === 'trade' && <TradeFrom onResultSelect={ (info)=> { setTradeInfo(info) }}></TradeFrom>}
            {value === 'wallet' && <WalletFrom onResultSelect={ ()=> {}}></WalletFrom>}
            {
              Object.keys(btns[value]).map((item: any, key: number) =>
                <button key={key} className='btn' onClick={async () => btns[value][item](tradeInfo)}>{['买入','卖出'].some(keyword => item.includes(keyword)) ? `${item}的${tradeInfo?.token.symbol|| ""}` : item}</button>
              )
            }
          </div>
          )
        }
      </div>
    </div>
  );
})

export default Test;
