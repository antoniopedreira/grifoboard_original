
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DayOfWeek, Task, TaskStatus } from "@/types";
import TaskDetails from "./task/TaskDetails";
import TaskStatusDisplay from "./task/TaskStatusDisplay";
import CausesDropdown from "./task/CausesDropdown";

interface TaskCardProps {
  task: Task;
  onTaskUpdate: (updatedTask: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onTaskUpdate }) => {
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

  return (
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
          
          <Button variant="ghost" size="sm">
            Editar
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
