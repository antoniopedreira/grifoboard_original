
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Obra, UserSession } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  userSession: UserSession;
  session: UserSession;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setObraAtiva: (obra: Obra | null) => void;
  setUserSession: (session: UserSession | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [userSession, setUserSession] = useState<UserSession>({ user: null, obraAtiva: null });
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  // Generate unique session identifier
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Helper function to convert Supabase User to UserSession format
  const mapUser = (user: User | null): UserSession['user'] => {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email || '',
    };
  };

  // Handle session conflicts - detect multiple active sessions
  const handleSessionConflict = (currentSessionId: string) => {
    const storedSessionId = localStorage.getItem('current_session_id');
    
    if (storedSessionId && storedSessionId !== currentSessionId) {
      console.warn('🚨 Multiple sessions detected! Forcing logout to prevent conflicts.');
      
      toast({
        title: "Sessão conflitante detectada",
        description: "Você foi desconectado devido a um login em outra janela/dispositivo.",
        variant: "destructive",
      });
      
      // Force logout to prevent data conflicts
      setTimeout(() => {
        signOut();
      }, 2000);
      
      return true; // Conflict detected
    }
    
    return false; // No conflict
  };

  // Monitor user activity to detect active sessions
  const updateActivity = () => {
    setLastActivity(Date.now());
    if (sessionId) {
      localStorage.setItem('last_activity', Date.now().toString());
    }
  };

  // Check for session expiry or conflicts
  const checkSessionHealth = () => {
    if (!userSession.user || !sessionId) return;
    
    const storedActivity = localStorage.getItem('last_activity');
    const storedSessionId = localStorage.getItem('current_session_id');
    
    // Check for session conflicts
    if (storedSessionId && storedSessionId !== sessionId) {
      handleSessionConflict(sessionId);
      return;
    }
    
    // Check for session expiry (inactive for more than 30 minutes)
    if (storedActivity) {
      const timeSinceActivity = Date.now() - parseInt(storedActivity, 10);
      const thirtyMinutes = 30 * 60 * 1000;
      
      if (timeSinceActivity > thirtyMinutes) {
        console.log('🕐 Session expired due to inactivity');
        toast({
          title: "Sessão expirada",
          description: "Sua sessão expirou devido à inatividade.",
        });
        signOut();
      }
    }
  };

  // Retrieve obra ativa from localStorage on initial load
  const getInitialObraAtiva = (userId: string | undefined) => {
    if (!userId) return null;
    
    const savedObra = localStorage.getItem(`obraAtiva_${userId}`);
    if (savedObra) {
      try {
        return JSON.parse(savedObra);
      } catch (e) {
        localStorage.removeItem(`obraAtiva_${userId}`);
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    let healthCheckInterval: NodeJS.Timeout;
    
    // Set up auth state listener with better error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event, session?.user?.id);
        
        try {
          if (session && session.user) {
            // Generate or get session ID
            const newSessionId = generateSessionId();
            setSessionId(newSessionId);
            
            // Check for conflicts before proceeding
            if (!handleSessionConflict(newSessionId)) {
              // Store session ID and activity
              localStorage.setItem('current_session_id', newSessionId);
              localStorage.setItem('last_activity', Date.now().toString());
              
              // Get the active obra
              const obraAtiva = getInitialObraAtiva(session.user.id);
              setUserSession({ user: mapUser(session.user), obraAtiva });
              
              // Start health check interval
              healthCheckInterval = setInterval(checkSessionHealth, 60000); // Check every minute
            }
          } else {
            // Clear session on logout
            console.log('🔓 Clearing session');
            setUserSession({ user: null, obraAtiva: null });
            setSessionId(null);
            
            // Clear session-related localStorage
            ['current_session_id', 'last_activity'].forEach(key => {
              localStorage.removeItem(key);
            });
            
            // Clear user-specific data
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith('obraAtiva_') || key.startsWith('user_')) {
                localStorage.removeItem(key);
              }
            });
            
            // Clear health check interval
            if (healthCheckInterval) {
              clearInterval(healthCheckInterval);
            }
          }
        } catch (error) {
          console.error('❌ Error in auth state change:', error);
          // On error, force logout to prevent corrupted state
          setUserSession({ user: null, obraAtiva: null });
          setSessionId(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('❌ Error getting session:', error);
        if (error.message.includes('refresh_token_not_found') || 
            error.message.includes('Invalid Refresh Token')) {
          console.log('🔄 Invalid refresh token, clearing session');
          localStorage.clear(); // Clear all localStorage on token errors
          setUserSession({ user: null, obraAtiva: null });
        }
      } else if (session?.user) {
        const newSessionId = generateSessionId();
        setSessionId(newSessionId);
        localStorage.setItem('current_session_id', newSessionId);
        
        const obraAtiva = getInitialObraAtiva(session.user.id);
        setUserSession({ user: mapUser(session.user), obraAtiva });
      }
      setIsLoading(false);
    });

    // Add activity listeners
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => updateActivity();
    
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Handle tab/window visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateActivity();
        checkSessionHealth();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      subscription.unsubscribe();
      if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
      }
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Clear any existing session data before new login
      localStorage.removeItem('current_session_id');
      localStorage.removeItem('last_activity');
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        // Handle specific auth errors
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Por favor, confirme seu email antes de fazer login.');
        } else if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha incorretos.');
        } else {
          throw error;
        }
      }
      
      // Success - session will be handled by onAuthStateChange
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo de volta!",
      });
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) throw error;
      
      if (data?.session) {
        toast({
          title: "Conta criada",
          description: "Cadastro concluído! Redirecionando...",
        });
      } else {
        toast({
          title: "Cadastro realizado",
          description: "Sua conta foi criada. Você já pode acessar o app.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      const redirectUrl = `${window.location.origin}/auth`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });
      
      if (error) throw error;
      
      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao enviar email",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      console.log('🔓 Signing out user');
      
      // Clear local session state first
      const currentUserId = userSession.user?.id;
      setUserSession({ user: null, obraAtiva: null });
      setSessionId(null);
      
      // Clear session-specific data
      ['current_session_id', 'last_activity'].forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Clear user-specific data
      if (currentUserId) {
        localStorage.removeItem(`obraAtiva_${currentUserId}`);
      }
      
      // Clear any other localStorage items that might persist user data
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('obraAtiva_') || key.startsWith('user_')) {
          localStorage.removeItem(key);
        }
      });
      
      // Sign out from Supabase with scope: 'local' to only clear local session
      await supabase.auth.signOut({ scope: 'local' });
      
      toast({
        title: "Desconectado",
        description: "Você foi desconectado com sucesso.",
      });
      
    } catch (error: any) {
      console.error('❌ Logout error:', error);
      // Even if logout fails on server, clear local state
      setUserSession({ user: null, obraAtiva: null });
      setSessionId(null);
      localStorage.clear();
      
      toast({
        title: "Desconectado",
        description: "Sessão local limpa com sucesso.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setObraAtiva = (obra: Obra | null) => {
    console.log("🏗️ Setting active obra:", obra?.id, obra?.nome_obra);
    
    setUserSession(prev => {
      const newSession = prev ? { ...prev, obraAtiva: obra } : { user: null, obraAtiva: null };
      
      // Save active obra in localStorage for persistence
      if (prev?.user && obra) {
        localStorage.setItem(`obraAtiva_${prev.user.id}`, JSON.stringify(obra));
        console.log("💾 Saved obra to localStorage for user:", prev.user.id);
      } else if (prev?.user) {
        localStorage.removeItem(`obraAtiva_${prev.user.id}`);
        console.log("🗑️ Removed obra from localStorage for user:", prev.user.id);
      }
      
      return newSession;
    });
  };

  const value = {
    userSession,
    session: userSession, // Alias for backward compatibility
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    setObraAtiva,
    setUserSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
