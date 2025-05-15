
import { Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import { RegistryProvider } from "@/context/RegistryContext";
import { useAuth } from "@/context/AuthContext";
import Index from "@/pages/Index";
import Obras from "@/pages/Obras";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import { Obra } from "@/types/supabase";
import { useState } from "react";

const App = () => {
  const [selectedObra, setSelectedObra] = useState<Obra | null>(null);
  
  const handleObraSelect = (obra: Obra) => {
    setSelectedObra(obra);
  };

  return (
    <AuthProvider>
      <RegistryProvider>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Index onObraSelect={handleObraSelect} />} />
            <Route path="/obras" element={<Obras onObraSelect={handleObraSelect} />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
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
    <div className="flex flex-col min-h-screen bg-background dark:bg-[#021C2F]">
      {!isAuthPage && <Header />}
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        {children}
      </main>
    </div>
  );
};

export default App;
