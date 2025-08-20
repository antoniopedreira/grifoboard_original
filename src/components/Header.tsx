import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Building2, LogOut, Search, Bell, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const { userSession, signOut, setObraAtiva } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleMudarObra = () => {
    setObraAtiva(null);
    navigate("/obras");
  };

  return (
    <header className="bg-grifo-bg border-b border-border sticky top-0 z-50 shadow-grifo">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo e branding */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary rounded-grifo-lg flex items-center justify-center shadow-grifo">
              <span className="text-primary-foreground font-bold text-lg">G</span>
            </div>
            <div>
              <h1 className="grifo-h3 text-primary">Grifo</h1>
              <div className="grifo-small">Engenharia</div>
            </div>
          </div>

          {/* Obra ativa (centro) */}
          {userSession?.user && userSession.obraAtiva && (
            <div className="hidden md:flex items-center bg-grifo-surface rounded-grifo px-4 py-2 shadow-sm">
              <Building2 className="w-5 h-5 text-accent mr-2" />
              <div>
                <div className="grifo-small">Obra ativa</div>
                <div className="grifo-body font-semibold text-accent">
                  {userSession.obraAtiva.nome_obra}
                </div>
              </div>
            </div>
          )}

          {/* Ações do usuário (direita) */}
          {userSession?.user && (
            <div className="flex items-center space-x-3">
              {/* Busca */}
              <Button variant="ghost" size="sm" className="rounded-grifo">
                <Search className="h-5 w-5 text-muted-foreground" />
              </Button>
              
              {/* Notificações */}
              <Button variant="ghost" size="sm" className="rounded-grifo relative">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-warning text-warning-foreground text-xs">
                  3
                </Badge>
              </Button>

              {/* Mudar obra */}
              {userSession.obraAtiva && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="rounded-grifo border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={handleMudarObra}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Mudar Obra
                </Button>
              )}
              
              {/* Menu do usuário */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary/10 rounded-grifo flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-grifo hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;