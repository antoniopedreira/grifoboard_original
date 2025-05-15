
import { useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import { RegistryProvider } from "@/context/RegistryContext";
import { useAuth } from "@/context/AuthContext";

const App = () => {
  const location = useLocation();
  
  // Verificar se há um tema salvo e aplicar no carregamento inicial
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <AuthProvider>
      <RegistryProvider>
        <AppLayout>
          <Outlet />
        </AppLayout>
        <Toaster />
      </RegistryProvider>
    </AuthProvider>
  );
};

// Layout component to manage header visibility
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { userSession } = useAuth();
  const isAuthPage = location.pathname === '/auth';

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {!isAuthPage && <Header />}
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        {children}
      </main>
    </div>
  );
};

export default App;
