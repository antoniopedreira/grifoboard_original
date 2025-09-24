
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
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo de volta!",
      });
      // Redirect to obras page after successful login
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
    <form onSubmit={handleSubmit} className="space-y-6" style={{ scrollMarginBottom: '140px' }}>
      <div className="space-y-4">
        {/* Email field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium" style={{ color: '#1E2836' }}>
            Email
          </Label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#C7A347] transition-colors duration-200" />
            <Input 
              id="email" 
              type="email" 
              placeholder="seu@email.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="pl-12 h-12 rounded-xl border-gray-300 focus:border-[#C7A347] focus:ring-2 focus:ring-[#C7A347]/20 transition-all duration-300" 
              required
            />
          </div>
        </div>
        
        {/* Password field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium" style={{ color: '#1E2836' }}>
            Senha
          </Label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#C7A347] transition-colors duration-200" />
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="pl-12 pr-12 h-12 rounded-xl border-gray-300 focus:border-[#C7A347] focus:ring-2 focus:ring-[#C7A347]/20 transition-all duration-300" 
              required
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C7A347] focus:outline-none transition-colors duration-200 p-1 rounded-lg hover:bg-gray-50"
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <Checkbox 
            id="remember-me" 
            checked={rememberMe} 
            onCheckedChange={(checked) => setRememberMe(checked === true)} 
            className="rounded border-gray-300 data-[state=checked]:bg-[#C7A347] data-[state=checked]:border-[#C7A347] h-4 w-4"
          />
          <Label 
            htmlFor="remember-me" 
            className="text-sm cursor-pointer select-none font-medium"
            style={{ color: '#1E2836' }}
          >
            Manter-me conectado
          </Label>
        </div>
        <button 
          type="button"
          onClick={onForgotPassword}
          className="text-sm font-medium hover:underline transition-all duration-200"
          style={{ color: '#1E2836' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#C7A347'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#1E2836'}
        >
          Esqueci minha senha
        </button>
      </div>
      
      {/* Login button */}
      <div className="pt-2">
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="w-full font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl transform hover:scale-[1.02] active:scale-[0.98] border-0"
          style={{ 
            height: '48px',
            backgroundColor: '#C7A347'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B7943F'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C7A347'}
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
      </div>
      
    </form>
  );
};

export default LoginForm;
