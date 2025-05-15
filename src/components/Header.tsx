
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const Header = () => {
  const { userSession, signOut, setObraAtiva } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Função para alternar entre os modos claro/escuro
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", newTheme);
  };

  // Detectar preferência do sistema e configuração salva
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme) {
      setTheme(savedTheme as "light" | "dark");
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else if (prefersDark) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-background border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold text-primary flex items-center">
              <img 
                src="/logo-light.png" 
                alt="GrifoBoard" 
                className="h-8 mr-2 hidden dark:block" 
              />
              <img 
                src="/logo-dark.png" 
                alt="GrifoBoard" 
                className="h-8 mr-2 block dark:hidden" 
              />
              <NavLink to="/">GrifoBoard</NavLink>
            </h1>

            {userSession.user && (
              <nav className="hidden md:flex space-x-4">
                {userSession.obraAtiva && (
                  <NavLink 
                    to="/" 
                    className={({isActive}) => 
                      isActive ? "font-medium text-primary" : "text-foreground/80 hover:text-primary"
                    }
                  >
                    Tarefas
                  </NavLink>
                )}
                <NavLink 
                  to="/obras" 
                  className={({isActive}) => 
                    isActive ? "font-medium text-primary" : "text-foreground/80 hover:text-primary"
                  }
                >
                  Obras
                </NavLink>
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <span className="sr-only">Toggle theme</span>
            </Button>

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
      </div>
    </header>
  );
};

export default Header;
