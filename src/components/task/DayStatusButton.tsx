
import { DayOfWeek, TaskStatus } from "@/types";
import { getStatusColor } from "@/utils/pcp";
import { Check } from "lucide-react";

interface DayStatusButtonProps {
  day: DayOfWeek;
  status: TaskStatus;
  isPlanned: boolean;
  onStatusChange: (day: DayOfWeek, newStatus: TaskStatus) => void;
}

const DayStatusButton: React.FC<DayStatusButtonProps> = ({ day, status, isPlanned, onStatusChange }) => {
  if (!isPlanned) {
    return (
      <div className="h-8 w-8 rounded-full bg-gray-200 opacity-30 border border-gray-300" />
    );
  }

  const statusColor = getStatusColor(status);
  
  const handleClick = () => {
    // Cycle through statuses: planned -> completed -> not_done -> planned
    const nextStatus: Record<TaskStatus, TaskStatus> = {
      planned: "completed",
      completed: "not_done",
      not_done: "planned",
      not_planned: "not_planned"
    };
    onStatusChange(day, nextStatus[status]);
  };

  return (
    <button
      onClick={handleClick}
      className={`h-8 w-8 rounded-full ${statusColor} border flex items-center justify-center text-white`}
      aria-label={`Status para ${day}: ${status}`}
    >
      {status === "completed" && <Check className="w-4 h-4" />}
    </button>
  );
};

export default DayStatusButton;
