
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Obra } from "@/types/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRegistry } from "@/context/RegistryContext";
import MainPageContent from "@/components/MainPageContent";

interface IndexProps {
  onObraSelect: (obra: Obra) => void;
}

const Index = ({ onObraSelect }: IndexProps) => {
  const { userSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { setSelectedObraId } = useRegistry();

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
      
      // When a work is selected, redirect to dashboard tab if no tab is specifically requested
      const searchParams = new URLSearchParams(location.search);
      if (!searchParams.has('tab')) {
        navigate("/tarefas?tab=dashboard", { replace: true });
      }
    } else {
      setSelectedObraId(null);
    }
  }, [userSession?.obraAtiva, setSelectedObraId, onObraSelect, navigate, location.search]);

  // If there's no active obra, redirect to obras page
  useEffect(() => {
    if (userSession?.user && !userSession.obraAtiva) {
      navigate("/obras");
    }
  }, [userSession, navigate]);

  if (!userSession?.user || !userSession.obraAtiva) {
    return null; // Rendering will be handled by the useEffect navigation
  }

  return <MainPageContent />;
};

export default Index;
