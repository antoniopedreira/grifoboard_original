
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

  // If there's no user, redirect to auth page
  useEffect(() => {
    if (!userSession?.user) {
      // Save the current route before redirecting
      sessionStorage.setItem('lastRoute', location.pathname);
      navigate("/auth");
    }
  }, [userSession?.user, navigate, location.pathname]);

  // Set the selected obra ID when an obra is selected or active
  useEffect(() => {
    if (userSession?.obraAtiva) {
      setSelectedObraId(userSession.obraAtiva.id);
      onObraSelect(userSession.obraAtiva);
    } else {
      setSelectedObraId(null);
    }
  }, [userSession?.obraAtiva, setSelectedObraId, onObraSelect]);

  // If there's no active obra, redirect to obras page
  useEffect(() => {
    if (userSession?.user && !userSession.obraAtiva) {
      // Save the current route before redirecting
      sessionStorage.setItem('lastRoute', '/obras');
      navigate("/obras");
    }
  }, [userSession?.user, userSession?.obraAtiva, navigate]);

  if (!userSession?.user || !userSession.obraAtiva) {
    return null; // Rendering will be handled by the useEffect navigation
  }

  // Render either the dashboard or tasks page based on the current route
  return isDashboard ? <DashboardContent /> : <MainPageContent />;
};

export default Index;
