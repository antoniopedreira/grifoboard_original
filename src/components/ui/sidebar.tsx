
import * as React from "react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  LayoutList,
  CheckSquare,
  LogOut,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const sidebarVariants = {
  open: {
    width: "248px", // 15.5rem
  },
  closed: {
    width: "60px", // 3.75rem
  },
};

const contentVariants = {
  open: { display: "block", opacity: 1 },
  closed: { display: "block", opacity: 1 },
};

const variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      x: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    x: -20,
    opacity: 0,
    transition: {
      x: { stiffness: 100 },
    },
  },
};

const transitionProps = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
  staggerChildren: 0.1,
};

const staggerVariants = {
  open: {
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
};

export function SessionNavBar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { userSession, signOut } = useAuth();
  
  // Check the current path to determine active tab
  const isDashboardActive = location.pathname.includes("/dashboard");
  const isTasksActive = location.pathname.includes("/tarefas");
  const isChecklistActive = location.pathname.includes("/checklist");
  
  // Extract the first letter for the avatar fallback
  const userInitial = userSession?.user?.email?.charAt(0).toUpperCase() || "U";
  
  // If there's no user or active obra, don't show the sidebar
  if (!userSession?.user || !userSession.obraAtiva) {
    return null;
  }
  
  const handleSignOut = async () => {
    await signOut();
  };

  // Mobile Bottom Navigation
  const MobileBottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-brand border-t border-brand-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center py-2">
        <Button
          variant="ghost"
          className={cn(
            "flex flex-col items-center p-2 h-auto min-h-[44px] w-20 rounded-md transition hover:bg-brand-2 text-text-on-dark/80 hover:text-text-on-dark",
            isDashboardActive && "bg-brand-2 text-text-on-dark"
          )}
          onClick={() => navigate("/dashboard")}
          aria-current={isDashboardActive ? "page" : undefined}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-xs mt-1 font-medium">Dashboard</span>
        </Button>
        
        <Button
          variant="ghost"
          className={cn(
            "flex flex-col items-center p-2 h-auto min-h-[44px] w-20 rounded-md transition hover:bg-brand-2 text-text-on-dark/80 hover:text-text-on-dark",
            isTasksActive && "bg-brand-2 text-text-on-dark"
          )}
          onClick={() => navigate("/tarefas")}
          aria-current={isTasksActive ? "page" : undefined}
        >
          <LayoutList className="h-5 w-5" />
          <span className="text-xs mt-1 font-medium">Tarefas</span>
        </Button>
        
        <Button
          variant="ghost"
          className={cn(
            "flex flex-col items-center p-2 h-auto min-h-[44px] w-20 rounded-md transition hover:bg-brand-2 text-text-on-dark/80 hover:text-text-on-dark",
            isChecklistActive && "bg-brand-2 text-text-on-dark"
          )}
          onClick={() => navigate("/checklist")}
          aria-current={isChecklistActive ? "page" : undefined}
        >
          <CheckSquare className="h-5 w-5" />
          <span className="text-xs mt-1 font-medium">Checklist</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex flex-col items-center p-2 h-auto min-h-[44px] w-20 rounded-md transition hover:bg-brand-2 text-text-on-dark/80 hover:text-text-on-dark"
            >
              <Avatar className="size-5">
                <AvatarFallback className="bg-accent text-brand text-sm">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs mt-1 font-medium">Conta</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" sideOffset={8} className="mb-2">
            <div className="flex flex-row items-center gap-2 p-2">
              <Avatar className="size-6">
                <AvatarFallback>
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left">
                <span className="text-sm font-medium">
                  {userSession?.user?.email || "Usuário"}
                </span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <motion.div
      className={cn(
        "sidebar fixed left-0 z-30 h-[calc(100vh-65px)] shrink-0 border-r top-[65px]",
      )}
      initial={isCollapsed ? "closed" : "open"}
      animate={isCollapsed ? "closed" : "open"}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <motion.div
        className={`relative z-30 flex text-muted-on-dark h-full shrink-0 flex-col bg-brand transition-all`}
        variants={contentVariants}
      >
        <motion.ul variants={staggerVariants} className="flex h-full flex-col">
          <div className="flex grow flex-col items-center">
            <div className="flex h-full w-full flex-col">
              <div className="flex grow flex-col gap-4">
                <ScrollArea className="h-16 grow p-2">
                  <div className={cn("flex w-full flex-col gap-1 pt-10")}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "flex h-[46px] w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-brand-2 text-text-on-dark/80 hover:text-text-on-dark justify-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent relative",
                        isDashboardActive && "bg-brand-2 text-text-on-dark before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] before:bg-accent before:content-['']"
                      )}
                      onClick={() => navigate("/dashboard")}
                      aria-current={isDashboardActive ? "page" : undefined}
                      title={isCollapsed ? "Dashboard" : undefined}
                    >
                      <LayoutDashboard className="h-5 w-5" />{" "}
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Dashboard</p>
                        )}
                      </motion.li>
                    </Button>
                    <Button
                      variant="ghost"
                      className={cn(
                        "flex h-[46px] w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-brand-2 text-text-on-dark/80 hover:text-text-on-dark justify-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent relative",
                        isTasksActive && "bg-brand-2 text-text-on-dark before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] before:bg-accent before:content-['']"
                      )}
                      onClick={() => navigate("/tarefas")}
                      aria-current={isTasksActive ? "page" : undefined}
                      title={isCollapsed ? "Tarefas" : undefined}
                    >
                      <LayoutList className="h-5 w-5" />{" "}
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Tarefas</p>
                        )}
                      </motion.li>
                    </Button>
                    <Button
                      variant="ghost"
                      className={cn(
                        "flex h-[46px] w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-brand-2 text-text-on-dark/80 hover:text-text-on-dark justify-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent relative",
                        isChecklistActive && "bg-brand-2 text-text-on-dark before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] before:bg-accent before:content-['']"
                      )}
                      onClick={() => navigate("/checklist")}
                      aria-current={isChecklistActive ? "page" : undefined}
                      title={isCollapsed ? "Checklist" : undefined}
                    >
                      <CheckSquare className="h-5 w-5" />{" "}
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Checklist</p>
                        )}
                      </motion.li>
                    </Button>
                  </div>
                </ScrollArea>
              </div>
              <div className="flex flex-col p-2">
                <Separator className="mb-2 bg-text-on-dark/20" />
                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="w-full" asChild>
                      <Button 
                        variant="ghost" 
                        className="flex h-[46px] w-full flex-row items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-brand-2 text-text-on-dark/80 hover:text-text-on-dark justify-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                        title={isCollapsed ? "Conta" : undefined}
                      >
                        <Avatar className="size-5">
                          <AvatarFallback className="bg-accent text-brand text-sm">
                            {userInitial}
                          </AvatarFallback>
                        </Avatar>
                        <motion.li
                          variants={variants}
                          className="flex w-full items-center gap-2"
                        >
                          {!isCollapsed && (
                            <p className="text-sm font-medium">Conta</p>
                          )}
                        </motion.li>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent sideOffset={5}>
                      <div className="flex flex-row items-center gap-2 p-2">
                        <Avatar className="size-6">
                          <AvatarFallback>
                            {userInitial}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-medium">
                            {userSession?.user?.email || "Usuário"}
                          </span>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="flex items-center gap-2"
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-4 w-4" /> Sair
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </motion.ul>
      </motion.div>
    </motion.div>
  );

  return (
    <>
      <div className="hidden lg:block">
        <DesktopSidebar />
      </div>
      <div className="lg:hidden">
        <MobileBottomNav />
      </div>
    </>
  );
}

// IMPORTANT: Remove these exports that cause the circular dependency
// export {
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from "@/components/ui/sidebar"

export default SessionNavBar;
