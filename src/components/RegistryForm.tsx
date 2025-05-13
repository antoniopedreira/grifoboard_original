
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

interface RegistryFormProps {
  onClose: () => void;
  onRegistryCreate: (type: string, value: string) => void;
}

const RegistryForm: React.FC<RegistryFormProps> = ({ onClose, onRegistryCreate }) => {
  const [newSector, setNewSector] = useState("");
  const [newDiscipline, setNewDiscipline] = useState("");
  const [newTeam, setNewTeam] = useState("");
  const [newResponsible, setNewResponsible] = useState("");
  const [newExecutor, setNewExecutor] = useState("");  // New state
  const [newCable, setNewCable] = useState("");        // New state

  const handleSubmit = (type: string) => {
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
      onRegistryCreate(type, value);
      toast({
        title: "Cadastro adicionado",
        description: `${value} foi adicionado com sucesso.`,
      });
    } else {
      toast({
        title: "Erro no cadastro",
        description: "Por favor, insira um valor válido.",
        variant: "destructive",
      });
    }
  };

  return (
    <Tabs defaultValue="sector" className="w-full">
      <TabsList className="grid grid-cols-6 mb-4">
        <TabsTrigger value="sector">Setor</TabsTrigger>
        <TabsTrigger value="discipline">Disciplina</TabsTrigger>
        <TabsTrigger value="team">Equipe</TabsTrigger>
        <TabsTrigger value="responsible">Responsável</TabsTrigger>
        <TabsTrigger value="executor">Executante</TabsTrigger>
        <TabsTrigger value="cable">Cabo</TabsTrigger>
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
          <Button onClick={() => handleSubmit("sector")}>Adicionar Setor</Button>
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
          <Button onClick={() => handleSubmit("discipline")}>Adicionar Disciplina</Button>
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
          <Button onClick={() => handleSubmit("team")}>Adicionar Equipe</Button>
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
          <Button onClick={() => handleSubmit("responsible")}>Adicionar Responsável</Button>
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
          <Button onClick={() => handleSubmit("executor")}>Adicionar Executante</Button>
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
          <Button onClick={() => handleSubmit("cable")}>Adicionar Cabo</Button>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default RegistryForm;
