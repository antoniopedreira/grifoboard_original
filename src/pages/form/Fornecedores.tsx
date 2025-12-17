import { useState, useRef } from "react";
import { PublicFormLayout } from "@/components/PublicFormLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Truck,
  Loader2,
  CheckCircle2,
  UploadCloud,
  FileText,
  X,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  Award,
  Image as ImageIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cadastrosService } from "@/services/cadastrosService";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

// --- Constantes ---
const OPCOES_TIPOS = [
  "Loja de materiais de construção",
  "Distribuidor / Atacadista",
  "Fabricante",
  "Fornecedor de serviços especializados",
  "Locação de Equipamentos",
  "Transportadora / Logística",
  "Outro",
];

const OPCOES_CATEGORIAS = [
  "Material Básico (Cimento, Areia, Brita)",
  "Aço e Estrutura Metálica",
  "Elétrica e Iluminação",
  "Hidráulica e Esgoto",
  "Pisos e Revestimentos",
  "Tintas e Impermeabilizantes",
  "Portas, Janelas e Vidros",
  "Madeiras e Telhados",
  "Ferramentas e EPIs",
  "Outro",
];

const OPCOES_DIFERENCIAIS = [
  "Entrega Imediata (Pronta Entrega)",
  "Faturamento (Boleto a Prazo)",
  "Frete Grátis (Sob consulta)",
  "Atendimento via WhatsApp",
  "Garantia estendida",
  "Showroom físico",
  "Venda Online / E-commerce",
  "Outro",
];

const ESTADOS_BR = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

// --- Componente de Upload ---
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
        onFilesChange(newFiles);
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

