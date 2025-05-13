
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DayOfWeek, Task, TaskStatus } from "@/types";
import TaskDetails from "./task/TaskDetails";
import TaskStatusDisplay from "./task/TaskStatusDisplay";
import CausesDropdown from "./task/CausesDropdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2 } from "lucide-react";
import { dayNameMap } from "@/utils/pcp";
import { useRegistry } from "@/context/RegistryContext";
import { useToast } from "@/hooks/use-toast";

interface TaskCardProps {
  task: Task;
  onTaskUpdate: (updatedTask: Task) => void;
  onTaskDelete?: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onTaskUpdate, onTaskDelete }) => {
  const { sectors, disciplines, teams, responsibles, executors, cables } = useRegistry();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Edit form state
  const [editFormData, setEditFormData] = useState<Omit<Task, "id" | "isFullyCompleted" | "dailyStatus">>(
    {
      sector: task.sector,
      item: task.item,
      description: task.description,
      discipline: task.discipline,
      team: task.team,
      responsible: task.responsible,
      executor: task.executor || "",
      cable: task.cable || "",
      plannedDays: task.plannedDays,
      completionStatus: task.completionStatus,
      causeIfNotDone: task.causeIfNotDone,
    }
  );

  const handleStatusChange = (day: DayOfWeek, newStatus: TaskStatus) => {
    const updatedDailyStatus = task.dailyStatus.map(status => 
      status.day === day ? { ...status, status: newStatus } : status
    );

    onTaskUpdate({
      ...task,
      dailyStatus: updatedDailyStatus,
    });
  };

  const handleCompletionStatusChange = () => {
    const newCompletionStatus = task.completionStatus === "completed" ? "not_completed" : "completed";
    
    onTaskUpdate({
      ...task,
      completionStatus: newCompletionStatus,
    });
  };

  const handleCauseSelect = (cause: string) => {
    onTaskUpdate({
      ...task,
      causeIfNotDone: cause
    });
  };

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
  };

  const handleDayToggle = (day: DayOfWeek) => {
    setEditFormData(prev => {
      const updatedPlannedDays = prev.plannedDays.includes(day)
        ? prev.plannedDays.filter(d => d !== day)
        : [...prev.plannedDays, day];
      
      return {
        ...prev,
        plannedDays: updatedPlannedDays
      };
    });
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEdit = () => {
    const updatedTask: Task = {
      ...task,
      ...editFormData,
    };

    onTaskUpdate(updatedTask);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Tarefa atualizada",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  const handleDelete = () => {
    if (onTaskDelete) {
      onTaskDelete(task.id);
      setIsDeleteDialogOpen(false);
      
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi excluída com sucesso.",
      });
    }
  };

  const isFormValid = () => {
    return (
      editFormData.sector.trim() !== "" &&
      editFormData.description.trim() !== "" &&
      editFormData.responsible.trim() !== "" &&
      editFormData.plannedDays.length > 0
    );
  };

  return (
    <>
      <Card className="w-full bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between">
            <div>
              <h3 className="font-semibold">{task.description}</h3>
              <p className="text-sm text-gray-500">{task.item}</p>
            </div>
            <Badge 
              className={`cursor-pointer ${
                task.completionStatus === "completed" 
                  ? "bg-green-500 hover:bg-green-600" 
                  : "text-orange-500 border-orange-500 hover:bg-orange-100"
              }`}
              variant={task.completionStatus === "completed" ? "default" : "outline"}
              onClick={handleCompletionStatusChange}
            >
              {task.completionStatus === "completed" ? "Concluída" : "Não Concluída"}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pb-2">
          <TaskDetails 
            sector={task.sector}
            discipline={task.discipline}
            team={task.team}
            responsible={task.responsible}
            executor={task.executor || "Não definido"}
            cable={task.cable || "Não definido"}
          />
          
          <TaskStatusDisplay 
            task={task}
            onStatusChange={handleStatusChange}
          />
        </CardContent>
        
        <CardFooter className="pt-2">
          <div className="w-full flex justify-between items-center">
            {task.completionStatus !== "completed" ? (
              <CausesDropdown 
                onCauseSelect={handleCauseSelect}
                currentCause={task.causeIfNotDone}
              />
            ) : (
              <span />
            )}
            
            <Button variant="ghost" size="sm" onClick={handleEditClick}>
              <Pencil className="mr-1 h-4 w-4" /> Editar
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Tarefa</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-sector">Setor</Label>
              <Select 
                value={editFormData.sector} 
                onValueChange={(value) => handleEditFormChange("sector", value)}
              >
                <SelectTrigger id="edit-sector">
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Input
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => handleEditFormChange("description", e.target.value)}
                placeholder="Descrição da tarefa"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-discipline">Disciplina</Label>
                <Select 
                  value={editFormData.discipline} 
                  onValueChange={(value) => handleEditFormChange("discipline", value)}
                >
                  <SelectTrigger id="edit-discipline">
                    <SelectValue placeholder="Selecione a disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    {disciplines.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-team">Equipe</Label>
                <Select 
                  value={editFormData.team} 
                  onValueChange={(value) => handleEditFormChange("team", value)}
                >
                  <SelectTrigger id="edit-team">
                    <SelectValue placeholder="Selecione a equipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-responsible">Responsável</Label>
                <Select 
                  value={editFormData.responsible} 
                  onValueChange={(value) => handleEditFormChange("responsible", value)}
                >
                  <SelectTrigger id="edit-responsible">
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    {responsibles.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-executor">Executante</Label>
                <Select 
                  value={editFormData.executor || ""} 
                  onValueChange={(value) => handleEditFormChange("executor", value)}
                >
                  <SelectTrigger id="edit-executor">
                    <SelectValue placeholder="Selecione o executante" />
                  </SelectTrigger>
                  <SelectContent>
                    {executors.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-cable">Cabo</Label>
              <Select 
                value={editFormData.cable || ""} 
                onValueChange={(value) => handleEditFormChange("cable", value)}
              >
                <SelectTrigger id="edit-cable">
                  <SelectValue placeholder="Selecione o cabo" />
                </SelectTrigger>
                <SelectContent>
                  {cables.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Dias Planejados</Label>
              <div className="flex flex-wrap gap-4">
                {(Object.entries(dayNameMap) as [DayOfWeek, string][]).map(([day, name]) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-day-${day}`}
                      checked={editFormData.plannedDays.includes(day as DayOfWeek)}
                      onCheckedChange={() => handleDayToggle(day as DayOfWeek)}
                    />
                    <Label htmlFor={`edit-day-${day}`} className="cursor-pointer">{name}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button 
              variant="destructive" 
              onClick={() => {
                setIsEditDialogOpen(false);
                setIsDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="mr-1 h-4 w-4" /> Excluir
            </Button>
            <Button onClick={handleSaveEdit} disabled={!isFormValid()}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TaskCard;
