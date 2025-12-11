import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Obra, UserSession } from "@/types/supabase";
import { useToast } from "@/hooks/use-toast";
import { User, Session } from "@supabase/supabase-js";

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
  const mapUser = (user: User | null): UserSession["user"] => {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email || "",
      user_metadata: user.user_metadata, // ADICIONADO: Passando os metadados
    };
  };

  // Session conflict detection disabled - was causing false positives
  const handleSessionConflict = (currentSessionId: string) => {
    return false; // No conflict detection
  };

  // Monitor user activity to detect active sessions
  const updateActivity = () => {
    setLastActivity(Date.now());
    if (sessionId) {
      localStorage.setItem("last_activity", Date.now().toString());
    }
  };

  // Health check (no auto-logout on inactivity or conflicts)
  const checkSessionHealth = () => {
    if (!userSession.user || !sessionId) return;
    // Intentionally no-op: user will only be logged out when they click "Sair"
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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session && session.user) {
          // Generate or get session ID
          const newSessionId = generateSessionId();
          setSessionId(newSessionId);

          // Check for conflicts before proceeding
          if (!handleSessionConflict(newSessionId)) {
            // Store session ID and activity
            localStorage.setItem("current_session_id", newSessionId);
            localStorage.setItem("last_activity", Date.now().toString());

            // Get the active obra
            const obraAtiva = getInitialObraAtiva(session.user.id);
            setUserSession({ user: mapUser(session.user), obraAtiva });

            // Start health check interval
            healthCheckInterval = setInterval(checkSessionHealth, 60000); // Check every minute
          }
        } else {
          // Clear session on logout
          setUserSession({ user: null, obraAtiva: null });
          setSessionId(null);

          // Clear session-related localStorage
          ["current_session_id", "last_activity"].forEach((key) => {
            localStorage.removeItem(key);
          });

          // Clear user-specific data
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("obraAtiva_") || key.startsWith("user_")) {
              localStorage.removeItem(key);
            }
          });

          // Clear health check interval
          if (healthCheckInterval) {
            clearInterval(healthCheckInterval);
          }
        }
      } catch (error) {
        // On error, force logout to prevent corrupted state
        setUserSession({ user: null, obraAtiva: null });
        setSessionId(null);
      }

      setIsLoading(false);
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        if (error.message.includes("refresh_token_not_found") || error.message.includes("Invalid Refresh Token")) {
          localStorage.clear(); // Clear all localStorage on token errors
          setUserSession({ user: null, obraAtiva: null });
        }
      } else if (session?.user) {
        const newSessionId = generateSessionId();
        setSessionId(newSessionId);
        localStorage.setItem("current_session_id", newSessionId);

        const obraAtiva = getInitialObraAtiva(session.user.id);
        setUserSession({ user: mapUser(session.user), obraAtiva });
      }
      setIsLoading(false);
    });

    // Add activity listeners
    const activityEvents = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"];
    const handleActivity = () => updateActivity();

    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Remove visibility change listener to prevent layout shifts
    // Only track activity through user interactions, not tab switching

    // Cleanup
    return () => {
      subscription.unsubscribe();
      if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
      }
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      // Clear any existing session data before new login
      localStorage.removeItem("current_session_id");
      localStorage.removeItem("last_activity");

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        // Handle specific auth errors
        if (error.message.includes("Email not confirmed")) {
          throw new Error("Por favor, confirme seu email antes de fazer login.");
        } else if (error.message.includes("Invalid login credentials")) {
          throw new Error("Email ou senha incorretos.");
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
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      if (data?.session) {
        // Email confirmation disabled: user is already logged in
        toast({
          title: "Conta criada",
          description: "Bem-vindo!",
        });
      } else {
        // Email confirmation enabled
        toast({
          title: "Cadastro iniciado",
          description: `Enviamos um email de confirmação para ${email}. Verifique sua caixa de entrada e o spam.`,
        });
      }
    } catch (error: any) {
      const msg = typeof error?.message === "string" ? error.message : String(error);
      let friendly = msg;
      if (msg.includes("over_email_send_rate_limit") || msg.includes("request this after")) {
        friendly = "Por segurança, aguarde alguns segundos antes de tentar novamente.";
      } else if (msg.toLowerCase().includes("already registered")) {
        friendly = "Já existe uma conta para este email. Tente fazer login ou recuperar a senha.";
      }
      toast({
        title: "Erro no cadastro",
        description: friendly,
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
      const redirectUrl = `${window.location.origin}/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
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
      setSessionId(null);

      // Clear session-specific data
      ["current_session_id", "last_activity"].forEach((key) => {
        localStorage.removeItem(key);
      });

      // Clear user-specific data
      if (currentUserId) {
        localStorage.removeItem(`obraAtiva_${currentUserId}`);
      }

      // Clear any other localStorage items that might persist user data
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("obraAtiva_") || key.startsWith("user_")) {
          localStorage.removeItem(key);
        }
      });

      // Sign out from Supabase with scope: 'local' to only clear local session
      await supabase.auth.signOut({ scope: "local" });

      toast({
        title: "Desconectado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error: any) {
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
    setUserSession((prev) => {
      const newSession = prev ? { ...prev, obraAtiva: obra } : { user: null, obraAtiva: null };

      // Save active obra in localStorage for persistence
      if (prev?.user && obra) {
        localStorage.setItem(`obraAtiva_${prev.user.id}`, JSON.stringify(obra));
      } else if (prev?.user) {
        localStorage.removeItem(`obraAtiva_${prev.user.id}`);
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
    setUserSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
