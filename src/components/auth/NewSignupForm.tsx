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
import { Check, X } from 'lucide-react';

const signupSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, 'Você deve aceitar os termos')
}).refine(data => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"]
});

type SignupFormData = z.infer<typeof signupSchema>;

const NewSignupForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      acceptTerms: false
    }
  });

  const password = watch('password');
  const acceptTerms = watch('acceptTerms');

  // Password strength indicators
  const passwordChecks = [
    { label: 'Pelo menos 8 caracteres', valid: password?.length >= 8 },
    { label: 'Uma letra maiúscula', valid: /[A-Z]/.test(password || '') },
    { label: 'Um número', valid: /[0-9]/.test(password || '') }
  ];

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      await signUp(data.email, data.password);
      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu e-mail para ativar sua conta."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <AuthInput
        label="E-mail profissional"
        type="email"
        placeholder="seu@empresa.com"
        {...register('email')}
        error={errors.email?.message}
      />

      <div className="space-y-3">
        <AuthInput
          label="Senha"
          type="password"
          placeholder="••••••••"
          showPasswordToggle
          {...register('password')}
          error={errors.password?.message}
        />
        
        {/* Password Strength Indicator */}
        {password && (
          <div className="space-y-2">
            <p className="grifo-small text-muted-foreground">Força da senha:</p>
            <div className="space-y-1">
              {passwordChecks.map((check, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {check.valid ? (
                    <Check className="w-3 h-3 text-success" />
                  ) : (
                    <X className="w-3 h-3 text-muted-foreground" />
                  )}
                  <span className={`text-xs ${check.valid ? 'text-success' : 'text-muted-foreground'}`}>
                    {check.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AuthInput
        label="Confirmar senha"
        type="password"
        placeholder="••••••••"
        showPasswordToggle
        {...register('confirmPassword')}
        error={errors.confirmPassword?.message}
      />

      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="acceptTerms"
            checked={acceptTerms}
            onCheckedChange={(checked) => setValue('acceptTerms', !!checked)}
          />
          <label 
            htmlFor="acceptTerms" 
            className="grifo-small text-muted-foreground cursor-pointer select-none leading-relaxed"
          >
            Aceito os{' '}
            <Link to="/terms" className="text-primary hover:text-primary-hover">
              Termos de Uso
            </Link>{' '}
            e{' '}
            <Link to="/privacy" className="text-primary hover:text-primary-hover">
              Política de Privacidade
            </Link>
          </label>
        </div>
        {errors.acceptTerms && (
          <p className="text-destructive text-sm">{errors.acceptTerms.message}</p>
        )}
      </div>

      <AuthButton
        type="submit"
        loading={isLoading}
        className="w-full"
        size="lg"
      >
        Criar minha conta gratuita
      </AuthButton>

      <div className="text-center">
        <span className="grifo-small text-muted-foreground">
          Já tem uma conta?{' '}
        </span>
        <Link 
          to="/auth/login"
          className="grifo-small text-primary hover:text-primary-hover font-medium transition-colors"
        >
          Faça login
        </Link>
      </div>
    </form>
  );
};

export default NewSignupForm;