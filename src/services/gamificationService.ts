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
      const { data: profiles, error: profileError } = await supabase
        .from("gamification_profiles")
        .select("*")
        .order("xp_total", { ascending: false })
        .limit(20);

      if (profileError) throw profileError;
      if (!profiles || profiles.length === 0) return [];

      const userIds = profiles.map((p) => p.id);

      const { data: users, error: userError } = await supabase
        .from("ranking_users_view")
        .select("id, nome")
        .in("id", userIds);

      if (userError) throw userError;

      const ranking: RankingItem[] = profiles.map((profile, index) => {
        const userDetails = users?.find((u) => u.id === profile.id);
        return {
          ...profile,
          nome: userDetails?.nome || "Usuário Grifo",
          role: "Membro FAST",
          position: index + 1,
        };
      });

      return ranking;
    } catch (error) {
      console.error("Erro ao carregar ranking:", error);
      return [];
    }
  },

  // 3. Dar XP (Positivo)
  async awardXP(userId: string, action: string, amount: number, referenceId?: string) {
    try {
      // Se tiver ID de referência, verifica se já existe para evitar duplicidade
      if (referenceId) {
        const { data: existing } = await supabase
          .from("gamification_logs")
          .select("id")
          .eq("user_id", userId)
          .eq("reference_id", referenceId)
          .eq("action_type", action) // Verifica a ação específica
          .maybeSingle();

        if (existing) {
          console.log("XP já atribuído para este item.");
          return;
        }
      }

      // Insere o log
      const { error: logError } = await supabase.from("gamification_logs").insert({
        user_id: userId,
        action_type: action,
        xp_amount: amount,
        reference_id: referenceId,
      });

      if (logError) throw logError;

      // Atualiza Perfil
      await this.updateProfileXP(userId, amount);

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

  // 4. Remover XP (Quando desfaz uma ação)
  async removeXP(userId: string, actionToCheck: string, amountToRemove: number, referenceId: string) {
    try {
      // 1. Encontra e APAGA o log anterior (para permitir ganhar de novo no futuro)
      const { data: existingLog } = await supabase
        .from("gamification_logs")
        .select("id")
        .eq("user_id", userId)
        .eq("reference_id", referenceId)
        .eq("action_type", actionToCheck)
        .maybeSingle();

      if (existingLog) {
        await supabase.from("gamification_logs").delete().eq("id", existingLog.id);
      } else {
        // Se não achou log, não faz nada (para não tirar ponto que a pessoa não tem)
        return;
      }

      // 2. Atualiza o perfil subtraindo os pontos (passar valor negativo)
      // Nota: amountToRemove deve ser positivo aqui, nós invertemos dentro do updateProfileXP se quisermos,
      // ou passamos negativo direto. Vamos passar negativo.
      await this.updateProfileXP(userId, -Math.abs(amountToRemove));

      toast({
        title: `XP Revertido`,
        description: "Status alterado. Continue focado!",
        variant: "destructive",
        duration: 3000,
      });
    } catch (error) {
      console.error("Erro ao remover XP:", error);
    }
  },

  // Função auxiliar interna para recalcular e salvar
  async updateProfileXP(userId: string, amountToAdd: number) {
    const { data: profile } = await supabase
      .from("gamification_profiles")
      .select("xp_total")
      .eq("id", userId)
      .maybeSingle();

    const currentXP = profile?.xp_total || 0;
    const newXP = Math.max(0, currentXP + amountToAdd); // Não deixa ficar negativo
    const newLevel = Math.floor(newXP / 1000) + 1;

    await supabase.from("gamification_profiles").upsert({
      id: userId,
      xp_total: newXP,
      level_current: newLevel,
      last_activity_date: new Date().toISOString(),
    });
  },
};

function formatActionName(action: string): string {
  const map: Record<string, string> = {
    TAREFA_CONCLUIDA: "Tarefa FAST Concluída",
    DIARIO_CRIADO: "Diário Enviado",
    CONTRATACAO_FAST: "Contratação Fechada",
  };
  return map[action] || action.replace(/_/g, " ");
}
