
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task } from "@/types";

interface TaskFiltersProps {
  tasks: Task[];
  onFiltersChange: (filteredTasks: Task[]) => void;
  selectedCause: string | null;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({ tasks, onFiltersChange, selectedCause }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSector, setFilterSector] = useState("all");
  const [filterDiscipline, setFilterDiscipline] = useState("all");
  const [filterResponsible, setFilterResponsible] = useState("all");
  const [filterTeam, setFilterTeam] = useState("all");
  const [filterExecutor, setFilterExecutor] = useState("all");
  
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Extract unique values for filters and filter out empty values
  const sectors = Array.from(new Set(tasks.map(task => task.sector))).filter(Boolean);
  const disciplines = Array.from(new Set(tasks.map(task => task.discipline))).filter(Boolean);
  const responsibles = Array.from(new Set(tasks.map(task => task.responsible))).filter(Boolean);
  const teams = Array.from(new Set(tasks.map(task => task.team))).filter(Boolean);
  const executors = Array.from(new Set(tasks.map(task => task.executor).filter(Boolean))).filter(Boolean);
  

  // Apply filters whenever filter values change
  useEffect(() => {
    const filteredTasks = tasks.filter(task => {
      const matchesSearch = 
        searchTerm === "" ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.item.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesSector = filterSector === "all" || task.sector === filterSector;
      const matchesDiscipline = filterDiscipline === "all" || task.discipline === filterDiscipline;
      const matchesResponsible = filterResponsible === "all" || task.responsible === filterResponsible;
      const matchesTeam = filterTeam === "all" || task.team === filterTeam;
      const matchesExecutor = filterExecutor === "all" || task.executor === filterExecutor;
      
      const matchesStatus = filterStatus === "all" || 
                          (filterStatus === "completed" && task.isFullyCompleted) ||
                          (filterStatus === "not_completed" && !task.isFullyCompleted);
      
      return matchesSearch && matchesSector && matchesDiscipline && matchesResponsible && matchesTeam && matchesExecutor && matchesStatus;
    });

    onFiltersChange(filteredTasks);
  }, [searchTerm, filterSector, filterDiscipline, filterResponsible, filterTeam, filterExecutor, filterStatus, tasks, onFiltersChange]);

  // Reset filters when selectedCause changes
  useEffect(() => {
    setSearchTerm("");
    setFilterSector("all");
    setFilterDiscipline("all");
    setFilterResponsible("all");
    setFilterTeam("all");
    setFilterExecutor("all");
    
    setFilterStatus("all");
  }, [selectedCause]);
  
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="w-[200px]">
        <div className="text-xs text-gray-500 mb-1">Busca</div>
        <Input
          placeholder="Buscar tarefas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>
      
      <div className="w-full sm:w-auto">
        <div className="text-xs text-gray-500 mb-1">Status</div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="completed">Concluídas</SelectItem>
            <SelectItem value="not_completed">Não Concluídas</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-full sm:w-auto">
        <div className="text-xs text-gray-500 mb-1">Setor</div>
        <Select value={filterSector} onValueChange={setFilterSector}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Setor" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="all">Todos</SelectItem>
            {sectors.map(sector => (
              <SelectItem key={sector} value={sector}>{sector}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-full sm:w-auto">
        <div className="text-xs text-gray-500 mb-1">Disciplina</div>
        <Select value={filterDiscipline} onValueChange={setFilterDiscipline}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Disciplina" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="all">Todos</SelectItem>
            {disciplines.map(discipline => (
              <SelectItem key={discipline} value={discipline}>{discipline}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-full sm:w-auto">
        <div className="text-xs text-gray-500 mb-1">Responsável</div>
        <Select value={filterResponsible} onValueChange={setFilterResponsible}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Responsável" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="all">Todos</SelectItem>
            {responsibles.map(responsible => (
              <SelectItem key={responsible} value={responsible}>{responsible}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-auto">
        <div className="text-xs text-gray-500 mb-1">Executante</div>
        <Select value={filterTeam} onValueChange={setFilterTeam}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Executante" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="all">Todos</SelectItem>
            {teams.map(team => (
              <SelectItem key={team} value={team}>{team}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-auto">
        <div className="text-xs text-gray-500 mb-1">Encarregado</div>
        <Select value={filterExecutor} onValueChange={setFilterExecutor}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Encarregado" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="all">Todos</SelectItem>
            {executors.map(executor => (
              <SelectItem key={executor} value={executor}>{executor}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

    </div>
  );
};

export default TaskFilters;
