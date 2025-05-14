
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useRegistry } from "@/context/RegistryContext";
import { Loader2 } from "lucide-react";

interface RegistryFormProps {
  onClose: () => void;
  onRegistryCreate: (type: string, value: string) => Promise<void>;
  isSaving: boolean;
}

const RegistryForm: React.FC<RegistryFormProps> = ({ onClose, onRegistryCreate, isSaving }) => {
  const [newSector, setNewSector] = useState("");
  const [newDiscipline, setNewDiscipline] = useState("");
  const [newTeam, setNewTeam] = useState("");
  const [newResponsible, setNewResponsible] = useState("");
  const [newExecutor, setNewExecutor] = useState("");
  const [newCable, setNewCable] = useState("");
  const { sectors, disciplines, teams, responsibles, executors, cables, isLoading } = useRegistry();

  const handleSubmit = async (type: string) => {
    let value = "";
    
    switch(type) {
      case "sector":
        value = newSector.trim();
        setNewSector("");
        break;
      case "discipline":
        value = newDiscipline.trim();
        setNewDiscipline("");
        break;
      case "team":
        value = newTeam.trim();
        setNewTeam("");
        break;
      case "responsible":
        value = newResponsible.trim();
        setNewResponsible("");
        break;
      case "executor":
        value = newExecutor.trim();
        setNewExecutor("");
        break;
      case "cable":
        value = newCable.trim();
        setNewCable("");
        break;
    }
    
    if (value) {
      try {
        await onRegistryCreate(type, value);
        toast({
          title: "Cadastro adicionado",
          description: `${value} foi adicionado com sucesso.`,
        });
      } catch (error) {
        // Error is handled by the context
      }
    } else {
      toast({
        title: "Erro no cadastro",
        description: "Por favor, insira um valor válido.",
        variant: "destructive",
      });
    }
  };

  // Display existing items count
  const renderItemsCount = (items: string[]) => {
    if (isLoading) return <span className="text-xs text-muted-foreground">Carregando...</span>;
    return <span className="text-xs text-muted-foreground">{items.length} itens</span>;
  };

  return (
    <Tabs defaultValue="sector" className="w-full">
      <TabsList className="flex flex-wrap mb-4 w-full">
        <TabsTrigger value="sector" className="flex-1 px-1 py-1.5 text-xs min-w-[70px]">
          Setor
          <div className="ml-1">{renderItemsCount(sectors)}</div>
        </TabsTrigger>
        <TabsTrigger value="discipline" className="flex-1 px-1 py-1.5 text-xs min-w-[70px]">
          Disciplina
          <div className="ml-1">{renderItemsCount(disciplines)}</div>
        </TabsTrigger>
        <TabsTrigger value="team" className="flex-1 px-1 py-1.5 text-xs min-w-[70px]">
          Equipe
          <div className="ml-1">{renderItemsCount(teams)}</div>
        </TabsTrigger>
        <TabsTrigger value="responsible" className="flex-1 px-1 py-1.5 text-xs min-w-[70px]">
          Resp.
          <div className="ml-1">{renderItemsCount(responsibles)}</div>
        </TabsTrigger>
        <TabsTrigger value="executor" className="flex-1 px-1 py-1.5 text-xs min-w-[70px]">
          Exec.
          <div className="ml-1">{renderItemsCount(executors)}</div>
        </TabsTrigger>
        <TabsTrigger value="cable" className="flex-1 px-1 py-1.5 text-xs min-w-[70px]">
          Cabo
          <div className="ml-1">{renderItemsCount(cables)}</div>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="sector" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-sector">Novo Setor</Label>
          <Input
            id="new-sector"
            value={newSector}
            onChange={(e) => setNewSector(e.target.value)}
            placeholder="Digite o nome do setor"
          />
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={() => handleSubmit("sector")} 
            disabled={isSaving || newSector.trim() === ""}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Adicionar Setor"
            )}
          </Button>
        </div>
      </TabsContent>
      
      <TabsContent value="discipline" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-discipline">Nova Disciplina</Label>
          <Input
            id="new-discipline"
            value={newDiscipline}
            onChange={(e) => setNewDiscipline(e.target.value)}
            placeholder="Digite o nome da disciplina"
          />
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={() => handleSubmit("discipline")} 
            disabled={isSaving || newDiscipline.trim() === ""}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Adicionar Disciplina"
            )}
          </Button>
        </div>
      </TabsContent>
      
      <TabsContent value="team" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-team">Nova Equipe</Label>
          <Input
            id="new-team"
            value={newTeam}
            onChange={(e) => setNewTeam(e.target.value)}
            placeholder="Digite o nome da equipe"
          />
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={() => handleSubmit("team")} 
            disabled={isSaving || newTeam.trim() === ""}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Adicionar Equipe"
            )}
          </Button>
        </div>
      </TabsContent>
      
      <TabsContent value="responsible" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-responsible">Novo Responsável</Label>
          <Input
            id="new-responsible"
            value={newResponsible}
            onChange={(e) => setNewResponsible(e.target.value)}
            placeholder="Digite o nome do responsável"
          />
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={() => handleSubmit("responsible")} 
            disabled={isSaving || newResponsible.trim() === ""}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Adicionar Responsável"
            )}
          </Button>
        </div>
      </TabsContent>
      
      <TabsContent value="executor" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-executor">Novo Executante</Label>
          <Input
            id="new-executor"
            value={newExecutor}
            onChange={(e) => setNewExecutor(e.target.value)}
            placeholder="Digite o nome do executante"
          />
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={() => handleSubmit("executor")} 
            disabled={isSaving || newExecutor.trim() === ""}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Adicionar Executante"
            )}
          </Button>
        </div>
      </TabsContent>
      
      <TabsContent value="cable" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-cable">Novo Cabo</Label>
          <Input
            id="new-cable"
            value={newCable}
            onChange={(e) => setNewCable(e.target.value)}
            placeholder="Digite o tipo de cabo"
          />
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={() => handleSubmit("cable")} 
            disabled={isSaving || newCable.trim() === ""}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Adicionar Cabo"
            )}
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default RegistryForm;
