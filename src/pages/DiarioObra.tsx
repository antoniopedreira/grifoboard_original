import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function DiarioObra() {
  const { userSession } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [descricao, setDescricao] = useState("");
  const [clima, setClima] = useState("");
  const [equipamentos, setEquipamentos] = useState("");
  const [maoDeObra, setMaoDeObra] = useState("");
  const [atividades, setAtividades] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Implement saving to database
    toast.success("Registro do diário salvo com sucesso!");
    
    // Clear form
    setDescricao("");
    setClima("");
    setEquipamentos("");
    setMaoDeObra("");
    setAtividades("");
    setObservacoes("");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Diário de Obra</h1>
        <p className="text-gray-600">Registre todos os eventos e atividades do dia</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Novo Registro
              </CardTitle>
              <CardDescription>
                Preencha as informações do dia na obra
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Data */}
                <div className="space-y-2">
                  <Label htmlFor="data">Data</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: ptBR }) : "Selecione uma data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(date) => date && setDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Clima */}
                <div className="space-y-2">
                  <Label htmlFor="clima">Condições Climáticas</Label>
                  <Input
                    id="clima"
                    placeholder="Ex: Ensolarado, Nublado, Chuvoso..."
                    value={clima}
                    onChange={(e) => setClima(e.target.value)}
                  />
                </div>

                {/* Mão de Obra */}
                <div className="space-y-2">
                  <Label htmlFor="maoDeObra">Mão de Obra</Label>
                  <Textarea
                    id="maoDeObra"
                    placeholder="Descreva a quantidade e função dos trabalhadores presentes..."
                    value={maoDeObra}
                    onChange={(e) => setMaoDeObra(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Equipamentos */}
                <div className="space-y-2">
                  <Label htmlFor="equipamentos">Equipamentos Utilizados</Label>
                  <Textarea
                    id="equipamentos"
                    placeholder="Liste os equipamentos e máquinas utilizados..."
                    value={equipamentos}
                    onChange={(e) => setEquipamentos(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Atividades */}
                <div className="space-y-2">
                  <Label htmlFor="atividades">Atividades Realizadas</Label>
                  <Textarea
                    id="atividades"
                    placeholder="Descreva as principais atividades executadas..."
                    value={atividades}
                    onChange={(e) => setAtividades(e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                {/* Observações */}
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações e Ocorrências</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Registre qualquer observação importante, problemas, visitantes, entregas..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Salvar Registro
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setDescricao("");
                      setClima("");
                      setEquipamentos("");
                      setMaoDeObra("");
                      setAtividades("");
                      setObservacoes("");
                    }}
                  >
                    Limpar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Recent Entries Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Registros Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum registro encontrado
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Dicas</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Registre diariamente todas as atividades</li>
                <li>• Documente problemas e soluções</li>
                <li>• Anote visitantes e entregas</li>
                <li>• Registre condições climáticas</li>
                <li>• Mantenha histórico completo</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
