
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { RegistryProvider } from "@/context/RegistryContext";
import Header from "@/components/Header";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Obras from "@/pages/Obras";
import NotFound from "@/pages/NotFound";
import { useState } from 'react';
import { Obra } from './types/supabase';
import { ScrollArea } from "@/components/ui/scroll-area";
import CustomSidebar from '@/components/CustomSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

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
  const isAuthPage = location.pathname === '/auth';
  const isObrasPage = location.pathname === '/obras' || location.pathname === '/';

  return (
    <div className={`flex flex-col min-h-screen ${!isAuthPage ? 'bg-background' : ''}`}>
      {!isAuthPage && <Header />}
      
      <div className="flex flex-1 w-full">
        {!isAuthPage && !isObrasPage && <CustomSidebar />}
        
        <main className="flex-1 overflow-hidden">
          {!isAuthPage && !isObrasPage ? (
            <ScrollArea className="h-[calc(100vh-65px)]">
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

function App() {
  const [selectedObraId, setSelectedObraId] = useState<string | null>(null);
  
  const handleObraSelect = (obra: Obra) => {
    setSelectedObraId(obra.id);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RegistryProvider>
          <SidebarProvider>
            <Router>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/obras" replace />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/obras" element={<Obras onObraSelect={handleObraSelect} />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/tarefas" element={<Index onObraSelect={handleObraSelect} />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLayout>
            </Router>
          </SidebarProvider>
          <Toaster />
        </RegistryProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
