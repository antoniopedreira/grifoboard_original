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
  return <header className="bg-brand border-b border-brand-2/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-brand font-semibold text-sm">G</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-text-on-dark">GrifoBoard</h1>
              <div className="text-xs text-muted-on-dark">Controle do PCP de Obra</div>
            </div>
          </div>

          {userSession.user && <div className="flex items-center space-x-2 md:space-x-3">
              {userSession.obraAtiva && <div className="hidden md:flex items-center bg-text-on-dark/10 rounded-lg px-3 py-2 border border-text-on-dark/20">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center mr-2">
                      <Building2 className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-on-dark">Obra ativa:</div>
                      <div className="font-medium text-sm text-text-on-dark">
                        {userSession.obraAtiva.nome_obra}
                      </div>
                    </div>
                  </div>
                </div>}
              
              {userSession.obraAtiva && <Button 
                variant="outline" 
                size="sm" 
                className="smooth-button bg-transparent border-text-on-dark/30 text-text-on-dark hover:bg-brand-2 hover:border-text-on-dark/40 hover:text-text-on-dark text-xs md:text-sm px-2 md:px-3" 
                onClick={handleMudarObra}
              >
                  <Building2 className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                  <span className="hidden sm:inline ml-1 md:ml-0">Mudar Obra</span>
                </Button>}
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="smooth-button text-text-on-dark hover:bg-destructive/20 hover:text-destructive text-xs md:text-sm px-2 md:px-3" 
                onClick={async () => {
                  await signOut();
                  navigate('/auth');
                }}
              >
                <LogOut className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                <span className="hidden sm:inline ml-1 md:ml-0">Sair</span>
              </Button>
            </div>}
        </div>
      </div>
    </header>;
};
export default Header;