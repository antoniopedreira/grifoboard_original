
import { SignInCard } from '@/components/ui/sign-in-card';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Auth = () => {
  const { userSession } = useAuth();
  const navigate = useNavigate();
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  useEffect(() => {
    // Only check auth status once to prevent multiple redirects
    if (userSession?.user && !redirectAttempted) {
      if (userSession.obraAtiva) {
        // If user has an active obra, redirect to dashboard
        navigate('/dashboard');
      } else {
        // If user is logged in but no active obra, redirect to obras page
        navigate('/obras');
      }
      setRedirectAttempted(true);
    }
  }, [userSession, navigate, redirectAttempted]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-heading text-2xl font-semibold text-gray-800">
              Gerenciador de Obras
            </h1>
            <p className="text-gray-500 mt-1">
              Gerencie suas obras e acompanhe o progresso
            </p>
          </div>
          <SignInCard />
        </div>
      </div>
      <footer className="py-4 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Gerenciador de Obras • Todos os direitos reservados
      </footer>
    </div>
  );
};

export default Auth;
