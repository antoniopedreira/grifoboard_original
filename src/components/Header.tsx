
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const Header = () => {
  const { session, signOut, setObraAtiva } = useAuth();

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

            {session.user && (
              <nav className="hidden md:flex space-x-4">
                {session.obraAtiva && (
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

          {session.user ? (
            <div className="flex items-center space-x-4">
              {session.obraAtiva && (
                <div className="hidden md:block">
                  <div className="text-sm text-muted-foreground">Obra ativa:</div>
                  <div className="font-medium">{session.obraAtiva.nome_obra}</div>
                </div>
              )}
              <Button variant="outline" onClick={handleSignOut}>
                Sair
              </Button>
              {session.obraAtiva && (
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
