
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

interface MainHeaderProps {
  onNewTaskClick: () => void;
  onRegistryClick: () => void;
}

const MainHeader: React.FC<MainHeaderProps> = ({ onNewTaskClick, onRegistryClick }) => {
  const { session } = useAuth();

  return (
    <div className="mb-6 flex justify-between items-center">
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
  );
};

export default MainHeader;
