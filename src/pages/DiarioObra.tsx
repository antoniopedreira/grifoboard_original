import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarIcon, Plus, FileText, Trash2, Filter, Eye } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { diarioService, type DiarioObra } from "@/services/diarioService";
import { Separator } from "@/components/ui/separator";

export default function DiarioObra() {
  const { userSession } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [clima, setClima] = useState("");
  const [equipamentos, setEquipamentos] = useState("");
  const [maoDeObra, setMaoDeObra] = useState("");
  const [atividades, setAtividades] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [diarios, setDiarios] = useState<DiarioObra[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState<Date | undefined>();
  const [filterEndDate, setFilterEndDate] = useState<Date | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDiario, setSelectedDiario] = useState<DiarioObra | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    loadDiarios();
  }, [userSession?.obraAtiva?.id, filterStartDate, filterEndDate]);

  const loadDiarios = async () => {
    if (!userSession?.obraAtiva?.id) return;

    try {
      setLoading(true);
      const data = await diarioService.getByObra(
        userSession.obraAtiva.id,
        filterStartDate ? format(filterStartDate, "yyyy-MM-dd") : undefined,
        filterEndDate ? format(filterEndDate, "yyyy-MM-dd") : undefined
      );
      setDiarios(data);
    } catch (error) {
      console.error("Error loading diarios:", error);
      toast.error("Erro ao carregar diários");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userSession?.obraAtiva?.id || !userSession?.user?.id) {
      toast.error("Selecione uma obra primeiro");
      return;
    }

    try {
      setLoading(true);
      await diarioService.create({
        obra_id: userSession.obraAtiva.id,
        data: format(date, "yyyy-MM-dd"),
        clima,
        mao_de_obra: maoDeObra,
        equipamentos,
        atividades,
        observacoes,
        created_by: userSession.user.id,
      });

      toast.success("Registro do diário salvo com sucesso!");
      
      // Clear form
      setClima("");
      setEquipamentos("");
      setMaoDeObra("");
      setAtividades("");
      setObservacoes("");
      setDate(new Date());

      // Reload diarios
      loadDiarios();
    } catch (error) {
      console.error("Error saving diario:", error);
      toast.error("Erro ao salvar diário");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este registro?")) return;

    try {
      await diarioService.delete(id);
      toast.success("Registro excluído com sucesso");
      loadDiarios();
    } catch (error) {
      console.error("Error deleting diario:", error);
      toast.error("Erro ao excluir registro");
    }
  };

  const clearFilters = () => {
    setFilterStartDate(undefined);
    setFilterEndDate(undefined);
  };

  const handleViewDetails = (diario: DiarioObra) => {
    setSelectedDiario(diario);
    setDetailsOpen(true);
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
                  <Button type="submit" className="flex-1" disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    {loading ? "Salvando..." : "Salvar Registro"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setClima("");
                      setEquipamentos("");
                      setMaoDeObra("");
                      setAtividades("");
                      setObservacoes("");
                      setDate(new Date());
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
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Registros
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showFilters && (
                <div className="space-y-3 mb-4 p-3 bg-muted rounded-lg">
                  <div className="space-y-2">
                    <Label className="text-xs">Data Inicial</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !filterStartDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filterStartDate ? format(filterStartDate, "dd/MM/yyyy") : "Selecionar"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filterStartDate}
                          onSelect={setFilterStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Data Final</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !filterEndDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filterEndDate ? format(filterEndDate, "dd/MM/yyyy") : "Selecionar"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filterEndDate}
                          onSelect={setFilterEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {(filterStartDate || filterEndDate) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={clearFilters}
                    >
                      Limpar Filtros
                    </Button>
                  )}
                </div>
              )}

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {loading ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Carregando...
                  </p>
                ) : diarios.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum registro encontrado
                  </p>
                ) : (
                  diarios.map((diario) => (
                    <div
                      key={diario.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleViewDetails(diario)}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Registro {format(new Date(diario.data), "dd/MM/yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(diario.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
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

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Registro - {selectedDiario && format(new Date(selectedDiario.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </DialogTitle>
          </DialogHeader>

          {selectedDiario && (
            <div className="space-y-4">
              {selectedDiario.clima && (
                <div>
                  <Label className="text-sm font-semibold">Condições Climáticas</Label>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedDiario.clima}</p>
                </div>
              )}

              {selectedDiario.mao_de_obra && (
                <div>
                  <Label className="text-sm font-semibold">Mão de Obra</Label>
                  <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedDiario.mao_de_obra}
                  </p>
                </div>
              )}

              {selectedDiario.equipamentos && (
                <div>
                  <Label className="text-sm font-semibold">Equipamentos Utilizados</Label>
                  <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedDiario.equipamentos}
                  </p>
                </div>
              )}

              <div>
                <Label className="text-sm font-semibold">Atividades Realizadas</Label>
                <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedDiario.atividades}
                </p>
              </div>

              {selectedDiario.observacoes && (
                <div>
                  <Label className="text-sm font-semibold">Observações e Ocorrências</Label>
                  <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedDiario.observacoes}
                  </p>
                </div>
              )}

              <Separator />

              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>
                  Criado em: {format(new Date(selectedDiario.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    handleDelete(selectedDiario.id);
                    setDetailsOpen(false);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Registro
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
