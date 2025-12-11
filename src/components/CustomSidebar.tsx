import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ClipboardList, // Ícone para Tarefas
  CheckSquare, // Ícone novo para Checklist (para diferenciar)
  BookOpen,
  Store,
  HardHat,
  FileText,
  LogOut,
  Settings,
} from "lucide-react";

// Definição dos itens do menu - ADICIONADO "TAREFAS"
const menuItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/tarefas", label: "Tarefas", icon: ClipboardList }, // Adicionado aqui
  { path: "/checklist", label: "Checklist", icon: CheckSquare },
  { path: "/diarioobra", label: "Diário de Obra", icon: FileText },
  { path: "/playbook", label: "Playbook", icon: BookOpen },
  { path: "/marketplace", label: "Marketplace", icon: Store },
  { path: "/obras", label: "Minhas Obras", icon: HardHat },
];

const CustomSidebar = () => {
  const { userSession, signOut } = useAuth();
  const location = useLocation();

  const getInitials = (name?: string | null) => {
    if (!name) return "GR";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const userName = userSession?.user?.user_metadata?.full_name || "Usuário Grifo";
  const userEmail = userSession?.user?.email || "";
  const userAvatar = userSession?.user?.user_metadata?.avatar_url;

  return (
    // Sidebar fixa com altura total (h-screen)
    <aside className="h-screen w-64 bg-primary text-primary-foreground flex flex-col shadow-2xl relative z-30 font-sans border-r border-white/10 hidden md:flex flex-shrink-0">
      {/* Logo Area - Agora substitui o Header antigo */}
      <div className="p-6 flex items-center justify-center border-b border-white/10 bg-black/10">
        <img
          src="/lovable-uploads/grifo-logo-header.png"
          alt="Grifo Engenharia"
          className="h-12 w-auto object-contain hover:scale-105 transition-transform"
          loading="eager"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
                ${
                  isActive
                    ? "bg-secondary text-white shadow-lg font-medium translate-x-1"
                    : "hover:bg-white/10 hover:text-white text-primary-foreground/80"
                }
              `}
            >
              <item.icon
                className={`h-5 w-5 transition-colors ${isActive ? "text-white" : "text-secondary group-hover:text-white"}`}
              />
              <span className="truncate text-sm font-medium">{item.label}</span>

              {isActive && (
                <motion.div layoutId="activeIndicator" className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 m-4 rounded-xl bg-black/20 border border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10 border-2 border-secondary shadow-sm">
            <AvatarImage src={userAvatar} />
            <AvatarFallback className="bg-secondary text-white font-bold text-xs">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate" title={userName}>
              {userName}
            </p>
            <p className="text-xs text-white/50 truncate" title={userEmail}>
              {userEmail}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
          <button className="flex items-center justify-center p-2 rounded-md hover:bg-white/10 text-xs text-white/70 transition-colors">
            <Settings className="w-4 h-4 mr-1" /> Config
          </button>
          <button
            onClick={() => signOut()}
            className="flex items-center justify-center p-2 rounded-md hover:bg-red-500/20 hover:text-red-200 text-xs text-white/70 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-1" /> Sair
          </button>
        </div>
      </div>
    </aside>
  );
};

export default CustomSidebar;
