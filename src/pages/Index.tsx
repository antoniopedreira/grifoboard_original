
import { useEffect, useState } from "react";
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
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  
  // Determine if we're in dashboard or tasks view
  const isDashboard = location.pathname === "/dashboard";

  // If there's no user, redirect to auth page (apenas uma vez)
  useEffect(() => {
    if (!userSession?.user && !redirectAttempted) {
      navigate("/auth");
      setRedirectAttempted(true);
    }
  }, [userSession, navigate, redirectAttempted]);

  // Set the selected obra ID when an obra is selected or active
  useEffect(() => {
    if (userSession?.obraAtiva) {
      setSelectedObraId(userSession.obraAtiva.id);
      onObraSelect(userSession.obraAtiva);
    }
  }, [userSession?.obraAtiva, setSelectedObraId, onObraSelect]);

  // Redirect to obras page only if no active obra and user is logged in
  useEffect(() => {
    if (userSession?.user && !userSession.obraAtiva && !redirectAttempted) {
      navigate("/obras");
      setRedirectAttempted(true);
    }
  }, [userSession, navigate, redirectAttempted]);

  if (!userSession?.user || !userSession.obraAtiva) {
    return null; // Rendering will be handled by the useEffect navigation
  }

  // Render either the dashboard or tasks page based on the current route
  return isDashboard ? <DashboardContent /> : <MainPageContent />;
};

export default Index;
