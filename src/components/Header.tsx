
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const { userSession, signOut, setObraAtiva } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isTasksPage = location.pathname === "/tarefas";

  const handleMudarObra = () => {
    setObraAtiva(null);
    navigate("/obras");
  };

  return (
    <header className="bg-white border-b z-40 relative">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{ color: "#021C2F" }}>
            GrifoBoard
          </h1>

          {userSession.user && (
            <div className="flex items-center space-x-4">
              {userSession.obraAtiva && isTasksPage && (
                <div className="hidden md:block">
                  <div className="text-sm text-muted-foreground">Obra ativa:</div>
                  <div className="font-medium">{userSession.obraAtiva.nome_obra}</div>
                </div>
              )}
              
              {userSession.obraAtiva && (
                <Button 
                  variant="secondary" 
                  onClick={handleMudarObra}
                >
                  Mudar Obra
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
