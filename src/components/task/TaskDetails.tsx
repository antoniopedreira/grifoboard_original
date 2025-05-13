
import React from "react";

interface TaskDetailsProps {
  sector: string;
  discipline: string;
  team: string;
  responsible: string;
  executor: string;  // New field
  cable: string;     // New field
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
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div className="flex flex-col">
        <span className="text-gray-500">Setor</span>
        <span>{sector}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-gray-500">Disciplina</span>
        <span>{discipline}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-gray-500">Equipe</span>
        <span>{team}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-gray-500">Responsável</span>
        <span>{responsible}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-gray-500">Executante</span>
        <span>{executor}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-gray-500">Cabo</span>
        <span>{cable}</span>
      </div>
    </div>
  );
};

export default TaskDetails;
