import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { RegistryProvider } from "@/context/RegistryContext";
import { RouteGuard } from "@/components/auth/RouteGuard";
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
import PortalParceiro from "@/pages/PortalParceiro";
import GrifoWay from "@/pages/GrifoWay";
import GrifoAI from "@/pages/GrifoAI";
import GestaoMetas from "@/pages/GestaoMetas"; // <--- 1. IMPORT NOVO
import FormProfissionais from "@/pages/form/Profissionais";
import FormEmpresas from "@/pages/form/Empresas";
import FormFornecedores from "@/pages/form/Fornecedores";
import { useEffect, useState } from "react";
import { Obra } from "./types/supabase";
import { ScrollArea } from "@/components/ui/scroll-area";
import CustomSidebar from "@/components/CustomSidebar";
import MasterAdminSidebar from "@/components/MasterAdminSidebar";
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

// Rotas exclusivas do master admin
const masterAdminRoutes = ["/master-admin", "/formularios", "/base-de-dados"];

// Componente Mobile Nav para telas pequenas
const MobileNav = ({ isMasterAdmin }: { isMasterAdmin: boolean }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-primary">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-primary border-r-0 w-72">
        {isMasterAdmin ? <MasterAdminSidebar /> : <CustomSidebar />}
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
  const isPortalParceiro = location.pathname === "/portal-parceiro";
  const isMasterAdminPage = masterAdminRoutes.includes(location.pathname);

  // Layout do App (Dashboard, Obras, etc)
  const isAppPage = !isAuthPage && !isFormPage && !isPortalParceiro;

  // Layout Público / Autenticação (Login, Cadastro, Forms Públicos)
  if (!isAppPage) {
    return (
      <div className="flex flex-col min-h-screen bg-background font-sans">
        <main className="flex-1 flex flex-col">{children}</main>
      </div>
    );
  }

  // Layout Logado (Sidebar + Conteúdo)
  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans">
      {/* Sidebar Desktop - Master Admin ou Regular */}
      {isMasterAdminPage ? <MasterAdminSidebar /> : <CustomSidebar />}

      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {/* Header Mobile Simplificado */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-border shadow-sm z-20">
          <div className="flex items-center gap-2">
            <img src="/lovable-uploads/grifo-logo-header.png" className="h-8 w-auto" alt="Grifo" />
            <span className="font-bold text-primary font-heading">GrifoBoard</span>
          </div>
          <MobileNav isMasterAdmin={isMasterAdminPage} />
        </div>

        {/* Área de Conteúdo */}
        <main className="flex-1 relative overflow-hidden flex flex-col bg-background">
          <ScrollArea className="flex-1 h-full">
            <div className="p-4 md:p-6 max-w-[1600px] mx-auto w-full pb-20">{children}</div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
};

const RouteRestorer = () => {
  const { userSession } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Não salva se logout em progresso
    if (localStorage.getItem("logging_out") === "true") return;

    // Não salva se não tem usuário logado
    if (!userSession?.user) return;

    // Lista de rotas que não devem ser salvas
    const excludedRoutes = ["/auth", "/reset-password", "/portal-parceiro", "/master-admin"];

    if (!excludedRoutes.includes(location.pathname)) {
      sessionStorage.setItem("lastRoute", location.pathname);
    }
  }, [location.pathname, userSession]);

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
                <RouteGuard>
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
                        <Route path="/grifoway" element={<GrifoWay />} />
                        <Route path="/grifo-ai" element={<GrifoAI />} />
                        <Route path="/gestao-metas" element={<GestaoMetas />} /> {/* <--- 2. ROTA NOVA */}
                        <Route path="/portal-parceiro" element={<PortalParceiro />} />
                        <Route path="/tarefas" element={<Index onObraSelect={handleObraSelect} />} />
                        <Route path="/dashboard" element={<Index onObraSelect={handleObraSelect} />} />
                        <Route path="/diarioobra" element={<DiarioObra />} />
                        <Route path="/checklist" element={<Index onObraSelect={handleObraSelect} />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </AppLayout>
                  </RegistryProvider>
                </RouteGuard>
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
