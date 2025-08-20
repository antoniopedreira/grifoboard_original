import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';
import AuthButton from '@/components/auth/AuthButton';

const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido')
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual forgot password logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setEmailSent(true);
      toast({
        title: "E-mail enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao enviar e-mail",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const ForgotPasswordForm = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-primary/10 rounded-grifo-lg flex items-center justify-center mx-auto mb-4">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <p className="grifo-body text-muted-foreground">
          Digite seu e-mail e enviaremos um link para redefinir sua senha.
        </p>
      </div>

      <AuthInput
        label="E-mail"
        type="email"
        placeholder="seu@email.com"
        {...register('email')}
        error={errors.email?.message}
      />

      <AuthButton
        type="submit"
        loading={isLoading}
        className="w-full"
        size="lg"
      >
        Enviar link de recuperação
      </AuthButton>

      <div className="text-center">
        <Link 
          to="/auth/login"
          className="inline-flex items-center grifo-small text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para o login
        </Link>
      </div>
    </form>
  );

  const EmailSentMessage = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-success/10 rounded-grifo-lg flex items-center justify-center mx-auto">
        <Mail className="w-8 h-8 text-success" />
      </div>
      
      <div>
        <h3 className="grifo-h3 mb-2">E-mail enviado!</h3>
        <p className="grifo-body text-muted-foreground mb-4">
          Enviamos um link de recuperação para:
        </p>
        <p className="font-medium text-primary">{getValues('email')}</p>
      </div>

      <div className="grifo-surface p-4 rounded-grifo">
        <p className="grifo-small text-muted-foreground">
          Não recebeu o e-mail? Verifique sua caixa de spam ou{' '}
          <button 
            onClick={() => setEmailSent(false)}
            className="text-primary hover:text-primary-hover font-medium"
          >
            tente novamente
          </button>
        </p>
      </div>

      <AuthButton
        variant="outline"
        className="w-full"
        onClick={() => window.location.href = '/auth/login'}
      >
        Voltar para o login
      </AuthButton>
    </div>
  );

  return (
    <AuthLayout 
      title="Esqueceu sua senha?" 
      subtitle="Não se preocupe, isso acontece com todos"
    >
      {emailSent ? <EmailSentMessage /> : <ForgotPasswordForm />}
    </AuthLayout>
  );
};

export default ForgotPassword;