import React, { useEffect } from 'react';
import logo from '../../assets/logo.svg';
import '../../assets/App.css';
import { useNavigate } from 'react-router-dom';
import { HidexSDK } from '@/hidexService';

function App() {
  const navigate = useNavigate();
  const { trade } = HidexSDK;
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Tydodo</p>
        <div style={{ marginTop: '50px' }}>
          <div
            className="link-action"
            style={{ marginBottom: '80px' }}
            onClick={() => {
              navigate('/test');
            }}
          >
            Hidex SDK 调试
          </div>
          <a className="App-link color-999" href="https://zh-hans.react.dev/" target="_blank" rel="noopener noreferrer">
            React 文档
          </a>
          <a className="App-link color-999" href="https://reactrouter.cn/" target="_blank" rel="noopener noreferrer">
            React 路由
          </a>
        </div>
      </header>
    </div>
  );
}

export default App;
