import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ClipboardList, Database, Plus } from "lucide-react";

interface MainHeaderProps {
  onNewTaskClick: () => void;
  onRegistryClick: () => void;
  onChecklistClick: () => void;
}

const MainHeader: React.FC<MainHeaderProps> = ({ onNewTaskClick, onRegistryClick, onChecklistClick }) => {
  const { session } = useAuth();

  return (
    <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: "#021C2F" }}>
          {session.obraAtiva ? `Tarefas - ${session.obraAtiva.nome_obra}` : "Planejamento Semanal"}
        </h2>
        <p className="text-muted-foreground text-sm mt-1">Gerencie e acompanhe o progresso das atividades da obra.</p>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="border-gray-200 hover:bg-gray-50 hover:text-primary transition-colors shadow-sm"
          style={{ color: "#021C2F" }}
          onClick={onRegistryClick}
        >
          <Database className="mr-2 h-4 w-4" />
          Cadastros
        </Button>

        <Button
          variant="outline"
          className="border-gray-200 hover:bg-gray-50 hover:text-primary transition-colors shadow-sm"
          style={{ color: "#021C2F" }}
          onClick={onChecklistClick}
        >
          <ClipboardList className="mr-2 h-4 w-4" />
          Checklist
        </Button>

        <Button onClick={onNewTaskClick} className="shadow-md hover:shadow-lg transition-all">
          <Plus className="mr-2 h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>
    </div>
  );
};

export default MainHeader;
