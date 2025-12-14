import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import MainHeader from "@/components/MainHeader";
import { MarketplaceCard } from "@/components/marketplace/MarketplaceCard";
import { MarketplaceDetailModal } from "@/components/marketplace/MarketplaceDetailModal";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Store, Hammer, Truck, Briefcase, Filter } from "lucide-react";
import { motion } from "framer-motion";

// Types for marketplace items
export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  category: "Profissional" | "Empresa" | "Fornecedor";
  type: string;
  location: string;
  rating: number;
  reviews: number;
  image: string | null;
  tags: string[];
  rawData: any;
}

// Fetch functions
const fetchProfissionais = async () => {
  const { data, error } = await supabase
    .from("formulario_profissionais")
    .select("*");
  if (error) throw error;
  return data || [];
};

const fetchEmpresas = async () => {
  const { data, error } = await supabase
    .from("formulario_empresas")
    .select("*");
  if (error) throw error;
  return data || [];
};

const fetchFornecedores = async () => {
  const { data, error } = await supabase
    .from("formulario_fornecedores")
    .select("*");
  if (error) throw error;
  return data || [];
};

// Transform functions
const transformProfissional = (p: any): MarketplaceItem => ({
  id: p.id,
  title: p.nome_completo,
  description: `${p.funcao_principal}${p.especialidades?.length ? ` • Especialidades: ${p.especialidades.slice(0, 2).join(", ")}` : ""}`,
  category: "Profissional",
  type: p.modalidade_trabalho || "Autônomo",
  location: `${p.cidade}, ${p.estado}`,
  rating: 0,
  reviews: 0,
  image: null,
  tags: [...(p.especialidades || []).slice(0, 3), p.funcao_principal].filter(Boolean),
  rawData: p,
});

const transformEmpresa = (e: any): MarketplaceItem => ({
  id: e.id,
  title: e.nome_empresa,
  description: `${e.tamanho_empresa} • ${e.tipos_obras?.slice(0, 2).join(", ") || "Construção"}`,
  category: "Empresa",
  type: e.tamanho_empresa || "Empresa",
  location: `${e.cidade}, ${e.estado}`,
  rating: 0,
  reviews: 0,
  image: e.logo_path || null,
  tags: (e.tipos_obras || []).slice(0, 3),
  rawData: e,
});

const transformFornecedor = (f: any): MarketplaceItem => ({
  id: f.id,
  title: f.nome_empresa,
  description: `${f.tipos_atuacao?.slice(0, 2).join(", ") || "Fornecedor"} • ${f.categorias_atendidas?.slice(0, 2).join(", ") || ""}`,
  category: "Fornecedor",
  type: f.tipos_atuacao?.[0] || "Fornecedor",
  location: `${f.cidade}, ${f.estado}`,
  rating: 0,
  reviews: 0,
  image: f.logo_path || null,
  tags: [...(f.categorias_atendidas || []).slice(0, 3)],
  rawData: f,
});

const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [activeTab, setActiveTab] = useState("todos");

  // Fetch data from Supabase
  const { data: profissionais = [], isLoading: loadingProf } = useQuery({
    queryKey: ["marketplace-profissionais"],
    queryFn: fetchProfissionais,
  });

  const { data: empresas = [], isLoading: loadingEmp } = useQuery({
    queryKey: ["marketplace-empresas"],
    queryFn: fetchEmpresas,
  });

  const { data: fornecedores = [], isLoading: loadingForn } = useQuery({
    queryKey: ["marketplace-fornecedores"],
    queryFn: fetchFornecedores,
  });

  const isLoading = loadingProf || loadingEmp || loadingForn;

  // Transform and combine all items
  const allItems = useMemo(() => {
    const profItems = profissionais.map(transformProfissional);
    const empItems = empresas.map(transformEmpresa);
    const fornItems = fornecedores.map(transformFornecedor);
    return [...profItems, ...empItems, ...fornItems];
  }, [profissionais, empresas, fornecedores]);

  // Filter logic
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        activeTab === "todos"
          ? true
          : activeTab === "profissionais"
            ? item.category === "Profissional"
            : activeTab === "empresas"
              ? item.category === "Empresa"
              : activeTab === "fornecedores"
                ? item.category === "Fornecedor"
                : true;

      return matchesSearch && matchesCategory;
    });
  }, [allItems, searchTerm, activeTab]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header Global */}
      <div className="container mx-auto max-w-[1600px] px-4 sm:px-6 pt-6">
        <MainHeader onNewTaskClick={() => {}} onRegistryClick={() => {}} onChecklistClick={() => {}} />
      </div>

      {/* Hero Section do Marketplace */}
      <div className="bg-white border-b border-slate-200 pt-8 pb-12 px-4 sm:px-6 mb-8 mt-6">
        <div className="container mx-auto max-w-[1200px] text-center space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center justify-center p-3 bg-secondary/10 rounded-full mb-4">
              <Store className="h-8 w-8 text-secondary" />
            </div>
            <h1 className="text-4xl font-heading font-bold text-slate-900 mb-2">Marketplace da Construção</h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Conecte-se com os melhores profissionais, empresas e fornecedores cadastrados na plataforma.
            </p>
          </motion.div>

          {/* Barra de Busca Grande */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="max-w-2xl mx-auto relative group"
          >
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-secondary transition-colors" />
            </div>
            <Input
              placeholder="Buscar profissionais, empresas ou fornecedores..."
              className="h-14 pl-12 pr-4 rounded-full border-slate-200 shadow-sm text-base focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button className="absolute right-2 top-2 h-10 rounded-full px-6 bg-secondary hover:bg-secondary/90 transition-all">
              Buscar
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto max-w-[1600px] px-4 sm:px-6">
        <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Navegação de Categorias */}
          <div className="flex justify-center">
            <TabsList className="h-auto p-1.5 bg-white border border-slate-200 rounded-full shadow-sm overflow-x-auto flex-nowrap justify-start sm:justify-center w-full sm:w-auto">
              <TabsTrigger
                value="todos"
                className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Todos ({allItems.length})
              </TabsTrigger>
              <TabsTrigger
                value="profissionais"
                className="rounded-full px-6 py-2.5 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                <Hammer className="h-4 w-4" /> Profissionais ({profissionais.length})
              </TabsTrigger>
              <TabsTrigger
                value="empresas"
                className="rounded-full px-6 py-2.5 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                <Briefcase className="h-4 w-4" /> Empresas ({empresas.length})
              </TabsTrigger>
              <TabsTrigger
                value="fornecedores"
                className="rounded-full px-6 py-2.5 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                <Truck className="h-4 w-4" /> Fornecedores ({fornecedores.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="mt-0 focus-visible:ring-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isLoading ? (
                <div className="col-span-full py-20 text-center text-slate-400">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p>Carregando...</p>
                </div>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <MarketplaceCard item={item} onClick={() => setSelectedItem(item)} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                  <Filter className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">Nenhum item encontrado.</p>
                  <p className="text-sm">Cadastre profissionais, empresas ou fornecedores nos formulários públicos.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <MarketplaceDetailModal item={selectedItem} isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
};

export default Marketplace;
