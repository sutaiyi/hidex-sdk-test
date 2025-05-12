import { HidexSDK } from '@/hidexService';
import React, { useState } from 'react';
import ReactJson from 'react-json-view';

const Decryption = React.memo(() => {
  const [jsonData, setJsonData] = useState<any>({});
  const { wallet } = HidexSDK;
  return (
    <div className="btn-content">
      <div style={{ flex: '1 1 100%', width: '100%', textAlign: 'left' }}>
        <h3 style={{ textTransform: 'capitalize' }}>数据解密</h3>
        <div>
          密码： <input type="text" id="DecryptionPassword"></input>
        </div>
        <div>
          元数据：<textarea name="" id="DecryptionText"></textarea>
        </div>

        <div>
          <button
            className="btn"
            onClick={async () => {
              try {
                const password = document.getElementById('DecryptionPassword') as HTMLInputElement;
                const text = document.getElementById('DecryptionText') as HTMLInputElement;
                const cleanedValue = text.value.replace(/^{{(.+)}}$/, '{$1}');
                const obj = JSON.parse(cleanedValue);
                const passValue = await wallet.decryptionS3Data(obj.data.putBooted, password.value);
                if (passValue) {
                  setJsonData(passValue);
                }
                console.log(passValue);
              } catch (error) {
                alert(error);
              }
            }}
          >
            解密
          </button>
          <div>
            <ReactJson src={jsonData} theme="monokai" />
          </div>
        </div>
      </div>
    </div>
  );
});
export default Decryption;
