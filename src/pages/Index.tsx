
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

  return <MainPageContent />;
};

export default Index;
