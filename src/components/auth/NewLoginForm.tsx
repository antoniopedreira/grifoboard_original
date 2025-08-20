import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import AuthInput from './AuthInput';
import AuthButton from './AuthButton';
import { Checkbox } from '@/components/ui/checkbox';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
  rememberMe: z.boolean().optional()
});

type LoginFormData = z.infer<typeof loginSchema>;

const NewLoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false
    }
  });

  const rememberMe = watch('rememberMe');

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await signIn(data.email, data.password);
      toast({
        title: "Bem-vindo de volta!",
        description: "Login realizado com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Credenciais inválidas. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <AuthInput
        label="E-mail"
        type="email"
        placeholder="seu@email.com"
        {...register('email')}
        error={errors.email?.message}
      />

      <AuthInput
        label="Senha"
        type="password"
        placeholder="••••••••"
        showPasswordToggle
        {...register('password')}
        error={errors.password?.message}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="rememberMe"
            checked={rememberMe}
            onCheckedChange={(checked) => setValue('rememberMe', !!checked)}
          />
          <label 
            htmlFor="rememberMe" 
            className="grifo-small text-muted-foreground cursor-pointer select-none"
          >
            Manter-me conectado
          </label>
        </div>
        
        <Link 
          to="/auth/forgot-password"
          className="grifo-small text-primary hover:text-primary-hover transition-colors"
        >
          Esqueci minha senha
        </Link>
      </div>

      <AuthButton
        type="submit"
        loading={isLoading}
        className="w-full"
        size="lg"
      >
        Entrar na plataforma
      </AuthButton>

      <div className="text-center">
        <span className="grifo-small text-muted-foreground">
          Não tem uma conta?{' '}
        </span>
        <Link 
          to="/auth/signup"
          className="grifo-small text-primary hover:text-primary-hover font-medium transition-colors"
        >
          Crie sua conta gratuita
        </Link>
      </div>
    </form>
  );
};

export default NewLoginForm;