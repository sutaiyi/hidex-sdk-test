import { usePrivy } from '@privy-io/react-auth';
import { useEffect } from 'react';

const LoginButton = () => {
  const { login, logout, ready, authenticated, user } = usePrivy();

  if (!ready) return <div>Privy 准备中 Loading...</div>;

  return (
    <div>
      {authenticated ? (
        <div className="m-auto">
          <p>
            Welcome, {user?.email?.address} {user?.email?.address && '|'} {user?.wallet?.address}
          </p>
          <button className="btn" onClick={logout}>
            Logout
          </button>
        </div>
      ) : (
        <button className="btn" onClick={login}>
          Login with Privy
        </button>
      )}
    </div>
  );
};

export default LoginButton;
