
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthCard />
      </div>
    </div>
  );
};

export default Auth;
