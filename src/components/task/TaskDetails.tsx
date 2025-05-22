
import React from "react";

interface TaskDetailsProps {
  sector: string;
  discipline: string;
  team: string;
  responsible: string;
  executor: string;
  cable: string;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({
  sector,
  discipline,
  team,
  responsible,
  executor,
  cable
}) => {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-4 p-3 rounded-lg bg-gray-50/80 border border-gray-100">
      <div className="flex flex-col">
        <span className="text-gray-500 font-medium text-[10px] uppercase tracking-wide">Setor</span>
        <span className="truncate text-gray-800 font-medium mt-0.5">{sector}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-gray-500 font-medium text-[10px] uppercase tracking-wide">Disciplina</span>
        <span className="truncate text-gray-800 font-medium mt-0.5">{discipline}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-gray-500 font-medium text-[10px] uppercase tracking-wide">Equipe</span>
        <span className="truncate text-gray-800 font-medium mt-0.5">{team}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-gray-500 font-medium text-[10px] uppercase tracking-wide">Responsável</span>
        <span className="truncate text-gray-800 font-medium mt-0.5">{responsible}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-gray-500 font-medium text-[10px] uppercase tracking-wide">Executante</span>
        <span className="truncate text-gray-800 font-medium mt-0.5">{executor}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-gray-500 font-medium text-[10px] uppercase tracking-wide">Cabo</span>
        <span className="truncate text-gray-800 font-medium mt-0.5">{cable}</span>
      </div>
    </div>
  );
};

export default TaskDetails;
