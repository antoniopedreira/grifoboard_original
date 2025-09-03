import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AuthLayout from './AuthLayout';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import ResetPasswordForm from './ResetPasswordForm';

type AuthView = 'login' | 'signup' | 'forgot' | 'reset';

const LoginPage = () => {
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const location = useLocation();
  
  // Check URL hash for password reset
  useEffect(() => {
    const hash = location.hash;
    if (hash.includes('type=recovery') || hash.includes('reset-password')) {
      setCurrentView('reset');
    }
  }, [location.hash]);
  
  const getTitle = () => {
    switch (currentView) {
      case 'signup': return 'Criar conta';
      case 'forgot': return 'Recuperar senha';
      case 'reset': return 'Nova senha';
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
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">ou</span>
            </div>
          </div>
          
          {/* Create account button */}
          <Button 
            type="button" 
            variant="outline"
            onClick={() => setCurrentView('signup')}
            className="w-full font-semibold transition-all duration-300 rounded-xl border-[#C7A347] text-[#C7A347] hover:bg-[#C7A347] hover:text-white"
            style={{ height: '48px' }}
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
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">ou</span>
            </div>
          </div>
          
          {/* Back to login */}
          <Button 
            type="button" 
            variant="outline"
            onClick={() => setCurrentView('login')}
            className="w-full font-semibold transition-all duration-300 rounded-xl border-[#C7A347] text-[#C7A347] hover:bg-[#C7A347] hover:text-white"
            style={{ height: '48px' }}
          >
            Já tenho conta
          </Button>
        </div>
      )}
      
      {currentView === 'forgot' && (
        <ForgotPasswordForm onBackToLogin={() => setCurrentView('login')} />
      )}
      
      {currentView === 'reset' && (
        <ResetPasswordForm onBackToLogin={() => setCurrentView('login')} />
      )}
    </AuthLayout>
  );
};

export default LoginPage;