
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AuthCard from '@/components/auth/AuthCard';

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
      <main className="flex-1 flex items-center justify-center p-4">
        <AuthCard />
      </main>
      
      <footer className="py-4 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} GrifoBoard • Todos os direitos reservados
      </footer>
    </div>
  );
};

export default Auth;
