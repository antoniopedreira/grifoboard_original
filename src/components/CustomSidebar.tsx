import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import {
  LayoutDashboard, // Vamos manter o ícone, mas usar para o PCP
  BookOpen,
  Store,
  FileText,
  LogOut,
  Settings,
  Building2,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  PieChart, // Novo ícone para representar PCP analítico se preferir
} from "lucide-react";
import { cn } from "@/lib/utils";

// MUDANÇA AQUI: Removemos o Dashboard isolado e renomeamos Tarefas para PCP
const menuItems = [
  // O antigo dashboard saiu. Agora PCP é a "home" de produção.
  { path: "/tarefas", label: "PCP", icon: LayoutDashboard },
  { path: "/diarioobra", label: "Diário de Obra", icon: FileText },
  { path: "/playbook", label: "Playbook", icon: BookOpen },
  { path: "/marketplace", label: "Marketplace", icon: Store },
];

const CustomSidebar = () => {
  const { userSession, signOut, setObraAtiva } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const handleSwitchObra = () => {
    setObraAtiva(null);
    navigate("/obras");
  };

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
  const activeObraName = userSession?.obraAtiva?.nome_obra || "Selecionar";

  return (
    <TooltipProvider>
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? "5rem" : "16rem" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="h-screen bg-primary text-primary-foreground flex flex-col shadow-2xl relative z-30 font-sans border-r border-white/10 hidden md:flex flex-shrink-0"
      >
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-9 z-40 bg-secondary text-white p-1 rounded-full shadow-md border border-white/20 hover:bg-secondary/90 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div
          className={cn(
            "flex items-center border-b border-white/10 bg-black/10 transition-all duration-300",
            isCollapsed ? "justify-center p-4 h-20" : "justify-center p-6 h-24",
          )}
        >
          <img
            src="/lovable-uploads/grifo-logo-header.png"
            alt="Grifo"
            className={cn(
              "object-contain transition-all duration-300 hover:scale-105",
              isCollapsed ? "h-8 w-8" : "h-12 w-auto",
            )}
            loading="eager"
          />
        </div>

        <div className={cn("transition-all duration-300", isCollapsed ? "px-2 py-4" : "px-3 pt-4 pb-2")}>
          {isCollapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleSwitchObra}
                  variant="ghost"
                  className="w-full flex justify-center h-10 p-0 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-secondary/50"
                >
                  <Building2 className="w-5 h-5 text-secondary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-primary border-white/10 text-white">
                <p>Obra: {activeObraName}</p>
                <p className="text-xs text-muted-foreground">Clique para trocar</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              onClick={handleSwitchObra}
              variant="ghost"
              className="w-full flex items-center justify-between h-auto py-3 px-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-secondary/50 transition-all group"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary text-secondary group-hover:text-white transition-colors">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-[10px] uppercase tracking-wider text-white/50 font-semibold">Obra Ativa</span>
                  <span className="text-sm font-bold text-white truncate w-full max-w-[120px] text-left">
                    {activeObraName}
                  </span>
                </div>
              </div>
              <ChevronsUpDown className="w-4 h-4 text-white/30 group-hover:text-secondary" />
            </Button>
          )}
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path; // Mantivemos a rota /tarefas internamente por enquanto

            const LinkContent = (
              <Link
                to={item.path}
                className={cn(
                  "relative flex items-center rounded-lg transition-all duration-200 group mb-1 overflow-hidden",
                  isCollapsed ? "justify-center h-10 w-10 mx-auto" : "gap-3 px-4 py-3 w-full",
                  isActive
                    ? "bg-secondary text-white shadow-lg font-medium"
                    : "hover:bg-white/10 hover:text-white text-primary-foreground/80",
                )}
              >
                <item.icon
                  className={cn(
                    "transition-colors flex-shrink-0",
                    isCollapsed ? "h-5 w-5" : "h-5 w-5",
                    isActive ? "text-white" : "text-secondary group-hover:text-white",
                  )}
                />

                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="truncate text-sm font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}

                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className={cn(
                      "absolute bg-white",
                      isCollapsed
                        ? "left-0 top-0 bottom-0 w-1 h-full rounded-l-none"
                        : "right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full",
                    )}
                  />
                )}
              </Link>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.path} delayDuration={0}>
                  <TooltipTrigger asChild>{LinkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="bg-primary border-white/10 text-white font-medium z-50">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.path}>{LinkContent}</div>;
          })}
        </nav>

        {/* Footer da Sidebar (User Profile) - Mantido igual */}
        <div
          className={cn(
            "m-4 rounded-xl bg-black/20 border border-white/5 overflow-hidden transition-all duration-300",
            isCollapsed ? "p-2 flex flex-col items-center gap-4" : "p-4",
          )}
        >
          {/* ... Código do perfil mantido ... */}
          <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3 mb-3")}>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Avatar className="h-10 w-10 border-2 border-secondary shadow-sm cursor-pointer hover:scale-105 transition-transform">
                  <AvatarImage src={userAvatar} />
                  <AvatarFallback className="bg-secondary text-white font-bold text-xs">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" className="bg-primary border-white/10 text-white">
                  <p>{userName}</p>
                  <p className="text-xs text-white/50">{userEmail}</p>
                </TooltipContent>
              )}
            </Tooltip>

            {!isCollapsed && (
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-medium text-white truncate" title={userName}>
                  {userName}
                </p>
                <p className="text-xs text-white/50 truncate" title={userEmail}>
                  {userEmail}
                </p>
              </div>
            )}
          </div>

          <div
            className={cn(
              "grid gap-2 border-t border-white/10 transition-all",
              isCollapsed ? "grid-cols-1 w-full pt-2 border-none" : "grid-cols-2 pt-2",
            )}
          >
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    "flex items-center justify-center rounded-md hover:bg-white/10 text-white/70 transition-colors group",
                    isCollapsed ? "p-2 w-full hover:text-secondary" : "p-2 text-xs",
                  )}
                >
                  <Settings className={cn(isCollapsed ? "w-5 h-5" : "w-4 h-4 mr-1")} />
                  {!isCollapsed && "Config"}
                </button>
              </TooltipTrigger>
              {isCollapsed && <TooltipContent side="right">Configurações</TooltipContent>}
            </Tooltip>

            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => signOut()}
                  className={cn(
                    "flex items-center justify-center rounded-md hover:bg-red-500/20 hover:text-red-200 transition-colors group",
                    isCollapsed ? "p-2 w-full text-red-300" : "p-2 text-xs text-white/70",
                  )}
                >
                  <LogOut className={cn(isCollapsed ? "w-5 h-5" : "w-4 h-4 mr-1")} />
                  {!isCollapsed && "Sair"}
                </button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" className="bg-destructive text-white border-destructive">
                  Sair
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
};

export default CustomSidebar;
