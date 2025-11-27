
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
import { Loader2, Trash2, Edit2, Check, X, Copy } from "lucide-react";

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
  const [editingItem, setEditingItem] = useState<{type: string, value: string, newValue: string} | null>(null);
  const { sectors, disciplines, teams, responsibles, executors, isLoading, deleteRegistry, editRegistry, getRegistryItemId, selectedObraId } = useRegistry();
  const [deletingItem, setDeletingItem] = useState<{type: string, value: string} | null>(null);
  const [copyingFromUser, setCopyingFromUser] = useState(false);
  const [userRegistries, setUserRegistries] = useState<{
    sectors: string[];
    disciplines: string[];
    teams: string[];
    responsibles: string[];
    executors: string[];
  } | null>(null);

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

  const handleEdit = (type: string, value: string) => {
    setEditingItem({ type, value, newValue: value });
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    
    const itemId = getRegistryItemId(editingItem.type, editingItem.value);
    if (!itemId) {
      toast({
        title: "Erro",
        description: "Item não encontrado.",
        variant: "destructive",
      });
      return;
    }

    try {
      await editRegistry(itemId, editingItem.newValue);
      setEditingItem(null);
    } catch (error) {
      // Error is handled by the context
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const handleDelete = async (type: string, value: string) => {
    setDeletingItem({type, value});
    try {
      await deleteRegistry(type, value);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      // Error is handled by the context
    } finally {
      setDeletingItem(null);
    }
  };

  const loadUserRegistries = async () => {
    try {
      setCopyingFromUser(true);
      const { registrosService } = await import('@/services/registroService');
      const data = await registrosService.listarRegistrosUsuario();
      
      setUserRegistries({
        sectors: data.filter(item => item.tipo === 'sector').map(item => item.valor),
        disciplines: data.filter(item => item.tipo === 'discipline').map(item => item.valor),
        teams: data.filter(item => item.tipo === 'team').map(item => item.valor),
        responsibles: data.filter(item => item.tipo === 'responsible').map(item => item.valor),
        executors: data.filter(item => item.tipo === 'executor').map(item => item.valor),
      });
    } catch (error) {
      toast({
        title: "Erro ao carregar cadastros",
        description: "Não foi possível carregar seus cadastros pessoais.",
        variant: "destructive"
      });
    }
  };

  const handleCopyFromUser = async () => {
    if (!selectedObraId || !userRegistries) return;

    try {
      const { registrosService } = await import('@/services/registroService');
      const allUserRegistries = [
        ...userRegistries.sectors.map(v => ({ tipo: 'sector', valor: v })),
        ...userRegistries.disciplines.map(v => ({ tipo: 'discipline', valor: v })),
        ...userRegistries.teams.map(v => ({ tipo: 'team', valor: v })),
        ...userRegistries.responsibles.map(v => ({ tipo: 'responsible', valor: v })),
        ...userRegistries.executors.map(v => ({ tipo: 'executor', valor: v })),
      ];

      await registrosService.copiarRegistrosParaObra(
        selectedObraId, 
        allUserRegistries.map(r => ({ ...r, id: '', obra_id: null, user_id: null, created_at: '' }))
      );

      toast({
        title: "Cadastros copiados",
        description: "Seus cadastros pessoais foram copiados para esta obra.",
      });

      setCopyingFromUser(false);
      setUserRegistries(null);
      window.location.reload(); // Refresh to show new data
    } catch (error) {
      toast({
        title: "Erro ao copiar cadastros",
        description: "Alguns cadastros podem já existir nesta obra.",
        variant: "destructive"
      });
    }
  };

  // Display existing items count
  const renderItemsCount = (items: string[]) => {
    if (isLoading) return <span className="text-xs text-muted-foreground">Carregando...</span>;
    return <span className="text-xs text-muted-foreground">{items.length} itens</span>;
  };

  // Render list of items with delete buttons
  const renderItemsList = (type: string, items: string[]) => {
    if (isLoading) return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Carregando...</span>
      </div>
    );
    
    if (items.length === 0) return (
      <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-muted-foreground/25 rounded-lg">
        <div className="text-muted-foreground/60 text-4xl mb-2">📋</div>
        <div className="text-sm text-muted-foreground font-medium">Nenhum item cadastrado</div>
        <div className="text-xs text-muted-foreground/75 mt-1">Adicione o primeiro item acima</div>
      </div>
    );

    // Sort items alphabetically (case insensitive)
    const sortedItems = [...items].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    return (
      <ScrollArea className="h-[240px] w-full mt-6">
        <div className="space-y-3 pr-4">
          {sortedItems.map((item, index) => {
            const isEditing = editingItem?.type === type && editingItem?.value === item;
            const isDeleting = deletingItem?.type === type && deletingItem?.value === item;
            
            return (
              <div 
                key={index} 
                className="group flex items-center justify-between bg-card border border-border hover:border-primary/30 p-4 rounded-lg transition-all duration-200 hover:shadow-sm"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-primary/60 flex-shrink-0"></div>
                  {isEditing ? (
                    <Input
                      value={editingItem.newValue}
                      onChange={(e) => setEditingItem({...editingItem, newValue: e.target.value})}
                      className="text-sm font-medium flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm font-medium text-foreground truncate">
                      {item}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  {isEditing ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={isSaving}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50 h-8 w-8 p-0"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(type, item)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(type, item)}
                        disabled={isDeleting}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    );
  };

  return (
    <div className="space-y-6">
      {selectedObraId && (
        <div className="flex justify-end">
          {!copyingFromUser ? (
            <Button
              onClick={loadUserRegistries}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copiar da Minha Base de Dados
            </Button>
          ) : userRegistries ? (
            <div className="flex gap-2">
              <Button
                onClick={handleCopyFromUser}
                size="sm"
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                Confirmar Cópia
              </Button>
              <Button
                onClick={() => {
                  setCopyingFromUser(false);
                  setUserRegistries(null);
                }}
                variant="outline"
                size="sm"
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando...
            </div>
          )}
        </div>
      )}

      <Tabs defaultValue="sector" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-8 h-auto p-1 bg-muted/50">
        <TabsTrigger value="sector" className="flex flex-col py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <span className="font-medium text-xs sm:text-sm">Setor</span>
          <div className="mt-1 text-xs opacity-75">{renderItemsCount(sectors)}</div>
        </TabsTrigger>
        <TabsTrigger value="discipline" className="flex flex-col py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <span className="font-medium text-xs sm:text-sm">Disciplina</span>
          <div className="mt-1 text-xs opacity-75">{renderItemsCount(disciplines)}</div>
        </TabsTrigger>
        <TabsTrigger value="team" className="flex flex-col py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <span className="font-medium text-xs sm:text-sm">Executante</span>
          <div className="mt-1 text-xs opacity-75">{renderItemsCount(teams)}</div>
        </TabsTrigger>
        <TabsTrigger value="responsible" className="flex flex-col py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <span className="font-medium text-xs sm:text-sm">Resp.</span>
          <div className="mt-1 text-xs opacity-75">{renderItemsCount(responsibles)}</div>
        </TabsTrigger>
        <TabsTrigger value="executor" className="flex flex-col py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <span className="font-medium text-xs sm:text-sm">Encarregado</span>
          <div className="mt-1 text-xs opacity-75">{renderItemsCount(executors)}</div>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="sector" className="space-y-6">
        <div className="bg-muted/30 border rounded-lg p-6">
          <Label htmlFor="new-sector" className="text-base font-semibold text-foreground mb-4 block">
            Novo Setor
          </Label>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              id="new-sector"
              value={newSector}
              onChange={(e) => setNewSector(e.target.value)}
              placeholder="Digite o nome do setor"
              className="flex-1 h-11"
            />
            <Button 
              onClick={() => handleSubmit("sector")} 
              disabled={isSaving || newSector.trim() === ""}
              className="whitespace-nowrap h-11 px-6"
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
      
      <TabsContent value="discipline" className="space-y-6">
        <div className="bg-muted/30 border rounded-lg p-6">
          <Label htmlFor="new-discipline" className="text-base font-semibold text-foreground mb-4 block">
            Nova Disciplina
          </Label>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              id="new-discipline"
              value={newDiscipline}
              onChange={(e) => setNewDiscipline(e.target.value)}
              placeholder="Digite o nome da disciplina"
              className="flex-1 h-11"
            />
            <Button 
              onClick={() => handleSubmit("discipline")} 
              disabled={isSaving || newDiscipline.trim() === ""}
              className="whitespace-nowrap h-11 px-6"
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
      
      <TabsContent value="team" className="space-y-6">
        <div className="bg-muted/30 border rounded-lg p-6">
          <Label htmlFor="new-team" className="text-base font-semibold text-foreground mb-4 block">
            Novo Executante
          </Label>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              id="new-team"
              value={newTeam}
              onChange={(e) => setNewTeam(e.target.value)}
              placeholder="Digite o nome do executante"
              className="flex-1 h-11"
            />
            <Button 
              onClick={() => handleSubmit("team")} 
              disabled={isSaving || newTeam.trim() === ""}
              className="whitespace-nowrap h-11 px-6"
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
      
      <TabsContent value="responsible" className="space-y-6">
        <div className="bg-muted/30 border rounded-lg p-6">
          <Label htmlFor="new-responsible" className="text-base font-semibold text-foreground mb-4 block">
            Novo Responsável
          </Label>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              id="new-responsible"
              value={newResponsible}
              onChange={(e) => setNewResponsible(e.target.value)}
              placeholder="Digite o nome do responsável"
              className="flex-1 h-11"
            />
            <Button 
              onClick={() => handleSubmit("responsible")} 
              disabled={isSaving || newResponsible.trim() === ""}
              className="whitespace-nowrap h-11 px-6"
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
      
      <TabsContent value="executor" className="space-y-6">
        <div className="bg-muted/30 border rounded-lg p-6">
          <Label htmlFor="new-executor" className="text-base font-semibold text-foreground mb-4 block">
            Novo Encarregado
          </Label>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              id="new-executor"
              value={newExecutor}
              onChange={(e) => setNewExecutor(e.target.value)}
              placeholder="Digite o nome do encarregado"
              className="flex-1 h-11"
            />
            <Button 
              onClick={() => handleSubmit("executor")} 
              disabled={isSaving || newExecutor.trim() === ""}
              className="whitespace-nowrap h-11 px-6"
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
    </div>
  );
};

export default RegistryForm;
