import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  CheckSquare, 
  BookOpen, 
  Map, 
  Menu 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AppSidebar } from "@/components/AppSidebar"; 
import { useState } from "react";

export function MobileBottomNav() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Verifica se a rota atual corresponde ao link para destacar o ícone
  const isActive = (path: string) => location.pathname === path;

  // Itens principais para acesso rápido no celular
  const navItems = [
    { icon: LayoutDashboard, label: "PCP", path: "/obras" },
    { icon: CheckSquare, label: "Diário", path: "/diario-obra" },
    { icon: BookOpen, label: "Playbook", path: "/playbook" },
    { icon: Map, label: "GrifoWay", path: "/grifo-way" },
  ];

  return (
    // md:hidden -> Garante que isso SÓ apareça em telas menores que Desktop (tablets/celulares)
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)] md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-95 transition-transform",
              isActive(item.path) 
                ? "text-[#A47528]" 
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            <item.icon className={cn("h-6 w-6", isActive(item.path) && "fill-current/10")} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}

        {/* Botão Menu "Mais" que abre a Sidebar original para acessar outras páginas */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-400 hover:text-slate-600 active:scale-95 transition-transform">
              <Menu className="h-6 w-6" />
              <span className="text-[10px] font-medium">Menu</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[85%] max-w-[300px]">
            {/* Reutilizamos a sidebar existente dentro do menu mobile */}
            <AppSidebar /> 
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
