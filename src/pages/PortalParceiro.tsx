import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, User, Building2, Truck, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
// Importar seus formulários existentes aqui para reutilizá-los ou criar versões de edição
// Para simplificar, vou simular a estrutura de edição

export default function PortalParceiro() {
  const { userSession, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin" /></div>;
  }

  if (!partnerData) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Perfil não encontrado</h1>
        <p>Não encontramos um cadastro vinculado a este usuário.</p>
        <Button onClick={handleLogout} className="mt-4">Sair</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Simples */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/lovable-uploads/grifo-logo-header.png" alt="Grifo" className="h-8" />
          <span className="text-sm font-medium px-2 py-1 bg-slate-100 rounded-md text-slate-600">
            Área do Parceiro
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600 hidden sm:inline">
            Olá, <strong>{partnerData.nome_completo || partnerData.nome_empresa}</strong>
          </span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-6 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Meu Perfil Profissional</h1>
          <p className="text-slate-500">Gerencie como você aparece no Marketplace da Grifo.</p>
        </div>

        <Tabs defaultValue="dados">
          <TabsList className="mb-6">
            <TabsTrigger value="dados">Dados Cadastrais</TabsTrigger>
            <TabsTrigger value="midia">Fotos e Portfólio</TabsTrigger>
            <TabsTrigger value="preview">Visualizar Cartão</TabsTrigger>
          </TabsList>

          <TabsContent value="dados">
            <Card>
              <CardHeader>
                <CardTitle>Editar Informações</CardTitle>
                <CardDescription>Mantenha seus contatos e especialidades atualizados.</CardDescription>
              </CardHeader>
              <CardContent>
                {/* AQUI VOCÊ PODE REUTILIZAR SEUS FORMULÁRIOS (PROFISSIONAIS, ETC) 
                    PASSANDO 'partnerData' COMO 'initialData' E MUDANDO O MODO PARA 'EDIT' */}
                <div className="p-8 border-2 border-dashed rounded-xl text-center text-slate-400">
                  Formulário de Edição de {partnerType?.toUpperCase()} será carregado aqui.
                  <br/>
                  (Reutilize os componentes de Form que criamos, adicionando a propriedade 'initialData')
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="midia">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Mídia</CardTitle>
                <CardDescription>Adicione novas fotos de obras recentes.</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="p-8 border-2 border-dashed rounded-xl text-center text-slate-400">
                  Componente de Upload de Fotos (PhotosSection) será carregado aqui.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
