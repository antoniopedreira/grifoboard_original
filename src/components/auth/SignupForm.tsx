
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

const SignupForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const { signUp } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para continuar",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Senhas diferentes",
        description: "As senhas informadas não coincidem",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signUp(email, password);
      toast({
        title: "Cadastro realizado",
        description: "Verifique seu email para confirmar o registro.",
      });
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Não foi possível concluir seu cadastro.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        {/* Email field */}
        <div className="space-y-1.5">
          <Label htmlFor="signup-email" className="text-xs font-semibold text-gray-700">
            Email
          </Label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <Input 
              id="signup-email" 
              type="email" 
              placeholder="seu@email.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="pl-10 h-10 text-sm border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
              required
            />
          </div>
        </div>
        
        {/* Password field */}
        <div className="space-y-1.5">
          <Label htmlFor="signup-password" className="text-xs font-semibold text-gray-700">
            Senha
          </Label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <Input 
              id="signup-password" 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="pl-10 pr-10 h-10 text-sm border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
              required
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
              aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        
        {/* Confirm Password field */}
        <div className="space-y-1.5">
          <Label htmlFor="confirm-password" className="text-xs font-semibold text-gray-700">
            Confirmar Senha
          </Label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <Input 
              id="confirm-password" 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              className="pl-10 h-10 text-sm border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
              required
            />
          </div>
        </div>
      </div>
      
      {/* Signup button */}
      <Button 
        type="submit" 
        disabled={isLoading} 
        className="w-full h-10 font-semibold text-sm bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cadastrando...
          </div>
        ) : (
          "Cadastrar"
        )}
      </Button>
    </form>
  );
};

export default SignupForm;
