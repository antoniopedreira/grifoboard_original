
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { PlusCircle, Settings } from "lucide-react";
import { motion } from "framer-motion";

interface MainHeaderProps {
  onNewTaskClick: () => void;
  onRegistryClick: () => void;
}

const MainHeader: React.FC<MainHeaderProps> = ({ onNewTaskClick, onRegistryClick }) => {
  const { userSession } = useAuth();

  return (
    <div className="mb-6 flex justify-between items-center">
      <motion.h2 
        className="text-2xl font-bold gradient-text"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        {userSession?.obraAtiva ? `Tarefas - ${userSession.obraAtiva.nome_obra}` : 'Planejamento Semanal'}
      </motion.h2>
      <div className="flex gap-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Button 
            variant="outline" 
            className="border border-primary-accent/30 hover:border-primary-accent text-primary-accent hover:bg-primary-accent/10"
            onClick={onRegistryClick}
          >
            <Settings className="mr-2 h-4 w-4" />
            Cadastros
          </Button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button 
            onClick={onNewTaskClick}
            className="bg-gradient-to-r from-primary-accent to-primary-accent-hover hover:shadow-lg hover:shadow-primary-accent/20 transition-all duration-300"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Tarefa
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default MainHeader;
