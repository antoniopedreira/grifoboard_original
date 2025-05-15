
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const Header = () => {
  const { userSession, signOut, setObraAtiva } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">("dark"); // Iniciar com tema escuro

  // Função para alternar entre os modos claro/escuro
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
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
    } else {
      // Se não houver preferência, usar tema escuro por padrão
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-background border-b border-border shadow-md dark:shadow-elegant">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl md:text-3xl font-bold text-primary-gold flex items-center">
              <span className="mr-2">GrifoBoard</span>
            </h1>

            {userSession.user && (
              <nav className="hidden md:flex space-x-4">
                {userSession.obraAtiva && (
                  <NavLink 
                    to="/" 
                    className={({isActive}) => 
                      isActive ? "font-medium text-primary-gold" : "text-foreground/80 hover:text-primary-gold transition-colors duration-200"
                    }
                  >
                    Tarefas
                  </NavLink>
                )}
                <NavLink 
                  to="/obras" 
                  className={({isActive}) => 
                    isActive ? "font-medium text-primary-gold" : "text-foreground/80 hover:text-primary-gold transition-colors duration-200"
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
              className="rounded-full hover:bg-secondary/50 transition-colors duration-200"
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
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="rounded-2xl border-primary-gold text-primary-gold hover:bg-primary-gold/10 transition-all duration-200"
                >
                  Sair
                </Button>
                {userSession.obraAtiva && (
                  <Button 
                    variant="secondary" 
                    onClick={() => setObraAtiva(null)}
                    className="rounded-2xl bg-primary-gold text-white hover:bg-primary-gold/80 transition-all duration-200"
                  >
                    Mudar Obra
                  </Button>
                )}
              </div>
            ) : (
              <Button 
                asChild
                className="rounded-2xl bg-primary-gold text-white hover:bg-primary-gold/80 transition-all duration-200"
              >
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
