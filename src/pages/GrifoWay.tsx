import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { gamificationService, type RankingItem, type GamificationProfile } from "@/services/gamificationService";
import {
  Trophy,
  Zap,
  Target,
  Shield,
  BookOpen,
  Crown,
  Flame,
  CheckCircle2,
  Medal,
  TrendingUp,
  Users,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- COMPONENTES AUXILIARES ---

const LevelBadge = ({ level }: { level: number }) => {
  let label = "Iniciante";
  let color = "bg-slate-500";

  if (level >= 3) {
    label = "Intermediário";
    color = "bg-blue-600";
  }
  if (level >= 7) {
    label = "Avançado";
    color = "bg-purple-600";
  }
  if (level >= 10) {
    label = "Elite FAST";
    color = "bg-[#C7A347] text-white shadow-lg border-yellow-400";
  }

  return (
    <Badge className={cn("px-3 py-1 text-xs font-bold uppercase tracking-wider", color)}>
      Nível {level} - {label}
    </Badge>
  );
};

const XPProgressBar = ({ current, level }: { current: number; level: number }) => {
  // Calcula XP necessário para o próximo nível (Ex: Nível 1 = 0-1000, Nível 2 = 1000-2000)
  const previousLevelXP = (level - 1) * 1000;
  const nextLevelXP = level * 1000;
  const progressInLevel = current - previousLevelXP;
  const percentage = Math.min(100, Math.max(0, (progressInLevel / 1000) * 100));

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-wide">
        <span>Progresso do Nível {level}</span>
        <span>Próximo Nível</span>
      </div>
      <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
        <div
          className="h-full bg-gradient-to-r from-yellow-500 to-[#C7A347] transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs font-medium text-slate-600">
        <span>{current} XP Total</span>
        <span>{nextLevelXP} XP Meta</span>
      </div>
    </div>
  );
};

// --- PÁGINA PRINCIPAL ---

