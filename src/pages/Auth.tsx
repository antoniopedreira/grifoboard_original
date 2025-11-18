import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { handleAuthRedirect } from '@/utils/authRedirect';
import LoginPage from '@/components/auth/LoginPage';

const Auth = () => {
  const { isLoading } = useAuth();

  useEffect(() => {
    // Apenas trata redirects especiais (ex: reset de senha)
    handleAuthRedirect();
  }, []);

  // Enquanto estiver carregando sessão, só mostra a tela de login
  return <LoginPage />;
};

export default Auth;
