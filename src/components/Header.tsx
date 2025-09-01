import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Building2, LogOut } from "lucide-react";
const Header = () => {
  const {
    userSession,
    signOut,
    setObraAtiva
  } = useAuth();
  const navigate = useNavigate();
  const handleMudarObra = () => {
    setObraAtiva(null);
    navigate("/obras");
  };
  return <header className="frosted-glass border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-semibold text-sm">G</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">GrifoBoard</h1>
              <div className="text-xs text-muted-foreground">Controle do PCP de Obra</div>
            </div>
          </div>

          {userSession.user && <div className="flex items-center space-x-3">
              {userSession.obraAtiva && <div className="hidden md:flex items-center bg-muted/50 rounded-lg px-3 py-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-2">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Obra ativa:</div>
                      <div className="font-medium text-sm text-foreground">
                        {userSession.obraAtiva.nome_obra}
                      </div>
                    </div>
                  </div>
                </div>}
              
              {userSession.obraAtiva && <Button variant="outline" size="sm" className="smooth-button" onClick={handleMudarObra}>
                  <Building2 className="h-4 w-4 mr-2" />
                  Mudar Obra
                </Button>}
              
              <Button variant="ghost" size="sm" className="smooth-button hover:bg-destructive/10 hover:text-destructive" onClick={async () => {
            await signOut();
            navigate('/auth');
          }}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>}
        </div>
      </div>
    </header>;
};
export default Header;