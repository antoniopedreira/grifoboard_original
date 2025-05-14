
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import MainPageContent from "@/components/MainPageContent";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session.user) {
      // Redireciona para a página de autenticação se não estiver logado
      navigate('/auth');
    } else if (!session.obraAtiva) {
      // Redireciona para a seleção de obras se não tiver uma obra ativa
      navigate('/obras');
    }
  }, [session, navigate]);

  // Só renderiza a página principal se o usuário estiver logado e com uma obra ativa
  if (!session.user || !session.obraAtiva) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <MainPageContent />
      </main>
    </div>
  );
};

export default Index;
