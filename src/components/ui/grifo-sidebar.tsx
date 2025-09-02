import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  LayoutList,
  CheckSquare,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { GrifoButton } from "./grifo-button"

const sidebarVariants = {
  expanded: { width: "15rem" },
  collapsed: { width: "3.5rem" },
}

interface NavigationItem {
  key: string
  icon: React.ElementType
  label: string
  path: string
  isActive: (pathname: string) => boolean
}

const navigationItems: NavigationItem[] = [
  {
    key: "dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/dashboard",
    isActive: (pathname) => pathname.includes("/dashboard")
  },
  {
    key: "tasks",
    icon: LayoutList,
    label: "Tarefas",
    path: "/tarefas",
    isActive: (pathname) => pathname.includes("/tarefas")
  },
  {
    key: "checklist",
    icon: CheckSquare,
    label: "Checklist",
    path: "/checklist",
    isActive: (pathname) => pathname.includes("/checklist")
  },
]

export function GrifoSidebar() {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { userSession, signOut } = useAuth()

  // Check if screen is mobile
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth < 1024) {
        setIsCollapsed(true)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const userInitial = userSession?.user?.email?.charAt(0).toUpperCase() || "U"

  // Don't show sidebar if no user or obra
  if (!userSession?.user || !userSession.obraAtiva) {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    navigate("/auth")
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <motion.aside
      className={`fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] bg-brand border-r border-brand/20 ${
        isMobile ? 'lg:fixed' : ''
      }`}
      initial={false}
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <div className="flex h-full flex-col">
        {/* Toggle button */}
        <div className="flex justify-end p-2">
          <GrifoButton
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 text-brand-foreground hover:bg-brand-foreground/10"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </GrifoButton>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2">
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = item.isActive(location.pathname)
              const Icon = item.icon

              return (
                <div key={item.key} className="relative">
                  {/* Active indicator bar */}
                  {isActive && (
                    <div className="absolute left-0 top-0 h-full w-1 bg-accent rounded-r-sm" />
                  )}
                  
                  <GrifoButton
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-10 text-brand-foreground hover:bg-brand-foreground/10 transition-colors",
                      isActive && "bg-brand-foreground/15",
                      isCollapsed && "px-2"
                    )}
                    onClick={() => navigate(item.path)}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={cn("h-5 w-5 flex-shrink-0", isCollapsed ? "mx-auto" : "mr-3")} />
                    {!isCollapsed && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                  </GrifoButton>
                </div>
              )
            })}
          </nav>
        </ScrollArea>

        {/* User section */}
        <div className="p-2 border-t border-brand-foreground/20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <GrifoButton
                variant="ghost"
                className={cn(
                  "w-full h-10 text-brand-foreground hover:bg-brand-foreground/10",
                  isCollapsed ? "px-2" : "justify-start"
                )}
                title={isCollapsed ? "Conta" : undefined}
              >
                <Avatar className={cn("h-6 w-6 flex-shrink-0", isCollapsed ? "mx-auto" : "mr-3")}>
                  <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <span className="text-sm font-medium">Conta</span>
                )}
              </GrifoButton>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent
              side="right"
              align="end"
              sideOffset={8}
              className="w-56"
            >
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-accent text-accent-foreground text-sm">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {userSession?.user?.email || "Usuário"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {userSession?.obraAtiva?.nome_obra}
                  </span>
                </div>
              </div>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-danger hover:text-danger focus:text-danger"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.aside>
  )
}

export default GrifoSidebar