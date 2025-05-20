
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
      retry: false,
      // Maintain query data when the window is unfocused
      staleTime: Infinity,
      gcTime: Infinity
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

// Route guard component with route persistence
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  // Get auth state from localStorage to prevent tab switching issues
  const authData = localStorage.getItem('supabase.auth.token');
  const isAuthenticated = !!authData;

  // Save current route to sessionStorage when navigating
  useEffect(() => {
    if (isAuthenticated && location.pathname !== '/auth') {
      sessionStorage.setItem('lastRoute', location.pathname);
    }
  }, [location.pathname, isAuthenticated]);

  if (!isAuthenticated && location.pathname !== '/auth') {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

function App() {
  const [selectedObraId, setSelectedObraId] = useState<string | null>(null);
  const [initialRoute, setInitialRoute] = useState<string>('/obras');
  
  // Check localStorage for obra selection and sessionStorage for last route on initial load
  useEffect(() => {
    const storedObraId = localStorage.getItem('selectedObraId');
    if (storedObraId) {
      setSelectedObraId(storedObraId);
    }
    
    // Get the last route from sessionStorage
    const lastRoute = sessionStorage.getItem('lastRoute');
    if (lastRoute) {
      setInitialRoute(lastRoute);
    }
  }, []);
  
  const handleObraSelect = (obra: Obra) => {
    setSelectedObraId(obra.id);
    // Save selected obra to localStorage
    if (obra.id) {
      localStorage.setItem('selectedObraId', obra.id);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RegistryProvider>
          <Router>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Navigate to={initialRoute} replace />} />
                <Route path="/auth" element={<Auth onAuthenticated={() => {
                  // If user had a saved route, restore it after login
                  const lastRoute = sessionStorage.getItem('lastRoute');
                  return lastRoute || '/obras';
                }} />} />
                <Route path="/obras" element={
                  <RequireAuth>
                    <Obras onObraSelect={handleObraSelect} />
                  </RequireAuth>
                } />
                <Route path="/tarefas" element={
                  <RequireAuth>
                    <Index onObraSelect={handleObraSelect} />
                  </RequireAuth>
                } />
                <Route path="/dashboard" element={
                  <RequireAuth>
                    <Index onObraSelect={handleObraSelect} />
                  </RequireAuth>
                } />
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
