
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
      <div className="h-8 w-8 rounded-full bg-gray-200 opacity-30 border border-[#E0E2EC]" />
    );
  }

  // Update color mapping to match new color palette
  const getNewStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case "completed":
        return "bg-green-500 border-green-600";
      case "not_done":
        return "bg-red-500 border-red-600";
      case "planned":
        return "bg-[#927535] border-[#927535]/70";
      case "not_planned":
      default:
        return "bg-[#E0E2EC] border-gray-300";
    }
  };

  const statusColor = getNewStatusColor(status);
  
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
      className={`h-8 w-8 rounded-full ${statusColor} border flex items-center justify-center text-white hover:opacity-90 transition-opacity`}
      aria-label={`Status para ${day}: ${status}`}
    >
      {status === "completed" && <Check className="w-4 h-4" />}
    </button>
  );
};

export default DayStatusButton;
