
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Obra } from "@/types/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRegistry } from "@/context/RegistryContext";
import MainPageContent from "@/components/MainPageContent";
import DashboardContent from "@/components/DashboardContent";
import ChecklistContent from "@/components/ChecklistContent";

interface IndexProps {
  onObraSelect: (obra: Obra) => void;
}

const Index = ({ onObraSelect }: IndexProps) => {
  const { userSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { setSelectedObraId } = useRegistry();
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  
  // Determine which content to render based on the current route
  const isDashboard = location.pathname === "/dashboard";
  const isChecklist = location.pathname === "/checklist";

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
    return null; // Rendering will be handled by the useEffect navigation
  }

  // Render the appropriate content based on the current route
  if (isDashboard) {
    return <DashboardContent />;
  } else if (isChecklist) {
    return <ChecklistContent />;
  } else {
    return <MainPageContent />;
  }
};

export default Index;
