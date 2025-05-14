
import React, { createContext, useContext, useState } from "react";

interface RegistryContextType {
  sectors: string[];
  disciplines: string[];
  teams: string[];
  responsibles: string[];
  executors: string[];   
  cables: string[];      
  addRegistry: (type: string, value: string) => void;
}

// Removing all default values and starting with empty arrays
const RegistryContext = createContext<RegistryContextType | undefined>(undefined);

export const RegistryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sectors, setSectors] = useState<string[]>([]);
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [responsibles, setResponsibles] = useState<string[]>([]);
  const [executors, setExecutors] = useState<string[]>([]);
  const [cables, setCables] = useState<string[]>([]);

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
      case "executor":
        if (!executors.includes(value)) {
          setExecutors([...executors, value]);
        }
        break;
      case "cable":
        if (!cables.includes(value)) {
          setCables([...cables, value]);
        }
        break;
    }
  };

  return (
    <RegistryContext.Provider value={{ 
      sectors, 
      disciplines, 
      teams, 
      responsibles, 
      executors, 
      cables, 
      addRegistry 
    }}>
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
