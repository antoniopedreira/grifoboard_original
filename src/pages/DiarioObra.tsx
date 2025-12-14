import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { diarioService } from "@/services/diarioService";
import { diarioFotosService, type DiarioFoto } from "@/services/diarioFotosService"; // Importando serviço de fotos
import MainHeader from "@/components/MainHeader";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Save,
  CloudSun,
  HardHat,
  ClipboardList,
  Camera,
  Loader2,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PhotoUploader } from "@/components/diario/PhotoUploader";
import { PhotoGallery } from "@/components/diario/PhotoGallery";

const DiarioObra = () => {
  const { userSession } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());

  // Estados de Carregamento
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);

  // Estados de Dados
  const [diarioId, setDiarioId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<DiarioFoto[]>([]);
  const [formData, setFormData] = useState({
    clima_manha: "",
    clima_tarde: "",
    clima_noite: "",
    mao_de_obra: "",
    equipamentos: "",
    atividades: "",
    ocorrencias: "",
    observacoes: "",
  });

  const obraId = userSession?.obraAtiva?.id;

  // Carregar dados ao mudar a data ou obra
  useEffect(() => {
    if (obraId) {
      loadDiario();
      loadPhotos();
    }
  }, [date, obraId]);

  // --- FUNÇÕES DE DADOS DO DIÁRIO ---

  const loadDiario = async () => {
    setIsLoading(true);
    try {
      // @ts-ignore - Método adicionado recentemente ao service
      const data = await diarioService.getDiarioByDate(obraId!, date);
      if (data) {
        setDiarioId(data.id);

        let climas = { manha: "", tarde: "", noite: "" };
        try {
          const parsed = JSON.parse(data.clima || "{}");
          if (typeof parsed === "object") {
            climas = {
              manha: parsed.manha || "",
              tarde: parsed.tarde || "",
              noite: parsed.noite || "",
            };
          }
        } catch (e) {
          climas.manha = data.clima || "";
        }

        setFormData({
          clima_manha: climas.manha,
          clima_tarde: climas.tarde,
          clima_noite: climas.noite,
          mao_de_obra: data.mao_de_obra || "",
          equipamentos: data.equipamentos || "",
          atividades: data.atividades || "",
          ocorrencias: data.ocorrencias || "",
          observacoes: data.observacoes || "",
        });
      } else {
        setDiarioId(null);
        setFormData({
          clima_manha: "",
          clima_tarde: "",
          clima_noite: "",
          mao_de_obra: "",
          equipamentos: "",
          atividades: "",
          ocorrencias: "",
          observacoes: "",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar diário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do diário.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!obraId) return;

    setIsSaving(true);
    try {
      const climaJson = JSON.stringify({
        manha: formData.clima_manha,
        tarde: formData.clima_tarde,
        noite: formData.clima_noite,
      });

      // @ts-ignore - Método adicionado recentemente ao service
      const savedDiario = await diarioService.upsertDiario({
        id: diarioId,
        obra_id: obraId,
        data_diario: format(date, "yyyy-MM-dd"),
        clima: climaJson,
        mao_de_obra: formData.mao_de_obra,
        equipamentos: formData.equipamentos,
        atividades: formData.atividades,
        ocorrencias: formData.ocorrencias,
        observacoes: formData.observacoes,
      });

      setDiarioId(savedDiario.id);
      toast({
        title: "Diário Salvo",
        description: "As informações foram atualizadas com sucesso.",
        className: "bg-green-50 border-green-200",
      });
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro ao salvar",
        description: "Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // --- FUNÇÕES DE FOTOS ---

  const loadPhotos = async () => {
    if (!obraId) return;
    setIsLoadingPhotos(true);
    try {
      const isoDate = format(date, "yyyy-MM-dd");
      const data = await diarioFotosService.loadPhotos(obraId, isoDate, "todos");
      setPhotos(data);
    } catch (error) {
      console.error("Erro ao carregar fotos:", error);
    } finally {
      setIsLoadingPhotos(false);
    }
  };

  const handlePhotoUpload = async (files: File[], legenda?: string) => {
    if (!obraId) return;
    try {
      const isoDate = format(date, "yyyy-MM-dd");
      await diarioFotosService.uploadDailyPhotos(obraId, isoDate, files, legenda || "");
      toast({ title: "Sucesso", description: "Fotos enviadas com sucesso." });
      loadPhotos(); // Recarrega a galeria
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Falha ao enviar fotos.", variant: "destructive" });
    }
  };

  const handlePhotoDelete = async (id: string, path: string) => {
    try {
      await diarioFotosService.deletePhoto(id, path);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Foto excluída", description: "A imagem foi removida do diário." });
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Não foi possível excluir a foto.", variant: "destructive" });
    }
  };

  // --- HELPERS ---

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const navigateDay = (direction: "prev" | "next") => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + (direction === "next" ? 1 : -1));
    setDate(newDate);
  };

  const climaOptions = ["Ensolarado", "Nublado", "Chuvoso", "Variável", "Impraticável"];

  return (
    <div className="container mx-auto max-w-[1600px] px-4 sm:px-6 py-6 min-h-screen pb-24 space-y-6">
      <MainHeader onNewTaskClick={() => {}} onRegistryClick={() => {}} onChecklistClick={() => {}} />

      <div className="flex flex-col gap-6">
        {/* Barra de Navegação e Ações */}
        <div className="sticky top-0 z-30 bg-slate-50/90 backdrop-blur-md border-b border-slate-200 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateDay("prev")}
              className="h-9 w-9 hover:bg-slate-100"
            >
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "justify-start text-left font-semibold w-[240px] h-9 hover:bg-slate-50",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateDay("next")}
              className="h-9 w-9 hover:bg-slate-100"
            >
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-md transition-all gap-2"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar Diário
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Carregando registros do dia...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Coluna Esquerda */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="border-border/60 shadow-sm hover:shadow-md transition-all">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
                  <CardTitle className="text-base font-heading text-primary flex items-center gap-2">
                    <CloudSun className="h-4 w-4 text-secondary" />
                    Condições Climáticas
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {["manha", "tarde", "noite"].map((periodo) => (
                      <div key={periodo} className="flex items-center justify-between gap-4">
                        <Label className="capitalize w-16 text-slate-600">
                          {periodo === "manha" ? "Manhã" : periodo}
                        </Label>
                        <Select
                          value={formData[`clima_${periodo}` as keyof typeof formData]}
                          onValueChange={(val) => handleInputChange(`clima_${periodo}`, val)}
                        >
                          <SelectTrigger className="flex-1 h-9 border-slate-200">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {climaOptions.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-sm hover:shadow-md transition-all">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
                  <CardTitle className="text-base font-heading text-primary flex items-center gap-2">
                    <HardHat className="h-4 w-4 text-secondary" />
                    Recursos
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase">Mão de Obra (Qtd e Tipo)</Label>
                    <Textarea
                      placeholder="Ex: 5 Pedreiros, 4 Serventes..."
                      value={formData.mao_de_obra}
                      onChange={(e) => handleInputChange("mao_de_obra", e.target.value)}
                      className="min-h-[80px] border-slate-200 resize-none focus:border-secondary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase">Equipamentos Utilizados</Label>
                    <Textarea
                      placeholder="Ex: 1 Betoneira, 1 Serra Circular..."
                      value={formData.equipamentos}
                      onChange={(e) => handleInputChange("equipamentos", e.target.value)}
                      className="min-h-[80px] border-slate-200 resize-none focus:border-secondary"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Coluna Direita */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="border-border/60 shadow-sm hover:shadow-md transition-all">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
                  <CardTitle className="text-base font-heading text-primary flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-secondary" />
                    Registro de Atividades
                  </CardTitle>
                  <CardDescription>Descrição detalhada dos serviços executados no dia.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase">Atividades Executadas</Label>
                    <Textarea
                      placeholder="Descreva o que foi feito hoje..."
                      value={formData.atividades}
                      onChange={(e) => handleInputChange("atividades", e.target.value)}
                      className="min-h-[150px] border-slate-200 focus:border-secondary text-base leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase">Ocorrências / Impeditivos</Label>
                      <Textarea
                        placeholder="Houve algum problema?"
                        value={formData.ocorrencias}
                        onChange={(e) => handleInputChange("ocorrencias", e.target.value)}
                        className="min-h-[100px] border-red-100 focus:border-red-300 bg-red-50/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase">Observações Gerais</Label>
                      <Textarea
                        placeholder="Outras anotações..."
                        value={formData.observacoes}
                        onChange={(e) => handleInputChange("observacoes", e.target.value)}
                        className="min-h-[100px] border-slate-200"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Galeria de Fotos Integrada */}
              <Card className="border-border/60 shadow-sm hover:shadow-md transition-all overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base font-heading text-primary flex items-center gap-2">
                      <Camera className="h-4 w-4 text-secondary" />
                      Galeria de Fotos
                    </CardTitle>
                    {diarioId && <PhotoUploader onUpload={handlePhotoUpload} />}
                  </div>
                  <CardDescription>
                    {!diarioId ? "Salve o diário primeiro para adicionar fotos." : "Documentação visual do dia."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 bg-slate-50/30 min-h-[200px]">
                  {diarioId ? (
                    <PhotoGallery
                      photos={photos}
                      loading={isLoadingPhotos}
                      onDelete={handlePhotoDelete}
                      currentUserId={userSession?.user?.id}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground border-2 border-dashed border-slate-200 rounded-xl">
                      <FileText className="h-8 w-8 mb-2 opacity-20" />
                      <p>Preencha e salve o diário para habilitar o envio de fotos.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiarioObra;
