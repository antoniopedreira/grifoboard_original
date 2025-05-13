
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task } from "@/types";

interface TaskFiltersProps {
  tasks: Task[];
  onFiltersChange: (filteredTasks: Task[]) => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({ tasks, onFiltersChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSector, setFilterSector] = useState("all");
  const [filterResponsible, setFilterResponsible] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Extract unique sectors and responsibles for filters
  const sectors = Array.from(new Set(tasks.map(task => task.sector)));
  const responsibles = Array.from(new Set(tasks.map(task => task.responsible)));

  // Apply filters whenever filter values change
  useEffect(() => {
    const filteredTasks = tasks.filter(task => {
      const matchesSearch = 
        searchTerm === "" ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.item.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesSector = filterSector === "all" || task.sector === filterSector;
      const matchesResponsible = filterResponsible === "all" || task.responsible === filterResponsible;
      const matchesStatus = filterStatus === "all" || 
                          (filterStatus === "completed" && task.completionStatus === "completed") ||
                          (filterStatus === "not_completed" && task.completionStatus === "not_completed");
      
      return matchesSearch && matchesSector && matchesResponsible && matchesStatus;
    });

    onFiltersChange(filteredTasks);
  }, [searchTerm, filterSector, filterResponsible, filterStatus, tasks, onFiltersChange]);
  
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1">
        <Input
          placeholder="Buscar tarefas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>
      
      <div className="w-full md:w-40">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="completed">Concluídas</SelectItem>
            <SelectItem value="not_completed">Não Concluídas</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-full md:w-52">
        <Select value={filterSector} onValueChange={setFilterSector}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por setor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os setores</SelectItem>
            {sectors.map(sector => (
              <SelectItem key={sector} value={sector}>{sector}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-full md:w-52">
        <Select value={filterResponsible} onValueChange={setFilterResponsible}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os responsáveis</SelectItem>
            {responsibles.map(responsible => (
              <SelectItem key={responsible} value={responsible}>{responsible}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TaskFilters;
