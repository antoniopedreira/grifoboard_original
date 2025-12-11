import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { LayoutDashboard, ClipboardList, BookOpen, Store, HardHat, FileText, LogOut, Settings } from "lucide-react";

// Definição dos itens do menu
const menuItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/checklist", label: "Checklist", icon: ClipboardList },
  { path: "/diario", label: "Diário de Obra", icon: FileText },
  { path: "/playbook", label: "Playbook", icon: BookOpen },
  { path: "/marketplace", label: "Marketplace", icon: Store },
  { path: "/obras", label: "Minhas Obras", icon: HardHat },
];

const AppSidebar = () => {
  const { userSession, signOut } = useAuth();
  const location = useLocation();

  // Função auxiliar para obter as iniciais
  const getInitials = (name?: string) => {
    if (!name) return "GR";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="h-screen w-64 bg-grifo-primary text-grifo-tertiary flex flex-col shadow-2xl relative z-20 font-sans border-r border-white/5">
      {/* Logo Area */}
      <div className="p-6 flex items-center justify-center border-b border-white/10 bg-black/10">
        <img
          src="/lovable-uploads/grifo-logo-header.png"
          alt="Grifo Engenharia"
          className="h-12 w-auto brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                ${
                  isActive
                    ? "bg-grifo-secondary text-white shadow-lg shadow-grifo-secondary/20 font-medium translate-x-1"
                    : "hover:bg-white/5 hover:text-white text-grifo-tertiary/70"
                }
              `}
            >
              <item.icon
                className={`h-5 w-5 transition-colors ${isActive ? "text-white" : "text-grifo-secondary group-hover:text-white"}`}
              />
              <span>{item.label}</span>

              {/* Indicador de 'ativo' à direita */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 bg-black/20 backdrop-blur-sm m-4 rounded-xl border border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10 border-2 border-grifo-secondary shadow-md">
            <AvatarImage src={userSession?.user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-grifo-secondary text-white font-bold">
              {getInitials(userSession?.user?.user_metadata?.full_name || userSession?.user?.email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {userSession?.user?.user_metadata?.full_name || "Usuário"}
            </p>
            <p className="text-xs text-grifo-tertiary/60 truncate">{userSession?.user?.email}</p>
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-white/10">
          <button className="flex-1 flex items-center justify-center p-2 rounded-lg hover:bg-white/5 text-xs text-grifo-tertiary/70 transition-colors">
            <Settings className="w-4 h-4 mr-1" /> Config
          </button>
          <button
            onClick={() => signOut()}
            className="flex-1 flex items-center justify-center p-2 rounded-lg hover:bg-red-500/20 hover:text-red-200 text-xs text-grifo-tertiary/70 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-1" /> Sair
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppSidebar;
