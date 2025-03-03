import HidexSDk from '../../hidexService'
const { network } = HidexSDk;
const networkFuns: any = {
  '获取当前网络': () => {
    try {
      const currentChain = network.get();
      console.log(currentChain.chain, currentChain)
    } catch (error) {
      console.log('获取当前网络失败：', error)
    }
  },
  '选择网络(ETH)': async () => {
    try {
      await network.choose('ETH')
      const currentChain = network.get();
      console.log('网络选择成功：', currentChain.chain, currentChain)
    } catch (error) {
      console.log('网络选择失败：', error)
    }
  },
  '获取网络PRC实例': async () => {
    try {
      const provide = await network.getProviderByChain(102)
      console.log('网络实例获取成功：', provide)
    } catch (error) {
      console.log('网络实例获取失败：', error)
    }
  },
  'RPC并发': async () => {
    try {
      const chainName = network.getChainNameByChainId(102);
      const logResultPro = network.sysProviderRpcs[chainName].map((v: any) => {
        return v.getLatestBlockhash();
      });
      const result = await Promise.any(logResultPro);
      console.log('并发请求结果：', result)
    } catch (error) {
      console.log('并发请求获取失败：', error)
    }
  },
  '获取最快的网络': async () => {
    try {
      const rpc = await network.getFastestRpc(102);
      console.log('当前网络最快的RPC：', rpc)
    } catch (error) {
      console.log('获取失败：', error)
    }
  },
  '获取最快RPC实例': async () => {
    try {
      const provide = await network.getFastestProviderByChain(102);
      console.log('当前网络最快的RPC实例：', provide)
    } catch (error) {
      console.log('获取失败：', error)
    }
  }
}

export default networkFuns