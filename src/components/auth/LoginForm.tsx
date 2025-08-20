
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginFormProps {
  onForgotPassword?: () => void;
}

const LoginForm = ({ onForgotPassword }: LoginFormProps = {}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para continuar",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signIn(email, password);
      navigate('/obras');
    } catch (error: any) {
      toast({
        title: "Erro ao entrar",
        description: error.message || "Falha na autenticação. Verifique suas credenciais.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Email field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </Label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-[hsl(var(--grifo-gold))] transition-colors duration-200" />
            <Input 
              id="email" 
              type="email" 
              placeholder="seu@email.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="pl-12 h-12 rounded-xl border-border focus:border-[hsl(var(--grifo-gold))] focus:ring-2 focus:ring-[hsl(var(--grifo-gold))]/20 transition-all duration-300" 
              required
            />
          </div>
        </div>
        
        {/* Password field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-foreground">
            Senha
          </Label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-[hsl(var(--grifo-gold))] transition-colors duration-200" />
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="pl-12 pr-12 h-12 rounded-xl border-border focus:border-[hsl(var(--grifo-gold))] focus:ring-2 focus:ring-[hsl(var(--grifo-gold))]/20 transition-all duration-300" 
              required
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[hsl(var(--grifo-gold))] focus:outline-none transition-colors duration-200 p-1 rounded-lg hover:bg-accent"
              aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Remember me & Forgot password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Checkbox 
            id="remember-me" 
            checked={rememberMe} 
            onCheckedChange={(checked) => setRememberMe(checked === true)} 
            className="rounded border-border data-[state=checked]:bg-[hsl(var(--grifo-gold))] data-[state=checked]:border-[hsl(var(--grifo-gold))] h-4 w-4"
          />
          <Label 
            htmlFor="remember-me" 
            className="text-sm text-muted-foreground cursor-pointer select-none font-medium"
          >
            Manter-me conectado
          </Label>
        </div>
        <button 
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-muted-foreground hover:text-[hsl(var(--grifo-gold))] font-medium hover:underline transition-all duration-200"
        >
          Esqueci minha senha
        </button>
      </div>
      
      {/* Login button */}
      <Button 
        type="submit" 
        disabled={isLoading} 
        className="w-full h-12 font-semibold text-white bg-[hsl(var(--grifo-gold))] hover:bg-[hsl(var(--grifo-gold-hover))] shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl transform hover:scale-[1.02] active:scale-[0.98] border-0"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Entrando...
          </div>
        ) : (
          'Entrar'
        )}
      </Button>
    </form>
  );
};

export default LoginForm;
