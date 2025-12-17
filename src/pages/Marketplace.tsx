import { useState, useEffect } from "react";
import MainHeader from "@/components/MainHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Loader2, Building2, User, Truck } from "lucide-react";
import { MarketplaceCard } from "@/components/marketplace/MarketplaceCard";
import { MarketplaceDetailModal } from "@/components/marketplace/MarketplaceDetailModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Definição unificada do Item
interface MarketplaceItem {
  id: string;
  type: "empresa" | "profissional" | "fornecedor";
  name: string;
  location: string;
  categories: string[];
  rating: number; // Placeholder por enquanto (ou busca de reviews)
  reviewCount: number;
  data: any; // Objeto completo do banco para o Modal usar
}

export default function Marketplace() {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("todos");

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  const fetchMarketplaceData = async () => {
    setLoading(true);
    try {
      // 1. Buscar Profissionais
      const { data: profs, error: errProfs } = await supabase.from("formulario_profissionais").select("*");

      // 2. Buscar Empresas
      const { data: empresas, error: errEmp } = await supabase.from("formulario_empresas").select("*");

      // 3. Buscar Fornecedores
      const { data: fornecedores, error: errForn } = await supabase.from("formulario_fornecedores").select("*");

      if (errProfs || errEmp || errForn) {
        console.error("Erro ao buscar dados:", errProfs, errEmp, errForn);
        toast.error("Erro ao carregar o marketplace.");
        return;
      }

      const allItems: MarketplaceItem[] = [];

      // Mapear Profissionais
      profs?.forEach((p) => {
        // Tenta parsear especialidades se for string JSON, ou usa array direto, ou string única
        let cats: string[] = [];
        if (Array.isArray(p.especialidades)) cats = p.especialidades;
        else if (typeof p.especialidades === "string") {
          try {
            cats = JSON.parse(p.especialidades);
          } catch {
            cats = [p.especialidades];
          }
        } else {
          cats = [p.funcao_principal]; // Fallback
        }

        allItems.push({
          id: p.id,
          type: "profissional",
          name: p.nome_completo || "Sem Nome",
          location: p.cidade && p.estado ? `${p.cidade} - ${p.estado}` : "Localização não inf.",
          categories: cats,
          rating: 5.0, // Placeholder: Futuro -> buscar média de reviews
          reviewCount: 0,
          data: p, // Guarda tudo para o Modal
        });
      });

      // Mapear Empresas
      empresas?.forEach((e) => {
        let cats: string[] = [];
        if (Array.isArray(e.tipos_obras)) cats = e.tipos_obras;
        else if (typeof e.tipos_obras === "string") {
          try {
            cats = JSON.parse(e.tipos_obras);
          } catch {
            cats = [e.tipos_obras];
          }
        }

        allItems.push({
          id: e.id,
          type: "empresa",
          name: e.nome_empresa || "Empresa Sem Nome",
          location: e.cidade && e.estado ? `${e.cidade} - ${e.estado}` : "Localização não inf.",
          categories: cats,
          rating: 5.0,
          reviewCount: 0,
          data: e,
        });
      });

      // Mapear Fornecedores
      fornecedores?.forEach((f) => {
        let cats: string[] = [];
        if (Array.isArray(f.categorias_atendidas)) cats = f.categorias_atendidas;
        else if (typeof f.categorias_atendidas === "string") {
          try {
            cats = JSON.parse(f.categorias_atendidas);
          } catch {
            cats = [f.categorias_atendidas];
          }
        }

        allItems.push({
          id: f.id,
          type: "fornecedor",
          name: f.nome_empresa || "Fornecedor Sem Nome",
          location: f.cidade && f.estado ? `${f.cidade} - ${f.estado}` : "Localização não inf.",
          categories: cats,
          rating: 5.0,
          reviewCount: 0,
          data: f,
        });
      });

      setItems(allItems);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (item: MarketplaceItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  // Lógica de Filtro
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categories.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTab =
      activeTab === "todos" ||
      (activeTab === "profissionais" && item.type === "profissional") ||
      (activeTab === "empresas" && item.type === "empresa") ||
      (activeTab === "fornecedores" && item.type === "fornecedor");

    return matchesSearch && matchesTab;
  });

  return (
    <div className="min-h-screen bg-slate-50/50">
      <MainHeader onNewTaskClick={() => {}} onRegistryClick={() => {}} onChecklistClick={() => {}} />

      <main className="container mx-auto px-4 py-8 mt-16 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Marketplace Grifo</h1>
          <p className="text-slate-500 mt-2">
            Encontre os melhores profissionais e parceiros homologados para sua obra.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Buscar por nome, cidade ou especialidade..."
              className="pl-10 h-12 bg-white shadow-sm border-slate-200 text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-12 px-6 gap-2 bg-white border-slate-200 hover:bg-slate-50">
            <Filter className="h-4 w-4" /> Filtros Avançados
          </Button>
        </div>

        {/* Tabs & Content */}
        <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white p-1 border border-slate-200 h-12 shadow-sm rounded-lg w-full md:w-auto overflow-x-auto flex justify-start">
            <TabsTrigger
              value="todos"
              className="h-9 px-6 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 font-medium"
            >
              Todos
            </TabsTrigger>
            <TabsTrigger
              value="profissionais"
              className="h-9 px-6 gap-2 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
            >
              <User className="h-4 w-4" /> Profissionais
            </TabsTrigger>
            <TabsTrigger
              value="empresas"
              className="h-9 px-6 gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <Building2 className="h-4 w-4" /> Empresas
            </TabsTrigger>
            <TabsTrigger
              value="fornecedores"
              className="h-9 px-6 gap-2 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700"
            >
              <Truck className="h-4 w-4" /> Fornecedores
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-500 text-lg">Nenhum resultado encontrado para sua busca.</p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveTab("todos");
                  }}
                >
                  Limpar filtros
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <MarketplaceCard key={item.id} item={item} onClick={() => handleCardClick(item)} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal de Detalhes */}
      <MarketplaceDetailModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReviewSubmitted={fetchMarketplaceData} // Recarrega para atualizar reviews se necessário
      />
    </div>
  );
}
