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
      apparatus: 'web'
    });
    return HidexSDK;
  } catch (error) {
    console.error(error);
    throw new Error('serviceInit error')
  }
}



export default serviceInit();