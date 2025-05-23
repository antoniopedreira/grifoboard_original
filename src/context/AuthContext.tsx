
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
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
      (_event, session) => {
        if (session) {
          // When auth state changes, also try to get the active obra
          const obraAtiva = getInitialObraAtiva(session.user.id);
          setUserSession({ user: mapUser(session.user), obraAtiva });
        } else {
          setUserSession({ user: null, obraAtiva: null });
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
      const { error } = await supabase.auth.signUp({ email, password });
      
      if (error) throw error;
      
      toast({
        title: "Cadastro realizado",
        description: "Verifique seu email para confirmar o registro.",
      });
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

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setUserSession({ user: null, obraAtiva: null });
      
      // Also clear obra from localStorage
      if (userSession.user) {
        localStorage.removeItem(`obraAtiva_${userSession.user.id}`);
      }
      
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
    setUserSession(prev => prev ? { ...prev, obraAtiva: obra } : { user: null, obraAtiva: null });
    
    // Save active obra in localStorage for persistence
    if (userSession.user && obra) {
      localStorage.setItem(`obraAtiva_${userSession.user.id}`, JSON.stringify(obra));
    } else if (userSession.user) {
      localStorage.removeItem(`obraAtiva_${userSession.user.id}`);
    }
  };

  const value = {
    userSession,
    session: userSession, // Alias for backward compatibility
    isLoading,
    signIn,
    signUp,
    signOut,
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
