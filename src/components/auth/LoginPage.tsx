import { useState } from 'react';
import { Button } from '@/components/ui/button';
import AuthLayout from './AuthLayout';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ForgotPasswordForm from './ForgotPasswordForm';

type AuthView = 'login' | 'signup' | 'forgot';

const LoginPage = () => {
  const [currentView, setCurrentView] = useState<AuthView>('login');
  
  const getTitle = () => {
    switch (currentView) {
      case 'signup': return 'Criar conta';
      case 'forgot': return 'Recuperar senha';
      default: return 'Entrar';
    }
  };
  
  return (
    <AuthLayout title={getTitle()}>
      {currentView === 'login' && (
        <div className="space-y-6">
          <LoginForm onForgotPassword={() => setCurrentView('forgot')} />
          
          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>
          
          {/* Create account button */}
          <Button 
            type="button" 
            variant="outline"
            onClick={() => setCurrentView('signup')}
            className="w-full h-12 font-semibold border-[hsl(var(--grifo-gold))] text-[hsl(var(--grifo-gold))] hover:bg-[hsl(var(--grifo-gold))]/10 hover:text-[hsl(var(--grifo-gold-hover))] transition-all duration-300 rounded-xl"
          >
            Criar conta
          </Button>
        </div>
      )}
      
      {currentView === 'signup' && (
        <div className="space-y-6">
          <SignupForm />
          
          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>
          
          {/* Back to login */}
          <Button 
            type="button" 
            variant="outline"
            onClick={() => setCurrentView('login')}
            className="w-full h-12 font-semibold border-[hsl(var(--grifo-gold))] text-[hsl(var(--grifo-gold))] hover:bg-[hsl(var(--grifo-gold))]/10 hover:text-[hsl(var(--grifo-gold-hover))] transition-all duration-300 rounded-xl"
          >
            Já tenho conta
          </Button>
        </div>
      )}
      
      {currentView === 'forgot' && (
        <ForgotPasswordForm onBackToLogin={() => setCurrentView('login')} />
      )}
    </AuthLayout>
  );
};

export default LoginPage;