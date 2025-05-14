
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Obra, UserSession } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  session: UserSession;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setObraAtiva: (obra: Obra | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [session, setSession] = useState<UserSession>({ user: null, obraAtiva: null });
  const [isLoading, setIsLoading] = useState(true);

  // Função auxiliar para converter User do Supabase para o formato do UserSession
  const mapUser = (user: User | null): UserSession['user'] => {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email || '',
    };
  };

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession({ user: mapUser(session.user), obraAtiva: null });
      }
      setIsLoading(false);
    });

    // Ouvir mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession({ user: mapUser(session?.user || null), obraAtiva: null });
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Recuperar obra ativa do localStorage ao iniciar
  useEffect(() => {
    if (session.user) {
      const savedObra = localStorage.getItem(`obraAtiva_${session.user.id}`);
      if (savedObra) {
        try {
          const obra = JSON.parse(savedObra);
          setSession(prev => ({ ...prev, obraAtiva: obra }));
        } catch (e) {
          localStorage.removeItem(`obraAtiva_${session.user.id}`);
        }
      }
    }
  }, [session.user]);

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
      setSession({ user: null, obraAtiva: null });
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
    setSession(prev => ({ ...prev, obraAtiva: obra }));
    
    // Salvar obra ativa no localStorage
    if (session.user && obra) {
      localStorage.setItem(`obraAtiva_${session.user.id}`, JSON.stringify(obra));
    } else if (session.user) {
      localStorage.removeItem(`obraAtiva_${session.user.id}`);
    }
  };

  const value = {
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    setObraAtiva
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
