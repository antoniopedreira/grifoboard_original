import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { handleAuthRedirect } from '@/utils/authRedirect';
import { masterAdminService } from '@/services/masterAdminService';
import LoginPage from '@/components/auth/LoginPage';

const Auth = () => {
  const { userSession, isLoading } = useAuth();
  const navigate = useNavigate();
  const [checkingRole, setCheckingRole] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      // Check for auth redirects first
      if (handleAuthRedirect()) {
        return; // Will redirect to reset password page
      }
      
      // Only navigate if user is authenticated
      if (!isLoading && userSession.user && window.location.pathname !== '/' && !checkingRole) {
        setCheckingRole(true);
        try {
          // Check if user is master_admin
          const isMasterAdmin = await masterAdminService.isMasterAdmin();
          
          if (isMasterAdmin) {
            // Master admin goes directly to master-admin page
            navigate('/master-admin', { replace: true });
          } else {
            // Regular users go to obras selection
            navigate('/', { replace: true });
          }
        } catch (error) {
          console.error('Error checking user role:', error);
          // Default to obras page on error
          navigate('/', { replace: true });
        } finally {
          setCheckingRole(false);
        }
      }
    };

    checkUserRole();
  }, [isLoading, userSession.user, navigate, checkingRole]);

  return <LoginPage />;
};

export default Auth;
