
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

interface MainHeaderProps {
  onNewTaskClick: () => void;
  onRegistryClick: () => void;
}

const MainHeader: React.FC<MainHeaderProps> = ({ onNewTaskClick, onRegistryClick }) => {
  const { session } = useAuth();

  return (
    <div className="mb-4 lg:mb-6">
      {/* Mobile Header */}
      <div className="flex flex-col gap-3 lg:hidden">
        <h2 className="text-lg font-bold text-brand line-clamp-2">
          {session.obraAtiva ? `Tarefas - ${session.obraAtiva.nome_obra}` : 'Planejamento Semanal'}
        </h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1 border-gray-200 hover:bg-gray-50 text-brand min-h-[44px]"
            onClick={onRegistryClick}
          >
            Cadastros
          </Button>
          <Button 
            size="sm"
            className="flex-1 min-h-[44px]"
            onClick={onNewTaskClick}
          >
            Nova Tarefa
          </Button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ color: "#021C2F" }}>
          {session.obraAtiva ? `Tarefas - ${session.obraAtiva.nome_obra}` : 'Planejamento Semanal'}
        </h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-gray-200 hover:bg-gray-50" 
            style={{ color: "#021C2F" }}
            onClick={onRegistryClick}
          >
            Cadastros
          </Button>
          <Button onClick={onNewTaskClick}>Nova Tarefa</Button>
        </div>
      </div>
    </div>
  );
};

export default MainHeader;
