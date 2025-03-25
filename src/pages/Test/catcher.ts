import { HidexSDK } from '@/hidexService'
const chtcherFun = () => {
  const { catcher } = HidexSDK;
  return {
    'cookie存储Set': async () => {
      try {
        // 一天后过期
        const result = await catcher.setCookie('hidex-test', { value: 'hidexValue' }, { expires: 7, secure: true });
        // 普通持久化存储
        await catcher.setItem('hidex-test', 'hidexValue');
        console.log('cookie存储', result)
      } catch (error) {
        console.log(error)
      }
    },
    'cookie存储Get': async () => {
      try {
        const dataStorage = await catcher.getCookie('dataStorage');
        console.log('cookie存储获取 dataStorage', dataStorage)
      } catch (error) {
        console.log(error)
      }
    },
    'cookie存储Delete': async () => {
      try {
        const result = await catcher.removeCookie('hidex-test', { secure: true });
        await catcher.removeItem('hidex-test');
        console.log('cookie存储删除', result)
      } catch (error) {
        console.log(error)
      }
    },
  }
}

export default chtcherFun