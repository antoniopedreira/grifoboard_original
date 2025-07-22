
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

const LoginForm = () => {
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
      <div className="space-y-5">
        {/* Email field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
            Email
          </Label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors duration-200" />
            <Input 
              id="email" 
              type="email" 
              placeholder="seu@email.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="pl-12 h-12 text-sm border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 rounded-xl bg-gray-50/50 focus:bg-white hover:bg-white" 
              required
            />
          </div>
        </div>
        
        {/* Password field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
            Senha
          </Label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors duration-200" />
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="pl-12 pr-12 h-12 text-sm border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 rounded-xl bg-gray-50/50 focus:bg-white hover:bg-white" 
              required
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary focus:outline-none transition-colors duration-200 p-1 rounded-lg hover:bg-gray-100"
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
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center space-x-3">
          <Checkbox 
            id="remember-me" 
            checked={rememberMe} 
            onCheckedChange={(checked) => setRememberMe(checked === true)} 
            className="rounded-md"
          />
          <Label 
            htmlFor="remember-me" 
            className="text-sm text-gray-600 cursor-pointer select-none font-medium"
          >
            Lembrar-me
          </Label>
        </div>
        <button 
          type="button"
          className="text-sm text-primary hover:text-primary/80 font-semibold hover:underline transition-all duration-200"
        >
          Esqueci a senha
        </button>
      </div>
      
      {/* Login button */}
      <Button 
        type="submit" 
        disabled={isLoading} 
        className="w-full h-12 font-semibold text-sm bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Entrando...
          </div>
        ) : (
          "Entrar"
        )}
      </Button>
    </form>
  );
};

export default LoginForm;
