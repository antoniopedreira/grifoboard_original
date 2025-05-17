
import { createContext, useContext } from 'react';
import { Obra } from '@/types/supabase';
import { User } from '@supabase/supabase-js';

// Define UserSession type
export interface UserSession {
  user: {
    id: string;
    email: string;
  } | null;
  obraAtiva: Obra | null;
}

// Define AuthContextType with all required methods and properties
export interface AuthContextType {
  userSession: UserSession;
  session: UserSession;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setObraAtiva: (obra: Obra | null) => void;
  setUserSession: (session: UserSession | null) => void;
}

// Create and export the AuthContext
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export the useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
