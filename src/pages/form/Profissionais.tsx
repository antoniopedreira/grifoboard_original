import { useState } from "react";
import FormTemplate from "./FormTemplate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import FormSectionHeader from "@/components/task-form/FormSectionHeader";
import { SuccessModal } from "@/components/SuccessModal";
const ESTADOS_BRASILEIROS = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];
const FUNCOES_PRINCIPAIS = ["Engenheiro", "Técnico de construção", "Mestre de obras", "Pedreiro", "Carpinteiro", "Eletricista", "Encanador", "Pintor", "Gesseiro", "Serralheiro", "Servente", "Arquiteto", "Outro"];
const ESPECIALIDADES = ["Estrutura", "Alvenaria", "Acabamento", "Hidráulica", "Elétrica", "Drywall", "Pintura", "Revestimentos", "Impermeabilização", "Demolição", "Outra"];
const TEMPO_EXPERIENCIA = ["Menos de 1 ano", "1–3 anos", "3–5 anos", "Mais de 5 anos"];
const DISPONIBILIDADE_ATUAL = ["Imediata", "Em 15 dias", "Em 30 dias", "Apenas por contrato pontual"];
const MODALIDADE_TRABALHO = ["CLT", "PJ", "Pessoa física / diária", "Freelancer por obra"];
const REGIOES_BRASIL = ["Região Norte", "Região Nordeste", "Região Centro-Oeste", "Região Sudeste", "Região Sul"];
const DIFERENCIAIS = ["Experiência com obras de médio/grande porte", "Especialização técnica", "Curso profissionalizante", "Certificação NR", "Carteira de motorista", "Veículo próprio", "Outro"];
const EQUIPAMENTOS_PROPRIOS = ["Sim", "Não", "Parcialmente"];
const FormProfissionais = () => {
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [curriculoFile, setCurriculoFile] = useState<File | null>(null);
  const [fotosFiles, setFotosFiles] = useState<FileList | null>(null);
  const [certificacoesFiles, setCertificacoesFiles] = useState<FileList | null>(null);

  const [formData, setFormData] = useState({
    nomeCompleto: "",
    cpf: "",
    dataNascimento: "",
    cidade: "",
    estado: "",
    funcaoPrincipal: "",
    funcaoPrincipalOutro: "",
    especialidades: [] as string[],
    especialidadesOutro: "",
    tempoExperiencia: "",
    obrasRelevantes: "",
    disponibilidadeAtual: "",
    modalidadeTrabalho: "",
    regioesAtendidas: [] as string[],
    cidadesFrequentes: "",
    pretensaoValor: "",
    equipamentosProprios: "",
    diferenciais: [] as string[],
    diferenciaisOutro: "",
    telefone: "",
    email: ""
  });
  const handleCheckboxChange = (field: "especialidades" | "regioesAtendidas" | "diferenciais", value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter(item => item !== value) : [...prev[field], value]
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploadingFiles(true);

    try {
      let curriculoPath: string | null = null;
      let fotosPath: string | null = null;
      let certificacoesPath: string | null = null;

      // Upload curriculo if provided
      if (curriculoFile) {
        const fileExt = curriculoFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('formularios-profissionais')
          .upload(`curriculos/${fileName}`, curriculoFile);

        if (uploadError) throw uploadError;
        curriculoPath = `curriculos/${fileName}`;
      }

      // Upload fotos files if provided
      if (fotosFiles && fotosFiles.length > 0) {
        const uploadedPaths: string[] = [];
        for (let i = 0; i < fotosFiles.length; i++) {
          const file = fotosFiles[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('formularios-profissionais')
            .upload(`fotos/${fileName}`, file);

          if (uploadError) throw uploadError;
          uploadedPaths.push(`fotos/${fileName}`);
        }
        fotosPath = uploadedPaths.join(',');
      }

      // Upload certificacoes files if provided
      if (certificacoesFiles && certificacoesFiles.length > 0) {
        const uploadedPaths: string[] = [];
        for (let i = 0; i < certificacoesFiles.length; i++) {
          const file = certificacoesFiles[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('formularios-profissionais')
            .upload(`certificacoes/${fileName}`, file);

          if (uploadError) throw uploadError;
          uploadedPaths.push(`certificacoes/${fileName}`);
        }
        certificacoesPath = uploadedPaths.join(',');
      }

      setUploadingFiles(false);

      const {
        error
      } = await supabase.from("formulario_profissionais").insert({
        nome_completo: formData.nomeCompleto,
        cpf: formData.cpf,
        data_nascimento: formData.dataNascimento,
        cidade: formData.cidade,
        estado: formData.estado,
        funcao_principal: formData.funcaoPrincipal,
        funcao_principal_outro: formData.funcaoPrincipalOutro,
        especialidades: formData.especialidades,
        especialidades_outro: formData.especialidadesOutro,
        tempo_experiencia: formData.tempoExperiencia,
        obras_relevantes: formData.obrasRelevantes,
        disponibilidade_atual: formData.disponibilidadeAtual,
        modalidade_trabalho: formData.modalidadeTrabalho,
        regioes_atendidas: formData.regioesAtendidas,
        cidades_frequentes: formData.cidadesFrequentes,
        pretensao_valor: formData.pretensaoValor,
        equipamentos_proprios: formData.equipamentosProprios,
        diferenciais: formData.diferenciais,
        diferenciais_outro: formData.diferenciaisOutro,
        telefone: formData.telefone,
        email: formData.email,
        curriculo_path: curriculoPath,
        fotos_trabalhos_path: fotosPath,
        certificacoes_path: certificacoesPath,
      });
      if (error) throw error;

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      toast.error("Erro ao enviar formulário. Tente novamente.");
    } finally {
      setLoading(false);
      setUploadingFiles(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    
    // Reset form
    setFormData({
      nomeCompleto: "",
      cpf: "",
      dataNascimento: "",
      cidade: "",
      estado: "",
      funcaoPrincipal: "",
      funcaoPrincipalOutro: "",
      especialidades: [],
      especialidadesOutro: "",
      tempoExperiencia: "",
      obrasRelevantes: "",
      disponibilidadeAtual: "",
      modalidadeTrabalho: "",
      regioesAtendidas: [],
      cidadesFrequentes: "",
      pretensaoValor: "",
      equipamentosProprios: "",
      diferenciais: [],
      diferenciaisOutro: "",
      telefone: "",
      email: ""
    });
    setCurriculoFile(null);
    setFotosFiles(null);
    setCertificacoesFiles(null);
    
    // Reset file inputs
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
      (input as HTMLInputElement).value = '';
    });
  };

  return (
    <>
      <SuccessModal 
        open={showSuccessModal}
        onClose={handleCloseModal}
        title="Cadastro realizado com sucesso!"
        message="Obrigado por se cadastrar no GRIFOBOARD MARKETPLACE. Em breve entraremos em contato."
      />
      
      <FormTemplate title="GRIFOBOARD MARKETPLACE" subtitle="Formulário de cadastro para profissionais terceirizados">
      <form onSubmit={handleSubmit} className="space-y-8">
        <h2 className="text-2xl font-semibold text-foreground">
          Profissionais Terceirizados
        </h2>
        

        {/* 1. Informações Básicas */}
        <div className="space-y-4">
          <FormSectionHeader label="1. Informações Básicas" />
          
          <div>
            <Label htmlFor="nomeCompleto">Nome completo *</Label>
            <Input id="nomeCompleto" required value={formData.nomeCompleto} onChange={e => setFormData({
            ...formData,
            nomeCompleto: e.target.value
          })} />
          </div>

          <div>
            <Label htmlFor="cpf">CPF *</Label>
            <Input id="cpf" required value={formData.cpf} onChange={e => setFormData({
            ...formData,
            cpf: e.target.value
          })} />
          </div>

          <div>
            <Label htmlFor="dataNascimento">Data de nascimento *</Label>
            <Input id="dataNascimento" type="date" required value={formData.dataNascimento} onChange={e => setFormData({
            ...formData,
            dataNascimento: e.target.value
          })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cidade">Cidade *</Label>
              <Input id="cidade" required value={formData.cidade} onChange={e => setFormData({
              ...formData,
              cidade: e.target.value
            })} />
            </div>

            <div>
              <Label htmlFor="estado">Estado *</Label>
              <select id="estado" required value={formData.estado} onChange={e => setFormData({
              ...formData,
              estado: e.target.value
            })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">Selecione...</option>
                {ESTADOS_BRASILEIROS.map(estado => <option key={estado} value={estado}>{estado}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* 2. Área de Atuação */}
        <div className="space-y-4">
          <FormSectionHeader label="2. Área de Atuação" />
          
          <div>
            <Label htmlFor="funcaoPrincipal">Função principal *</Label>
            <select id="funcaoPrincipal" required value={formData.funcaoPrincipal} onChange={e => setFormData({
            ...formData,
            funcaoPrincipal: e.target.value
          })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">Selecione...</option>
              {FUNCOES_PRINCIPAIS.map(funcao => <option key={funcao} value={funcao}>{funcao}</option>)}
            </select>
          </div>

          {formData.funcaoPrincipal === "Outro" && <div>
              <Label htmlFor="funcaoPrincipalOutro">Especifique a função</Label>
              <Input id="funcaoPrincipalOutro" value={formData.funcaoPrincipalOutro} onChange={e => setFormData({
            ...formData,
            funcaoPrincipalOutro: e.target.value
          })} />
            </div>}

          <div>
            <Label>Especialidades (múltipla escolha) *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {ESPECIALIDADES.map(especialidade => <div key={especialidade} className="flex items-center space-x-2">
                  <Checkbox id={`esp-${especialidade}`} checked={formData.especialidades.includes(especialidade)} onCheckedChange={() => handleCheckboxChange("especialidades", especialidade)} />
                  <label htmlFor={`esp-${especialidade}`} className="text-sm cursor-pointer">
                    {especialidade}
                  </label>
                </div>)}
            </div>
          </div>

          {formData.especialidades.includes("Outra") && <div>
              <Label htmlFor="especialidadesOutro">Especifique a especialidade</Label>
              <Input id="especialidadesOutro" value={formData.especialidadesOutro} onChange={e => setFormData({
            ...formData,
            especialidadesOutro: e.target.value
          })} />
            </div>}
        </div>

        {/* 3. Experiência */}
        <div className="space-y-4">
          <FormSectionHeader label="3. Experiência" />
          
          <div>
            <Label htmlFor="tempoExperiencia">Tempo de experiência na área *</Label>
            <select id="tempoExperiencia" required value={formData.tempoExperiencia} onChange={e => setFormData({
            ...formData,
            tempoExperiencia: e.target.value
          })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">Selecione...</option>
              {TEMPO_EXPERIENCIA.map(tempo => <option key={tempo} value={tempo}>{tempo}</option>)}
            </select>
          </div>

          <div>
            <Label htmlFor="obrasRelevantes">Obras mais relevantes que já participou</Label>
            <Textarea id="obrasRelevantes" placeholder="Descreva brevemente as obras mais relevantes..." value={formData.obrasRelevantes} onChange={e => setFormData({
            ...formData,
            obrasRelevantes: e.target.value
          })} rows={4} />
          </div>
        </div>

        {/* 4. Disponibilidade */}
        <div className="space-y-4">
          <FormSectionHeader label="4. Disponibilidade" />
          
          <div>
            <Label htmlFor="disponibilidadeAtual">Disponibilidade atual *</Label>
            <select id="disponibilidadeAtual" required value={formData.disponibilidadeAtual} onChange={e => setFormData({
            ...formData,
            disponibilidadeAtual: e.target.value
          })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">Selecione...</option>
              {DISPONIBILIDADE_ATUAL.map(disp => <option key={disp} value={disp}>{disp}</option>)}
            </select>
          </div>

          <div>
            <Label htmlFor="modalidadeTrabalho">Modalidade de trabalho *</Label>
            <select id="modalidadeTrabalho" required value={formData.modalidadeTrabalho} onChange={e => setFormData({
            ...formData,
            modalidadeTrabalho: e.target.value
          })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">Selecione...</option>
              {MODALIDADE_TRABALHO.map(modalidade => <option key={modalidade} value={modalidade}>{modalidade}</option>)}
            </select>
          </div>

          <div>
            <Label>Regiões Atendidas *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {REGIOES_BRASIL.map(regiao => <div key={regiao} className="flex items-center space-x-2">
                  <Checkbox id={`reg-${regiao}`} checked={formData.regioesAtendidas.includes(regiao)} onCheckedChange={() => handleCheckboxChange("regioesAtendidas", regiao)} />
                  <label htmlFor={`reg-${regiao}`} className="text-sm cursor-pointer">
                    {regiao}
                  </label>
                </div>)}
            </div>
          </div>

          <div>
            <Label htmlFor="cidadesFrequentes">Cidades atendidas com maior frequência</Label>
            <Input id="cidadesFrequentes" placeholder="Ex: São Paulo, Rio de Janeiro, Belo Horizonte..." value={formData.cidadesFrequentes} onChange={e => setFormData({
            ...formData,
            cidadesFrequentes: e.target.value
          })} />
          </div>
        </div>

        {/* 5. Condições e Faixa de Preço */}
        <div className="space-y-4">
          <FormSectionHeader label="5. Condições e Faixa de Preço" />
          
          <div>
            <Label htmlFor="pretensaoValor">Pretensão salarial ou valor por diária / m² / contrato *</Label>
            <Input id="pretensaoValor" required placeholder="Ex: R$ 5.000/mês ou R$ 200/dia" value={formData.pretensaoValor} onChange={e => setFormData({
            ...formData,
            pretensaoValor: e.target.value
          })} />
          </div>

          <div>
            <Label htmlFor="equipamentosProprios">Possui equipamentos próprios? *</Label>
            <select id="equipamentosProprios" required value={formData.equipamentosProprios} onChange={e => setFormData({
            ...formData,
            equipamentosProprios: e.target.value
          })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">Selecione...</option>
              {EQUIPAMENTOS_PROPRIOS.map(equip => <option key={equip} value={equip}>{equip}</option>)}
            </select>
          </div>
        </div>

        {/* 6. Diferenciais */}
        <div className="space-y-4">
          <FormSectionHeader label="6. Diferenciais" />
          
          <div>
            <Label>Seus diferenciais *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {DIFERENCIAIS.map(diferencial => <div key={diferencial} className="flex items-center space-x-2">
                  <Checkbox id={`dif-${diferencial}`} checked={formData.diferenciais.includes(diferencial)} onCheckedChange={() => handleCheckboxChange("diferenciais", diferencial)} />
                  <label htmlFor={`dif-${diferencial}`} className="text-sm cursor-pointer">
                    {diferencial}
                  </label>
                </div>)}
            </div>
          </div>

          {formData.diferenciais.includes("Outro") && <div>
              <Label htmlFor="diferenciaisOutro">Especifique outros diferenciais</Label>
              <Input id="diferenciaisOutro" value={formData.diferenciaisOutro} onChange={e => setFormData({
            ...formData,
            diferenciaisOutro: e.target.value
          })} />
            </div>}
        </div>

        {/* 7. Documentos e Portfólio */}
        <div className="space-y-4">
          <FormSectionHeader label="7. Documentos e Portfólio" description="(Uploads de arquivos serão habilitados em breve)" />
          
          <p className="text-sm text-muted-foreground italic">
            • Currículo (opcional)<br />
            • Fotos de trabalhos realizados (opcional)<br />
            • Certificações / cursos (opcional)
          </p>
        </div>

        {/* 8. Contato */}
        <div className="space-y-4">
          <FormSectionHeader label="8. Contato" />
          
          <div>
            <Label htmlFor="telefone">Telefone / WhatsApp *</Label>
            <Input id="telefone" required placeholder="(00) 00000-0000" value={formData.telefone} onChange={e => setFormData({
            ...formData,
            telefone: e.target.value
          })} />
          </div>

          <div>
            <Label htmlFor="email">E-mail (opcional)</Label>
            <Input id="email" type="email" placeholder="seu@email.com" value={formData.email} onChange={e => setFormData({
            ...formData,
            email: e.target.value
          })} />
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Enviando..." : "Enviar Cadastro"}
        </Button>
      </form>
    </FormTemplate>;
};
export default FormProfissionais;