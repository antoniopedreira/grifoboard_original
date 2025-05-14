
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const Header = () => {
  const { userSession, signOut, setObraAtiva } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold text-primary">
              <NavLink to="/">PCP Manager</NavLink>
            </h1>

            {userSession.user && (
              <nav className="hidden md:flex space-x-4">
                {userSession.obraAtiva && (
                  <NavLink 
                    to="/" 
                    className={({isActive}) => 
                      isActive ? "font-medium text-primary" : "text-gray-600 hover:text-primary"
                    }
                  >
                    Tarefas
                  </NavLink>
                )}
                <NavLink 
                  to="/obras" 
                  className={({isActive}) => 
                    isActive ? "font-medium text-primary" : "text-gray-600 hover:text-primary"
                  }
                >
                  Obras
                </NavLink>
              </nav>
            )}
          </div>

          {userSession.user ? (
            <div className="flex items-center space-x-4">
              {userSession.obraAtiva && (
                <div className="hidden md:block">
                  <div className="text-sm text-muted-foreground">Obra ativa:</div>
                  <div className="font-medium">{userSession.obraAtiva.nome_obra}</div>
                </div>
              )}
              <Button variant="outline" onClick={handleSignOut}>
                Sair
              </Button>
              {userSession.obraAtiva && (
                <Button 
                  variant="secondary" 
                  onClick={() => setObraAtiva(null)}
                >
                  Mudar Obra
                </Button>
              )}
            </div>
          ) : (
            <Button asChild>
              <NavLink to="/auth">Entrar</NavLink>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
