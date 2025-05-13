
import React, { createContext, useContext, useState } from "react";

interface RegistryContextType {
  sectors: string[];
  disciplines: string[];
  teams: string[];
  responsibles: string[];
  addRegistry: (type: string, value: string) => void;
}

const defaultSectors = ["Fundação", "Alvenaria", "Estrutura", "Acabamento", "Instalações"];
const defaultDisciplines = ["Civil", "Elétrica", "Hidráulica", "Arquitetura"];
const defaultTeams = ["Equipe A", "Equipe B", "Equipe C"];
const defaultResponsibles = ["João Silva", "Maria Oliveira", "Carlos Santos"];

const RegistryContext = createContext<RegistryContextType | undefined>(undefined);

export const RegistryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sectors, setSectors] = useState<string[]>(defaultSectors);
  const [disciplines, setDisciplines] = useState<string[]>(defaultDisciplines);
  const [teams, setTeams] = useState<string[]>(defaultTeams);
  const [responsibles, setResponsibles] = useState<string[]>(defaultResponsibles);

  const addRegistry = (type: string, value: string) => {
    if (value.trim() === "") return;

    switch(type) {
      case "sector":
        if (!sectors.includes(value)) {
          setSectors([...sectors, value]);
        }
        break;
      case "discipline":
        if (!disciplines.includes(value)) {
          setDisciplines([...disciplines, value]);
        }
        break;
      case "team":
        if (!teams.includes(value)) {
          setTeams([...teams, value]);
        }
        break;
      case "responsible":
        if (!responsibles.includes(value)) {
          setResponsibles([...responsibles, value]);
        }
        break;
    }
  };

  return (
    <RegistryContext.Provider value={{ sectors, disciplines, teams, responsibles, addRegistry }}>
      {children}
    </RegistryContext.Provider>
  );
};

export const useRegistry = (): RegistryContextType => {
  const context = useContext(RegistryContext);
  if (context === undefined) {
    throw new Error("useRegistry must be used within a RegistryProvider");
  }
  return context;
};
