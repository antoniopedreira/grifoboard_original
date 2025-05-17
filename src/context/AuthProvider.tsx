
import { useEffect, useState } from 'react';
import { AuthContext, UserSession } from './AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Session, User } from '@supabase/supabase-js';
import { Obra } from '@/types/supabase';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [userSession, setUserSession] = useState<UserSession | null>({
    user: null,
    obraAtiva: null
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Function to map Supabase User to our UserSession format
  const mapUser = (user: User | null): UserSession['user'] => {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email || '',
    };
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUserSession({
          user: mapUser(session.user),
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
        setUserSession(prev => ({
          user: mapUser(session.user),
          obraAtiva: prev?.obraAtiva || null
        }));
      } else {
        setUserSession({
          user: null,
          obraAtiva: null
        });
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Recover active obra from localStorage
  useEffect(() => {
    if (userSession?.user) {
      const savedObra = localStorage.getItem(`obraAtiva_${userSession.user.id}`);
      if (savedObra) {
        try {
          const obra = JSON.parse(savedObra);
          setUserSession(prev => prev ? { ...prev, obraAtiva: obra } : null);
        } catch (e) {
          localStorage.removeItem(`obraAtiva_${userSession.user.id}`);
        }
      }
    }
  }, [userSession?.user]);

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
      throw error;
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
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUserSession({
        user: null,
        obraAtiva: null
      });
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

  const setObraAtiva = (obra: Obra | null) => {
    if (userSession) {
      const updatedSession = {
        ...userSession,
        obraAtiva: obra,
      };
      setUserSession(updatedSession);
      
      // Save to localStorage
      if (userSession.user && obra) {
        localStorage.setItem(`obraAtiva_${userSession.user.id}`, JSON.stringify(obra));
      } else if (userSession.user) {
        localStorage.removeItem(`obraAtiva_${userSession.user.id}`);
      }
      
      if (obra) {
        toast({
          title: 'Obra ativa alterada',
          description: `Agora você está trabalhando em: ${obra.nome_obra}`
        });
      }
    }
  };

  const value = {
    userSession: userSession || { user: null, obraAtiva: null },
    session: userSession || { user: null, obraAtiva: null },
    isLoading: loading,
    signIn,
    signUp,
    signOut,
    setObraAtiva,
    setUserSession: (session: UserSession | null) => setUserSession(session),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
