
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
    <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs mb-3">
      <div className="flex flex-col">
        <span className="text-gray-500 font-medium">Setor</span>
        <span className="truncate text-gray-800">{sector}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-gray-500 font-medium">Disciplina</span>
        <span className="truncate text-gray-800">{discipline}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-gray-500 font-medium">Equipe</span>
        <span className="truncate text-gray-800">{team}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-gray-500 font-medium">Responsável</span>
        <span className="truncate text-gray-800">{responsible}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-gray-500 font-medium">Executante</span>
        <span className="truncate text-gray-800">{executor}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-gray-500 font-medium">Cabo</span>
        <span className="truncate text-gray-800">{cable}</span>
      </div>
    </div>
  );
};

export default TaskDetails;
