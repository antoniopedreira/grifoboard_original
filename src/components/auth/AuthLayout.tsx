import { ReactNode } from 'react';
import { Building2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  const features = [
    "Planejamento semanal inteligente",
    "PCP visual e em tempo real", 
    "Equipe sempre no ritmo certo"
  ];

  return (
    <div className="min-h-screen w-full flex bg-grifo-bg overflow-hidden">
      {/* Hero Section - 60% */}
      <div className="hidden lg:flex lg:w-3/5 relative bg-gradient-to-br from-grifo-bg to-grifo-surface/30">
        {/* Engineering Pattern Background */}
        <div className="absolute inset-0 grifo-pattern opacity-40"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 py-24">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-primary rounded-grifo-lg flex items-center justify-center shadow-grifo mr-4">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="grifo-h1 text-primary">Grifo</h1>
                <p className="grifo-small text-muted-foreground">Engenharia</p>
              </div>
            </div>
          </div>

          {/* Main Headline */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-accent leading-tight mb-4">
              Gerencie suas obras com
              <span className="text-primary block">inteligência e precisão</span>
            </h2>
            <p className="grifo-body text-muted-foreground max-w-lg">
              Acompanhe o desempenho das obras em tempo real, 
              otimize recursos e mantenha sua equipe sempre produtiva.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center">
                <CheckCircle className="w-5 h-5 text-success mr-3 flex-shrink-0" />
                <span className="grifo-body text-accent">{feature}</span>
              </div>
            ))}
          </div>

          {/* Decorative Elements */}
          <div className="absolute bottom-16 right-16 w-32 h-32 border-2 border-primary/20 rounded-grifo-lg rotate-12 opacity-60"></div>
          <div className="absolute top-24 right-32 w-20 h-20 bg-primary/10 rounded-full opacity-40"></div>
        </div>
      </div>

      {/* Auth Form Section - 40% */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 bg-primary rounded-grifo flex items-center justify-center shadow-grifo mr-3">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="grifo-h2 text-primary">Grifo</h1>
            </div>
          </div>

          {/* Form Card */}
          <div className="grifo-card p-8">
            <div className="mb-6">
              <h2 className="grifo-h3 mb-2">{title}</h2>
              {subtitle && (
                <p className="grifo-small text-muted-foreground">{subtitle}</p>
              )}
            </div>
            
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;