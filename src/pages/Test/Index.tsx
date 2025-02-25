import React, { useEffect } from 'react';
import logo from '../../assets/logo.svg';
import './Test.css';
import trade from './trade'
import network from './network';
import account from './account';

function Test() {
  useEffect(() => {
    
  }, []);
  const btns:any = {
    ...network,
    ...account,
    ...trade
  }

  return (
    <div className="Test">
      <div className='logo-content'>
        <div className='logo-box'><img src={logo} className="logo-img" alt="logo" /></div>
      </div>
      <div className='btn-content'>
        <div style={{flex: '1 1 100%', width: '100%', textAlign: 'center'}}>Hidex SDK 调试</div>
        {
          Object.keys(btns).map((item:any, key: number) =>
            <button key={key} className='btn' onClick={async () => btns[item]()}>{item}</button>
          )
        }
      </div>
    </div>
  );
}

export default Test;