export default function Fornecedores() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // Dados da Empresa
    nome_empresa: "",
    cnpj_cpf: "",
    site: "",
    cidade: "",
    estado: "",
    tempo_atuacao: "",

    // Contato
    nome_responsavel: "",
    telefone: "",
    email: "",

    // Perfil Comercial
    tipos_atuacao: [] as string[],
    tipo_atuacao_outro: "",
    categorias_atendidas: [] as string[],
    categorias_outro: "",
    ticket_medio: "",
    capacidade_atendimento: "",
    regioes_atendidas: [] as string[],
    cidades_frequentes: "",
    diferenciais: [] as string[],
    diferenciais_outro: "",
  });

  // Arquivos
  const [filesLogo, setFilesLogo] = useState<File[]>([]);
  const [filesPortfolio, setFilesPortfolio] = useState<File[]>([]);
  const [filesFotosTrabalhos, setFilesFotosTrabalhos] = useState<File[]>([]); // NOVA
  const [filesCertificacoes, setFilesCertificacoes] = useState<File[]>([]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (
    field: "tipos_atuacao" | "categorias_atendidas" | "diferenciais",
    item: string,
    checked: boolean,
  ) => {
    setFormData((prev) => {
      const list = prev[field];
      if (checked) {
        return { ...prev, [field]: [...list, item] };
      } else {
        return { ...prev, [field]: list.filter((i) => i !== item) };
      }
    });
  };

  const uploadFiles = async (files: File[], folder: string) => {
    const urls: string[] = [];
    for (const file of files) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("formularios-fornecedores") // Usa bucket específico
        .upload(fileName, file);

      if (!error && data) {
        const { data: urlData } = supabase.storage.from("formularios-fornecedores").getPublicUrl(data.path);
        urls.push(urlData.publicUrl);
      }
    }
    return urls;
  };

  const handleSubmit = async () => {
    if (!formData.nome_empresa || !formData.cnpj_cpf || !formData.telefone) {
      toast({
        title: "Dados incompletos",
        description: "Verifique os dados da empresa e contato.",
        variant: "destructive",
      });
      setStep(1);
      return;
    }

    if (formData.categorias_atendidas.length === 0) {
      toast({ title: "Atenção", description: "Selecione o que você fornece.", variant: "destructive" });
      setStep(2);
      return;
    }

    setLoading(true);
    try {
      // Upload paralelo
      const [logoUrls, portfolioUrls, fotosUrls, certUrls] = await Promise.all([
        uploadFiles(filesLogo, "logos"),
        uploadFiles(filesPortfolio, "portfolios"),
        uploadFiles(filesFotosTrabalhos, "fotos_trabalhos"),
        uploadFiles(filesCertificacoes, "certificados"),
      ]);

      const payload = {
        ...formData,
        regioes_atendidas: [formData.estado],

        logo_path: logoUrls[0] || null,
        portfolio_path: JSON.stringify(portfolioUrls),
        fotos_trabalhos_path: JSON.stringify(fotosUrls), // NOVA COLUNA
        certificacoes_path: JSON.stringify(certUrls),
      };

      await cadastrosService.createFornecedor(payload);
      setSuccess(true);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Falha ao enviar cadastro.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <PublicFormLayout
        title="Cadastro Recebido!"
        description="Sua loja agora está visível no Marketplace da Grifo."
        icon={<CheckCircle2 className="h-8 w-8 text-green-600" />}
      >
        <div className="text-center space-y-6 animate-in zoom-in-95 duration-500">
          <p className="text-slate-600">
            Obrigado pelo cadastro. Nossos compradores entrarão em contato para cotações.
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
      title="Cadastro de Fornecedores"
      description="Torne-se um parceiro de suprimentos da Grifo Engenharia."
      icon={<Truck className="h-8 w-8" />}
    >
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
        {/* ETAPA 1: DADOS DA EMPRESA */}
        {step === 1 && (
          <div className="space-y-5 animate-in slide-in-from-right duration-500">
            <div className="space-y-2">
              <Label>Nome Fantasia / Razão Social *</Label>
              <Input
                value={formData.nome_empresa}
                onChange={(e) => handleChange("nome_empresa", e.target.value)}
                required
                placeholder="Nome da loja ou empresa"
                className="bg-slate-50 h-12"
              />
            </div>

            <div className="space-y-2">
              <Label>CNPJ *</Label>
              <Input
                value={formData.cnpj_cpf}
                onChange={(e) => handleChange("cnpj_cpf", e.target.value)}
                required
                placeholder="00.000.000/0000-00"
                className="bg-slate-50 h-12"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cidade Base</Label>
                <Input
                  value={formData.cidade}
                  onChange={(e) => handleChange("cidade", e.target.value)}
                  className="bg-slate-50 h-12"
                />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select onValueChange={(val) => handleChange("estado", val)} value={formData.estado}>
                  <SelectTrigger className="bg-slate-50 h-12">
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS_BR.map((uf) => (
                      <SelectItem key={uf} value={uf}>
                        {uf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefone / WhatsApp *</Label>
                <Input
                  value={formData.telefone}
                  onChange={(e) => handleChange("telefone", e.target.value)}
                  required
                  placeholder="(00) 99999-9999"
                  className="bg-slate-50 h-12"
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                  className="bg-slate-50 h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Site ou Instagram</Label>
              <Input
                value={formData.site}
                onChange={(e) => handleChange("site", e.target.value)}
                placeholder="https://..."
                className="bg-slate-50 h-12"
              />
            </div>

            <div className="pt-2">
              <UploadField
                label="Logo da Empresa"
                sublabel="JPG ou PNG (opcional)"
                accept="image/*"
                icon={ImageIcon}
                files={filesLogo}
                onFilesChange={setFilesLogo}
                multiple={false}
              />
            </div>
          </div>
        )}

        {/* ETAPA 2: O QUE FORNECE */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="space-y-3">
              <Label>Tipo de Negócio *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-md border border-slate-100">
                {OPCOES_TIPOS.map((tipo) => (
                  <div key={tipo} className="flex items-center space-x-3 p-1">
                    <Checkbox
                      id={`tipo-${tipo}`}
                      checked={formData.tipos_atuacao.includes(tipo)}
                      onCheckedChange={(checked) => handleCheckboxChange("tipos_atuacao", tipo, checked as boolean)}
                      className="h-5 w-5"
                    />
                    <Label htmlFor={`tipo-${tipo}`} className="text-sm font-normal cursor-pointer leading-none py-1">
                      {tipo}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <Label>Categorias de Produtos/Serviços *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-md border border-slate-100">
                {OPCOES_CATEGORIAS.map((cat) => (
                  <div key={cat} className="flex items-center space-x-3 p-1">
                    <Checkbox
                      id={`cat-${cat}`}
                      checked={formData.categorias_atendidas.includes(cat)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("categorias_atendidas", cat, checked as boolean)
                      }
                      className="h-5 w-5"
                    />
                    <Label htmlFor={`cat-${cat}`} className="text-sm font-normal cursor-pointer leading-none py-1">
                      {cat}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label>Tempo de Mercado</Label>
                <Select onValueChange={(val) => handleChange("tempo_atuacao", val)} value={formData.tempo_atuacao}>
                  <SelectTrigger className="bg-slate-50 h-12">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="< 1 ano">Menos de 1 ano</SelectItem>
                    <SelectItem value="1-3 anos">1 a 3 anos</SelectItem>
                    <SelectItem value="3-5 anos">3 a 5 anos</SelectItem>
                    <SelectItem value="5+ anos">Mais de 5 anos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Capacidade (Obras Simultâneas)</Label>
                <Select
                  onValueChange={(val) => handleChange("capacidade_atendimento", val)}
                  value={formData.capacidade_atendimento}
                >
                  <SelectTrigger className="bg-slate-50 h-12">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 obra">1 Obra</SelectItem>
                    <SelectItem value="2-3 obras">2 a 3 Obras</SelectItem>
                    <SelectItem value="Grande Escala">Grande Escala (Varejo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 3: DIFERENCIAIS E ARQUIVOS */}
        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="space-y-3">
              <Label>Diferenciais (Até 3)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-md border border-slate-100">
                {OPCOES_DIFERENCIAIS.map((dif) => (
                  <div key={dif} className="flex items-center space-x-3 p-1">
                    <Checkbox
                      id={`dif-${dif}`}
                      checked={formData.diferenciais.includes(dif)}
                      onCheckedChange={(checked) => handleCheckboxChange("diferenciais", dif, checked as boolean)}
                      className="h-5 w-5"
                    />
                    <Label htmlFor={`dif-${dif}`} className="text-sm font-normal cursor-pointer leading-none py-1">
                      {dif}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* SEÇÃO DE ARQUIVOS DIVIDIDA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
              {/* 1. Catálogo PDF */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-slate-100 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-slate-600" />
                  </div>
                  <h3 className="font-bold text-slate-800">Catálogo / Tabela (PDF)</h3>
                </div>
                <UploadField
                  label="Arquivo PDF"
                  sublabel="Tabela de preços ou catálogo técnico."
                  accept=".pdf"
                  icon={FileText}
                  files={filesPortfolio}
                  onFilesChange={setFilesPortfolio}
                  multiple={true}
                />
              </div>

              {/* 2. Fotos de Produtos */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-slate-100 p-2 rounded-lg">
                    <ImageIcon className="h-5 w-5 text-slate-600" />
                  </div>
                  <h3 className="font-bold text-slate-800">Fotos de Produtos / Obras</h3>
                </div>
                <UploadField
                  label="Imagens Reais"
                  sublabel="Fotos dos seus produtos ou entregas."
                  accept="image/*"
                  icon={ImageIcon}
                  files={filesFotosTrabalhos}
                  onFilesChange={setFilesFotosTrabalhos}
                  multiple={true}
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-slate-100 p-2 rounded-lg">
                  <Award className="h-5 w-5 text-slate-600" />
                </div>
                <h3 className="font-bold text-slate-800">Certificações e Documentos</h3>
              </div>
              <UploadField
                label="Certificações Técnicas / ISO"
                sublabel="Documentos que comprovem qualidade."
                accept=".pdf,.jpg,.png"
                icon={Award}
                files={filesCertificacoes}
                onFilesChange={setFilesCertificacoes}
                multiple={true}
              />
            </div>

            <div className="space-y-2 pt-4">
              <Label>Responsável pelo Contato</Label>
              <Input
                value={formData.nome_responsavel}
                onChange={(e) => handleChange("nome_responsavel", e.target.value)}
                required
                placeholder="Nome do vendedor/gerente"
                className="h-12"
              />
            </div>
          </div>
        )}

        <div className="flex justify-between gap-4 pt-4 border-t border-slate-100 mt-8">
          {step > 1 ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep((prev) => prev - 1)}
              disabled={loading}
              className="h-12"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button
              type="button"
              onClick={() => setStep((prev) => prev + 1)}
              className="bg-slate-800 hover:bg-slate-900 h-12 px-6"
            >
              Próximo <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700 min-w-[140px] h-12 text-base shadow-lg font-bold"
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
