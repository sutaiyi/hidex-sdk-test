import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './assets/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import HidexSDK from './hidexService'
import Loading from './Loading';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const Rend = () => {
  const [loading, setLoading] = React.useState(true)
  const { utils } = HidexSDK;
	useEffect(() => {
		const initLoading = async () => {
			try {
        await HidexSDK.init();
        setLoading(false);
      } catch (error) {
        const {code, message} = utils.getErrorMessage(error)
        if (code === 13001) {
          alert(message + ', 进入《Hidex SDK 调试》点击 Wallet 下的解锁即可')
        }
        setLoading(false);
      }
		};
		initLoading();
	}, []);
	return (
    loading ? <Loading/> : <App />
	);
};

root.render(
  <Rend />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
