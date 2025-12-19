import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface GamificationProfile {
  id: string;
  xp_total: number;
  level_current: number;
  current_streak: number;
}

export interface GamificationLog {
  id: string;
  user_id: string;
  action_type: string;
  xp_amount: number;
  reference_id: string | null;
  created_at: string;
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
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
    return data as GamificationProfile | null;
  },

  // 2. Busca o Ranking Global (Top 10)
  async getRanking() {
    const { data: profiles, error: profileError } = await supabase
      .from('gamification_profiles')
      .select('*')
      .order('xp_total', { ascending: false })
      .limit(10);

    if (profileError) throw profileError;
    if (!profiles || profiles.length === 0) return [];

    const userIds = profiles.map(p => p.id);
    const { data: users, error: userError } = await supabase
      .from('usuarios')
      .select('id, nome, email, role')
      .in('id', userIds);

    if (userError) throw userError;

    const ranking = profiles.map((profile, index) => {
      const userDetails = users?.find(u => u.id === profile.id);
      // Usa nome se existir, senão parte do email antes do @
      const displayName = userDetails?.nome || userDetails?.email?.split('@')[0] || 'Usuário';
      return {
        ...profile,
        nome: displayName,
        role: userDetails?.role || 'member',
        position: index + 1
      };
    });

    return ranking as RankingItem[];
  },

  // 3. Busca o histórico de XP do usuário
  async getLogs(userId: string, limit = 20) {
    const { data, error } = await supabase
      .from('gamification_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar logs:', error);
      return [];
    }
    return data as GamificationLog[];
  },

  // 4. Dar XP (Usado no Diário, PCP, etc)
  async awardXP(userId: string, action: string, amount: number, referenceId?: string) {
    try {
      // Verifica log para evitar duplicidade no mesmo dia/item
      if (referenceId) {
        const { data: existing } = await supabase
          .from('gamification_logs')
          .select('id')
          .eq('user_id', userId)
          .eq('reference_id', referenceId)
          .maybeSingle();
        if (existing) {
          console.log('XP já concedido para esta ação:', referenceId);
          return; 
        }
      }

      // Registra o log primeiro
      const { error: logError } = await supabase.from('gamification_logs').insert({
        user_id: userId,
        action_type: action,
        xp_amount: amount,
        reference_id: referenceId || null
      });

      if (logError) {
        console.error('Erro ao inserir log:', logError);
        throw logError;
      }

      // Busca o perfil atual
      const { data: profile } = await supabase
        .from('gamification_profiles')
        .select('xp_total, level_current')
        .eq('id', userId)
        .maybeSingle();

      const currentXP = profile?.xp_total || 0;
      const newXP = currentXP + amount;
      
      // Regra de Nível: Novo nível a cada 1000 XP
      const newLevel = Math.floor(newXP / 1000) + 1;

      // Formata a data corretamente (apenas YYYY-MM-DD)
      const today = new Date().toISOString().split('T')[0];

      // Upsert garante que cria se não existir
      const { error: upsertError } = await supabase.from('gamification_profiles').upsert({
        id: userId,
        xp_total: newXP,
        level_current: newLevel,
        last_activity_date: today
      }, { onConflict: 'id' });

      if (upsertError) {
        console.error('Erro ao upsert perfil:', upsertError);
        throw upsertError;
      }

      console.log(`✅ XP concedido: +${amount} para usuário ${userId}. Total: ${newXP}`);

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
