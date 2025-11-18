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
  const [isCheckingRole, setIsCheckingRole] = useState(false);

  useEffect(() => {
    const checkAndRedirect = async () => {
      // Check for auth redirects first
      if (handleAuthRedirect()) {
        return;
      }
      
      // Only proceed if user is authenticated, not loading, on auth page, and not already checking
      if (!isLoading && userSession.user && location.pathname === '/auth' && !isCheckingRole) {
        setIsCheckingRole(true);
        
        try {
          // Check role BEFORE any navigation
          const isMasterAdmin = await masterAdminService.isMasterAdmin();
          
          // Navigate directly to the correct page based on role
          if (isMasterAdmin) {
            navigate('/master-admin', { replace: true });
          } else {
            navigate('/obras', { replace: true });
          }
        } catch (error) {
          console.error('Error checking user role:', error);
          // On error, default to obras
          navigate('/obras', { replace: true });
        }
      }
    };

    checkAndRedirect();
  }, [isLoading, userSession.user, location.pathname, navigate, isCheckingRole]);

  // Reset checking state when user logs out
  useEffect(() => {
    if (!userSession.user) {
      setIsCheckingRole(false);
    }
  }, [userSession.user]);

  return <LoginPage />;
};

export default Auth;
