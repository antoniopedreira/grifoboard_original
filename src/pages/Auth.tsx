
import { SignInCard } from '@/components/ui/sign-in-card';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Auth = () => {
  const { userSession } = useAuth();
  const navigate = useNavigate();
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  useEffect(() => {
    // Verificar se o usuário já está autenticado e redirecionar apenas uma vez
    if (userSession?.user && !redirectAttempted) {
      const lastRoute = sessionStorage.getItem('lastRoute') || '/obras';
      navigate(lastRoute);
      setRedirectAttempted(true);
    }
  }, [userSession, navigate, redirectAttempted]);

  return (
    <div className="w-screen h-screen overflow-hidden flex items-center justify-center">
      <SignInCard />
    </div>
  );
};

export default Auth;
