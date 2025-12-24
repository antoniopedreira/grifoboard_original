import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, CheckSquare, BookOpen, Map, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

// Importando os Sidebars corretos que você usa no Desktop
import CustomSidebar from "@/components/CustomSidebar";
import MasterAdminSidebar from "@/components/MasterAdminSidebar";

export function MobileBottomNav() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  // Lógica para saber qual Sidebar mostrar (igual ao App.tsx)
  const masterAdminRoutes = ["/master-admin", "/formularios", "/base-de-dados"];
  const isMasterAdminPage = masterAdminRoutes.some((route) => location.pathname.startsWith(route));

  const navItems = [
    { icon: LayoutDashboard, label: "PCP", path: "/obras" },
    // CORREÇÃO: Link ajustado para /diarioobra (sem hífen) conforme seu App.tsx
    { icon: CheckSquare, label: "Diário", path: "/diarioobra" },
    { icon: BookOpen, label: "Playbook", path: "/playbook" },
    // CORREÇÃO: Link ajustado para /grifoway (sem hífen) conforme seu App.tsx
    { icon: Map, label: "GrifoWay", path: "/grifoway" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-safe md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-95 transition-transform",
              isActive(item.path) ? "text-[#A47528]" : "text-slate-400 hover:text-slate-600",
            )}
          >
            <item.icon className={cn("h-6 w-6", isActive(item.path) && "fill-current/10")} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}

        {/* Menu Hamburguer que abre a Sidebar correta */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-400 hover:text-slate-600 active:scale-95 transition-transform">
              <Menu className="h-6 w-6" />
              <span className="text-[10px] font-medium">Menu</span>
            </button>
          </SheetTrigger>

          {/* Ajuste de estilo para a Sheet ficar correta no mobile */}
          <SheetContent side="left" className="p-0 w-[85%] max-w-[300px] overflow-y-auto bg-primary border-r-0">
            {/* Lógica condicional para mostrar o menu correto */}
            {isMasterAdminPage ? <MasterAdminSidebar /> : <CustomSidebar />}

            {/* Fix CSS para garantir que o sidebar preencha a Sheet */}
            <style>{`
               [data-radix-collection-item] aside { display: flex !important; width: 100%; height: 100%; }
             `}</style>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
