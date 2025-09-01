
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { useRegistry } from "@/context/RegistryContext";
import { Loader2, Trash2 } from "lucide-react";

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
  const { sectors, disciplines, teams, responsibles, executors, isLoading, deleteRegistry } = useRegistry();
  const [deletingItem, setDeletingItem] = useState<{type: string, value: string} | null>(null);

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

  const handleDelete = async (type: string, value: string) => {
    setDeletingItem({type, value});
    try {
      await deleteRegistry(type, value);
    } catch (error) {
      console.error("Erro ao excluir:", error);
      // Error is handled by the context
    } finally {
      setDeletingItem(null);
    }
  };

  // Display existing items count
  const renderItemsCount = (items: string[]) => {
    if (isLoading) return <span className="text-xs text-muted-foreground">Carregando...</span>;
    return <span className="text-xs text-muted-foreground">{items.length} itens</span>;
  };

  // Render list of items with delete buttons
  const renderItemsList = (type: string, items: string[]) => {
    if (isLoading) return <div className="text-sm text-muted-foreground py-2">Carregando...</div>;
    if (items.length === 0) return <div className="text-sm text-muted-foreground py-2">Nenhum item cadastrado</div>;

    return (
      <ScrollArea className="h-[200px] mt-4">
        <div className="space-y-2 pr-4">
          {items.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between bg-muted/50 p-2 rounded-md"
              style={{
                overflow: 'hidden',
                whiteSpace: 'normal',
                wordWrap: 'break-word',
                width: '100%'
              }}
            >
              <span 
                className="text-sm flex-1"
                style={{
                  overflow: 'hidden',
                  whiteSpace: 'normal',
                  wordWrap: 'break-word'
                }}
              >
                {item}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(type, item)}
                disabled={deletingItem?.type === type && deletingItem?.value === item}
              >
                {deletingItem?.type === type && deletingItem?.value === item ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 text-destructive" />
                )}
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <Tabs defaultValue="sector" className="w-full">
      <TabsList className="flex flex-wrap mb-6 w-full">
        <TabsTrigger value="sector" className="flex-1 px-3 py-2 text-sm">
          <div className="flex flex-col items-center">
            <span>Setor</span>
            <div className="ml-1 mt-1">{renderItemsCount(sectors)}</div>
          </div>
        </TabsTrigger>
        <TabsTrigger value="discipline" className="flex-1 px-3 py-2 text-sm">
          <div className="flex flex-col items-center">
            <span>Disciplina</span>
            <div className="ml-1 mt-1">{renderItemsCount(disciplines)}</div>
          </div>
        </TabsTrigger>
        <TabsTrigger value="team" className="flex-1 px-3 py-2 text-sm">
          <div className="flex flex-col items-center">
            <span>Executante</span>
            <div className="ml-1 mt-1">{renderItemsCount(teams)}</div>
          </div>
        </TabsTrigger>
        <TabsTrigger value="responsible" className="flex-1 px-3 py-2 text-sm">
          <div className="flex flex-col items-center">
            <span>Resp.</span>
            <div className="ml-1 mt-1">{renderItemsCount(responsibles)}</div>
          </div>
        </TabsTrigger>
        <TabsTrigger value="executor" className="flex-1 px-3 py-2 text-sm">
          <div className="flex flex-col items-center">
            <span>Encarregado</span>
            <div className="ml-1 mt-1">{renderItemsCount(executors)}</div>
          </div>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="sector" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-sector" className="font-medium">Novo Setor</Label>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              id="new-sector"
              value={newSector}
              onChange={(e) => setNewSector(e.target.value)}
              placeholder="Digite o nome do setor"
              className="flex-1"
            />
            <Button 
              onClick={() => handleSubmit("sector")} 
              disabled={isSaving || newSector.trim() === ""}
              className="whitespace-nowrap"
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
        </div>
        {renderItemsList("sector", sectors)}
      </TabsContent>
      
      <TabsContent value="discipline" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-discipline" className="font-medium">Nova Disciplina</Label>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              id="new-discipline"
              value={newDiscipline}
              onChange={(e) => setNewDiscipline(e.target.value)}
              placeholder="Digite o nome da disciplina"
              className="flex-1"
            />
            <Button 
              onClick={() => handleSubmit("discipline")} 
              disabled={isSaving || newDiscipline.trim() === ""}
              className="whitespace-nowrap"
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
        </div>
        {renderItemsList("discipline", disciplines)}
      </TabsContent>
      
      <TabsContent value="team" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-team" className="font-medium">Novo Executante</Label>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              id="new-team"
              value={newTeam}
              onChange={(e) => setNewTeam(e.target.value)}
              placeholder="Digite o nome do executante"
              className="flex-1"
            />
            <Button 
              onClick={() => handleSubmit("team")} 
              disabled={isSaving || newTeam.trim() === ""}
              className="whitespace-nowrap"
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
        </div>
        {renderItemsList("team", teams)}
      </TabsContent>
      
      <TabsContent value="responsible" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-responsible" className="font-medium">Novo Responsável</Label>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              id="new-responsible"
              value={newResponsible}
              onChange={(e) => setNewResponsible(e.target.value)}
              placeholder="Digite o nome do responsável"
              className="flex-1"
            />
            <Button 
              onClick={() => handleSubmit("responsible")} 
              disabled={isSaving || newResponsible.trim() === ""}
              className="whitespace-nowrap"
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
        </div>
        {renderItemsList("responsible", responsibles)}
      </TabsContent>
      
      <TabsContent value="executor" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-executor" className="font-medium">Novo Encarregado</Label>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              id="new-executor"
              value={newExecutor}
              onChange={(e) => setNewExecutor(e.target.value)}
              placeholder="Digite o nome do encarregado"
              className="flex-1"
            />
            <Button 
              onClick={() => handleSubmit("executor")} 
              disabled={isSaving || newExecutor.trim() === ""}
              className="whitespace-nowrap"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Adicionar Encarregado"
              )}
            </Button>
          </div>
        </div>
        {renderItemsList("executor", executors)}
      </TabsContent>
    </Tabs>
  );
};

export default RegistryForm;
