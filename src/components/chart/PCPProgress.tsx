
import { Progress } from "@/components/ui/progress";
import { PCPData } from "@/types";

interface PCPProgressProps {
  data: PCPData;
  label?: string;
}

const PCPProgress: React.FC<PCPProgressProps> = ({ data, label }) => {
  const percentage = Math.round(data.percentage);
  
  // Determine color based on percentage
  let progressColor = "bg-red-500";
  if (percentage >= 80) {
    progressColor = "bg-green-500";
  } else if (percentage >= 60) {
    progressColor = "bg-[#927535]"; // Our secondary golden color
  } else if (percentage >= 40) {
    progressColor = "bg-orange-500";
  }
  
  return (
    <div className="w-full">
      {label && <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-[#081C2C]">{label}</span>
        <span className="text-sm font-medium text-[#081C2C]">{percentage}%</span>
      </div>}
      <div className="w-full flex items-center gap-2">
        <div className="w-full">
          <Progress 
            value={percentage} 
            className={`h-2 ${progressColor}`} 
          />
        </div>
        <span className="text-sm font-medium w-12 text-right text-[#081C2C]">
          {data.completedTasks}/{data.totalTasks}
        </span>
      </div>
    </div>
  );
};

export default PCPProgress;
