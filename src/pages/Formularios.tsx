import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Filter, FileText, Building2, Users, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormSubmissionModal } from '@/components/FormSubmissionModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface FormularioCard {
  id: string;
  titulo: string;
  descricao: string;
  url: string;
}

interface FormSubmission {
  id: string;
  tipo: 'profissionais' | 'empresas' | 'fornecedores';
  nome: string;
  created_at: string;
  data: any;
}

const formularios: FormularioCard[] = [
  {
    id: 'profissionais',
    titulo: 'Profissionais',
    descricao: 'Formulário de cadastro para profissionais',
    url: `${window.location.origin}/form/profissionais`
  },
  {
    id: 'empresas',
    titulo: 'Empresas',
    descricao: 'Formulário de cadastro para empresas',
    url: `${window.location.origin}/form/empresas`
  },
  {
    id: 'fornecedores',
    titulo: 'Fornecedores',
    descricao: 'Formulário de cadastro para fornecedores',
    url: `${window.location.origin}/form/fornecedores`
  }
];

const Formularios = () => {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos');
  const [dataInicio, setDataInicio] = useState<Date | undefined>();
  const [dataFim, setDataFim] = useState<Date | undefined>();
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [submissions, tipoFiltro, dataInicio, dataFim]);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const allSubmissions: FormSubmission[] = [];

      // Load Profissionais
      const { data: profissionais, error: errorProf } = await supabase
        .from('formulario_profissionais')
        .select('*')
        .order('created_at', { ascending: false });

      if (!errorProf && profissionais) {
        profissionais.forEach((item) => {
          allSubmissions.push({
            id: item.id,
            tipo: 'profissionais',
            nome: item.nome_completo,
            created_at: item.created_at || '',
            data: item,
          });
        });
      }

      // Load Empresas
      const { data: empresas, error: errorEmp } = await supabase
        .from('formulario_empresas')
        .select('*')
        .order('created_at', { ascending: false });

      if (!errorEmp && empresas) {
        empresas.forEach((item) => {
          allSubmissions.push({
            id: item.id,
            tipo: 'empresas',
            nome: item.nome_empresa,
            created_at: item.created_at || '',
            data: item,
          });
        });
      }

      // Load Fornecedores
      const { data: fornecedores, error: errorForn } = await supabase
        .from('formulario_fornecedores')
        .select('*')
        .order('created_at', { ascending: false });

      if (!errorForn && fornecedores) {
        fornecedores.forEach((item) => {
          allSubmissions.push({
            id: item.id,
            tipo: 'fornecedores',
            nome: item.nome_empresa,
            created_at: item.created_at || '',
            data: item,
          });
        });
      }

      // Sort by date
      allSubmissions.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setSubmissions(allSubmissions);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar cadastros.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...submissions];

    // Filter by type
    if (tipoFiltro !== 'todos') {
      filtered = filtered.filter(sub => sub.tipo === tipoFiltro);
    }

    // Filter by date range
    if (dataInicio) {
      filtered = filtered.filter(sub => 
        new Date(sub.created_at) >= dataInicio
      );
    }

    if (dataFim) {
      const endOfDay = new Date(dataFim);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter(sub => 
        new Date(sub.created_at) <= endOfDay
      );
    }

    setFilteredSubmissions(filtered);
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const handleOpenLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleViewDetails = (submission: FormSubmission) => {
    setSelectedSubmission(submission);
    setIsModalOpen(true);
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'profissionais':
        return <Users className="h-4 w-4" />;
      case 'empresas':
        return <Building2 className="h-4 w-4" />;
      case 'fornecedores':
        return <Briefcase className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'profissionais':
        return 'Profissional';
      case 'empresas':
        return 'Empresa';
      case 'fornecedores':
        return 'Fornecedor';
      default:
        return tipo;
    }
  };

  const getTipoBadgeVariant = (tipo: string): "default" | "secondary" | "outline" => {
    switch (tipo) {
      case 'profissionais':
        return 'default';
      case 'empresas':
        return 'secondary';
      case 'fornecedores':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Links Section */}
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Formulários Públicos</h1>
          <p className="text-muted-foreground mt-2">
            Compartilhe links dos formulários de cadastro
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {formularios.map((formulario) => (
            <Card key={formulario.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{formulario.titulo}</CardTitle>
                <CardDescription className="text-sm">{formulario.descricao}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-muted p-2 rounded-md">
                  <code className="text-xs text-foreground break-all">
                    {formulario.url}
                  </code>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleCopyLink(formulario.url)}
                  >
                    <Copy className="mr-2 h-3 w-3" />
                    Copiar Link
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenLink(formulario.url)}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Submissions Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Cadastros Recebidos</h2>
          <p className="text-muted-foreground mt-2">
            Visualize todos os cadastros submetidos através dos formulários
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="profissionais">Profissionais</SelectItem>
                    <SelectItem value="empresas">Empresas</SelectItem>
                    <SelectItem value="fornecedores">Fornecedores</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Início</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dataInicio && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataInicio ? format(dataInicio, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataInicio}
                      onSelect={setDataInicio}
                      locale={ptBR}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Fim</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dataFim && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataFim ? format(dataFim, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataFim}
                      onSelect={setDataFim}
                      locale={ptBR}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {(tipoFiltro !== 'todos' || dataInicio || dataFim) && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTipoFiltro('todos');
                    setDataInicio(undefined);
                    setDataFim(undefined);
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submissions Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Total: {filteredSubmissions.length} cadastro{filteredSubmissions.length !== 1 ? 's' : ''}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum cadastro encontrado
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{submission.nome}</TableCell>
                      <TableCell>
                        <Badge variant={getTipoBadgeVariant(submission.tipo)} className="flex items-center gap-1 w-fit">
                          {getTipoIcon(submission.tipo)}
                          {getTipoLabel(submission.tipo)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(submission.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(submission)}
                        >
                          Ver Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      {selectedSubmission && (
        <FormSubmissionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSubmission(null);
          }}
          submission={selectedSubmission}
        />
      )}
    </div>
  );
};

export default Formularios;
