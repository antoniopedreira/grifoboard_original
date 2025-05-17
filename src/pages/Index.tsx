
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
      navigate("/auth");
    }
  }, [userSession, navigate]);

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
      navigate("/obras");
    }
  }, [userSession, navigate]);

  if (!userSession?.user || !userSession.obraAtiva) {
    return null; // Rendering will be handled by the useEffect navigation
  }

  // Render either the dashboard or tasks page based on the current route
  return isDashboard ? <DashboardContent /> : <MainPageContent />;
};

export default Index;
