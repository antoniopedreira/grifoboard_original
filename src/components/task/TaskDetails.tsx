
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
  const formatField = (value: string) => {
    return value && value.trim() !== "" ? value : "Não definido";
  };

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-4 p-3 rounded-lg bg-gray-50/80 border border-gray-100" style={{ overflow: 'hidden' }}>
      <div className="flex flex-col" style={{ overflow: 'hidden', whiteSpace: 'normal', wordWrap: 'break-word', width: '100%' }}>
        <span className="text-gray-500 font-medium text-[10px] uppercase tracking-wide">Setor</span>
        <span className="text-gray-800 font-medium mt-0.5" style={{ overflow: 'hidden', whiteSpace: 'normal', wordWrap: 'break-word' }}>{formatField(sector)}</span>
      </div>
      <div className="flex flex-col" style={{ overflow: 'hidden', whiteSpace: 'normal', wordWrap: 'break-word', width: '100%' }}>
        <span className="text-gray-500 font-medium text-[10px] uppercase tracking-wide">Disciplina</span>
        <span className="text-gray-800 font-medium mt-0.5" style={{ overflow: 'hidden', whiteSpace: 'normal', wordWrap: 'break-word' }}>{formatField(discipline)}</span>
      </div>
      <div className="flex flex-col" style={{ overflow: 'hidden', whiteSpace: 'normal', wordWrap: 'break-word', width: '100%' }}>
        <span className="text-gray-500 font-medium text-[10px] uppercase tracking-wide">Executante</span>
        <span className="text-gray-800 font-medium mt-0.5" style={{ overflow: 'hidden', whiteSpace: 'normal', wordWrap: 'break-word' }}>{formatField(team)}</span>
      </div>
      <div className="flex flex-col" style={{ overflow: 'hidden', whiteSpace: 'normal', wordWrap: 'break-word', width: '100%' }}>
        <span className="text-gray-500 font-medium text-[10px] uppercase tracking-wide">Responsável</span>
        <span className="text-gray-800 font-medium mt-0.5" style={{ overflow: 'hidden', whiteSpace: 'normal', wordWrap: 'break-word' }}>{formatField(responsible)}</span>
      </div>
      <div className="flex flex-col" style={{ overflow: 'hidden', whiteSpace: 'normal', wordWrap: 'break-word', width: '100%' }}>
        <span className="text-gray-500 font-medium text-[10px] uppercase tracking-wide">Encarregado</span>
        <span className="text-gray-800 font-medium mt-0.5" style={{ overflow: 'hidden', whiteSpace: 'normal', wordWrap: 'break-word' }}>{formatField(executor)}</span>
      </div>
      <div className="flex flex-col" style={{ overflow: 'hidden', whiteSpace: 'normal', wordWrap: 'break-word', width: '100%' }}>
        <span className="text-gray-500 font-medium text-[10px] uppercase tracking-wide">Cabo</span>
        <span className="text-gray-800 font-medium mt-0.5" style={{ overflow: 'hidden', whiteSpace: 'normal', wordWrap: 'break-word' }}>{formatField(cable)}</span>
      </div>
    </div>
  );
};

export default TaskDetails;
