
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, LayoutList } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export function AppSidebar() {
  const { userSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Only render the sidebar if there is an active work
  if (!userSession.user || !userSession.obraAtiva) {
    return null;
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate("/dashboard")}
                  tooltip="Dashboard"
                  isActive={location.pathname === "/dashboard"}
                >
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate("/tarefas")}
                  tooltip="Tarefas"
                  isActive={location.pathname === "/tarefas"}
                >
                  <LayoutList />
                  <span>Tarefas</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;
