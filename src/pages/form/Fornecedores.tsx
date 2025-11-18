import { useState, FormEvent } from "react";
import FormTemplate from "./FormTemplate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SuccessModal } from "@/components/SuccessModal";

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

const FormFornecedores = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [portfolioFiles, setPortfolioFiles] = useState<FileList | null>(null);
  const [certificacoesFiles, setCertificacoesFiles] = useState<FileList | null>(null);

  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [cnpjCpf, setCnpjCpf] = useState("");
  const [site, setSite] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [tempoAtuacao, setTempoAtuacao] = useState("");
  const [tiposAtuacao, setTiposAtuacao] = useState<string[]>([]);
  const [tipoAtuacaoOutro, setTipoAtuacaoOutro] = useState("");
  const [categoriasAtendidas, setCategoriasAtendidas] = useState<string[]>([]);
  const [categoriasOutro, setCategoriasOutro] = useState("");
  const [ticketMedio, setTicketMedio] = useState("");
  const [capacidadeAtendimento, setCapacidadeAtendimento] = useState("");
  const [regioesAtendidas, setRegioesAtendidas] = useState<string[]>([]);
  const [cidadesFrequentes, setCidadesFrequentes] = useState("");
  const [diferenciais, setDiferenciais] = useState<string[]>([]);
  const [diferenciaisOutro, setDiferenciaisOutro] = useState("");
  const [nomeResponsavel, setNomeResponsavel] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");

  const handleCheckboxChange = (
    value: string,
    currentValues: string[],
    setter: (values: string[]) => void,
    max?: number,
  ) => {
    if (currentValues.includes(value)) {
      setter(currentValues.filter((v) => v !== value));
    } else {
      if (!max || currentValues.length < max) {
        setter([...currentValues, value]);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadingFiles(true);

    try {
      let logoPath: string | null = null;
      let portfolioPath: string | null = null;
      let certificacoesPath: string | null = null;

      // Upload logo if provided
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('formularios-fornecedores')
          .upload(`logos/${fileName}`, logoFile);

        if (uploadError) throw uploadError;
        logoPath = `logos/${fileName}`;
      }

      // Upload portfolio files if provided
      if (portfolioFiles && portfolioFiles.length > 0) {
        const uploadedPaths: string[] = [];
        for (let i = 0; i < portfolioFiles.length; i++) {
          const file = portfolioFiles[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('formularios-fornecedores')
            .upload(`portfolios/${fileName}`, file);

          if (uploadError) throw uploadError;
          uploadedPaths.push(`portfolios/${fileName}`);
        }
        portfolioPath = uploadedPaths.join(',');
      }

      // Upload certificacoes files if provided
      if (certificacoesFiles && certificacoesFiles.length > 0) {
        const uploadedPaths: string[] = [];
        for (let i = 0; i < certificacoesFiles.length; i++) {
          const file = certificacoesFiles[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('formularios-fornecedores')
            .upload(`certificacoes/${fileName}`, file);

          if (uploadError) throw uploadError;
          uploadedPaths.push(`certificacoes/${fileName}`);
        }
        certificacoesPath = uploadedPaths.join(',');
      }

      setUploadingFiles(false);

      const { error } = await supabase.from("formulario_fornecedores").insert({
        nome_empresa: nomeEmpresa,
        cnpj_cpf: cnpjCpf,
        site: site || null,
        cidade,
        estado,
        tempo_atuacao: tempoAtuacao,
        tipos_atuacao: tiposAtuacao,
        tipo_atuacao_outro: tipoAtuacaoOutro || null,
        categorias_atendidas: categoriasAtendidas,
        categorias_outro: categoriasOutro || null,
        ticket_medio: ticketMedio,
        capacidade_atendimento: capacidadeAtendimento,
        regioes_atendidas: regioesAtendidas,
        cidades_frequentes: cidadesFrequentes || null,
        diferenciais,
        diferenciais_outro: diferenciaisOutro || null,
        nome_responsavel: nomeResponsavel,
        telefone,
        email,
        logo_path: logoPath,
        portfolio_path: portfolioPath,
        certificacoes_path: certificacoesPath,
      });

      if (error) throw error;

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      toast.error("Erro ao enviar formulário. Tente novamente.");
    } finally {
      setIsSubmitting(false);
      setUploadingFiles(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    
    // Reset all fields
    setNomeEmpresa("");
    setCnpjCpf("");
    setSite("");
    setCidade("");
    setEstado("");
    setTempoAtuacao("");
    setTiposAtuacao([]);
    setTipoAtuacaoOutro("");
    setCategoriasAtendidas([]);
    setCategoriasOutro("");
    setTicketMedio("");
    setCapacidadeAtendimento("");
    setRegioesAtendidas([]);
    setCidadesFrequentes("");
    setDiferenciais([]);
    setDiferenciaisOutro("");
    setNomeResponsavel("");
    setTelefone("");
    setEmail("");
    setLogoFile(null);
    setPortfolioFiles(null);
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
      
      <FormTemplate
      title="GRIFOBOARD MARKETPLACE"
      subtitle="Formulário de cadastro para fornecedores / distribuidores / lojas"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. Informações da Empresa */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground border-b pb-2">1. Informações da Empresa / Prestador</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nomeEmpresa">Nome da empresa ou nome completo (MEI / autônomo) *</Label>
              <Input
                id="nomeEmpresa"
                value={nomeEmpresa}
                onChange={(e) => setNomeEmpresa(e.target.value)}
                placeholder="Nome da empresa"
                required
              />
            </div>

            <div>
              <Label htmlFor="cnpjCpf">CNPJ ou CPF *</Label>
              <Input
                id="cnpjCpf"
                value={cnpjCpf}
                onChange={(e) => setCnpjCpf(e.target.value)}
                placeholder="00.000.000/0000-00"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="site">Site / Portfólio (opcional)</Label>
            <Input
              id="site"
              value={site}
              onChange={(e) => setSite(e.target.value)}
              placeholder="https://..."
              type="url"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cidade">Cidade *</Label>
              <Input
                id="cidade"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Nome da cidade"
                required
              />
            </div>

            <div>
              <Label htmlFor="estado">Estado *</Label>
              <Select value={estado} onValueChange={setEstado} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  {ESTADOS_BR.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="tempoAtuacao">Tempo de atuação *</Label>
            <Select value={tempoAtuacao} onValueChange={setTempoAtuacao} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                <SelectItem value="menos-1-ano">Menos de 1 ano</SelectItem>
                <SelectItem value="1-3-anos">1–3 anos</SelectItem>
                <SelectItem value="3-5-anos">3–5 anos</SelectItem>
                <SelectItem value="mais-5-anos">Mais de 5 anos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 2. Tipo de Atuação */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground border-b pb-2">2. Tipo de Atuação</h2>

          <div>
            <Label>Você é: (múltipla escolha) *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {[
                "Loja de materiais de construção",
                "Distribuidor",
                "Fabricante",
                "Fornecedor de serviços",
                "Transportadora / logística",
                "Outro",
              ].map((tipo) => (
                <div key={tipo} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tipo-${tipo}`}
                    checked={tiposAtuacao.includes(tipo)}
                    onCheckedChange={() => handleCheckboxChange(tipo, tiposAtuacao, setTiposAtuacao)}
                  />
                  <label htmlFor={`tipo-${tipo}`} className="text-sm cursor-pointer">
                    {tipo}
                  </label>
                </div>
              ))}
            </div>

            {tiposAtuacao.includes("Outro") && (
              <div className="mt-3">
                <Input
                  value={tipoAtuacaoOutro}
                  onChange={(e) => setTipoAtuacaoOutro(e.target.value)}
                  placeholder="Especifique..."
                />
              </div>
            )}
          </div>

          <div>
            <Label>Categorias atendidas (múltipla escolha) *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {[
                "Estrutura",
                "Alvenaria",
                "Impermeabilização",
                "Acabamento",
                "Hidráulica",
                "Elétrica",
                "Pintura",
                "Drywall",
                "Marcenaria",
                "Gesso",
                "Serralheria",
                "Demolição",
                "Locação de equipamentos",
                "Entrega / logística",
                "Outro",
              ].map((cat) => (
                <div key={cat} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${cat}`}
                    checked={categoriasAtendidas.includes(cat)}
                    onCheckedChange={() => handleCheckboxChange(cat, categoriasAtendidas, setCategoriasAtendidas)}
                  />
                  <label htmlFor={`cat-${cat}`} className="text-sm cursor-pointer">
                    {cat}
                  </label>
                </div>
              ))}
            </div>

            {categoriasAtendidas.includes("Outro") && (
              <div className="mt-3">
                <Input
                  value={categoriasOutro}
                  onChange={(e) => setCategoriasOutro(e.target.value)}
                  placeholder="Especifique..."
                />
              </div>
            )}
          </div>
        </div>

        {/* 3. Faixa de Preço e Capacidade */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground border-b pb-2">3. Faixa de Preço e Capacidade</h2>

          <div>
            <Label htmlFor="ticketMedio">Ticket médio dos serviços/produtos *</Label>
            <Select value={ticketMedio} onValueChange={setTicketMedio} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                <SelectItem value="ate-5000">Até R$ 5.000</SelectItem>
                <SelectItem value="5000-20000">R$ 5.000 – R$ 20.000</SelectItem>
                <SelectItem value="20000-50000">R$ 20.000 – R$ 50.000</SelectItem>
                <SelectItem value="acima-50000">Acima de R$ 50.000</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="capacidadeAtendimento">Capacidade de atendimento simultâneo *</Label>
            <Select value={capacidadeAtendimento} onValueChange={setCapacidadeAtendimento} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                <SelectItem value="1-obra">1 obra</SelectItem>
                <SelectItem value="2-3-obras">2–3 obras</SelectItem>
                <SelectItem value="4-5-obras">4–5 obras</SelectItem>
                <SelectItem value="6-mais-obras">6+ obras</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 4. Regiões Atendidas */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground border-b pb-2">4. Regiões Atendidas</h2>

          <div>
            <Label>Regiões atendidas (múltipla escolha) *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {["Região Norte", "Região Nordeste", "Região Centro-Oeste", "Região Sudeste", "Região Sul"].map(
                (regiao) => (
                  <div key={regiao} className="flex items-center space-x-2">
                    <Checkbox
                      id={`regiao-${regiao}`}
                      checked={regioesAtendidas.includes(regiao)}
                      onCheckedChange={() => handleCheckboxChange(regiao, regioesAtendidas, setRegioesAtendidas)}
                    />
                    <label htmlFor={`regiao-${regiao}`} className="text-sm cursor-pointer">
                      {regiao}
                    </label>
                  </div>
                ),
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="cidadesFrequentes">Cidades atendidas com maior frequência</Label>
            <Textarea
              id="cidadesFrequentes"
              value={cidadesFrequentes}
              onChange={(e) => setCidadesFrequentes(e.target.value)}
              placeholder="Ex: São Paulo, Rio de Janeiro, Belo Horizonte..."
              rows={3}
            />
          </div>
        </div>

        {/* 5. Diferenciais */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground border-b pb-2">5. Diferenciais</h2>

          <div>
            <Label>Selecione até 3 diferenciais *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {[
                "Entrega rápida",
                "Equipe própria",
                "Garantia formal",
                "Preço competitivo",
                "Certificações técnicas",
                "Atendimento emergencial",
                "Experiência com obras de grande porte",
                "Outro",
              ].map((dif) => (
                <div key={dif} className="flex items-center space-x-2">
                  <Checkbox
                    id={`dif-${dif}`}
                    checked={diferenciais.includes(dif)}
                    onCheckedChange={() => handleCheckboxChange(dif, diferenciais, setDiferenciais, 3)}
                    disabled={!diferenciais.includes(dif) && diferenciais.length >= 3}
                  />
                  <label
                    htmlFor={`dif-${dif}`}
                    className={`text-sm ${!diferenciais.includes(dif) && diferenciais.length >= 3 ? "text-muted-foreground" : "cursor-pointer"}`}
                  >
                    {dif}
                  </label>
                </div>
              ))}
            </div>

            {diferenciais.includes("Outro") && (
              <div className="mt-3">
                <Input
                  value={diferenciaisOutro}
                  onChange={(e) => setDiferenciaisOutro(e.target.value)}
                  placeholder="Especifique..."
                />
              </div>
            )}
          </div>
        </div>

        {/* 6. Documentos e Portfólio */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground border-b pb-2">6. Documentos e Portfólio</h2>
          
          <div>
            <Label htmlFor="logo">Logo/foto da empresa (opcional)</Label>
            <p className="text-xs text-muted-foreground mb-2">Formatos aceitos: JPG, PNG (máx. 5MB)</p>
            <Input 
              id="logo" 
              type="file" 
              accept=".jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 5 * 1024 * 1024) {
                    toast.error("Arquivo muito grande. Tamanho máximo: 5MB");
                    e.target.value = '';
                    return;
                  }
                  setLogoFile(file);
                }
              }}
            />
          </div>

          <div>
            <Label htmlFor="portfolio">Portfólio de produtos ou serviços (opcional)</Label>
            <p className="text-xs text-muted-foreground mb-2">Formatos aceitos: PDF, JPG, PNG (máx. 5MB por arquivo)</p>
            <Input 
              id="portfolio" 
              type="file" 
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onChange={(e) => {
                const files = e.target.files;
                if (files) {
                  for (let i = 0; i < files.length; i++) {
                    if (files[i].size > 5 * 1024 * 1024) {
                      toast.error(`Arquivo ${files[i].name} muito grande. Tamanho máximo: 5MB`);
                      e.target.value = '';
                      return;
                    }
                  }
                  setPortfolioFiles(files);
                }
              }}
            />
          </div>

          <div>
            <Label htmlFor="certificacoes">Certificações / alvarás (opcional)</Label>
            <p className="text-xs text-muted-foreground mb-2">Formatos aceitos: PDF, JPG, PNG (máx. 5MB por arquivo)</p>
            <Input 
              id="certificacoes" 
              type="file" 
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onChange={(e) => {
                const files = e.target.files;
                if (files) {
                  for (let i = 0; i < files.length; i++) {
                    if (files[i].size > 5 * 1024 * 1024) {
                      toast.error(`Arquivo ${files[i].name} muito grande. Tamanho máximo: 5MB`);
                      e.target.value = '';
                      return;
                    }
                  }
                  setCertificacoesFiles(files);
                }
              }}
            />
          </div>
        </div>

        {/* 7. Contato Comercial */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground border-b pb-2">7. Contato Comercial</h2>

          <div>
            <Label htmlFor="nomeResponsavel">Nome do responsável *</Label>
            <Input
              id="nomeResponsavel"
              value={nomeResponsavel}
              onChange={(e) => setNomeResponsavel(e.target.value)}
              placeholder="Nome completo"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefone">Telefone / WhatsApp *</Label>
              <Input
                id="telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(00) 00000-0000"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enviar Inscrição
        </Button>
      </form>
    </FormTemplate>
    </>
  );
};

export default FormFornecedores;
