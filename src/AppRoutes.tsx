
import { Route, Routes, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Obras from "./pages/Obras";
import NotFound from "./pages/NotFound";
import { useAuth } from "./context/AuthContext";
import { SidebarTrigger } from "./components/ui/sidebar";
import CustomSidebar from "./components/CustomSidebar";

const AppRoutes = () => {
  const { session } = useAuth();

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
            <Index />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tarefas"
        element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        }
      />
      <Route
        path="/obras"
        element={
          <ProtectedRoute>
            <Obras />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
