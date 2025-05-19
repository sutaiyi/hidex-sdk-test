import { HidexSDK } from '@/hidexService';
import axios from 'axios';
import React, { useState } from 'react';

const Decryption = React.memo(() => {
  const { wallet } = HidexSDK;
  return (
    <div className="btn-content">
      <div style={{ flex: '1 1 100%', width: '100%', textAlign: 'left' }}>
        <h3 style={{ textTransform: 'capitalize' }}>其他数据测试</h3>
        <div>
          apiUrl <input type="text" id="apiHttpsUrl"></input>
        </div>
        <div>
          <button
            className="btn"
            onClick={async () => {
              try {
                const apiHttpsUrl = (document.getElementById('apiHttpsUrl') as HTMLInputElement).value;
                !apiHttpsUrl && alert('请输入api地址');
                console.log('ApiUrl', apiHttpsUrl);
                for (let index = 0; index < 20; index++) {
                  console.time(`Connect ${index + 1}`);

                  await new Promise((resolve) => setTimeout(resolve, 1000));

                  await axios.get(apiHttpsUrl);

                  console.timeEnd(`Connect ${index + 1}`);
                }
              } catch (error) {
                alert(error);
              }
            }}
          >
            API建连预热验证
          </button>
        </div>
      </div>
    </div>
  );
});
export default Decryption;
