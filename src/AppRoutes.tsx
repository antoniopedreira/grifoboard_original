
import { Route, Routes, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Obras from "./pages/Obras";
import NotFound from "./pages/NotFound";
import { useAuth } from "./context/AuthContext";
import { SidebarTrigger } from "./components/ui/sidebar";
import CustomSidebar from "./components/CustomSidebar";
import { useState } from "react";
import { Obra } from "./types/supabase";

const AppRoutes = () => {
  const { session } = useAuth();
  const [selectedObra, setSelectedObra] = useState<Obra | null>(null);

  // Handler for obra selection
  const handleObraSelect = (obra: Obra | null) => {
    setSelectedObra(obra);
  };

  // Protected route component
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!session) {
      return <Navigate to="/auth" replace />;
    }
    
    return (
      <>
        <CustomSidebar />
        <SidebarTrigger />
        <div className="lg:ml-20 transition-all duration-300 w-full min-h-screen pt-16 lg:pt-6 px-4 lg:px-8">
          {children}
        </div>
      </>
    );
  };

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navigate to="/dashboard" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Index onObraSelect={handleObraSelect} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tarefas"
        element={
          <ProtectedRoute>
            <Index onObraSelect={handleObraSelect} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/obras"
        element={
          <ProtectedRoute>
            <Obras onObraSelect={handleObraSelect} />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
