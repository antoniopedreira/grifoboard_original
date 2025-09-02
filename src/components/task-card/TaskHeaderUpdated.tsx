import { Task } from "@/types"
import { StatusChip } from "@/components/ui/status-chip"
import { CheckCircle2, CircleX } from "lucide-react"

interface TaskHeaderProps {
  task: Task
  onCompletionStatusChange: () => void
}

const TaskHeader: React.FC<TaskHeaderProps> = ({ task, onCompletionStatusChange }) => {
  return (
    <div className="flex justify-between items-start gap-3">
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground mb-0.5 text-sm leading-tight line-clamp-2">
          {task.description}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {task.item}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        {task.isFullyCompleted ? (
          <StatusChip 
            variant="success"
            className="cursor-pointer flex items-center gap-1"
            onClick={onCompletionStatusChange}
          >
            <CheckCircle2 className="h-3 w-3" />
            Concluída
          </StatusChip>
        ) : (
          <StatusChip 
            variant="warning"
            className="cursor-pointer flex items-center gap-1"
            onClick={onCompletionStatusChange}
          >
            <CircleX className="h-3 w-3" />
            Pendente
          </StatusChip>
        )}
      </div>
    </div>
  )
}

export default TaskHeader