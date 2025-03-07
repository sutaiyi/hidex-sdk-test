// import { HidexService } from 'hidex-sdk';
import { HidexService } from './hidex-sdk';

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
        rpc: 'https://eth.llamarpc.com,https://eth.meowrpc.com,https://eth-pokt.nodies.app',
      },
      {
        chainId: 56,
        chainName: 'BSC',
        rpc: 'https://bsc-dataseed.bnbchain.org,https://bsc-dataseed1.defibit.io,https://bsc-dataseed1.ninicoin.io,https://bsc-rpc.publicnode.com',
      },
      {
        chainId: 8453,
        chainName: 'BASE',
        rpc: '/api/llamarpc,/api/meowrpc,/api/offical,/api/devaccess',
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