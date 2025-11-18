import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { handleAuthRedirect } from '@/utils/authRedirect';
import { masterAdminService } from '@/services/masterAdminService';
import LoginPage from '@/components/auth/LoginPage';

const Auth = () => {
  const { userSession, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      // Check for auth redirects first
      if (handleAuthRedirect()) {
        return;
      }
      
      // Only check once when user becomes authenticated and we're on auth page
      if (!isLoading && userSession.user && location.pathname === '/auth' && !hasChecked) {
        setHasChecked(true);
        
        try {
          const isMasterAdmin = await masterAdminService.isMasterAdmin();
          
          if (isMasterAdmin) {
            navigate('/master-admin', { replace: true });
          } else {
            navigate('/obras', { replace: true });
          }
        } catch (error) {
          console.error('Error checking user role:', error);
          navigate('/obras', { replace: true });
        }
      }
    };

    checkUserRole();
  }, [isLoading, userSession.user, location.pathname, navigate, hasChecked]);

  // Reset hasChecked when user logs out
  useEffect(() => {
    if (!userSession.user) {
      setHasChecked(false);
    }
  }, [userSession.user]);

  return <LoginPage />;
};

export default Auth;
