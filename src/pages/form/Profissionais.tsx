import { useState, useRef } from "react";
import { PublicFormLayout } from "@/components/PublicFormLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Users,
  Loader2,
  CheckCircle2,
  UploadCloud,
  Image as ImageIcon,
  FileText,
  X,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cadastrosService } from "@/services/cadastrosService";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

// --- Componente Reutilizável de Upload ---
const UploadField = ({
  label,
  sublabel,
  accept,
  icon: Icon,
  files,
  onFilesChange,
  multiple = false,
}: {
  label: string;
  sublabel: string;
  accept: string;
  icon: any;
  files: File[];
  onFilesChange: (files: File[]) => void;
  multiple?: boolean;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      if (multiple) {
        onFilesChange([...files, ...newFiles]);
      } else {
        onFilesChange(newFiles); // Substitui se for single
      }
    }
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" /> {label}
      </Label>

      {/* Área de Clique */}
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:border-primary/50 transition-all group bg-white min-h-[100px]"
      >
        <div className="text-slate-400 group-hover:text-primary transition-colors mb-1">
          <UploadCloud className="h-6 w-6 mx-auto" />
        </div>
        <p className="text-sm font-medium text-slate-600">Clique para adicionar</p>
        <p className="text-[10px] text-slate-400">{sublabel}</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 gap-2 mt-2">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="relative flex items-center gap-3 p-2 bg-white border border-slate-200 rounded-md shadow-sm"
            >
              {file.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="h-8 w-8 object-cover rounded bg-slate-100"
                />
              ) : (
                <div className="h-8 w-8 flex items-center justify-center bg-slate-100 rounded">
                  <FileText className="h-4 w-4 text-slate-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 truncate">{file.name}</p>
                <p className="text-[10px] text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(idx);
                }}
                className="p-1 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Profissionais() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Estado dos Dados
  const [formData, setFormData] = useState({
    nome_completo: "",
    cpf: "",
    data_nascimento: "",
    telefone: "",
    email: "",
    cidade: "",
    estado: "",
    funcao_principal: "",
    tempo_experiencia: "",
    obras_relevantes: "",
    disponibilidade_atual: "",
    modalidade_trabalho: "",
    pretensao_valor: "",
    equipamentos_proprios: "Não",
  });

  // Estado dos Arquivos Separados
  const [filesLogo, setFilesLogo] = useState<File[]>([]);
  const [filesFotos, setFilesFotos] = useState<File[]>([]);
  const [filesCurriculo, setFilesCurriculo] = useState<File[]>([]);
  const [filesCertificados, setFilesCertificados] = useState<File[]>([]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Função para fazer Upload de um Array de arquivos
  const uploadFiles = async (files: File[], folder: string) => {
    const urls: string[] = [];
    for (const file of files) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("public-uploads") // Certifique-se que este bucket existe e é público
        .upload(fileName, file);

      if (error) {
        console.error("Erro upload:", error);
        continue;
      }

      if (data) {
        const { data: urlData } = supabase.storage.from("public-uploads").getPublicUrl(data.path);
        urls.push(urlData.publicUrl);
      }
    }
    return urls;
  };

  const handleSubmit = async () => {
    if (!formData.nome_completo || !formData.telefone || !formData.funcao_principal) {
      toast({ title: "Campos obrigatórios", description: "Verifique seus dados pessoais.", variant: "destructive" });
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      // 1. Uploads Paralelos
      const [logoUrls, fotosUrls, curriculoUrls, certificadosUrls] = await Promise.all([
        uploadFiles(filesLogo, "logos"),
        uploadFiles(filesFotos, "trabalhos"),
        uploadFiles(filesCurriculo, "curriculos"),
        uploadFiles(filesCertificados, "certificados"),
      ]);

      // 2. Prepara Payload
      const payload = {
        ...formData,
        // Arrays obrigatórios do banco
        regioes_atendidas: [formData.cidade],
        especialidades: [formData.funcao_principal],
        diferenciais: ["Cadastro Online"],

        // Mapeamento dos Arquivos para as Colunas do Banco
        logo_path: logoUrls[0] || null, // Apenas 1 logo
        fotos_trabalhos_path: JSON.stringify(fotosUrls),
        curriculo_path: JSON.stringify(curriculoUrls),
        certificacoes_path: JSON.stringify(certificadosUrls),

        // Fallback para data
        data_nascimento: formData.data_nascimento || "2000-01-01",
      };

      await cadastrosService.createProfissional(payload);
      setSuccess(true);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao enviar",
        description: "Houve um problema técnico. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <PublicFormLayout
        title="Cadastro Recebido!"
        description="Seu perfil profissional foi criado com sucesso."
        icon={<CheckCircle2 className="h-8 w-8 text-green-600" />}
      >
        <div className="text-center space-y-6 animate-in zoom-in-95 duration-500">
          <p className="text-slate-600">
            Nossa equipe de engenharia analisará seu portfólio. Mantenha seu WhatsApp atualizado.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
            Novo Cadastro
          </Button>
        </div>
      </PublicFormLayout>
    );
  }

  return (
    <PublicFormLayout
      title="Banco de Talentos"
      description="Junte-se à elite da construção civil."
      icon={<Users className="h-8 w-8" />}
    >
      {/* Steps Indicator */}
      <div className="flex items-center justify-center mb-8 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                step === i
                  ? "bg-primary text-white scale-110 shadow-md"
                  : step > i
                    ? "bg-green-500 text-white"
                    : "bg-slate-100 text-slate-400",
              )}
            >
              {step > i ? <CheckCircle2 className="h-5 w-5" /> : i}
            </div>
            {i < 3 && <div className={cn("w-8 h-1 mx-1 rounded-full", step > i ? "bg-green-500" : "bg-slate-100")} />}
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {/* ETAPA 1: DADOS PESSOAIS */}
        {step === 1 && (
          <div className="space-y-5 animate-in slide-in-from-right duration-500">
            <div className="space-y-2">
              <Label>Nome Completo *</Label>
              <Input
                value={formData.nome_completo}
                onChange={(e) => handleChange("nome_completo", e.target.value)}
                required
                placeholder="Como prefere ser chamado"
                className="bg-slate-50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CPF *</Label>
                <Input
                  value={formData.cpf}
                  onChange={(e) => handleChange("cpf", e.target.value)}
                  placeholder="000.000.000-00"
                  className="bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label>Nascimento</Label>
                <Input
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) => handleChange("data_nascimento", e.target.value)}
                  className="bg-slate-50"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>WhatsApp *</Label>
                <Input
                  value={formData.telefone}
                  onChange={(e) => handleChange("telefone", e.target.value)}
                  required
                  placeholder="(DDD) 99999-9999"
                  className="bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="bg-slate-50"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input
                  value={formData.cidade}
                  onChange={(e) => handleChange("cidade", e.target.value)}
                  className="bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Input
                  value={formData.estado}
                  onChange={(e) => handleChange("estado", e.target.value)}
                  placeholder="UF"
                  maxLength={2}
                  className="bg-slate-50"
                />
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 2: PERFIL */}
        {step === 2 && (
          <div className="space-y-5 animate-in slide-in-from-right duration-500">
            <div className="space-y-2">
              <Label>Função Principal *</Label>
              <Select onValueChange={(val) => handleChange("funcao_principal", val)} value={formData.funcao_principal}>
                <SelectTrigger className="bg-slate-50">
                  <SelectValue placeholder="Selecione sua especialidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engenheiro Civil">Engenheiro Civil</SelectItem>
                  <SelectItem value="Arquiteto">Arquiteto</SelectItem>
                  <SelectItem value="Mestre de Obras">Mestre de Obras</SelectItem>
                  <SelectItem value="Eletricista">Eletricista</SelectItem>
                  <SelectItem value="Encanador">Encanador</SelectItem>
                  <SelectItem value="Pedreiro">Pedreiro</SelectItem>
                  <SelectItem value="Pintor">Pintor</SelectItem>
                  <SelectItem value="Gesseiro">Gesseiro</SelectItem>
                  <SelectItem value="Serralheiro">Serralheiro</SelectItem>
                  <SelectItem value="Ajudante">Ajudante</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tempo de Experiência</Label>
                <Select
                  onValueChange={(val) => handleChange("tempo_experiencia", val)}
                  value={formData.tempo_experiencia}
                >
                  <SelectTrigger className="bg-slate-50">
                    <SelectValue placeholder="Anos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Iniciante">Iniciante</SelectItem>
                    <SelectItem value="1-3 anos">1-3 anos</SelectItem>
                    <SelectItem value="3-5 anos">3-5 anos</SelectItem>
                    <SelectItem value="Mais de 5 anos">Mais de 5 anos</SelectItem>
                    <SelectItem value="Mais de 10 anos">Mais de 10 anos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Modalidade</Label>
                <Select
                  onValueChange={(val) => handleChange("modalidade_trabalho", val)}
                  value={formData.modalidade_trabalho}
                >
                  <SelectTrigger className="bg-slate-50">
                    <SelectValue placeholder="Prefere..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLT">CLT (Fixo)</SelectItem>
                    <SelectItem value="PJ">PJ (Nota Fiscal)</SelectItem>
                    <SelectItem value="Diaria">Diária / Empreita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Possui Equipamentos Próprios?</Label>
              <RadioGroup
                value={formData.equipamentos_proprios}
                onValueChange={(val) => handleChange("equipamentos_proprios", val)}
                className="flex gap-4 p-2 bg-slate-50 rounded-md border border-slate-100"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Sim" id="sim" />
                  <Label htmlFor="sim" className="cursor-pointer">
                    Sim, tenho ferramentas
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Não" id="nao" />
                  <Label htmlFor="nao" className="cursor-pointer">
                    Não
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Disponibilidade</Label>
                <Input
                  placeholder="Ex: Imediata"
                  value={formData.disponibilidade_atual}
                  onChange={(e) => handleChange("disponibilidade_atual", e.target.value)}
                  className="bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label>Pretensão (R$)</Label>
                <Input
                  placeholder="Valor dia/mês"
                  value={formData.pretensao_valor}
                  onChange={(e) => handleChange("pretensao_valor", e.target.value)}
                  className="bg-slate-50"
                />
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 3: ARQUIVOS (Separados e Organizados) */}
        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-800 mb-2">
              <strong>Dica:</strong> Perfis completos aparecem primeiro nas buscas dos engenheiros.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. LOGO / FOTO */}
              <UploadField
                label="Foto de Perfil ou Logo"
                sublabel="JPG/PNG. Use uma foto clara do rosto."
                accept="image/*"
                icon={Users}
                files={filesLogo}
                onFilesChange={setFilesLogo}
                multiple={false}
              />

              {/* 2. CURRÍCULO */}
              <UploadField
                label="Currículo / Apresentação"
                sublabel="PDF ou Imagem do seu CV."
                accept=".pdf,image/*"
                icon={Briefcase}
                files={filesCurriculo}
                onFilesChange={setFilesCurriculo}
                multiple={true}
              />
            </div>

            {/* 3. FOTOS TRABALHO */}
            <UploadField
              label="Fotos dos Trabalhos Realizados"
              sublabel="Obras que você já fez. Antes e Depois valorizam muito!"
              accept="image/*"
              icon={ImageIcon}
              files={filesFotos}
              onFilesChange={setFilesFotos}
              multiple={true}
            />

            {/* 4. CERTIFICAÇÕES */}
            <UploadField
              label="Certificações e NRs"
              sublabel="Diploma, NR10, NR35, Certificados Técnicos..."
              accept=".pdf,image/*"
              icon={GraduationCap}
              files={filesCertificados}
              onFilesChange={setFilesCertificados}
              multiple={true}
            />

            <div className="space-y-2 mt-4">
              <Label>Resumo Profissional / Obras Relevantes</Label>
              <Textarea
                placeholder="Conte sobre as principais obras que participou ou detalhes que não estão nos documentos..."
                value={formData.obras_relevantes}
                onChange={(e) => handleChange("obras_relevantes", e.target.value)}
                className="bg-slate-50 min-h-[100px]"
              />
            </div>
          </div>
        )}

        {/* CONTROLES DE NAVEGAÇÃO */}
        <div className="flex justify-between gap-4 pt-4 border-t border-slate-100 mt-8">
          {step > 1 ? (
            <Button type="button" variant="ghost" onClick={() => setStep((prev) => prev - 1)} disabled={loading}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
          ) : (
            <div /> // Espaçador
          )}

          {step < 3 ? (
            <Button
              type="button"
              onClick={() => setStep((prev) => prev + 1)}
              className="bg-slate-800 hover:bg-slate-900"
            >
              Próximo <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700 min-w-[140px] h-11 text-base shadow-lg"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Finalizar Cadastro"}
            </Button>
          )}
        </div>
      </div>
    </PublicFormLayout>
  );
}
