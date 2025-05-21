
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
    <div className="w-screen h-screen overflow-hidden flex items-center justify-center">
      <SignInCard />
    </div>
  );
};

export default Auth;
