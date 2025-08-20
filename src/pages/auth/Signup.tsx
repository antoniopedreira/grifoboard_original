import AuthLayout from '@/components/auth/AuthLayout';
import NewSignupForm from '@/components/auth/NewSignupForm';

const Signup = () => {
  return (
    <AuthLayout 
      title="Crie sua conta" 
      subtitle="Gerencie suas obras com inteligência e precisão"
    >
      <NewSignupForm />
    </AuthLayout>
  );
};

export default Signup;