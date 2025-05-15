
import { DayOfWeek, Task, TaskStatus } from "@/types";
import { dayNameMap } from "@/utils/pcp";
import DayStatusButton from "./DayStatusButton";

interface TaskStatusDisplayProps {
  task: Task;
  onStatusChange: (day: DayOfWeek, newStatus: TaskStatus) => void;
}

const TaskStatusDisplay: React.FC<TaskStatusDisplayProps> = ({ task, onStatusChange }) => {
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center">
        {Object.entries(dayNameMap).map(([day, shortName]) => {
          const dayKey = day as DayOfWeek;
          const dayStatus = task.dailyStatus.find(s => s.day === dayKey)?.status || "not_planned";
          const isPlanned = task.plannedDays.includes(dayKey);
          
          return (
            <div key={day} className="flex flex-col items-center">
              <span className="text-xs text-muted-foreground mb-1">{shortName}</span>
              <DayStatusButton
                day={dayKey}
                status={dayStatus}
                isPlanned={isPlanned}
                onStatusChange={onStatusChange}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskStatusDisplay;