const GrifoWay = () => {
  const { userSession } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [ranking, setRanking] = useState<RankingItem[]>([]);

  // Carregar dados reais
  useEffect(() => {
    const loadData = async () => {
      if (!userSession?.user?.id) return;
      try {
        const [profData, rankData] = await Promise.all([
          gamificationService.getProfile(userSession.user.id),
          gamificationService.getRanking(),
        ]);

        // Se não tiver perfil ainda, cria um local visualmente zerado
        setProfile(profData || { id: userSession.user.id, xp_total: 0, level_current: 1, current_streak: 0 });
        setRanking(rankData || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userSession]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-[#C7A347]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header com Identidade Grifo */}
      <div className="bg-[#112131] text-white pb-24 pt-10 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C7A347] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="container mx-auto max-w-[1400px] relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <Zap className="h-6 w-6 text-[#C7A347]" />
                </div>
                <h1 className="text-3xl font-bold font-heading tracking-tight">The Grifo Way</h1>
              </div>
              <p className="text-slate-300 max-w-xl text-lg">
                A cultura é o motor que sustenta a velocidade.{" "}
                <span className="text-[#C7A347] font-semibold">Não existe FAST sem disciplina.</span>
              </p>
            </div>

            {/* Status Rápido */}
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-md">
              <div className="text-center px-4 border-r border-white/10">
                <div className="text-2xl font-bold text-[#C7A347]">{profile?.current_streak || 0}</div>
                <div className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1">
                  <Flame className="h-3 w-3" /> Streak
                </div>
              </div>
              <div className="text-center px-2">
                <div className="text-2xl font-bold text-white">
                  #{ranking.find((r) => r.id === userSession?.user?.id)?.position || "-"}
                </div>
                <div className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1">
                  <Trophy className="h-3 w-3" /> Ranking
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-[1400px] px-4 sm:px-6 -mt-16 relative z-20">
        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-center md:justify-start">
            <TabsList className="bg-white shadow-lg border border-slate-100 p-1 rounded-xl h-auto">
              <TabsTrigger
                value="dashboard"
                className="px-6 py-3 rounded-lg data-[state=active]:bg-[#112131] data-[state=active]:text-white transition-all gap-2 flex items-center"
              >
                <Trophy className="h-4 w-4" />
                Meu Desempenho
              </TabsTrigger>
              <TabsTrigger
                value="manual"
                className="px-6 py-3 rounded-lg data-[state=active]:bg-[#112131] data-[state=active]:text-white transition-all gap-2 flex items-center"
              >
                <BookOpen className="h-4 w-4" />
                Manual de Cultura
              </TabsTrigger>
            </TabsList>
          </div>

          {/* --- TAB DASHBOARD --- */}
          <TabsContent value="dashboard" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Coluna Esquerda: Perfil e Stats */}
              <div className="space-y-6">
                <Card className="border-none shadow-xl bg-white overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-slate-100 to-slate-200" />
                  <CardContent className="pt-12 px-6 pb-6 relative text-center">
                    <div className="relative inline-block mb-4">
                      <Avatar className="h-24 w-24 border-4 border-white shadow-md mx-auto">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-[#112131] text-white text-2xl font-bold">
                          {userSession?.user?.email?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                        <LevelBadge level={profile?.level_current || 1} />
                      </div>
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 mb-1 mt-2">
                      {userSession?.user?.user_metadata?.full_name || "Colaborador Grifo"}
                    </h2>

                    <div className="mt-4">
                      <XPProgressBar current={profile?.xp_total || 0} level={profile?.level_current || 1} />
                    </div>
                  </CardContent>
                </Card>

                {/* Quests Fixas (Apenas visual por enquanto) */}
                <Card className="border-none shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Target className="h-5 w-5 text-red-500" />
                      Missões Diárias
                    </CardTitle>
                    <CardDescription>Conclua rituais para ganhar XP</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-white border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-slate-100 text-slate-500">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">Preencher Diário de Obra</span>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-100">
                        +50 XP
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-white border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-slate-100 text-slate-500">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">Concluir Checklist FAST</span>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-100">
                        +30 XP
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Coluna Direita: Ranking Real */}
              <div className="lg:col-span-2">
                <Card className="border-none shadow-xl h-full flex flex-col">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-[#C7A347]" />
                        Ranking FAST 2.0
                      </CardTitle>
                    </div>
                    <CardDescription>Top colaboradores por XP acumulado</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 p-0">
                    {ranking.length === 0 ? (
                      <div className="p-8 text-center text-slate-500">
                        Nenhum colaborador pontuou ainda. Seja o primeiro!
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {ranking.map((user, index) => (
                          <div
                            key={user.id}
                            className={cn(
                              "flex items-center gap-4 p-4 transition-colors hover:bg-slate-50",
                              user.id === userSession?.user?.id && "bg-blue-50/50",
                            )}
                          >
                            <div className="flex-shrink-0 w-8 text-center font-bold text-slate-400">
                              {index === 0 ? (
                                <Medal className="h-6 w-6 text-yellow-500 mx-auto" />
                              ) : index === 1 ? (
                                <Medal className="h-6 w-6 text-slate-400 mx-auto" />
                              ) : index === 2 ? (
                                <Medal className="h-6 w-6 text-amber-700 mx-auto" />
                              ) : (
                                `#${index + 1}`
                              )}
                            </div>

                            <Avatar className="h-10 w-10 border border-slate-200">
                              <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-xs">
                                {user.nome.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-slate-900 truncate">{user.nome}</p>
                                {user.id === userSession?.user?.id && (
                                  <Badge variant="outline" className="text-[10px] h-4 px-1">
                                    Você
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span>{user.role}</span>
                                <span>•</span>
                                <span className="text-[#C7A347] font-medium">Nível {user.level_current}</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="block text-sm font-bold text-[#112131]">{user.xp_total} XP</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* --- TAB MANUAL (TEXTO ESTÁTICO) --- */}
          <TabsContent value="manual" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-1 space-y-4">
                <Card className="sticky top-24 border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-wider text-slate-500">Índice</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 p-2">
                    {["Introdução", "Pilares FAST 2.0", "Valores Culturais", "Comportamentos"].map((item, i) => (
                      <Button
                        key={item}
                        variant="ghost"
                        className="w-full justify-start text-slate-600 hover:text-[#112131] hover:bg-slate-50"
                        onClick={() => document.getElementById(`section-${i}`)?.scrollIntoView({ behavior: "smooth" })}
                      >
                        {i + 1}. {item}
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-3 space-y-8 pb-20">
                <div id="section-0" className="prose prose-slate max-w-none">
                  <Card className="border-l-4 border-l-[#C7A347] shadow-sm">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-bold text-[#112131] mb-4 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-[#C7A347]" />
                        Introdução
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        O <strong>Grifo Way</strong> é o manual que define a forma Grifo de pensar, agir, executar e
                        entregar. É o padrão cultural que sustenta o FAST 2.0.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div id="section-1">
                  <h3 className="text-2xl font-bold text-[#112131] mb-6 flex items-center gap-2">
                    <Zap className="h-6 w-6 text-[#C7A347]" />
                    1. Pilares & FAST 2.0
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-[#112131] text-white border-none">
                      <CardContent className="pt-6">
                        <h4 className="font-bold text-lg mb-2 text-[#C7A347]">Alta Performance</h4>
                        <p className="text-sm text-slate-300">
                          Na Grifo não premiamos o básico. Entregar "o esperado" não é diferencial — é requisito.
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white border border-slate-200">
                      <CardContent className="pt-6">
                        <h4 className="font-bold text-lg mb-2 text-[#112131]">FAST 2.0</h4>
                        <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                          <li>Planejamento extremamente claro</li>
                          <li>Checklist diário obrigatório</li>
                          <li>Nada improvisado</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div id="section-2">
                  <h3 className="text-2xl font-bold text-[#112131] mb-6 flex items-center gap-2">
                    <Shield className="h-6 w-6 text-[#C7A347]" />
                    2. Valores Inegociáveis
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { title: "Dono da Obra", desc: "Cada engenheiro é CEO da sua obra." },
                      { title: "Comunicação é Tudo", desc: "Curta, direta e sempre por sistema." },
                      { title: "Ritual não se negocia", desc: "Diário de obra e reuniões FAST são obrigatórios." },
                      { title: "Sistema > WhatsApp", desc: "O que gera histórico deve estar no GrifoBoard." },
                    ].map((val, i) => (
                      <Card
                        key={i}
                        className="hover:shadow-md transition-shadow border-l-2 border-l-slate-200 hover:border-l-[#C7A347]"
                      >
                        <CardContent className="pt-4">
                          <h4 className="font-bold text-[#112131] mb-1">{val.title}</h4>
                          <p className="text-sm text-slate-500">{val.desc}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div id="section-3">
                  <h3 className="text-2xl font-bold text-[#112131] mb-6 flex items-center gap-2">
                    <Users className="h-6 w-6 text-[#C7A347]" />
                    3. Comportamentos Esperados
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <h4 className="font-bold text-green-700 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" /> O Colaborador Grifo Way
                      </h4>
                      <ul className="space-y-2">
                        {[
                          "Atualiza o GrifoBoard todos os dias",
                          "Faz checklist FAST diário",
                          "Mantém comunicação clara",
                        ].map((item, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 text-sm text-slate-700 bg-green-50 p-2 rounded-md border border-green-100"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GrifoWay;
