import { useState } from "react";
import FormTemplate from "./FormTemplate";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Empresas = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // 1. Informações da Empresa
    nomeEmpresa: "",
    cnpj: "",
    site: "",
    cidade: "",
    estado: "",
    anoFundacao: "",
    tamanhoEmpresa: "",

    // 2. Contato Principal
    nomeContato: "",
    cargoContato: "",
    whatsappContato: "",
    emailContato: "",

    // 3. Estrutura Operacional
    obrasAndamento: "",
    tiposObras: [] as string[],
    tiposObrasOutro: "",
    ticketMedio: "",

    // 4. Processo Atual de Planejamento
    planejamentoCurtoPrazo: "",
    ferramentasGestao: "",

    // 5. Principais desafios
    principaisDesafios: [] as string[],
    desafiosOutro: "",
  });

  const handleCheckboxChange = (field: 'tiposObras' | 'principaisDesafios', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item: string) => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("formulario_empresas")
        .insert({
          nome_empresa: formData.nomeEmpresa,
          cnpj: formData.cnpj,
          site: formData.site || null,
          cidade: formData.cidade,
          estado: formData.estado,
          ano_fundacao: formData.anoFundacao,
          tamanho_empresa: formData.tamanhoEmpresa,
          nome_contato: formData.nomeContato,
          cargo_contato: formData.cargoContato,
          whatsapp_contato: formData.whatsappContato,
          email_contato: formData.emailContato,
          obras_andamento: formData.obrasAndamento,
          tipos_obras: formData.tiposObras,
          tipos_obras_outro: formData.tiposObrasOutro || null,
          ticket_medio: formData.ticketMedio,
          planejamento_curto_prazo: formData.planejamentoCurtoPrazo,
          ferramentas_gestao: formData.ferramentasGestao || null,
          principais_desafios: formData.principaisDesafios,
          desafios_outro: formData.desafiosOutro || null,
        });

      if (error) throw error;

      toast({
        title: "Formulário enviado com sucesso!",
        description: "Obrigado por se cadastrar.",
      });

      // Reset form
      setFormData({
        nomeEmpresa: "",
        cnpj: "",
        site: "",
        cidade: "",
        estado: "",
        anoFundacao: "",
        tamanhoEmpresa: "",
        nomeContato: "",
        cargoContato: "",
        whatsappContato: "",
        emailContato: "",
        obrasAndamento: "",
        tiposObras: [],
        tiposObrasOutro: "",
        ticketMedio: "",
        planejamentoCurtoPrazo: "",
        ferramentasGestao: "",
        principaisDesafios: [],
        desafiosOutro: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Erro ao enviar formulário",
        description: "Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormTemplate 
      title="GRIFOBOARD MARKETPLACE" 
      subtitle="Formulário de cadastro para empresas"
    >
      <div className="space-y-8">
        <h2 className="text-2xl font-semibold text-foreground">Cadastro de Empresas</h2>

        {/* 1. Informações da Empresa */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground border-b pb-2">1. Informações da Empresa</h3>
          
          <div className="space-y-2">
            <Label htmlFor="nomeEmpresa">Nome da empresa *</Label>
            <Input
              id="nomeEmpresa"
              value={formData.nomeEmpresa}
              onChange={(e) => setFormData({ ...formData, nomeEmpresa: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ *</Label>
            <Input
              id="cnpj"
              value={formData.cnpj}
              onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="site">Site da empresa (opcional)</Label>
            <Input
              id="site"
              type="url"
              value={formData.site}
              onChange={(e) => setFormData({ ...formData, site: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade *</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado *</Label>
              <Input
                id="estado"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="anoFundacao">Ano de fundação *</Label>
            <Input
              id="anoFundacao"
              type="number"
              maxLength={4}
              value={formData.anoFundacao}
              onChange={(e) => setFormData({ ...formData, anoFundacao: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tamanho da empresa *</Label>
            <div className="space-y-2">
              {["Micro (1–9 colaboradores)", "Pequena (10–49 colaboradores)", "Média (50–99 colaboradores)", "Grande (100+ colaboradores)"].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`tamanho-${option}`}
                    name="tamanhoEmpresa"
                    value={option}
                    checked={formData.tamanhoEmpresa === option}
                    onChange={(e) => setFormData({ ...formData, tamanhoEmpresa: e.target.value })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor={`tamanho-${option}`} className="font-normal cursor-pointer">{option}</Label>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 2. Contato Principal */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground border-b pb-2">2. Contato Principal</h3>
          
          <div className="space-y-2">
            <Label htmlFor="nomeContato">Nome completo *</Label>
            <Input
              id="nomeContato"
              value={formData.nomeContato}
              onChange={(e) => setFormData({ ...formData, nomeContato: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cargoContato">Cargo *</Label>
            <Input
              id="cargoContato"
              value={formData.cargoContato}
              onChange={(e) => setFormData({ ...formData, cargoContato: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsappContato">WhatsApp *</Label>
            <Input
              id="whatsappContato"
              type="tel"
              value={formData.whatsappContato}
              onChange={(e) => setFormData({ ...formData, whatsappContato: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailContato">E-mail *</Label>
            <Input
              id="emailContato"
              type="email"
              value={formData.emailContato}
              onChange={(e) => setFormData({ ...formData, emailContato: e.target.value })}
              required
            />
          </div>
        </section>

        {/* 3. Estrutura Operacional */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground border-b pb-2">3. Estrutura Operacional</h3>
          
          <div className="space-y-2">
            <Label>Quantas obras estão em andamento atualmente? *</Label>
            <div className="space-y-2">
              {["0–2", "3–5", "6–10", "11–20", "21+"].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`obras-${option}`}
                    name="obrasAndamento"
                    value={option}
                    checked={formData.obrasAndamento === option}
                    onChange={(e) => setFormData({ ...formData, obrasAndamento: e.target.value })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor={`obras-${option}`} className="font-normal cursor-pointer">{option}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipos de obras que executam *</Label>
            <div className="space-y-2">
              {["Residencial", "Comercial", "Industrial", "Reformas", "Obras públicas", "Outras"].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tipo-${option}`}
                    checked={formData.tiposObras.includes(option)}
                    onCheckedChange={() => handleCheckboxChange('tiposObras', option)}
                  />
                  <Label htmlFor={`tipo-${option}`} className="font-normal cursor-pointer">{option}</Label>
                </div>
              ))}
            </div>
            {formData.tiposObras.includes("Outras") && (
              <Input
                placeholder="Especifique outros tipos de obras"
                value={formData.tiposObrasOutro}
                onChange={(e) => setFormData({ ...formData, tiposObrasOutro: e.target.value })}
                className="mt-2"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Ticket médio das obras *</Label>
            <div className="space-y-2">
              {["Até R$ 200 mil", "R$ 200 mil – R$ 800 mil", "R$ 800 mil – R$ 2 milhões", "R$ 2 – 5 milhões", "Acima de R$ 5 milhões"].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`ticket-${option}`}
                    name="ticketMedio"
                    value={option}
                    checked={formData.ticketMedio === option}
                    onChange={(e) => setFormData({ ...formData, ticketMedio: e.target.value })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor={`ticket-${option}`} className="font-normal cursor-pointer">{option}</Label>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Processo Atual de Planejamento */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground border-b pb-2">4. Processo Atual de Planejamento</h3>
          
          <div className="space-y-2">
            <Label>Como vocês fazem o planejamento de curto prazo hoje? *</Label>
            <div className="space-y-2">
              {["Planilhas", "WhatsApp", "Software de gestão", "Não possuem processo definido"].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`plan-${option}`}
                    name="planejamentoCurtoPrazo"
                    value={option}
                    checked={formData.planejamentoCurtoPrazo === option}
                    onChange={(e) => setFormData({ ...formData, planejamentoCurtoPrazo: e.target.value })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor={`plan-${option}`} className="font-normal cursor-pointer">{option}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ferramentasGestao">Quais ferramentas de gestão vocês utilizam atualmente?</Label>
            <Input
              id="ferramentasGestao"
              value={formData.ferramentasGestao}
              onChange={(e) => setFormData({ ...formData, ferramentasGestao: e.target.value })}
            />
          </div>
        </section>

        {/* 5. Principais desafios */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground border-b pb-2">5. Principais desafios nas obras</h3>
          
          <div className="space-y-2">
            <Label>Selecione os principais desafios *</Label>
            <div className="space-y-2">
              {[
                "Atraso de etapas",
                "Falta de alinhamento com equipes",
                "Problemas de comunicação",
                "Falta de controle de materiais",
                "Falta de controle de mão de obra",
                "Problemas com fornecedores",
                "Necessidade de replanejamento constante",
                "Outro"
              ].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`desafio-${option}`}
                    checked={formData.principaisDesafios.includes(option)}
                    onCheckedChange={() => handleCheckboxChange('principaisDesafios', option)}
                  />
                  <Label htmlFor={`desafio-${option}`} className="font-normal cursor-pointer">{option}</Label>
                </div>
              ))}
            </div>
            {formData.principaisDesafios.includes("Outro") && (
              <Input
                placeholder="Especifique outros desafios"
                value={formData.desafiosOutro}
                onChange={(e) => setFormData({ ...formData, desafiosOutro: e.target.value })}
                className="mt-2"
              />
            )}
          </div>
        </section>

        {/* 6. Documentos */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground border-b pb-2">6. Documentos / Informações Complementares (opcional)</h3>
          
          <div className="space-y-2">
            <Label htmlFor="logo">Enviar logo da empresa</Label>
            <p className="text-sm text-muted-foreground">Upload em desenvolvimento...</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apresentacao">Enviar apresentação institucional (PDF)</Label>
            <p className="text-sm text-muted-foreground">Upload em desenvolvimento...</p>
          </div>
        </section>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting ? "Enviando..." : "Enviar Cadastro"}
          </Button>
        </div>
      </div>
    </FormTemplate>
  );
};

export default Empresas;
