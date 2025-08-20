import AuthLayout from '@/components/auth/AuthLayout';
import NewLoginForm from '@/components/auth/NewLoginForm';

const Login = () => {
  return (
    <AuthLayout 
      title="Bem-vindo de volta" 
      subtitle="Entre na sua conta para acessar seus projetos"
    >
      <NewLoginForm />
    </AuthLayout>
  );
};

export default Login;