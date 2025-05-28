
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
    <div 
      className="min-h-screen w-full fixed inset-0 flex flex-col justify-between"
      style={{
        backgroundImage: `url('/lovable-uploads/3f91862e-278f-40e3-b70c-323faa1a249b.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <AuthCard />
      </main>
      
      <footer className="relative z-10 py-6 text-center text-white/80 text-sm w-full">
        © {new Date().getFullYear()} GrifoBoard • Todos os direitos reservados
      </footer>
    </div>
  );
};

export default Auth;
