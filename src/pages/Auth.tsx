
import { SignInCard } from '@/components/ui/sign-in-card';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface AuthProps {
  onAuthenticated?: () => string;
}

const Auth = ({ onAuthenticated }: AuthProps = {}) => {
  const { userSession } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userSession?.user) {
      const redirectTo = onAuthenticated ? onAuthenticated() : '/obras';
      navigate(redirectTo, { replace: true });
    }
  }, [userSession, navigate, onAuthenticated]);

  return (
    <div className="w-screen h-screen overflow-hidden flex items-center justify-center">
      <SignInCard />
    </div>
  );
};

export default Auth;
