import { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

type AuthView = 'login' | 'signup' | 'forgot';

const AuthForm = () => {
  const [view, setView] = useState<AuthView>('login');

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {view === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <LoginForm onForgotPassword={() => setView('forgot')} />
            
            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-muted-foreground mb-3">Não tem uma conta?</p>
              <Button 
                variant="outline" 
                onClick={() => setView('signup')}
                className="w-full border-primary/20 text-primary hover:bg-primary/5 hover:text-primary transition-colors"
              >
                Criar conta
              </Button>
            </div>
          </motion.div>
        )}

        {view === 'signup' && (
          <motion.div
            key="signup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <SignupForm />
            
            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-muted-foreground mb-3">Já tem uma conta?</p>
              <Button 
                variant="outline" 
                onClick={() => setView('login')}
                className="w-full border-primary/20 text-primary hover:bg-primary/5 hover:text-primary transition-colors"
              >
                Voltar ao Login
              </Button>
            </div>
          </motion.div>
        )}

        {view === 'forgot' && (
          <motion.div
            key="forgot"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <ForgotPasswordForm onBackToLogin={() => setView('login')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthForm;
