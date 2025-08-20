
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AuthCard from '@/components/auth/AuthCard';

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
  
  return (
    <div className="h-screen w-full fixed inset-0 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Construction grid pattern background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 10c0-1.1.9-2 2-2s2 .9 2 2-2 2-2 2-2-.9-2-2zm0 20c0-1.1.9-2 2-2s2 .9 2 2-2 2-2 2-2-.9-2-2zm0 20c0-1.1.9-2 2-2s2 .9 2 2-2 2-2 2-2-.9-2-2zM10 36c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm20 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm20 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      {/* Geometric shapes for construction theme */}
      <div className="absolute top-20 left-20 w-32 h-32 border border-slate-700/30 rotate-45 rounded-lg"></div>
      <div className="absolute bottom-20 right-20 w-24 h-24 border border-slate-700/30 rotate-12"></div>
      <div className="absolute top-1/2 left-10 w-16 h-16 bg-slate-700/10 rounded-full"></div>
      <div className="absolute bottom-1/3 left-1/3 w-20 h-20 border border-slate-700/20 rotate-45"></div>
      
      {/* Main content - perfectly centered */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AuthCard />
        </div>
      </div>
    </div>
  );
};

export default Auth;
