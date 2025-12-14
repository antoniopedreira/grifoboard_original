import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Building2, User, Truck, MapPin, Star, Filter } from "lucide-react";
import { MarketplaceCard } from "@/components/marketplace/MarketplaceCard";
import { MarketplaceDetailModal } from "@/components/marketplace/MarketplaceDetailModal";
import { Skeleton } from "@/components/ui/skeleton";

type TargetType = "empresa" | "profissional" | "fornecedor";

interface MarketplaceItem {
  id: string;
  type: TargetType;
  name: string;
  location: string;
  categories?: string[];
  rating: number;
  reviewCount: number;
  data: any;
}

const REGIOES = [
  "Norte",
  "Nordeste", 
  "Centro-Oeste",
  "Sudeste",
  "Sul"
];

const Marketplace = () => {
  const { userSession } = useAuth();
  const [activeTab, setActiveTab] = useState<TargetType>("profissional");
  const [searchTerm, setSearchTerm] = useState("");
  const [regiaoFiltro, setRegiaoFiltro] = useState<string>("all");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empresasRes, profissionaisRes, fornecedoresRes, reviewsRes] = await Promise.all([
        supabase.from("formulario_empresas").select("*"),
        supabase.from("formulario_profissionais").select("*"),
        supabase.from("formulario_fornecedores").select("*"),
        supabase.from("marketplace_reviews").select("*")
      ]);

      if (empresasRes.data) setEmpresas(empresasRes.data);
      if (profissionaisRes.data) setProfissionais(profissionaisRes.data);
      if (fornecedoresRes.data) setFornecedores(fornecedoresRes.data);
      if (reviewsRes.data) setReviews(reviewsRes.data);
    } catch (error) {
      console.error("Error fetching marketplace data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getAverageRating = (targetType: TargetType, targetId: string) => {
    const targetReviews = reviews.filter(
      r => r.target_type === targetType && r.target_id === targetId
    );
    if (targetReviews.length === 0) return { rating: 0, count: 0 };
    const avg = targetReviews.reduce((acc, r) => acc + r.rating, 0) / targetReviews.length;
    return { rating: Math.round(avg * 10) / 10, count: targetReviews.length };
  };

  const processedItems = useMemo(() => {
    let items: MarketplaceItem[] = [];

    if (activeTab === "empresa") {
      items = empresas.map(e => {
        const { rating, count } = getAverageRating("empresa", e.id);
        return {
          id: e.id,
          type: "empresa" as TargetType,
          name: e.nome_empresa,
          location: `${e.cidade}, ${e.estado}`,
          categories: e.tipos_obras || [],
          rating,
          reviewCount: count,
          data: e
        };
      });
    } else if (activeTab === "profissional") {
      items = profissionais.map(p => {
        const { rating, count } = getAverageRating("profissional", p.id);
        return {
          id: p.id,
          type: "profissional" as TargetType,
          name: p.nome_completo,
          location: `${p.cidade}, ${p.estado}`,
          categories: p.especialidades || [],
          rating,
          reviewCount: count,
          data: p
        };
      });
    } else {
      items = fornecedores.map(f => {
        const { rating, count } = getAverageRating("fornecedor", f.id);
        return {
          id: f.id,
          type: "fornecedor" as TargetType,
          name: f.nome_empresa,
          location: `${f.cidade}, ${f.estado}`,
          categories: f.categorias_atendidas || [],
          rating,
          reviewCount: count,
          data: f
        };
      });
    }

    // Apply filters
    if (searchTerm) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categories?.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (regiaoFiltro && regiaoFiltro !== "all") {
      items = items.filter(item => {
        const data = item.data;
        const regioes = data.regioes_atendidas || [];
        return regioes.includes(regiaoFiltro);
      });
    }

    if (categoriaFiltro && categoriaFiltro !== "all") {
      items = items.filter(item => 
        item.categories?.includes(categoriaFiltro)
      );
    }

    return items;
  }, [activeTab, empresas, profissionais, fornecedores, reviews, searchTerm, regiaoFiltro, categoriaFiltro]);

  const availableCategories = useMemo(() => {
    let categories: string[] = [];
    if (activeTab === "empresa") {
      empresas.forEach(e => {
        if (e.tipos_obras) categories.push(...e.tipos_obras);
      });
    } else if (activeTab === "profissional") {
      profissionais.forEach(p => {
        if (p.especialidades) categories.push(...p.especialidades);
      });
    } else {
      fornecedores.forEach(f => {
        if (f.categorias_atendidas) categories.push(...f.categorias_atendidas);
      });
    }
    return [...new Set(categories)].sort();
  }, [activeTab, empresas, profissionais, fornecedores]);

  const handleCardClick = (item: MarketplaceItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleReviewSubmitted = () => {
    fetchData();
  };

  const getTabIcon = (type: TargetType) => {
    switch (type) {
      case "empresa": return <Building2 className="h-4 w-4" />;
      case "profissional": return <User className="h-4 w-4" />;
      case "fornecedor": return <Truck className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Marketplace</h1>
          <p className="text-muted-foreground">
            Encontre profissionais, empresas e fornecedores para sua obra
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-xl border shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, cidade ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <Select value={regiaoFiltro} onValueChange={setRegiaoFiltro}>
                <SelectTrigger className="w-[160px]">
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Região" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas regiões</SelectItem>
                  {REGIOES.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas categorias</SelectItem>
                  {availableCategories.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => {
          setActiveTab(v as TargetType);
          setCategoriaFiltro("all");
        }}>
          <TabsList className="mb-6 bg-muted/50">
            <TabsTrigger value="profissional" className="gap-2">
              <User className="h-4 w-4" />
              Profissionais
            </TabsTrigger>
            <TabsTrigger value="fornecedor" className="gap-2">
              <Truck className="h-4 w-4" />
              Fornecedores
            </TabsTrigger>
            <TabsTrigger value="empresa" className="gap-2">
              <Building2 className="h-4 w-4" />
              Empresas
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-xl" />
                ))}
              </div>
            ) : processedItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  {getTabIcon(activeTab)}
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhum resultado encontrado
                </h3>
                <p className="text-muted-foreground">
                  Tente ajustar os filtros ou a busca
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {processedItems.map((item) => (
                  <MarketplaceCard
                    key={item.id}
                    item={item}
                    onClick={() => handleCardClick(item)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Modal */}
      <MarketplaceDetailModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
};

export default Marketplace;
