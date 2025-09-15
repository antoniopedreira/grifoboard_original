import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { handleAuthRedirect } from '@/utils/authRedirect';
import LoginPage from '@/components/auth/LoginPage';

const Auth = () => {
  const { userSession, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for auth redirects first
    if (handleAuthRedirect()) {
      return; // Will redirect to reset password page
    }
    
    // Only navigate if we're not already on the root path and user is authenticated
    if (!isLoading && userSession.user && window.location.pathname !== '/') {
      navigate('/', { replace: true });
    }
  }, [isLoading, userSession.user, navigate]);

  return <LoginPage />;
};

export default Auth;
