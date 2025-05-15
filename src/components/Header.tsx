
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";

const Header = () => {
  const { userSession, signOut, setObraAtiva } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isTasksPage = location.pathname === "/tarefas";
  const isDashboardPage = location.pathname === "/dashboard";

  const handleMudarObra = () => {
    setObraAtiva(null);
    navigate("/obras");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <header className="bg-white border-b z-40 sticky top-0">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 
            className="text-2xl font-bold text-primary cursor-pointer"
            onClick={() => navigate("/obras")}
          >
            GrifoBoard
          </h1>

          {userSession.user && (
            <div className="flex items-center gap-4">
              {userSession.obraAtiva && (isTasksPage || isDashboardPage) && (
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

              <Button 
                variant="outline" 
                onClick={handleLogout}
                size="icon"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
