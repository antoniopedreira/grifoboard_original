import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormTemplate from './FormTemplate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const fornecedoresSchema = z.object({
  nomeEmpresa: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
  cnpjCpf: z.string().min(11, 'CNPJ/CPF inválido'),
  site: z.string().url('URL inválida').optional().or(z.literal('')),
  cidade: z.string().min(2, 'Cidade é obrigatória'),
  estado: z.string().min(2, 'Estado é obrigatório'),
  tempoAtuacao: z.string().min(1, 'Selecione o tempo de atuação'),
  tiposAtuacao: z.array(z.string()).min(1, 'Selecione pelo menos uma opção'),
  tipoAtuacaoOutro: z.string().optional(),
  categoriasAtendidas: z.array(z.string()).min(1, 'Selecione pelo menos uma categoria'),
  categoriasOutro: z.string().optional(),
  ticketMedio: z.string().min(1, 'Selecione o ticket médio'),
  capacidadeAtendimento: z.string().min(1, 'Selecione a capacidade'),
  regioesAtendidas: z.array(z.string()).min(1, 'Selecione pelo menos uma região'),
  cidadesFrequentes: z.string().optional(),
  diferenciais: z.array(z.string()).min(1, 'Selecione pelo menos um diferencial').max(3, 'Máximo 3 diferenciais'),
  diferenciaisOutro: z.string().optional(),
  nomeResponsavel: z.string().min(3, 'Nome é obrigatório'),
  telefone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('Email inválido'),
});

type FornecedoresFormData = z.infer<typeof fornecedoresSchema>;

