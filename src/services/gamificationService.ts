import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface GamificationProfile {
  id: string;
  xp_total: number;
  level_current: number;
  current_streak: number;
}

export interface RankingItem extends GamificationProfile {
  nome: string;
  role: string;
  position?: number;
}

export const gamificationService = {
  // 1. Busca o perfil do usuário atual
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('gamification_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // Ignora erro se não existir perfil ainda
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
    return data as GamificationProfile | null;
  },

  // 2. Busca o Ranking Global (Top 10)
  async getRanking() {
    // Busca os perfis ordenados por XP
    const { data: profiles, error: profileError } = await supabase
      .from('gamification_profiles')
      .select('*')
      .order('xp_total', { ascending: false })
      .limit(10);

    if (profileError) throw profileError;

    // Busca os nomes na tabela de usuários pública
    const userIds = profiles.map(p => p.id);
    const { data: users, error: userError } = await supabase
      .from('usuarios')
      .select('id, nome, role')
      .in('id', userIds);

    if (userError) throw userError;

    // Junta os dados (Perfil de Jogo + Nome do Usuário)
    const ranking = profiles.map((profile, index) => {
      const userDetails = users?.find(u => u.id === profile.id);
      return {
        ...profile,
        nome: userDetails?.nome || 'Usuário Grifo',
        role: userDetails?.role || 'Membro',
        position: index + 1
      };
    });

    return ranking as RankingItem[];
  },

  // 3. Dar XP (Usado no Diário, PCP, etc)
  async awardXP(userId: string, action: string, amount: number, referenceId?: string) {
    try {
      // Verifica log para evitar duplicidade no mesmo dia/item
      if (referenceId) {
        const { data: existing } = await supabase
          .from('gamification_logs')
          .select('id')
          .eq('user_id', userId)
          .eq('reference_id', referenceId)
          .single();
        if (existing) return; 
      }

      // Registra o log
      await supabase.from('gamification_logs').insert({
        user_id: userId,
        action_type: action,
        xp_amount: amount,
        reference_id: referenceId
      });

      // Atualiza o perfil
      const { data: profile } = await supabase
        .from('gamification_profiles')
        .select('xp_total')
        .eq('id', userId)
        .single();

      const currentXP = profile?.xp_total || 0;
      const newXP = currentXP + amount;
      
      // Regra de Nível: Novo nível a cada 1000 XP
      const newLevel = Math.floor(newXP / 1000) + 1;

      // Upsert garante que cria se não existir
      await supabase.from('gamification_profiles').upsert({
        id: userId,
        xp_total: newXP,
        level_current: newLevel,
        last_activity_date: new Date().toISOString()
      });

      toast({
        title: `+${amount} XP Conquistado! 🦅`,
        description: "Você está vivendo o Grifo Way.",
        className: "bg-[#C7A347] text-white border-none",
      });

    } catch (error) {
      console.error("Erro ao dar XP:", error);
    }
  }
};
