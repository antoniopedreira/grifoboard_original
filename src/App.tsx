import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
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
import GestaoMetas from "@/pages/GestaoMetas";
import PMP from "@/pages/PMP";
import FormProfissionais from "@/pages/form/Profissionais";
import FormEmpresas from "@/pages/form/Empresas";
import FormFornecedores from "@/pages/form/Fornecedores";
import { useEffect } from "react";
import { Obra } from "./types/supabase";
import CustomSidebar from "@/components/CustomSidebar";
import MasterAdminSidebar from "@/components/MasterAdminSidebar";
import { MobileBottomNav } from "@/components/mobile/MobileBottomNav"; // <--- NOVO IMPORT

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const masterAdminRoutes = ["/master-admin", "/formularios", "/base-de-dados"];

// Layout Principal Responsivo
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth" || location.pathname === "/reset-password";
  const isFormPage = location.pathname.startsWith("/form/");
  const isPortalParceiro = location.pathname === "/portal-parceiro";
  const isMasterAdminPage = masterAdminRoutes.includes(location.pathname);

  // Páginas "App" são aquelas que precisam de sidebar e navegação
  const isAppPage = !isAuthPage && !isFormPage && !isPortalParceiro;

  if (!isAppPage) {
    return (
      <div className="flex flex-col min-h-screen bg-background font-sans">
        <main className="flex-1 flex flex-col">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans">
      {/* 1. SIDEBAR DESKTOP
          hidden md:flex -> Escondido no mobile, Flexível no Desktop (md pra cima)
      */}
      <div className="hidden md:flex h-full">{isMasterAdminPage ? <MasterAdminSidebar /> : <CustomSidebar />}</div>

      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {/* 2. HEADER MOBILE
            Apenas logotipo e título. O menu hambúrguer foi removido daqui
            pois agora temos o menu inferior com opção "Menu".
        */}
        <div className="md:hidden flex items-center justify-center p-3 bg-white border-b border-border shadow-sm z-20">
          <div className="flex items-center gap-2">
            <img src="/lovable-uploads/grifo-logo-header.png" className="h-6 w-auto" alt="Grifo" />
            <span className="font-bold text-primary font-heading text-lg">GrifoBoard</span>
          </div>
        </div>

        {/* 3. CONTEÚDO PRINCIPAL
            pb-20 md:pb-0 -> Adiciona espaço embaixo no mobile pra barra não cobrir o conteúdo.
        */}
        <main className="flex-1 relative overflow-y-auto bg-background w-full pb-20 md:pb-0">
          <div className="p-4 md:p-6 max-w-[1600px] mx-auto w-full h-full">{children}</div>
        </main>

        {/* 4. NAVEGAÇÃO MOBILE INFERIOR
            O componente já tem 'md:hidden' internamente, então só aparece no celular.
        */}
        <MobileBottomNav />
      </div>
    </div>
  );
};

// Lógica de Restauração de Rota (Mantida igual)
const RouteRestorer = () => {
  const { userSession } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (localStorage.getItem("logging_out") === "true") {
      sessionStorage.removeItem("lastRoute");
      return;
    }
    if (!userSession?.user) return;

    const excludedRoutes = ["/auth", "/reset-password", "/portal-parceiro", "/master-admin"];
    if (!excludedRoutes.includes(location.pathname)) {
      sessionStorage.setItem("lastRoute", location.pathname);
    }
  }, [location.pathname, userSession]);

  return null;
};

function App() {
  const handleObraSelect = (obra: Obra) => {};

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Rotas Públicas (Sem layout de app) */}
          <Route path="/form/profissionais" element={<FormProfissionais />} />
          <Route path="/form/empresas" element={<FormEmpresas />} />
          <Route path="/form/fornecedores" element={<FormFornecedores />} />

          {/* Rotas da Aplicação (Com Layout Responsivo) */}
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
                        <Route path="/gestao-metas" element={<GestaoMetas />} />
                        <Route path="/pmp" element={<PMP />} />
                        <Route path="/portal-parceiro" element={<PortalParceiro />} />

                        {/* Redirecionamentos Legados */}
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
