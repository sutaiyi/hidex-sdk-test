const PrivyTest = (usePrivy: any) => {
  const { login, logout, ready, authenticated, user } = usePrivy();
  console.log(user);
  const key = authenticated ? `已登录账号${user?.wallet?.address}` : '登录';
  const key2 = '退出登录';
  const value = async () => {
    try {
      if (authenticated) {
        logout();
        return;
      }
      await login();
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };
  const obj = {};

  obj[key] = value;
  if (authenticated) {
    obj[key2] = value;
  }
  return obj;
};

export default PrivyTest;
