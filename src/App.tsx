import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { RegistryProvider } from "@/context/RegistryContext";
// O Header foi removido do layout de autenticação, então não precisamos renderizá-lo aqui
import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
import Index from "@/pages/Index";
import Obras from "@/pages/Obras";
import DiarioObra from "@/pages/DiarioObra";
import NotFound from "@/pages/NotFound";
import MasterAdmin from "@/pages/MasterAdmin";
import Formularios from "@/pages/Formularios";
import BaseDeDados from "@/pages/BaseDeDados";
import Playbook from "@/pages/Playbook";
import Marketplace from "@/pages/Marketplace";
import FormProfissionais from "@/pages/form/Profissionais";
import FormEmpresas from "@/pages/form/Empresas";
import FormFornecedores from "@/pages/form/Fornecedores";
import { useEffect, useState } from "react";
import { Obra } from "./types/supabase";
import { ScrollArea } from "@/components/ui/scroll-area";
import CustomSidebar from "@/components/CustomSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "./components/ui/button";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// Componente Mobile Nav para telas pequenas
const MobileNav = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-primary">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-primary border-r-0 w-72">
        <CustomSidebar />
        <style>{`
          [data-radix-collection-item] aside { display: flex !important; width: 100%; }
        `}</style>
      </SheetContent>
    </Sheet>
  );
};

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth" || location.pathname === "/reset-password";
  const isFormPage = location.pathname.startsWith("/form/");

  // Layout do App (Dashboard, Obras, etc)
  const isAppPage = !isAuthPage && !isFormPage;

  // Layout Público / Autenticação (Login, Cadastro, Forms Públicos)
  if (!isAppPage) {
    return (
      <div className="flex flex-col min-h-screen bg-background font-sans">
        {/* CORREÇÃO: Header removido. As páginas de auth/form controlam seu próprio layout */}
        <main className="flex-1 flex flex-col">{children}</main>
      </div>
    );
  }

  // Layout Logado (Sidebar + Conteúdo)
  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans">
      {/* Sidebar Desktop */}
      <CustomSidebar />

      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {/* Header Mobile Simplificado */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-border shadow-sm z-20">
          <div className="flex items-center gap-2">
            <img src="/lovable-uploads/grifo-logo-header.png" className="h-8 w-auto" alt="Grifo" />
            <span className="font-bold text-primary font-heading">GrifoBoard</span>
          </div>
          <MobileNav />
        </div>

        {/* Área de Conteúdo */}
        <main className="flex-1 relative overflow-hidden flex flex-col bg-background">
          <ScrollArea className="flex-1 h-full">
            <div className="p-6 md:p-8 max-w-[1600px] mx-auto w-full pb-20">{children}</div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
};

const RouteRestorer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/auth" && location.pathname !== "/reset-password") {
      sessionStorage.setItem("lastRoute", location.pathname);
    }
  }, [location.pathname]);

  return null;
};

function App() {
  const handleObraSelect = (obra: Obra) => {
    // Selection logic handled by context
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/form/profissionais" element={<FormProfissionais />} />
          <Route path="/form/empresas" element={<FormEmpresas />} />
          <Route path="/form/fornecedores" element={<FormFornecedores />} />

          {/* Rotas privadas e Auth */}
          <Route
            path="/*"
            element={
              <AuthProvider>
                <RegistryProvider>
                  <RouteRestorer />
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<Navigate to="/obras" replace />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/obras" element={<Obras onObraSelect={handleObraSelect} />} />
                      <Route path="/master-admin" element={<MasterAdmin />} />
                      <Route path="/formularios" element={<Formularios />} />
                      <Route path="/base-de-dados" element={<BaseDeDados />} />
                      <Route path="/playbook" element={<Playbook />} />
                      <Route path="/marketplace" element={<Marketplace />} />
                      <Route path="/tarefas" element={<Index onObraSelect={handleObraSelect} />} />
                      <Route path="/dashboard" element={<Index onObraSelect={handleObraSelect} />} />
                      <Route path="/diarioobra" element={<DiarioObra />} />
                      <Route path="/checklist" element={<Index onObraSelect={handleObraSelect} />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                </RegistryProvider>
              </AuthProvider>
            }
          />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
