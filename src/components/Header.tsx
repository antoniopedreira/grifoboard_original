
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Building2, LogOut } from "lucide-react";

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
    <header className="bg-white/95 backdrop-blur-md border-b border-border shadow-lg z-40 relative">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-primary p-2 rounded-xl shadow-md">
              <div className="text-white font-bold text-lg">G</div>
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading bg-gradient-primary bg-clip-text text-transparent">
                GrifoBoard
              </h1>
              <div className="text-xs text-muted-foreground">
                Sistema de Gestão de Obras
              </div>
            </div>
          </div>

          {userSession.user && (
            <div className="flex items-center space-x-4">
              {userSession.obraAtiva && isTasksPage && (
                <div className="hidden md:flex items-center bg-muted/50 rounded-xl px-4 py-2 ml-4">
                  <div className="flex items-center">
                    <div className="bg-primary/10 p-2 rounded-lg mr-3">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">Obra ativa:</div>
                      <div className="font-semibold text-sm text-foreground">{userSession.obraAtiva.nome_obra}</div>
                    </div>
                  </div>
                </div>
              )}
              
              {userSession.obraAtiva && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="icon-button h-10 px-4 font-medium"
                  onClick={handleMudarObra}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Mudar Obra
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="text-sm h-10 px-4 hover:bg-destructive/10 hover:text-destructive font-medium transition-all duration-300"
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
