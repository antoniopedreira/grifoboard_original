
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { RegistryProvider } from "@/context/RegistryContext";
import Header from "@/components/Header";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Obras from "@/pages/Obras";
import NotFound from "@/pages/NotFound";
import { useState, useEffect } from 'react';
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
  const isAuthPage = location.pathname === '/auth';
  const isObrasPage = location.pathname === '/obras' || location.pathname === '/';

  // Save the current route to sessionStorage for restoration later, but only for authenticated routes
  useEffect(() => {
    if (!isAuthPage) {
      sessionStorage.setItem('lastRoute', location.pathname);
    }
  }, [location.pathname, isAuthPage]);

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

// Route restoration component with improved behavior
const RouteRestorer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [restored, setRestored] = useState(false);

  // Handle initial page load route restoration
  useEffect(() => {
    // Only attempt to restore route once during initial page load
    if (!restored) {
      const isPageReload = !sessionStorage.getItem('appInitialized');
      
      // Mark as initialized to distinguish between first load and subsequent visits
      sessionStorage.setItem('appInitialized', 'true');
      
      if (isPageReload) {
        const lastRoute = sessionStorage.getItem('lastRoute');
        
        // Only navigate if we have a saved route, we're not already on that route,
        // and we're at the root path (/) to avoid interrupting intentional navigation
        if (lastRoute && lastRoute !== location.pathname && location.pathname === '/') {
          navigate(lastRoute);
        }
      }
      
      // Mark as restored to prevent future redirects
      setRestored(true);
    }
  }, [navigate, location.pathname, restored]);

  // Handle tab visibility changes - improved to avoid unnecessary redirects
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // No automatic redirection when switching back to the tab
        // The user should stay on their current route
        console.log('Tab is now visible, maintaining current route:', window.location.pathname);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
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
          <Router>
            <RouteRestorer />
            <AppLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/obras" replace />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/obras" element={<Obras onObraSelect={handleObraSelect} />} />
                <Route path="/tarefas" element={<Index onObraSelect={handleObraSelect} />} />
                <Route path="/dashboard" element={<Index onObraSelect={handleObraSelect} />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </Router>
          <Toaster />
        </RegistryProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
