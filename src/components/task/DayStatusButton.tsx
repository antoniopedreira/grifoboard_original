
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
      <div className="h-6 w-6 rounded-md bg-gray-100 opacity-30 border border-gray-200" />
    );
  }

  const statusColorMap = {
    planned: "bg-blue-100 border-blue-200 hover:bg-blue-200",
    completed: "bg-green-100 border-green-200 hover:bg-green-200",
    not_done: "bg-red-100 border-red-200 hover:bg-red-200",
    not_planned: "bg-gray-100 border-gray-200 hover:bg-gray-200"
  };
  
  const statusTextMap = {
    planned: "text-blue-600",
    completed: "text-green-600",
    not_done: "text-red-600",
    not_planned: "text-gray-400"
  };
  
  const handleClick = () => {
    // Cycle through statuses: planned -> completed -> not_done -> planned
    const nextStatus: Record<TaskStatus, TaskStatus> = {
      planned: "completed",
      completed: "not_done",
      not_done: "planned",
      not_planned: "planned"
    };
    onStatusChange(day, nextStatus[status]);
  };

  return (
    <button
      onClick={handleClick}
      className={`h-6 w-6 rounded-md ${statusColorMap[status]} flex items-center justify-center ${statusTextMap[status]} transition-all duration-150 shadow-sm`}
      aria-label={`Status para ${day}: ${status}`}
    >
      {status === "completed" && <Check className="w-3 h-3" />}
      {status === "not_done" && <span className="text-xs font-bold">X</span>}
      {status === "planned" && <span className="text-xs font-bold">?</span>}
    </button>
  );
};

export default DayStatusButton;
