import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoginPage from '@/components/auth/LoginPage';

const Auth = () => {
  const { userSession, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && userSession.user) {
      navigate('/', { replace: true });
    }
  }, [isLoading, userSession.user, navigate]);

  return <LoginPage />;
};

export default Auth;
