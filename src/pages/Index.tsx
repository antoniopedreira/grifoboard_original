
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

  // If there's no user, redirect to auth page (only once)
  useEffect(() => {
    if (!userSession?.user && !redirectAttempted) {
      navigate("/auth");
      setRedirectAttempted(true);
    }
  }, [userSession, navigate, redirectAttempted]);

  // Set the selected obra ID when an obra is active
  useEffect(() => {
    if (userSession?.obraAtiva) {
      setSelectedObraId(userSession.obraAtiva.id);
      onObraSelect(userSession.obraAtiva);
    }
  }, [userSession?.obraAtiva, setSelectedObraId, onObraSelect]);

  // If user is logged in but no active obra, redirect to obras page to select one
  useEffect(() => {
    if (userSession?.user && !userSession.obraAtiva && !redirectAttempted) {
      navigate("/obras");
      setRedirectAttempted(true);
    }
  }, [userSession, navigate, redirectAttempted]);

  if (!userSession?.user || !userSession.obraAtiva) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"></div>
          <div className="h-4 w-4 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"></div>
          <div className="h-4 w-4 animate-bounce rounded-full bg-primary"></div>
        </div>
      </div>
    );
  }

  // Render either the dashboard or tasks page based on the current route
  return isDashboard ? <DashboardContent /> : <MainPageContent />;
};

export default Index;
