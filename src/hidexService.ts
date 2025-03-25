import { Apparatus, HidexService } from 'hidex-sdk';

let HidexSDK: HidexService;
const serviceInit = () => {
  const ENV = process.env.NODE_ENV;
  HidexSDK = HidexSDK || new HidexService({
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
    env: ENV === 'development' ? 'development' : ENV === 'test' ? 'uat' : 'production', // development、uat、production
    apparatus: Apparatus.WEB,
    token: localStorage.getItem('access_token') || '',
  });
  return HidexSDK;
}
// eyJhbGciOiJIUzI1NiJ9.eyJsb2dpbl91c2VyX2tleSI6ImMzNGJmOGQ3YjBkNjQyNjRiYTg5NWU3Y2NiZGFlY2U3In0.FdpLK02cpFymSRAE97mW9OAxZ-4UR0iX6eWrsKHixNA
export {
  serviceInit,
  HidexSDK,
};