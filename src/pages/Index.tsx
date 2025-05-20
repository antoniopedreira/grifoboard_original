
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Obra } from "@/types/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRegistry } from "@/context/RegistryContext";
import MainPageContent from "@/components/MainPageContent";
import DashboardContent from "@/components/DashboardContent";

interface IndexProps {
  onObraSelect: (obra: Obra) => void;
}

const Index = ({ onObraSelect }: IndexProps) => {
  const { userSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { setSelectedObraId } = useRegistry();
  
  // Determine if we're in dashboard or tasks view
  const isDashboard = location.pathname === "/dashboard";

  // Set the selected obra ID when an obra is selected or active
  useEffect(() => {
    if (userSession?.obraAtiva) {
      setSelectedObraId(userSession.obraAtiva.id);
      onObraSelect(userSession.obraAtiva);
    } else {
      setSelectedObraId(null);
    }
  }, [userSession?.obraAtiva, setSelectedObraId, onObraSelect]);

  // If there's no user, redirect to auth page - but don't run this on every render
  useEffect(() => {
    if (!userSession?.user) {
      // Save the current route before redirecting
      sessionStorage.setItem('lastRoute', location.pathname);
      navigate("/auth", { replace: true });
    } else if (!userSession.obraAtiva) {
      // If there's no active obra, redirect to obras page - but only once
      sessionStorage.setItem('lastRoute', location.pathname);
      navigate("/obras", { replace: true });
    }
  }, [userSession?.user, userSession?.obraAtiva, navigate, location.pathname]);

  if (!userSession?.user || !userSession.obraAtiva) {
    return null; // Rendering will be handled by the useEffect navigation
  }

  // Render either the dashboard or tasks page based on the current route
  return isDashboard ? <DashboardContent /> : <MainPageContent />;
};

export default Index;
