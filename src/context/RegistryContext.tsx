
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
  addRegistry: (type: string, value: string) => Promise<void>;
  editRegistry: (id: string, newValue: string) => Promise<void>;
  deleteRegistry: (type: string, value: string) => Promise<void>;
  getRegistryItemId: (type: string, value: string) => string | undefined;
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
  
  // Mutation to edit registry items
  const editRegistryMutation = useMutation({
    mutationFn: async ({ id, newValue }: { id: string; newValue: string }) => {
      await registrosService.editarRegistro(id, newValue);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registros', selectedObraId] });
      toast({
        title: "Cadastro atualizado",
        description: "O item foi atualizado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao editar cadastro",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Mutation to delete registry items
  const deleteRegistryMutation = useMutation({
    mutationFn: async ({ type, value }: { type: string; value: string }) => {
      if (!selectedObraId) throw new Error('No obra selected');
      
      await registrosService.excluirRegistro(selectedObraId, type, value);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registros', selectedObraId] });
      toast({
        title: "Cadastro removido",
        description: "O item foi excluído com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir cadastro",
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
  
  // Function to edit registry items
  const editRegistry = async (id: string, newValue: string) => {
    if (newValue.trim() === "") return;

    try {
      await editRegistryMutation.mutateAsync({ id, newValue });
    } catch (error) {
      // Error is handled by the mutation
    }
  };
  
  // Function to get registry item ID by type and value
  const getRegistryItemId = (type: string, value: string): string | undefined => {
    const item = registryItems.find(item => item.tipo === type && item.valor === value);
    return item?.id;
  };
  
  // Function to delete registry items
  const deleteRegistry = async (type: string, value: string) => {
    try {
      await deleteRegistryMutation.mutateAsync({ type, value });
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
      addRegistry,
      editRegistry,
      deleteRegistry,
      getRegistryItemId,
      isLoading,
      isSaving: addRegistryMutation.isPending || editRegistryMutation.isPending || deleteRegistryMutation.isPending,
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
