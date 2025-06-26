import React, { useState } from 'react';
import { Login } from './Login';
import { Register } from './Register';

interface AuthWrapperProps {
  onAuthSuccess: () => void;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      {isLogin ? (
        <Login
          onSuccess={onAuthSuccess}
          onSwitchToRegister={() => setIsLogin(false)}
        />
      ) : (
        <Register
          onSuccess={() => setIsLogin(true)}
          onSwitchToLogin={() => setIsLogin(true)}
        />
      )}
    </>
  );
};