
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { RegistryProvider } from "@/context/RegistryContext";
import Header from "@/components/Header";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Obras from "@/pages/Obras";
import NotFound from "@/pages/NotFound";
import { useState } from 'react';
import { Obra } from './types/supabase';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false
    }
  }
});

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
            <Header />
            <Routes>
              <Route path="/" element={<Index onObraSelect={handleObraSelect} />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/obras" element={<Obras onObraSelect={handleObraSelect} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </RegistryProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
