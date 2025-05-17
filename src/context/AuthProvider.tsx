
import { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Session, User } from '@supabase/supabase-js';

interface AuthProviderProps {
  children: React.ReactNode;
}

export interface UserSession {
  user?: User;
  obraAtiva?: { id: string; nome_obra: string } | null;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUserSession({
          user: session.user,
          obraAtiva: null
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session?.user) {
        setUserSession({
          user: session.user,
          obraAtiva: userSession?.obraAtiva || null
        });
      } else {
        setUserSession(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast({
        title: 'Login realizado com sucesso',
        description: 'Bem-vindo ao GrifoBoard'
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao fazer login',
        description: error.message || 'Verifique suas credenciais e tente novamente',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      toast({
        title: 'Conta criada com sucesso',
        description: 'Verifique seu email para confirmar o cadastro'
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao criar conta',
        description: error.message || 'Ocorreu um erro ao criar sua conta',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUserSession(null);
      toast({
        title: 'Logout realizado',
        description: 'Você saiu da sua conta com sucesso'
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao fazer logout',
        description: error.message || 'Ocorreu um erro ao sair da sua conta',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const setActiveObra = (obra: { id: string; nome_obra: string } | null) => {
    if (userSession) {
      const updatedSession = {
        ...userSession,
        obraAtiva: obra,
      };
      setUserSession(updatedSession);
      
      if (obra) {
        toast({
          title: 'Obra ativa alterada',
          description: `Agora você está trabalhando em: ${obra.nome_obra}`
        });
      }
    }
  };

  const value = {
    session,
    userSession,
    loading,
    signIn,
    signUp,
    signOut,
    setActiveObra,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
