import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

const ForgotPasswordForm = ({ onBackToLogin }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const { toast } = useToast();
  const { resetPassword } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email obrigatório",
        description: "Digite seu email para recuperar a senha",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await resetPassword(email);
      setEmailSent(true);
      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao enviar email",
        description: error.message || "Não foi possível enviar o email de recuperação.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (emailSent) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-3">
          <div className="w-16 h-16 bg-[hsl(var(--grifo-gold))]/10 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-[hsl(var(--grifo-gold))]" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Email enviado!</h2>
          <p className="text-muted-foreground">
            Enviamos um link para redefinir sua senha para <strong>{email}</strong>
          </p>
        </div>
        
        <div className="space-y-4">
          <Button 
            type="button" 
            onClick={onBackToLogin}
            className="w-full h-12 font-semibold text-white bg-[hsl(var(--grifo-gold))] hover:bg-[hsl(var(--grifo-gold-hover))] shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
          >
            Voltar ao login
          </Button>
          
          <p className="text-sm text-muted-foreground">
            Não recebeu o email? Verifique sua pasta de spam ou{' '}
            <button 
              type="button"
              onClick={() => {
                setEmailSent(false);
                setEmail('');
              }}
              className="text-[hsl(var(--grifo-gold))] hover:underline font-medium"
            >
              tente novamente
            </button>
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3 text-center">
        <h2 className="text-xl font-semibold text-foreground">Esqueceu sua senha?</h2>
        <p className="text-sm text-muted-foreground">
          Digite seu email e enviaremos um link para redefinir sua senha
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="forgot-email" className="text-sm font-medium text-foreground">
          Email
        </Label>
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-[hsl(var(--grifo-gold))] transition-colors duration-200" />
          <Input 
            id="forgot-email" 
            type="email" 
            placeholder="seu@email.com" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="pl-12 h-12 rounded-xl border-border focus:border-[hsl(var(--grifo-gold))] focus:ring-2 focus:ring-[hsl(var(--grifo-gold))]/20 transition-all duration-300" 
            required
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="w-full h-12 font-semibold text-white bg-[hsl(var(--grifo-gold))] hover:bg-[hsl(var(--grifo-gold-hover))] shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl transform hover:scale-[1.02] active:scale-[0.98] border-0"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Enviando...
            </div>
          ) : (
            'Enviar link de recuperação'
          )}
        </Button>
        
        <Button 
          type="button" 
          variant="ghost"
          onClick={onBackToLogin}
          className="w-full h-12 font-medium text-muted-foreground hover:text-[hsl(var(--grifo-gold))] transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao login
        </Button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;