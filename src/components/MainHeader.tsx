
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";

interface MainHeaderProps {
  onNewTaskClick: () => void;
  onRegistryClick: () => void;
}

const MainHeader: React.FC<MainHeaderProps> = ({ onNewTaskClick, onRegistryClick }) => {
  const { session } = useAuth();

  return (
    <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground">
        {session.obraAtiva ? `${session.obraAtiva.nome_obra}` : 'Planejamento Semanal'}
      </h2>
      <div className="flex gap-3 self-end">
        <Button 
          variant="outline" 
          className="bg-primary/10 hover:bg-primary/20 text-primary"
          onClick={onRegistryClick}
        >
          <FileText className="mr-1 h-4 w-4" />
          Cadastros
        </Button>
        <Button onClick={onNewTaskClick}>
          <Plus className="mr-1 h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>
    </div>
  );
};

export default MainHeader;
