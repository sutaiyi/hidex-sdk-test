import HidexSDk from '../../hidexService'
const { wallet } = HidexSDk;

const walletTest: any = {
  创建密码123123: async () => {
    try {
      const password = '123123';
      await wallet.createPassword(password)
      console.log('密码创建成功', password)
    } catch (error) {
      console.error(error);
      alert(error);
    }
  },
  修改密码123123: async () => {
    try {
      console.log('验证密码...')
      const oldPassword = '123123';
      const newPassword = '123123';
      await wallet.verifyPassword(oldPassword);
      // 验证无误后修改密码
      console.log('验证无误， 开始修改密码...')
      await wallet.resetPassword(oldPassword, newPassword)
      console.log('密码修改成功 ' + newPassword)
    } catch (error) {
      console.error(error);
      alert(error);
    }
  },
  上锁: async () => {
    try {
      await wallet.setLocked();
      console.log('钱包上锁成功');
    } catch (error) {
      console.error(error);
      alert(error);
    }
  },
  解锁: async () => {
    try {
      const password = '123123';
      await wallet.unlock(password);
      console.log('钱包解锁成功');
    } catch (error) {
      console.error(error);
      alert(error);
    }
  },
  查看账户状态: async () => {
    try {
      const isUnlocked = wallet.isUnlocked();
      const isSetPassword = wallet.isSetPassword();
      const hasWallet = wallet.hasWallet();
      console.log('钱包是否已解锁: ', isUnlocked); // 
      console.log('是否设置密码: ', isSetPassword);
      console.log('是否创建了钱包: ', hasWallet);
    } catch (error) {
      console.error(error);
      alert(error);
    }
  },
  查看所有账号: async () => {
    try {
      const walletList = await wallet.getWalletList();
      console.log('所有钱包: ', walletList);
    } catch (error) {
      console.error(error);
      alert(error);
    }
  },
  查看当前选中的钱包: async () => {
    try {
      const chainName = 'SOLANA'
      const { walletItem, accountItem } = await wallet.getCurrentWallet();
      console.log('当前选中的钱包对象: ', walletItem, accountItem, accountItem[chainName]);
    } catch (error) {
      console.error(error);
      alert(error);
    }
  },
  助记词创建钱包: async () => {
    try {
      const mnemonic = await wallet.generateMnemonic();
      console.log('助记词： ', mnemonic);
      const walletAccount = await wallet.createWallet(mnemonic, 0);
      console.log('助记词钱包创建成功（返回当前创建的钱包对象）: ', walletAccount);
    } catch (error) {
      console.error(error);
      alert(error);
    }
  },
  同个助记词下创建多个钱包: async (mnemonic: string = 'hip language bulb glow worry gaze forum viable strong manual fame scorpion', pathIndex: number = 0) => {
    try {
      console.log('下标：', pathIndex);
      const walletAccount = await wallet.createWallet(mnemonic, pathIndex);
      console.log('创建成功（返回当前创建的钱包对象）: ', walletAccount);
      if (pathIndex >= 2) {
        return;
      }
      setTimeout(await walletTest.同个助记词下创建多个钱包(mnemonic, pathIndex + 1), 2500);
    } catch (error) {
      console.error(error);
      alert(error);
    }
  },
  私钥创建钱包: async () => {
    try {
      const privateKeyETH = '114d6696f21013bfb3a5891e6720ddb5a46dbd9d9da134042f6ceae77963f30a'
      console.log('ETH系私钥： ', privateKeyETH);
      const walletAccountETH = await wallet.createPrivateWallet(privateKeyETH);
      console.log('ETH系私钥创建成功（返回当前创建的钱包对象）: ', walletAccountETH);


      const privateKeySOL = '3UJnoLvwCmQBx7LrEGYZmA8vdoWohX4hqfBiYSCGCk1pr5YsP6mT59YhrmxiJCSWMCa1taSFPFp8F3ohsntUCkNh'
      console.log('SOLANA私钥： ', privateKeySOL);
      const walletAccountSOL = await wallet.createPrivateWallet(privateKeySOL);
      console.log('SOLANA私钥创建成功（返回当前创建的钱包对象）: ', walletAccountSOL);
    } catch (error) {
      console.error(error);
      alert(error);
    }
  },
  导出私钥: async () => {
    try {
      const privateKey = await wallet.exportPrivateKey('123123', 0, 0, 'SOLANA')
      console.log('私钥为: ', privateKey);
    } catch (error) {
      console.error(error);
      alert(error);
    }
  },
  导出助记词: async () => {
    try {
      const mnemonics = await wallet.exportMnemonics('123123', 0)
      console.log('助记词为: ', mnemonics);
    } catch (error) {
      console.error(error);
      alert(error);
    }
  },
  清空钱包: async () => {
    try {
      await wallet.clearWallet('123123')
      alert('清空成功')
    } catch (error) {
      console.error(error);
      alert(error);
    }
  },
  删除单个钱包: async () => {
    try {
      const walletId = 0;
      await wallet.deleteWallet('123123', walletId)
      alert('删除成功')
    } catch (error) {
      console.error(error);
      alert(error);
    }
  },
  删除单个账号: async () => {
    try {
      await wallet.deleteWalletAccount('123123', 0, 0)
      alert('删除成功')
    } catch (error) {
      console.error(error);
      alert(error);
    }
  },

}

export default walletTest