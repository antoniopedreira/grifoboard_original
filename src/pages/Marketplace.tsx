import { useState } from "react";
import MainHeader from "@/components/MainHeader";
import MarketplaceCard from "@/components/marketplace/MarketplaceCard";
import MarketplaceDetailModal from "@/components/marketplace/MarketplaceDetailModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Store, Hammer, Truck, Package, Briefcase, Filter } from "lucide-react";
import { motion } from "framer-motion";

// Mock Data (Simulando banco de dados)
const ITEMS = [
  {
    id: 1,
    title: "Mão de Obra Especializada",
    description: "Equipe completa de pedreiros e serventes com experiência em alvenaria estrutural.",
    category: "Mão de Obra",
    type: "Serviço",
    location: "Salvador, BA",
    rating: 4.8,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=400",
    tags: ["Alvenaria", "Acabamento"],
    contact: { name: "Empreiteira Silva", phone: "71999999999" },
  },
  {
    id: 2,
    title: "Aluguel de Betoneira 400L",
    description: "Betoneira elétrica 400 litros, ideal para obras de pequeno e médio porte. Diária ou mensal.",
    category: "Equipamentos",
    type: "Locação",
    location: "Lauro de Freitas, BA",
    rating: 4.9,
    reviews: 56,
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=400",
    tags: ["Maquinário", "Concretagem"],
    contact: { name: "LocaTudo Equipamentos", phone: "71988888888" },
  },
  {
    id: 3,
    title: "Cimento CP-II (Saco 50kg)",
    description: "Cimento Portland composto, versátil para todas as etapas da obra. Venda direta de fábrica.",
    category: "Materiais",
    type: "Venda",
    location: "Camaçari, BA",
    rating: 4.5,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400",
    tags: ["Básico", "Estrutura"],
    contact: { name: "Depósito Central", phone: "71977777777" },
  },
  {
    id: 4,
    title: "Projeto Elétrico Residencial",
    description: "Elaboração de projetos elétricos completos com ART e aprovação na Coelba.",
    category: "Serviços",
    type: "Projetos",
    location: "Remoto / Salvador",
    rating: 5.0,
    reviews: 32,
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400",
    tags: ["Engenharia", "Elétrica"],
    contact: { name: "Eng. Roberto Alves", phone: "71966666666" },
  },
  {
    id: 5,
    title: "Areia Lavada Média (Caminhão)",
    description: "Areia lavada média de alta qualidade, livre de impurezas. Caminhão fechado 12m³.",
    category: "Materiais",
    type: "Venda",
    location: "Simões Filho, BA",
    rating: 4.2,
    reviews: 15,
    image: "https://images.unsplash.com/photo-1605114676921-2785bd5d9565?auto=format&fit=crop&q=80&w=400",
    tags: ["Agregados", "Básico"],
    contact: { name: "Areal Vitória", phone: "71955555555" },
  },
];

const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("todos");

  // Lógica de Filtro
  const filteredItems = ITEMS.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      activeTab === "todos"
        ? true
        : activeTab === "mao_de_obra"
          ? item.category === "Mão de Obra"
          : activeTab === "materiais"
            ? item.category === "Materiais"
            : activeTab === "equipamentos"
              ? item.category === "Equipamentos"
              : activeTab === "servicos"
                ? item.category === "Serviços"
                : true;

    return matchesSearch && matchesCategory;
  });

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
              Conecte-se com os melhores fornecedores, prestadores de serviço e locadores de equipamentos da sua região.
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
              placeholder="O que você precisa para sua obra hoje?"
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
                Todos
              </TabsTrigger>
              <TabsTrigger
                value="mao_de_obra"
                className="rounded-full px-6 py-2.5 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                <Hammer className="h-4 w-4" /> Mão de Obra
              </TabsTrigger>
              <TabsTrigger
                value="materiais"
                className="rounded-full px-6 py-2.5 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                <Package className="h-4 w-4" /> Materiais
              </TabsTrigger>
              <TabsTrigger
                value="equipamentos"
                className="rounded-full px-6 py-2.5 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                <Truck className="h-4 w-4" /> Equipamentos
              </TabsTrigger>
              <TabsTrigger
                value="servicos"
                className="rounded-full px-6 py-2.5 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                <Briefcase className="h-4 w-4" /> Serviços
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="mt-0 focus-visible:ring-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.length > 0 ? (
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
                  <p className="text-sm">Tente buscar por outros termos ou categorias.</p>
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
