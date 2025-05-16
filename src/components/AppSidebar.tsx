
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
import { useLocation, useNavigate } from "react-router-dom";

export function AppSidebar() {
  const { userSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Only render the sidebar if there is an active work
  if (!userSession.user || !userSession.obraAtiva) {
    return null;
  }

  // Check the current path to determine active tab
  const isTasksActive = location.pathname.includes("/tarefas");
  const isDashboardActive = location.pathname.includes("/dashboard");

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
                  isActive={isDashboardActive}
                >
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate("/tarefas")}
                  tooltip="Tarefas"
                  isActive={isTasksActive}
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
