
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        {/* Email field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-white/90">
            Email
          </Label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-orange-400 transition-colors duration-200" />
            <Input 
              id="email" 
              type="email" 
              placeholder="seu@email.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="pl-12 h-12 text-white placeholder:text-white/40 border-white/20 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all duration-300 rounded-xl bg-white/10 backdrop-blur-sm focus:bg-white/15 hover:bg-white/12" 
              required
            />
          </div>
        </div>
        
        {/* Password field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-white/90">
            Senha
          </Label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-orange-400 transition-colors duration-200" />
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="pl-12 pr-12 h-12 text-white placeholder:text-white/40 border-white/20 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all duration-300 rounded-xl bg-white/10 backdrop-blur-sm focus:bg-white/15 hover:bg-white/12" 
              required
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-orange-400 focus:outline-none transition-colors duration-200 p-1 rounded-lg hover:bg-white/10"
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
            className="rounded border-white/30 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 h-4 w-4"
          />
          <Label 
            htmlFor="remember-me" 
            className="text-sm text-white/70 cursor-pointer select-none font-medium"
          >
            Lembrar-me
          </Label>
        </div>
        <button 
          type="button"
          className="text-sm text-white/70 hover:text-orange-400 font-medium hover:underline transition-all duration-200"
        >
          Esqueci a senha
        </button>
      </div>
      
      {/* Login button */}
      <Button 
        type="submit" 
        disabled={isLoading} 
        className="w-full h-12 mt-6 font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl transform hover:scale-[1.02] active:scale-[0.98] border-0"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Entrando...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Entrar
          </div>
        )}
      </Button>
    </form>
  );
};

export default LoginForm;