const Fornecedores = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FornecedoresFormData>({
    resolver: zodResolver(fornecedoresSchema),
    defaultValues: {
      tiposAtuacao: [],
      categoriasAtendidas: [],
      regioesAtendidas: [],
      diferenciais: [],
    }
  });

  const tiposAtuacao = watch('tiposAtuacao') || [];
  const categoriasAtendidas = watch('categoriasAtendidas') || [];
  const regioesAtendidas = watch('regioesAtendidas') || [];
  const diferenciais = watch('diferenciais') || [];

  const handleCheckboxChange = (field: 'tiposAtuacao' | 'categoriasAtendidas' | 'regioesAtendidas' | 'diferenciais', value: string, currentValues: string[]) => {
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    setValue(field, newValues);
  };

  const onSubmit = async (data: FornecedoresFormData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('formulario_fornecedores').insert({
        nome_empresa: data.nomeEmpresa,
        cnpj_cpf: data.cnpjCpf,
        site: data.site || null,
        cidade: data.cidade,
        estado: data.estado,
        tempo_atuacao: data.tempoAtuacao,
        tipos_atuacao: data.tiposAtuacao,
        tipo_atuacao_outro: data.tipoAtuacaoOutro || null,
        categorias_atendidas: data.categoriasAtendidas,
        categorias_outro: data.categoriasOutro || null,
        ticket_medio: data.ticketMedio,
        capacidade_atendimento: data.capacidadeAtendimento,
        regioes_atendidas: data.regioesAtendidas,
        cidades_frequentes: data.cidadesFrequentes || null,
        diferenciais: data.diferenciais,
        diferenciais_outro: data.diferenciaisOutro || null,
        nome_responsavel: data.nomeResponsavel,
        telefone: data.telefone,
        email: data.email,
      });

      if (error) throw error;

      toast({
        title: 'Formulário enviado com sucesso!',
        description: 'Obrigado por se cadastrar. Entraremos em contato em breve.',
      });
      
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      toast({
        title: 'Erro ao enviar formulário',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormTemplate
      title="GRIFO BUILDERS CLUB"
      subtitle="Formulário de cadastro para fornecedores / distribuidores / lojas"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* 1. Informações da Empresa */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground border-b pb-2">
            1. Informações da Empresa / Prestador
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nomeEmpresa">Nome da empresa ou nome completo (MEI / autônomo) *</Label>
              <Input id="nomeEmpresa" {...register('nomeEmpresa')} placeholder="Nome da empresa" />
              {errors.nomeEmpresa && <p className="text-sm text-destructive mt-1">{errors.nomeEmpresa.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="cnpjCpf">CNPJ ou CPF *</Label>
              <Input id="cnpjCpf" {...register('cnpjCpf')} placeholder="00.000.000/0000-00" />
              {errors.cnpjCpf && <p className="text-sm text-destructive mt-1">{errors.cnpjCpf.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="site">Site / Portfólio (opcional)</Label>
            <Input id="site" {...register('site')} placeholder="https://..." />
            {errors.site && <p className="text-sm text-destructive mt-1">{errors.site.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cidade">Cidade *</Label>
              <Input id="cidade" {...register('cidade')} placeholder="Nome da cidade" />
              {errors.cidade && <p className="text-sm text-destructive mt-1">{errors.cidade.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="estado">Estado *</Label>
              <Select onValueChange={(value) => setValue('estado', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  {ESTADOS_BR.map(estado => (
                    <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.estado && <p className="text-sm text-destructive mt-1">{errors.estado.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="tempoAtuacao">Tempo de atuação *</Label>
            <Select onValueChange={(value) => setValue('tempoAtuacao', value)}>
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
            {errors.tempoAtuacao && <p className="text-sm text-destructive mt-1">{errors.tempoAtuacao.message}</p>}
          </div>
        </div>

        {/* 2. Tipo de Atuação */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground border-b pb-2">
            2. Tipo de Atuação
          </h2>
          
          <div>
            <Label>Você é: (múltipla escolha) *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {[
                'Loja de materiais de construção',
                'Distribuidor',
                'Fabricante',
                'Fornecedor de serviços',
                'Transportadora / logística',
                'Outro'
              ].map((tipo) => (
                <div key={tipo} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tipo-${tipo}`}
                    checked={tiposAtuacao.includes(tipo)}
                    onCheckedChange={() => handleCheckboxChange('tiposAtuacao', tipo, tiposAtuacao)}
                  />
                  <label htmlFor={`tipo-${tipo}`} className="text-sm cursor-pointer">{tipo}</label>
                </div>
              ))}
            </div>
            {errors.tiposAtuacao && <p className="text-sm text-destructive mt-1">{errors.tiposAtuacao.message}</p>}
            
            {tiposAtuacao.includes('Outro') && (
              <div className="mt-3">
                <Input {...register('tipoAtuacaoOutro')} placeholder="Especifique..." />
              </div>
            )}
          </div>

          <div>
            <Label>Categorias atendidas (múltipla escolha) *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {[
                'Estrutura', 'Alvenaria', 'Impermeabilização', 'Acabamento',
                'Hidráulica', 'Elétrica', 'Pintura', 'Drywall',
                'Marcenaria', 'Gesso', 'Serralheria', 'Demolição',
                'Locação de equipamentos', 'Entrega / logística', 'Outro'
              ].map((cat) => (
                <div key={cat} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${cat}`}
                    checked={categoriasAtendidas.includes(cat)}
                    onCheckedChange={() => handleCheckboxChange('categoriasAtendidas', cat, categoriasAtendidas)}
                  />
                  <label htmlFor={`cat-${cat}`} className="text-sm cursor-pointer">{cat}</label>
                </div>
              ))}
            </div>
            {errors.categoriasAtendidas && <p className="text-sm text-destructive mt-1">{errors.categoriasAtendidas.message}</p>}
            
            {categoriasAtendidas.includes('Outro') && (
              <div className="mt-3">
                <Input {...register('categoriasOutro')} placeholder="Especifique..." />
              </div>
            )}
          </div>
        </div>

        {/* 3. Faixa de Preço e Capacidade */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground border-b pb-2">
            3. Faixa de Preço e Capacidade
          </h2>
          
          <div>
            <Label htmlFor="ticketMedio">Ticket médio dos serviços/produtos *</Label>
            <Select onValueChange={(value) => setValue('ticketMedio', value)}>
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
            {errors.ticketMedio && <p className="text-sm text-destructive mt-1">{errors.ticketMedio.message}</p>}
          </div>

          <div>
            <Label htmlFor="capacidadeAtendimento">Capacidade de atendimento simultâneo *</Label>
            <Select onValueChange={(value) => setValue('capacidadeAtendimento', value)}>
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
            {errors.capacidadeAtendimento && <p className="text-sm text-destructive mt-1">{errors.capacidadeAtendimento.message}</p>}
          </div>
        </div>

        {/* 4. Regiões Atendidas */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground border-b pb-2">
            4. Regiões Atendidas
          </h2>
          
          <div>
            <Label>Regiões atendidas (múltipla escolha) *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {[
                'Região Norte',
                'Região Nordeste',
                'Região Centro-Oeste',
                'Região Sudeste',
                'Região Sul'
              ].map((regiao) => (
                <div key={regiao} className="flex items-center space-x-2">
                  <Checkbox
                    id={`regiao-${regiao}`}
                    checked={regioesAtendidas.includes(regiao)}
                    onCheckedChange={() => handleCheckboxChange('regioesAtendidas', regiao, regioesAtendidas)}
                  />
                  <label htmlFor={`regiao-${regiao}`} className="text-sm cursor-pointer">{regiao}</label>
                </div>
              ))}
            </div>
            {errors.regioesAtendidas && <p className="text-sm text-destructive mt-1">{errors.regioesAtendidas.message}</p>}
          </div>

          <div>
            <Label htmlFor="cidadesFrequentes">Cidades atendidas com maior frequência</Label>
            <Textarea
              id="cidadesFrequentes"
              {...register('cidadesFrequentes')}
              placeholder="Ex: São Paulo, Rio de Janeiro, Belo Horizonte..."
              rows={3}
            />
          </div>
        </div>

        {/* 5. Diferenciais */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground border-b pb-2">
            5. Diferenciais
          </h2>
          
          <div>
            <Label>Selecione até 3 diferenciais *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {[
                'Entrega rápida',
                'Equipe própria',
                'Garantia formal',
                'Preço competitivo',
                'Certificações técnicas',
                'Atendimento emergencial',
                'Experiência com obras de grande porte',
                'Outro'
              ].map((dif) => (
                <div key={dif} className="flex items-center space-x-2">
                  <Checkbox
                    id={`dif-${dif}`}
                    checked={diferenciais.includes(dif)}
                    onCheckedChange={() => handleCheckboxChange('diferenciais', dif, diferenciais)}
                    disabled={!diferenciais.includes(dif) && diferenciais.length >= 3}
                  />
                  <label htmlFor={`dif-${dif}`} className={`text-sm ${!diferenciais.includes(dif) && diferenciais.length >= 3 ? 'text-muted-foreground' : 'cursor-pointer'}`}>{dif}</label>
                </div>
              ))}
            </div>
            {errors.diferenciais && <p className="text-sm text-destructive mt-1">{errors.diferenciais.message}</p>}
            
            {diferenciais.includes('Outro') && (
              <div className="mt-3">
                <Input {...register('diferenciaisOutro')} placeholder="Especifique..." />
              </div>
            )}
          </div>
        </div>

        {/* 7. Contato Comercial */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground border-b pb-2">
            7. Contato Comercial
          </h2>
          
          <div>
            <Label htmlFor="nomeResponsavel">Nome do responsável *</Label>
            <Input id="nomeResponsavel" {...register('nomeResponsavel')} placeholder="Nome completo" />
            {errors.nomeResponsavel && <p className="text-sm text-destructive mt-1">{errors.nomeResponsavel.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefone">Telefone / WhatsApp *</Label>
              <Input id="telefone" {...register('telefone')} placeholder="(00) 00000-0000" />
              {errors.telefone && <p className="text-sm text-destructive mt-1">{errors.telefone.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="email">E-mail *</Label>
              <Input id="email" type="email" {...register('email')} placeholder="seu@email.com" />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enviar Inscrição
        </Button>
      </form>
    </FormTemplate>
  );
};

export default Fornecedores;
