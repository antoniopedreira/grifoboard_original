
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
    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs mb-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
      <div className="flex flex-col">
        <span className="text-gray-500 font-medium text-[10px]">Setor</span>
        <span className="truncate text-gray-800">{sector}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-gray-500 font-medium text-[10px]">Disciplina</span>
        <span className="truncate text-gray-800">{discipline}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-gray-500 font-medium text-[10px]">Equipe</span>
        <span className="truncate text-gray-800">{team}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-gray-500 font-medium text-[10px]">Responsável</span>
        <span className="truncate text-gray-800">{responsible}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-gray-500 font-medium text-[10px]">Executante</span>
        <span className="truncate text-gray-800">{executor}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-gray-500 font-medium text-[10px]">Cabo</span>
        <span className="truncate text-gray-800">{cable}</span>
      </div>
    </div>
  );
};

export default TaskDetails;
