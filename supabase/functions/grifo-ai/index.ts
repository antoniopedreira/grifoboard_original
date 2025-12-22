import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const N8N_WEBHOOK_URL = "SUA_URL_DO_WEBHOOK_DO_N8N_AQUI"; 
// Ex: https://n8n.seu-dominio.com/webhook/grifomind
// DICA: No n8n, ative o workflow e use a URL de "Production".

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query, user_id, chat_id } = await req.json();

    if (!query) throw new Error("Pergunta não fornecida.");

    // Envia para o n8n
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: query,        // O n8n espera 'text' ou 'message'
        chat_id: chat_id,   // Para memória da sessão
        user_id: user_id    // Para identificação
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro no n8n: ${errorText}`);
    }

    const data = await response.json();
    
    // O seu n8n retorna { "message": "..." } no nó Respond to Webhook
    return new Response(JSON.stringify({ answer: data.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Erro na Edge Function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
