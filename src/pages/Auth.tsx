
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LoginPage from '@/components/auth/LoginPage';

const Auth = () => {
  const { userSession } = useAuth();
  const navigate = useNavigate();
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  
  useEffect(() => {
    if (userSession?.user && !redirectAttempted) {
      if (userSession.obraAtiva) {
        navigate('/dashboard');
      } else {
        navigate('/obras');
      }
      setRedirectAttempted(true);
    }
  }, [userSession, navigate, redirectAttempted]);
  
  return <LoginPage />;
};

export default Auth;
