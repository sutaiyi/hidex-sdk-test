import React from 'react';
import logo from '../../assets/logo.svg';
import '../../assets/App.css';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  return (
    <div className="App">
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <p>
        Tydodo
      </p>
      <div className='flex'>
        <div
          className="link-action"
          style={{ marginBottom: '80px' }}
          onClick={() => {
            navigate('/test')
          }}
        >
          Hidex SDK 调试
        </div>
        <a
          className="App-link color-999"
          href="https://zh-hans.react.dev/"
          target="_blank"
          rel="noopener noreferrer"
        >
          React 文档
        </a>
        <a
          className="App-link color-999"
          href="https://reactrouter.cn/"
          target="_blank"
          rel="noopener noreferrer"
        >
          React 路由
        </a>
      </div>
    </header>
  </div>
  );
}

export default App;
