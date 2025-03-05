import React, { useEffect } from 'react';
import logo from '../../assets/logo.svg';
import './Test.css';
import tradeTest from './trade'
import networkTest from './network';
import walletTest from './wallet';

function Test() {
  useEffect(() => {
    
  }, []);
  const btns:any = {
    network: networkTest,
    wallet: walletTest,
    trade: tradeTest
  }

  return (
    <div className="Test">
      <div className='logo-content'>
        <div className='logo-box'><img src={logo} className="logo-img" alt="logo" /></div>
      </div>
      <div className='btn-content'>
        <div style={{flex: '1 1 100%', width: '100%', textAlign: 'center'}}>Hidex SDK 调试
          <span className='tip'>请打开控制台查看调试信息</span>
        </div>
        {
          Object.keys(btns).map((value: any, key: number) =>
          <div style={{flex: '1 1 100%', width: '100%', textAlign: 'left'}} key={key}>
            <h3 style={{'textTransform': 'capitalize'}}>{value}</h3>
            {
              Object.keys(btns[value]).map((item: any, key: number) =>
                <button key={key} className='btn' onClick={async () => btns[value][item]()}>{item}</button>
              )
            }
          </div>
          )
        }
      </div>
    </div>
  );
}

export default Test;
