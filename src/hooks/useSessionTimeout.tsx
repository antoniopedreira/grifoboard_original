import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface UseSessionTimeoutProps {
  timeoutMinutes?: number;
  warningMinutes?: number;
}

export const useSessionTimeout = ({ 
  timeoutMinutes = 30, 
  warningMinutes = 5 
}: UseSessionTimeoutProps = {}) => {
  const { userSession, signOut } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimeout = () => {
    // Clear existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    if (!userSession.user) return;

    lastActivityRef.current = Date.now();
    localStorage.setItem('last_activity', lastActivityRef.current.toString());

    // Set warning timeout
    const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000;
    warningRef.current = setTimeout(() => {
      toast.warning('Aviso de Sessão', {
        description: `Sua sessão expirará em ${warningMinutes} minutos devido à inatividade.`,
        duration: 10000,
      });
    }, warningTime);

    // Set logout timeout
    const timeoutTime = timeoutMinutes * 60 * 1000;
    timeoutRef.current = setTimeout(() => {
      toast.error('Sessão Expirada', {
        description: 'Sua sessão expirou devido à inatividade.',
        duration: 5000,
      });
      signOut();
    }, timeoutTime);
  };

  useEffect(() => {
    if (!userSession.user) {
      // Clear timeouts if user is not logged in
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      return;
    }

    // Initial setup
    resetTimeout();

    // Activity event listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetTimeout();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Handle visibility change (tab switching)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Check if session is still valid when tab becomes visible
        const storedActivity = localStorage.getItem('last_activity');
        if (storedActivity) {
          const timeSinceActivity = Date.now() - parseInt(storedActivity, 10);
          const maxInactiveTime = timeoutMinutes * 60 * 1000;
          
          if (timeSinceActivity > maxInactiveTime) {
            // Session expired while tab was hidden
            toast.error('Sessão Expirada', {
              description: 'Sua sessão expirou devido à inatividade.',
              duration: 5000,
            });
            signOut();
          } else {
            // Reset timeout for remaining time
            resetTimeout();
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [userSession.user, signOut, timeoutMinutes, warningMinutes]);

  // Public API
  return {
    resetTimeout,
    lastActivity: lastActivityRef.current,
  };
};