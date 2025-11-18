
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { RegistryProvider } from "@/context/RegistryContext";
import Header from "@/components/Header";
import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
import Index from "@/pages/Index";
import Obras from "@/pages/Obras";
import DiarioObra from "@/pages/DiarioObra";
import NotFound from "@/pages/NotFound";
import MasterAdmin from "@/pages/MasterAdmin";
import Formularios from "@/pages/Formularios";
import BaseDeDados from "@/pages/BaseDeDados";
import FormProfissionais from "@/pages/form/Profissionais";
import FormEmpresas from "@/pages/form/Empresas";
import FormFornecedores from "@/pages/form/Fornecedores";
import { useEffect } from 'react';
import { Obra } from './types/supabase';
import { ScrollArea } from "@/components/ui/scroll-area";
import CustomSidebar from '@/components/CustomSidebar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false
    }
  }
});

// Component to determine if sidebar should be shown based on route
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth' || location.pathname === '/reset-password';
  const isObrasPage = location.pathname === '/obras' || location.pathname === '/';
  const isFormPage = location.pathname.startsWith('/form/');

  return (
    <div className={`flex flex-col min-h-screen ${!isAuthPage && !isFormPage ? 'bg-gray-50' : ''} font-sans`}>
      {!isAuthPage && !isFormPage && <Header />}
      
      <div className="flex flex-1 w-full">
        {!isAuthPage && !isObrasPage && !isFormPage && <CustomSidebar />}
        
        <main className="flex-1">
          {isFormPage ? (
            // Form pages render full screen without container/scrollarea
            children
          ) : !isAuthPage && !isObrasPage ? (
            <ScrollArea className="h-[calc(100vh-64px)]">
              <div className="py-6">
                {children}
              </div>
            </ScrollArea>
          ) : !isAuthPage ? (
            <ScrollArea className="h-[calc(100vh-64px)]">
              <div className="container mx-auto px-4 py-6">
                {children}
              </div>
            </ScrollArea>
          ) : (
            <div className="container mx-auto px-4 py-6">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Improved route restoration component
const RouteRestorer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Save the current route to sessionStorage for restoration later, but only for app routes
  useEffect(() => {
    if (location.pathname !== '/auth' && location.pathname !== '/reset-password') {
      sessionStorage.setItem('lastRoute', location.pathname);
    }
  }, [location.pathname]);

  return null;
};

function App() {
  const handleObraSelect = (obra: Obra) => {
    // no-op; selection handled within pages/contexts
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Rotas públicas - SEM AuthProvider */}
          <Route path="/form/profissionais" element={<FormProfissionais />} />
          <Route path="/form/empresas" element={<FormEmpresas />} />
          <Route path="/form/fornecedores" element={<FormFornecedores />} />
          
          {/* Rotas privadas - COM AuthProvider */}
          <Route path="/*" element={
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
                    <Route path="/tarefas" element={<Index onObraSelect={handleObraSelect} />} />
                    <Route path="/dashboard" element={<Index onObraSelect={handleObraSelect} />} />
                    <Route path="/diarioobra" element={<DiarioObra />} />
                    <Route path="/checklist" element={<Index onObraSelect={handleObraSelect} />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AppLayout>
              </RegistryProvider>
            </AuthProvider>
          } />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
