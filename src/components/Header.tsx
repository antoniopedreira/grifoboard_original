
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

const Header = () => {
  const { userSession, signOut, setObraAtiva } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-background border-b border-border transition-colors duration-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold text-primary">
              <NavLink to="/">GrifoBoard</NavLink>
            </h1>

            {userSession.user && (
              <nav className="hidden md:flex space-x-4">
                {userSession.obraAtiva && (
                  <NavLink 
                    to="/" 
                    className={({isActive}) => 
                      isActive ? "font-medium text-primary" : "text-foreground/80 hover:text-primary transition-colors"
                    }
                  >
                    Tarefas
                  </NavLink>
                )}
                <NavLink 
                  to="/obras" 
                  className={({isActive}) => 
                    isActive ? "font-medium text-primary" : "text-foreground/80 hover:text-primary transition-colors"
                  }
                >
                  Obras
                </NavLink>
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {userSession.user ? (
              <>
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
              </>
            ) : (
              <Button asChild>
                <NavLink to="/auth">Entrar</NavLink>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
