
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

  // Helper function to convert Supabase User to UserSession format
  const mapUser = (user: User | null): UserSession['user'] => {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email || '',
    };
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
    // First set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          // When auth state changes, also try to get the active obra
          const obraAtiva = getInitialObraAtiva(session.user.id);
          setUserSession({ user: mapUser(session.user), obraAtiva });
        } else {
          // On logout or no session, clear everything including localStorage
          setUserSession({ user: null, obraAtiva: null });
          
          // Clear all localStorage items that might persist user data
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('obraAtiva_') || key.startsWith('user_')) {
              localStorage.removeItem(key);
            }
          });
        }
        setIsLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const obraAtiva = getInitialObraAtiva(session.user.id);
        setUserSession({ user: mapUser(session.user), obraAtiva });
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo de volta!",
      });
    } catch (error: any) {
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
      
      // Clear local session state first
      const currentUserId = userSession.user?.id;
      setUserSession({ user: null, obraAtiva: null });
      
      // Clear all localStorage data for this user
      if (currentUserId) {
        localStorage.removeItem(`obraAtiva_${currentUserId}`);
      }
      
      // Clear any other localStorage items that might persist user data
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('obraAtiva_') || key.startsWith('user_')) {
          localStorage.removeItem(key);
        }
      });
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      toast({
        title: "Desconectado",
        description: "Você foi desconectado com sucesso.",
      });
      
    } catch (error: any) {
      toast({
        title: "Erro ao desconectar",
        description: error.message,
        variant: "destructive",
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
