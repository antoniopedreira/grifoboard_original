
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
    <header className="bg-white border-b shadow-sm z-40 relative">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold font-heading bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              GrifoBoard
            </h1>
          </div>

          {userSession.user && (
            <div className="flex items-center space-x-4">
              {userSession.obraAtiva && isTasksPage && (
                <div className="hidden md:flex items-center border-l pl-4 ml-4 border-gray-200">
                  <div className="flex items-center">
                    <Building2 className="w-4 h-4 text-gray-500 mr-2" />
                    <div>
                      <div className="text-xs text-muted-foreground">Obra ativa:</div>
                      <div className="font-medium text-sm">{userSession.obraAtiva.nome_obra}</div>
                    </div>
                  </div>
                </div>
              )}
              
              {userSession.obraAtiva && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs h-8 px-3 shadow-sm hover:shadow"
                  onClick={handleMudarObra}
                >
                  <Building2 className="h-3.5 w-3.5 mr-1.5" />
                  Mudar Obra
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8 hover:bg-red-50 hover:text-red-600"
                onClick={() => signOut()}
              >
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
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
