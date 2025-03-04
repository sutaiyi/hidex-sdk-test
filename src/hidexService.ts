import { HidexService } from 'hidex-sdk';
// import { HidexService } from './hidex-sdk';

const serviceInit = () => {
  try {
    const HidexSDK = new HidexService({
      rpcList: [{
        chainId: 102,
        chainName: 'SOLANA',
        rpc: '/solana_new',
      },
      {
        chainId: 1,
        chainName: 'ETH',
        rpc: 'string',
      },
      {
        chainId: 86,
        chainName: 'BSC',
        rpc: 'string',
      },
      {
        chainId: 8453,
        chainName: 'BASE',
        rpc: 'string',
      }],
      env: 'development', // development、uat、production
      apparatus: 'web',
      token: 'eyJhbGciOiJIUzI1NiJ9.eyJsb2dpbl91c2VyX2tleSI6IjFlZjc5ZTkwOTBkMjQ0YjQ4NGU1MGQ2Nzc4M2E3MTU5In0.yconLWtD40ashHHhIKtojkNWSZol0y83cPJ4rKxf7SM',
    });
    HidexSDK.init();
    return HidexSDK;
  } catch (error) {
    console.error(error);
    throw new Error('serviceInit error')
  }
}



export default serviceInit();