import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, User, Loader2, Image as ImageIcon, LayoutTemplate, UploadCloud, FileText, Trash2, Plus, Camera, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Helper component for displaying info fields
const InfoField = ({ label, value }: { label: string; value: string | null | undefined }) => {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-slate-700 font-medium">{value}</p>
    </div>
  );
};

// File upload section component
interface FileUploadSectionProps {
  title: string;
  description: string;
  fieldName: string;
  currentPath: string | null;
  bucket: string;
  onUpload: (fieldName: string, file: File) => Promise<void>;
  onDelete: (fieldName: string) => Promise<void>;
  isImage?: boolean;
  isMultiple?: boolean;
  uploading: boolean;
}

const FileUploadSection = ({
  title,
  description,
  fieldName,
  currentPath,
  bucket,
  onUpload,
  onDelete,
  isImage = true,
  isMultiple = false,
  uploading,
}: FileUploadSectionProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileUrls, setFileUrls] = useState<string[]>([]);

  useEffect(() => {
    if (currentPath) {
      const paths = currentPath.split(",").filter(Boolean);
      const urls = paths.map((p) => {
        if (p.startsWith("http")) return p;
        const { data } = supabase.storage.from(bucket).getPublicUrl(p.trim());
        return data.publicUrl;
      });
      setFileUrls(urls);
    } else {
      setFileUrls([]);
    }
  }, [currentPath, bucket]);

  const handleClick = () => inputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    for (let i = 0; i < files.length; i++) {
      await onUpload(fieldName, files[i]);
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-700">{title}</h4>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClick}
          disabled={uploading}
          className="text-xs"
        >
          {uploading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
          Adicionar
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={isImage ? "image/*" : ".pdf,.doc,.docx,image/*"}
        multiple={isMultiple}
        onChange={handleFileChange}
      />
      {fileUrls.length > 0 ? (
        <div className={`grid ${isImage ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : "grid-cols-1"} gap-3`}>
          {fileUrls.map((url, idx) => (
            <div key={idx} className="relative group">
              {isImage ? (
                <div className="aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                  <img src={url} alt={`${title} ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ) : (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <FileText className="h-5 w-5 text-slate-400" />
                  <span className="text-sm text-slate-600 truncate">Documento {idx + 1}</span>
                </a>
              )}
              <button
                onClick={() => onDelete(fieldName)}
                className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div
          onClick={handleClick}
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors"
        >
          {isImage ? (
            <Camera className="h-6 w-6 text-slate-300 mb-2" />
          ) : (
            <FileText className="h-6 w-6 text-slate-300 mb-2" />
          )}
          <p className="text-xs text-slate-400 text-center">Clique para adicionar</p>
        </div>
      )}
    </div>
  );
};

export default function PortalParceiro() {
  const { userSession, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [partnerData, setPartnerData] = useState<any>(null);
  const [partnerType, setPartnerType] = useState<"profissional" | "empresa" | "fornecedor" | null>(null);

  useEffect(() => {
    if (!userSession?.user) {
      navigate("/auth");
      return;
    }
    fetchPartnerData();
  }, [userSession]);

  const fetchPartnerData = async () => {
    setLoading(true);
    const userId = userSession?.user.id;
    if (!userId) return;

    // Tenta encontrar em Profissionais
    let { data: prof } = await supabase.from("formulario_profissionais").select("*").eq("user_id", userId).single();
    if (prof) {
      setPartnerData(prof);
      setPartnerType("profissional");
      setLoading(false);
      return;
    }

    // Tenta encontrar em Empresas
    let { data: emp } = await supabase.from("formulario_empresas").select("*").eq("user_id", userId).single();
    if (emp) {
      setPartnerData(emp);
      setPartnerType("empresa");
      setLoading(false);
      return;
    }

    // Tenta encontrar em Fornecedores
    let { data: forn } = await supabase.from("formulario_fornecedores").select("*").eq("user_id", userId).single();
    if (forn) {
      setPartnerData(forn);
      setPartnerType("fornecedor");
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const getBucket = () => {
    if (partnerType === "empresa") return "formularios-empresas";
    if (partnerType === "fornecedor") return "formularios-fornecedores";
    return "formularios-profissionais";
  };

  const getTableName = () => {
    if (partnerType === "empresa") return "formulario_empresas";
    if (partnerType === "fornecedor") return "formulario_fornecedores";
    return "formulario_profissionais";
  };

  const handleFileUpload = async (fieldName: string, file: File) => {
    if (!partnerData?.id) return;
    setUploading(true);
    
    try {
      const bucket = getBucket();
      const fileExt = file.name.split(".").pop();
      const fileName = `${partnerData.id}/${fieldName}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file);
      if (uploadError) throw uploadError;

      // Get current value and append new file (for multiple files support)
      const currentValue = partnerData[fieldName];
      const newValue = currentValue ? `${currentValue},${fileName}` : fileName;

      const tableName = getTableName();
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ [fieldName]: newValue })
        .eq("id", partnerData.id);

      if (updateError) throw updateError;

      setPartnerData({ ...partnerData, [fieldName]: newValue });
      toast.success("Arquivo enviado com sucesso!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Erro ao enviar arquivo: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileDelete = async (fieldName: string) => {
    if (!partnerData?.id) return;
    setUploading(true);

    try {
      const tableName = getTableName();
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ [fieldName]: null })
        .eq("id", partnerData.id);

      if (updateError) throw updateError;

      setPartnerData({ ...partnerData, [fieldName]: null });
      toast.success("Arquivo removido com sucesso!");
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error("Erro ao remover arquivo: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Função auxiliar para obter URL da imagem
  const getLogoUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const bucket = getBucket();
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-slate-500 font-medium animate-pulse">Carregando seu perfil...</p>
      </div>
    );
  }

  if (!partnerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full shadow-lg border-0">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-red-100 p-3 rounded-full w-fit mb-4">
              <User className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">Perfil não encontrado</CardTitle>
            <CardDescription>Não localizamos um cadastro de parceiro vinculado ao seu usuário.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-4">
            <Button onClick={handleLogout} variant="destructive" className="w-full">
              Sair e tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const partnerName = partnerData.nome_completo || partnerData.nome_empresa;
  const logoUrl = getLogoUrl(partnerData.logo_path);

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans">
      {/* --- HEADER --- */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm backdrop-blur-sm bg-white/90">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center max-w-6xl">
          <div className="flex items-center gap-3">
            <img
              src="/lovable-uploads/grifo-logo-header.png"
              alt="Grifo"
              className="h-8 transition-transform hover:scale-105"
            />
            <div className="hidden md:flex h-6 w-[1px] bg-slate-200 mx-1"></div>
            <span className="text-sm font-semibold text-slate-600 tracking-tight hidden md:inline-block">
              Portal do Parceiro
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-100/50 py-1.5 px-3 rounded-full border border-slate-100">
              <Avatar className="h-8 w-8 border border-white shadow-sm">
                <AvatarImage src={logoUrl || ""} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {partnerName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-xs text-right mr-1">
                <p className="font-semibold text-slate-700 truncate max-w-[120px]">{partnerName}</p>
                <p className="text-slate-400 font-medium capitalize">{partnerType}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="container mx-auto p-4 md:p-8 max-w-6xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200/60 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="outline"
                className="bg-white text-primary border-primary/20 px-2 py-0.5 uppercase text-[10px] tracking-wider font-bold"
              >
                Painel de Controle
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Olá,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
                {partnerName?.split(" ")[0]}
              </span>
            </h1>
            <p className="text-slate-500 mt-2 max-w-xl text-lg">
              Gerencie suas informações e mantenha seu perfil atualizado para se destacar no marketplace.
            </p>
          </div>
          <div className="hidden md:block">
            {/* Espaço para métricas futuras ou status */}
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status do Perfil</span>
              <div className="flex items-center justify-end gap-2 mt-1">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-sm font-medium text-slate-700">Ativo no Marketplace</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="dados" className="space-y-6">
          <TabsList className="bg-white p-1 border border-slate-200 shadow-sm rounded-xl w-full md:w-auto h-auto flex-wrap justify-start gap-1">
            <TabsTrigger
              value="dados"
              className="px-6 py-2.5 rounded-lg data-[state=active]:bg-primary/5 data-[state=active]:text-primary font-medium transition-all"
            >
              <User className="h-4 w-4 mr-2" /> Dados Cadastrais
            </TabsTrigger>
            <TabsTrigger
              value="midia"
              className="px-6 py-2.5 rounded-lg data-[state=active]:bg-primary/5 data-[state=active]:text-primary font-medium transition-all"
            >
              <ImageIcon className="h-4 w-4 mr-2" /> Fotos e Documentos
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="px-6 py-2.5 rounded-lg data-[state=active]:bg-primary/5 data-[state=active]:text-primary font-medium transition-all"
            >
              <LayoutTemplate className="h-4 w-4 mr-2" /> Visualizar Cartão
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: DADOS */}
          <TabsContent value="dados" className="focus-visible:outline-none">
            <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-primary/80 to-primary/20" />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <User className="h-5 w-5 text-primary" /> Informações do Perfil
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Seus dados cadastrais no marketplace.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-8">
                {partnerType === "profissional" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField label="Nome Completo" value={partnerData.nome_completo} />
                    <InfoField label="CPF" value={partnerData.cpf} />
                    <InfoField label="Data de Nascimento" value={partnerData.data_nascimento} />
                    <InfoField label="Telefone" value={partnerData.telefone} />
                    <InfoField label="Email" value={partnerData.email} />
                    <InfoField label="Cidade/Estado" value={`${partnerData.cidade} - ${partnerData.estado}`} />
                    <InfoField label="Função Principal" value={partnerData.funcao_principal} />
                    <InfoField label="Tempo de Experiência" value={partnerData.tempo_experiencia} />
                    <InfoField label="Disponibilidade" value={partnerData.disponibilidade_atual} />
                    <InfoField label="Modalidade de Trabalho" value={partnerData.modalidade_trabalho} />
                    <InfoField label="Pretensão Salarial" value={partnerData.pretensao_valor} />
                    <InfoField label="Equipamentos Próprios" value={partnerData.equipamentos_proprios} />
                    <div className="md:col-span-2">
                      <InfoField label="Especialidades" value={partnerData.especialidades?.join(", ")} />
                    </div>
                    <div className="md:col-span-2">
                      <InfoField label="Regiões Atendidas" value={partnerData.regioes_atendidas?.join(", ")} />
                    </div>
                    <div className="md:col-span-2">
                      <InfoField label="Diferenciais" value={partnerData.diferenciais?.join(", ")} />
                    </div>
                    {partnerData.obras_relevantes && (
                      <div className="md:col-span-2">
                        <InfoField label="Obras Relevantes" value={partnerData.obras_relevantes} />
                      </div>
                    )}
                  </div>
                )}
                {partnerType === "empresa" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField label="Nome da Empresa" value={partnerData.nome_empresa} />
                    <InfoField label="CNPJ" value={partnerData.cnpj} />
                    <InfoField label="Cidade/Estado" value={`${partnerData.cidade} - ${partnerData.estado}`} />
                    <InfoField label="Ano de Fundação" value={partnerData.ano_fundacao} />
                    <InfoField label="Tamanho da Empresa" value={partnerData.tamanho_empresa} />
                    <InfoField label="Obras em Andamento" value={partnerData.obras_andamento} />
                    <InfoField label="Ticket Médio" value={partnerData.ticket_medio} />
                    <InfoField label="Site" value={partnerData.site} />
                    <InfoField label="Contato" value={partnerData.nome_contato} />
                    <InfoField label="Cargo" value={partnerData.cargo_contato} />
                    <InfoField label="WhatsApp" value={partnerData.whatsapp_contato} />
                    <InfoField label="Email" value={partnerData.email_contato} />
                    <div className="md:col-span-2">
                      <InfoField label="Tipos de Obras" value={partnerData.tipos_obras?.join(", ")} />
                    </div>
                    <div className="md:col-span-2">
                      <InfoField label="Principais Desafios" value={partnerData.principais_desafios?.join(", ")} />
                    </div>
                    <div className="md:col-span-2">
                      <InfoField label="Planejamento Curto Prazo" value={partnerData.planejamento_curto_prazo} />
                    </div>
                  </div>
                )}
                {partnerType === "fornecedor" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField label="Nome da Empresa" value={partnerData.nome_empresa} />
                    <InfoField label="CNPJ/CPF" value={partnerData.cnpj_cpf} />
                    <InfoField label="Cidade/Estado" value={`${partnerData.cidade} - ${partnerData.estado}`} />
                    <InfoField label="Tempo de Atuação" value={partnerData.tempo_atuacao} />
                    <InfoField label="Ticket Médio" value={partnerData.ticket_medio} />
                    <InfoField label="Capacidade de Atendimento" value={partnerData.capacidade_atendimento} />
                    <InfoField label="Responsável" value={partnerData.nome_responsavel} />
                    <InfoField label="Telefone" value={partnerData.telefone} />
                    <InfoField label="Email" value={partnerData.email} />
                    <InfoField label="Site" value={partnerData.site} />
                    <div className="md:col-span-2">
                      <InfoField label="Tipos de Atuação" value={partnerData.tipos_atuacao?.join(", ")} />
                    </div>
                    <div className="md:col-span-2">
                      <InfoField label="Categorias Atendidas" value={partnerData.categorias_atendidas?.join(", ")} />
                    </div>
                    <div className="md:col-span-2">
                      <InfoField label="Regiões Atendidas" value={partnerData.regioes_atendidas?.join(", ")} />
                    </div>
                    <div className="md:col-span-2">
                      <InfoField label="Diferenciais" value={partnerData.diferenciais?.join(", ")} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: FOTOS E DOCUMENTOS */}
          <TabsContent value="midia" className="focus-visible:outline-none space-y-6">
            {/* Foto de Perfil / Logo - Destacada */}
            <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-primary/80 to-primary/20" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Camera className="h-5 w-5 text-primary" /> Foto de Perfil
                </CardTitle>
                <CardDescription className="mt-1">
                  Sua foto principal que aparece no Marketplace.
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-lg">
                      <AvatarImage src={getLogoUrl(partnerData.logo_path) || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                        {partnerName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1.5 shadow-lg">
                      <Camera className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <FileUploadSection
                      title="Alterar Foto"
                      description="JPG, PNG até 5MB"
                      fieldName="logo_path"
                      currentPath={null}
                      bucket={getBucket()}
                      onUpload={handleFileUpload}
                      onDelete={handleFileDelete}
                      isImage={true}
                      uploading={uploading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seções específicas por tipo de parceiro */}
            {partnerType === "profissional" && (
              <>
                <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white overflow-hidden">
                  <div className="h-1.5 w-full bg-gradient-to-r from-blue-500/80 to-blue-500/20" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <ImageIcon className="h-5 w-5 text-blue-500" /> Fotos de Trabalhos
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Mostre seus melhores trabalhos para atrair clientes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <FileUploadSection
                      title="Galeria de Trabalhos"
                      description="Adicione fotos dos seus projetos"
                      fieldName="fotos_trabalhos_path"
                      currentPath={partnerData.fotos_trabalhos_path}
                      bucket={getBucket()}
                      onUpload={handleFileUpload}
                      onDelete={handleFileDelete}
                      isImage={true}
                      isMultiple={true}
                      uploading={uploading}
                    />
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white overflow-hidden">
                  <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500/80 to-emerald-500/20" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <FileText className="h-5 w-5 text-emerald-500" /> Documentos
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Adicione currículo e certificações para validar sua experiência.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-6 space-y-6">
                    <FileUploadSection
                      title="Currículo"
                      description="PDF ou documento com seu currículo"
                      fieldName="curriculo_path"
                      currentPath={partnerData.curriculo_path}
                      bucket={getBucket()}
                      onUpload={handleFileUpload}
                      onDelete={handleFileDelete}
                      isImage={false}
                      uploading={uploading}
                    />
                    <div className="border-t border-slate-100 pt-6">
                      <FileUploadSection
                        title="Certificações"
                        description="Certificados e cursos realizados"
                        fieldName="certificacoes_path"
                        currentPath={partnerData.certificacoes_path}
                        bucket={getBucket()}
                        onUpload={handleFileUpload}
                        onDelete={handleFileDelete}
                        isImage={false}
                        isMultiple={true}
                        uploading={uploading}
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {partnerType === "fornecedor" && (
              <>
                <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white overflow-hidden">
                  <div className="h-1.5 w-full bg-gradient-to-r from-blue-500/80 to-blue-500/20" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <ImageIcon className="h-5 w-5 text-blue-500" /> Portfólio e Fotos
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Mostre seus produtos e trabalhos realizados.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-6 space-y-6">
                    <FileUploadSection
                      title="Portfólio"
                      description="Apresentação da empresa ou catálogo"
                      fieldName="portfolio_path"
                      currentPath={partnerData.portfolio_path}
                      bucket={getBucket()}
                      onUpload={handleFileUpload}
                      onDelete={handleFileDelete}
                      isImage={false}
                      uploading={uploading}
                    />
                    <div className="border-t border-slate-100 pt-6">
                      <FileUploadSection
                        title="Fotos de Trabalhos"
                        description="Fotos de produtos ou serviços realizados"
                        fieldName="fotos_trabalhos_path"
                        currentPath={partnerData.fotos_trabalhos_path}
                        bucket={getBucket()}
                        onUpload={handleFileUpload}
                        onDelete={handleFileDelete}
                        isImage={true}
                        isMultiple={true}
                        uploading={uploading}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white overflow-hidden">
                  <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500/80 to-emerald-500/20" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <FileText className="h-5 w-5 text-emerald-500" /> Certificações
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Adicione certificados e alvarás da empresa.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <FileUploadSection
                      title="Certificações e Alvarás"
                      description="Documentos que validam a empresa"
                      fieldName="certificacoes_path"
                      currentPath={partnerData.certificacoes_path}
                      bucket={getBucket()}
                      onUpload={handleFileUpload}
                      onDelete={handleFileDelete}
                      isImage={false}
                      isMultiple={true}
                      uploading={uploading}
                    />
                  </CardContent>
                </Card>
              </>
            )}

            {partnerType === "empresa" && (
              <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white overflow-hidden">
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500/80 to-emerald-500/20" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <FileText className="h-5 w-5 text-emerald-500" /> Apresentação Institucional
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Adicione a apresentação da sua empresa.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <FileUploadSection
                    title="Apresentação PDF"
                    description="Documento institucional da empresa"
                    fieldName="apresentacao_path"
                    currentPath={partnerData.apresentacao_path}
                    bucket={getBucket()}
                    onUpload={handleFileUpload}
                    onDelete={handleFileDelete}
                    isImage={false}
                    uploading={uploading}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* TAB 3: PREVIEW (Opcional, mas visualmente bom ter) */}
          <TabsContent value="preview" className="focus-visible:outline-none">
            <div className="flex justify-center py-12">
              <div className="text-center">
                <LayoutTemplate className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-400">Visualização em Breve</h3>
                <p className="text-slate-400 mt-2">Veja como seu card aparecerá para os clientes.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
