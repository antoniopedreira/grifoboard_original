import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface GamificationProfile {
  id: string;
  xp_total: number | null;
  level_current: number | null;
  current_streak: number | null;
}

export interface RankingItem extends GamificationProfile {
  nome: string;
  role: string;
  position?: number;
}

export const gamificationService = {
  // 1. Busca o perfil do usuário atual
  async getProfile(userId: string) {
    const { data, error } = await supabase.from("gamification_profiles").select("*").eq("id", userId).maybeSingle();

    if (error) {
      console.error("Erro ao buscar perfil:", error);
      return null;
    }
    return data as GamificationProfile | null;
  },

  // 2. Busca o Ranking Global (Top 20)
  async getRanking() {
    try {
      // Passo A: Busca os perfis com mais XP (Tabela de Gamificação)
      const { data: profiles, error: profileError } = await supabase
        .from("gamification_profiles")
        .select("*")
        .order("xp_total", { ascending: false })
        .limit(20);

      if (profileError) throw profileError;
      if (!profiles || profiles.length === 0) return [];

      // Passo B: Coleta os IDs para buscar os nomes
      const userIds = profiles.map((p) => p.id);

      // Passo C: Busca os nomes na VIEW PÚBLICA SEGURA
      // (Isso resolve o problema de ver "Usuário Grifo" em vez do nome real)
      const { data: users, error: userError } = await supabase
        .from("ranking_users_view")
        .select("id, nome")
        .in("id", userIds);

      if (userError) throw userError;

      // Passo D: Junta os dados (XP + Nome)
      const ranking: RankingItem[] = profiles.map((profile, index) => {
        // Encontra o usuário correspondente na lista de nomes
        // A view retorna { id, nome }, então users é seguro
        const userDetails = users?.find((u) => u.id === profile.id);

        return {
          ...profile,
          nome: userDetails?.nome || "Usuário Grifo", // Fallback se não tiver nome cadastrado
          role: "Membro FAST", // Texto padrão já que removemos cargos da view pública
          position: index + 1,
        };
      });

      return ranking;
    } catch (error) {
      console.error("Erro ao carregar ranking:", error);
      return [];
    }
  },

  // 3. Dar XP (Usado no Diário, PCP, etc)
  async awardXP(userId: string, action: string, amount: number, referenceId?: string) {
    try {
      // Verifica se já ganhou XP por esta ação específica hoje/neste item
      if (referenceId) {
        const { data: existing } = await supabase
          .from("gamification_logs")
          .select("id")
          .eq("user_id", userId)
          .eq("reference_id", referenceId)
          .maybeSingle();

        if (existing) return; // Já pontuou, sai da função
      }

      // Registra o log histórico
      const { error: logError } = await supabase.from("gamification_logs").insert({
        user_id: userId,
        action_type: action,
        xp_amount: amount,
        reference_id: referenceId,
      });

      if (logError) throw logError;

      // Busca perfil atual para somar
      const { data: profile } = await supabase
        .from("gamification_profiles")
        .select("xp_total")
        .eq("id", userId)
        .maybeSingle();

      const currentXP = profile?.xp_total || 0;
      const newXP = currentXP + amount;

      // Regra de Nível: 1 nível a cada 1000 XP
      const newLevel = Math.floor(newXP / 1000) + 1;

      // Atualiza o perfil com o novo total
      await supabase.from("gamification_profiles").upsert({
        id: userId,
        xp_total: newXP,
        level_current: newLevel,
        last_activity_date: new Date().toISOString(),
      });

      // Feedback Visual
      toast({
        title: `+${amount} XP Conquistado! 🦅`,
        description: `Ação: ${formatActionName(action)}`,
        className: "bg-[#C7A347] text-white border-none shadow-lg",
        duration: 3000,
      });
    } catch (error) {
      console.error("Erro ao dar XP:", error);
    }
  },
};

// Helper para formatar o nome da ação no Toast
function formatActionName(action: string): string {
  const map: Record<string, string> = {
    DIARIO_CRIADO: "Diário de Obra Enviado",
    TAREFA_CONCLUIDA: "Tarefa FAST Concluída",
    CONTRATACAO_FAST: "Contratação Fechada",
    CHECKLIST_COMPLETO: "Checklist Finalizado",
  };
  return map[action] || action.replace(/_/g, " ");
}
