
import React, { createContext, useContext, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, LayoutDashboard, List, Home, User, LogOut, Settings, Menu } from "lucide-react";
import { Button } from "./button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "./theme-toggle";

// Context
type SidebarContextType = {
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const SidebarContext = createContext<SidebarContextType>({
  expanded: true,
  setExpanded: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Close sidebar on mobile when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setMobileOpen(false);
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded, mobileOpen, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function SidebarTrigger() {
  const { mobileOpen, setMobileOpen } = useContext(SidebarContext);
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setMobileOpen(!mobileOpen)}
      className="lg:hidden fixed top-4 left-4 z-50"
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Abrir menu</span>
    </Button>
  );
}

export function Sidebar({ children }: { children?: React.ReactNode }) {
  const { expanded, setExpanded, mobileOpen, setMobileOpen } = useContext(SidebarContext);
  
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("main-sidebar");
      if (mobileOpen && sidebar && !sidebar.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen, setMobileOpen]);
  
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        id="main-sidebar"
        className={cn(
          "fixed top-0 left-0 h-full z-50 transition-all duration-300",
          "bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
          "flex flex-col",
          expanded ? "w-64" : "w-20",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {children || <SessionNavBar />}
        
        {/* Toggle button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setExpanded(!expanded)}
          className="absolute -right-3 top-12 hidden lg:flex h-6 w-6 rounded-full border border-sidebar-border bg-background shadow-md"
        >
          {expanded ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <span className="sr-only">
            {expanded ? "Recolher menu" : "Expandir menu"}
          </span>
        </Button>
      </aside>
      
      {/* Main content wrapper with padding */}
      <div 
        className={cn(
          "transition-all duration-300 min-h-screen",
          mobileOpen ? "lg:ml-64" : "lg:ml-20"
        )}
      >
        {/* This space is for the main content */}
        <div className="pt-16 lg:pt-0">
          <main className="h-full">{/* The application's main content goes here */}</main>
        </div>
      </div>
    </>
  );
}

export function SessionNavBar() {
  const { expanded } = useContext(SidebarContext);
  const location = useLocation();
  const { signOut, userSession } = useAuth();
  
  // Define os links de navegação
  const navLinks = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: "/dashboard",
    },
    {
      name: "Tarefas",
      icon: <List className="w-5 h-5" />,
      href: "/tarefas",
    },
    {
      name: "Obras",
      icon: <Home className="w-5 h-5" />,
      href: "/obras",
    }
  ];
  
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div 
        className={cn(
          "flex items-center gap-3 p-4 h-16 border-b border-sidebar-border",
          !expanded && "justify-center"
        )}
      >
        <div className="flex items-center justify-center w-10 h-10 bg-sidebar-primary rounded-lg">
          <span className="text-xl font-bold text-white">G</span>
        </div>
        {expanded && <span className="text-xl font-bold">GrifoBoard</span>}
      </div>
      
      {/* User Profile */}
      <div className={cn("p-4 border-b border-sidebar-border", !expanded && "flex justify-center")}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          {expanded && (
            <div className="flex-1 overflow-hidden">
              <p className="font-medium truncate">{userSession?.user?.email?.split('@')[0] || "Usuário"}</p>
              <p className="text-xs text-sidebar-foreground/70 truncate">
                {userSession?.obraAtiva?.nome_obra || "Sem obra ativa"}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-y-auto">
        <ul className="space-y-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href;
            
            return (
              <li key={link.name}>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to={link.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "hover:bg-sidebar-accent/40 text-sidebar-foreground/80",
                          !expanded && "justify-center"
                        )}
                      >
                        {link.icon}
                        {expanded && <span>{link.name}</span>}
                      </Link>
                    </TooltipTrigger>
                    {!expanded && (
                      <TooltipContent side="right" className="bg-popover border-border">
                        {link.name}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Footer Controls */}
      <div className={cn(
        "p-4 border-t border-sidebar-border flex items-center",
        expanded ? "justify-between" : "flex-col gap-4"
      )}>
        <ThemeToggle />
        
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
              >
                <LogOut className="w-5 h-5" />
                <span className="sr-only">Sair</span>
              </Button>
            </TooltipTrigger>
            {!expanded && (
              <TooltipContent side="right">Sair</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

export function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1 overflow-y-auto p-4", className)} {...props} />;
}

export function SidebarHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4 border-b border-sidebar-border", className)} {...props} />;
}

export function SidebarFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4 border-t border-sidebar-border", className)} {...props} />;
}

export function SidebarGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-6", className)} {...props} />;
}

export function SidebarGroupLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { expanded } = useContext(SidebarContext);

  if (!expanded) return null;

  return (
    <div className={cn("px-3 py-2 text-xs uppercase font-semibold text-sidebar-foreground/50", className)} {...props} />
  );
}

export function SidebarGroupContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1", className)} {...props} />;
}

export function SidebarMenu({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn("space-y-1", className)} {...props} />;
}

export function SidebarMenuItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={cn("", className)} {...props} />;
}

export function SidebarMenuButton({
  className,
  asChild = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const { expanded } = useContext(SidebarContext);
  const Component = asChild ? React.Fragment : "button";

  return (
    <Component
      className={cn(
        "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-all",
        "hover:bg-sidebar-accent/40 text-sidebar-foreground/80",
        !expanded && "justify-center",
        className
      )}
      {...props}
    />
  );
}
