
import React, { createContext, useContext, useState, useEffect } from "react";
import { registrosService } from "@/services/registroService";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface RegistryContextType {
  sectors: string[];
  disciplines: string[];
  teams: string[];
  responsibles: string[];
  executors: string[];   
  cables: string[];      
  addRegistry: (type: string, value: string) => Promise<void>;
  isLoading: boolean;
  isSaving: boolean;
  selectedObraId: string | null;
  setSelectedObraId: (id: string | null) => void;
}

const RegistryContext = createContext<RegistryContextType | undefined>(undefined);

export const RegistryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedObraId, setSelectedObraId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Using React Query to fetch registry items
  const { 
    data: registryItems = [], 
    isLoading 
  } = useQuery({
    queryKey: ['registros', selectedObraId],
    queryFn: async () => {
      if (!selectedObraId) return [];
      return registrosService.listarRegistros(selectedObraId);
    },
    enabled: !!selectedObraId
  });
  
  // Group registry items by type
  const sectors = registryItems.filter(item => item.tipo === 'sector').map(item => item.valor);
  const disciplines = registryItems.filter(item => item.tipo === 'discipline').map(item => item.valor);
  const teams = registryItems.filter(item => item.tipo === 'team').map(item => item.valor);
  const responsibles = registryItems.filter(item => item.tipo === 'responsible').map(item => item.valor);
  const executors = registryItems.filter(item => item.tipo === 'executor').map(item => item.valor);
  const cables = registryItems.filter(item => item.tipo === 'cable').map(item => item.valor);
  
  // Mutation to add new registry items
  const addRegistryMutation = useMutation({
    mutationFn: async ({ type, value }: { type: string; value: string }) => {
      if (!selectedObraId) throw new Error('No obra selected');
      
      await registrosService.criarRegistro({
        obra_id: selectedObraId,
        tipo: type,
        valor: value
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registros', selectedObraId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao adicionar cadastro",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Function to add new registry items
  const addRegistry = async (type: string, value: string) => {
    if (value.trim() === "") return;

    try {
      await addRegistryMutation.mutateAsync({ type, value });
    } catch (error) {
      // Error is handled by the mutation
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
      addRegistry,
      isLoading,
      isSaving: addRegistryMutation.isPending,
      selectedObraId,
      setSelectedObraId
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
