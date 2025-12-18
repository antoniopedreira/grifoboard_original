import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

// Rotas permitidas para parceiros
const parceiroAllowedRoutes = ["/portal-parceiro", "/auth", "/reset-password"];

// Rotas públicas (formulários)
const publicRoutes = ["/form/profissionais", "/form/empresas", "/form/fornecedores"];

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { userSession, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      // Rotas públicas não precisam de verificação
      if (publicRoutes.some(route => location.pathname.startsWith(route))) {
        setChecking(false);
        return;
      }

      // Se não tem usuário logado
      if (!userSession?.user) {
        setChecking(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("usuarios")
          .select("role")
          .eq("id", userSession.user.id)
          .single();

        if (error) {
          console.error("Erro ao buscar role:", error);
          setChecking(false);
          return;
        }

        const role = data?.role;
        setUserRole(role);

        // Se é parceiro e está tentando acessar rota não permitida
        if (role === "parceiro" && !parceiroAllowedRoutes.includes(location.pathname)) {
          navigate("/portal-parceiro", { replace: true });
          return;
        }

        // Se NÃO é parceiro e está tentando acessar portal-parceiro
        if (role !== "parceiro" && location.pathname === "/portal-parceiro") {
          navigate("/obras", { replace: true });
          return;
        }
      } catch (err) {
        console.error("Erro na verificação de role:", err);
      } finally {
        setChecking(false);
      }
    };

    if (!authLoading) {
      checkUserRole();
    }
  }, [userSession, location.pathname, authLoading, navigate]);

  if (authLoading || checking) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
