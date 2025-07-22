
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
      <div className="space-y-6">
        {/* Email field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email
          </Label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-slate-600 transition-colors duration-200" />
            <Input 
              id="email" 
              type="email" 
              placeholder="seu@email.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="pl-12 h-14 text-base border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-all duration-300 rounded-2xl bg-white/50 backdrop-blur-sm focus:bg-white/80 hover:bg-white/70" 
              required
            />
          </div>
        </div>
        
        {/* Password field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-slate-700">
            Senha
          </Label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-slate-600 transition-colors duration-200" />
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="pl-12 pr-12 h-14 text-base border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-all duration-300 rounded-2xl bg-white/50 backdrop-blur-sm focus:bg-white/80 hover:bg-white/70" 
              required
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors duration-200 p-2 rounded-xl hover:bg-slate-100/50"
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
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center space-x-3">
          <Checkbox 
            id="remember-me" 
            checked={rememberMe} 
            onCheckedChange={(checked) => setRememberMe(checked === true)} 
            className="rounded-lg border-slate-300 data-[state=checked]:bg-slate-800 data-[state=checked]:border-slate-800"
          />
          <Label 
            htmlFor="remember-me" 
            className="text-sm text-slate-600 cursor-pointer select-none font-medium"
          >
            Lembrar-me
          </Label>
        </div>
        <button 
          type="button"
          className="text-sm text-slate-600 hover:text-slate-800 font-medium hover:underline transition-all duration-200"
        >
          Esqueci a senha
        </button>
      </div>
      
      {/* Login button */}
      <Button 
        type="submit" 
        disabled={isLoading} 
        className="w-full h-14 mt-8 font-semibold text-base bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-900 hover:to-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl transform hover:scale-[1.02] active:scale-[0.98]"
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
