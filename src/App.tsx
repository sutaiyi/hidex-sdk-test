import React from 'react';
import './assets/App.css';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Index';
import Test from './pages/Test/Index';
import Login from './pages/Login/IIndex';
import DeepSeek from './pages/DeepSeek/Index';
import TokenSet from './pages/TokenSet/Index';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<Test />} />
          <Route path="/login" element={<Login />} />
          <Route path="/token-set" element={<TokenSet />} />
          <Route path="/deepseek" element={<DeepSeek />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
