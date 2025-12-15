import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TaskData {
  setor: string;
  descricao: string;
  disciplina: string;
  executante: string;
  responsavel: string;
  encarregado: string;
  seg: string | null;
  ter: string | null;
  qua: string | null;
  qui: string | null;
  sex: string | null;
  sab: string | null;
  dom: string | null;
}
interface GroupedTasks {
  [key: string]: TaskData[];
}

const DOW_PT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function formatDate(d: Date) {
  return d.toLocaleDateString("pt-BR");
}
function formatDateRange(a: Date, b: Date) {
  return `${formatDate(a)} a ${formatDate(b)}`;
}

function getCurrentDateTimeBR(): { date: string; time: string } {
  const now = new Date();
  const brazilTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  return {
    date: brazilTime.toLocaleDateString("pt-BR"),
    time: brazilTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  };
}

// Helper para status colorido no PDF
function getStatusHtml(status: string | null): string {
  if (!status || !status.trim()) return "";
  const s = status.toLowerCase().trim();

  if (s === "executada") return '<span style="color:#16a34a; font-weight:bold;">✓</span>'; // Verde
  if (s === "não feita" || s === "nao feita") return '<span style="color:#dc2626; font-weight:bold;">×</span>'; // Vermelho
  return '<span style="color:#94a3b8;">●</span>'; // Cinza (Planejado)
}

function sortSetores(setores: string[]): string[] {
  return setores.sort((A, B) => {
    const a = (A || "").toUpperCase();
    const b = (B || "").toUpperCase();
    if (a === "GERAL") return -1;
    if (b === "GERAL") return 1;
    const am = a.match(/^SETOR\s+(\d+)$/);
    const bm = b.match(/^SETOR\s+(\d+)$/);
    if (am && bm) return +am[1] - +bm[1];
    if (am && !bm) return -1;
    if (!am && bm) return 1;
    return a.localeCompare(b);
  });
}

// Gera o HTML Bonito
async function generateHtmlContent(
  tasks: TaskData[],
  obraNome: string,
  weekStart: Date,
  weekEnd: Date,
  groupBy: "setor" | "executante" = "setor",
  executanteFilter?: string,
): Promise<string> {
  const { date: currentDate, time: currentTime } = getCurrentDateTimeBR();

  // Logo em Base64 para funcionar offline/pdf (Substitua por sua logo real convertida se desejar)
  const logoBase64 =
    "data:image/png;base64,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";

  const grouped: GroupedTasks = {};
  for (const t of tasks) {
    const key = groupBy === "executante" ? t.executante : t.setor;
    (grouped[key] ||= []).push(t);
  }
  const keys = groupBy === "setor" ? sortSetores(Object.keys(grouped)) : Object.keys(grouped).sort();

  let sections = "";
  if (keys.length === 0) {
    sections = `<p style="text-align:center; color:#64748b; font-style:italic; margin:40px 0; font-size: 14px;">Nenhuma atividade planejada para a semana.</p>`;
  } else {
    for (const key of keys) {
      const rows = grouped[key];
      const isExecutanteGroup = groupBy === "executante";

      const body = rows
        .map(
          (r, idx) => `
        <tr class="${idx % 2 === 0 ? "even" : "odd"}">
          <td class="text-cell">${r.descricao ?? ""}</td>
          ${isExecutanteGroup ? `<td class="text-cell">${r.setor ?? ""}</td>` : ""}
          <td class="text-cell">${r.disciplina ?? ""}</td>
          ${!isExecutanteGroup ? `<td class="text-cell">${r.executante ?? ""}</td>` : ""}
          <td class="text-cell">${r.responsavel ?? ""}</td>
          <td class="text-cell">${r.encarregado ?? ""}</td>
          <td class="day-cell">${getStatusHtml(r.seg)}</td>
          <td class="day-cell">${getStatusHtml(r.ter)}</td>
          <td class="day-cell">${getStatusHtml(r.qua)}</td>
          <td class="day-cell">${getStatusHtml(r.qui)}</td>
          <td class="day-cell">${getStatusHtml(r.sex)}</td>
          <td class="day-cell">${getStatusHtml(r.sab)}</td>
          <td class="day-cell">${getStatusHtml(r.dom)}</td>
        </tr>
      `,
        )
        .join("");

      const groupLabel = isExecutanteGroup ? "Executante" : "Setor";
      const groupValue = key || (isExecutanteGroup ? "Sem Executante" : "Sem Setor");

      sections += `
        <section class="sector">
          <div class="sector-header">
            <h2 class="sector-title">${groupLabel}: ${groupValue}</h2>
            <span class="sector-badge">${rows.length} item(ns)</span>
          </div>

          <table class="data-table">
            <colgroup>
              ${
                isExecutanteGroup
                  ? `
                <col style="width:25%">
                <col style="width:12%">
                <col style="width:12%">
                <col style="width:10%">
                <col style="width:10%">
              `
                  : `
                <col style="width:25%">
                <col style="width:12%">
                <col style="width:12%">
                <col style="width:10%">
                <col style="width:10%">
              `
              }
              <col style="width:4.4%">
              <col style="width:4.4%">
              <col style="width:4.4%">
              <col style="width:4.4%">
              <col style="width:4.4%">
              <col style="width:4.4%">
              <col style="width:4.4%">
            </colgroup>

            <thead>
              <tr>
                <th>Atividade</th>
                ${isExecutanteGroup ? "<th>Setor</th>" : ""}
                <th>Disciplina</th>
                ${!isExecutanteGroup ? "<th>Executante</th>" : ""}
                <th>Resp.</th>
                <th>Enc.</th>
                ${DOW_PT.map((n) => `<th class="center">${n}</th>`).join("")}
              </tr>
            </thead>
            <tbody>${body}</tbody>
          </table>
        </section>
      `;
    }
  }

  // HTML + CSS (Tailwind-like)
  return `<!doctype html>
<html lang="pt-br">
<head>
  <meta charset="utf-8" />
  <title>Relatório de Produção - ${obraNome}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    @page { margin: 15mm 10mm; size: A4 landscape; }
    
    body { 
      font-family: 'Inter', Helvetica, Arial, sans-serif;
      color: #1e293b;
      margin: 0;
      font-size: 10px;
      line-height: 1.4;
      -webkit-print-color-adjust: exact; 
      print-color-adjust: exact;
    }

    /* Header */
    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #0f172a;
    }
    .logo-container img { height: 45px; width: auto; }
    .header-info { text-align: right; }
    .header-info h1 { margin: 0; font-size: 18px; font-weight: 700; color: #0f172a; text-transform: uppercase; }
    .header-info p { margin: 2px 0 0; color: #64748b; font-size: 11px; }

    /* Sections */
    .sector { margin-bottom: 20px; page-break-inside: avoid; }
    .sector-header {
      display: flex;
      align-items: center;
      gap: 10px;
      background-color: #f1f5f9;
      padding: 6px 10px;
      border-radius: 4px 4px 0 0;
      border: 1px solid #e2e8f0;
      border-bottom: none;
    }
    .sector-title { margin: 0; font-size: 12px; font-weight: 700; color: #334155; text-transform: uppercase; }
    .sector-badge { background: #cbd5e1; color: #475569; font-size: 9px; padding: 2px 6px; border-radius: 10px; font-weight: 600; }

    /* Table */
    .data-table { width: 100%; border-collapse: collapse; table-layout: fixed; border: 1px solid #e2e8f0; }
    .data-table th {
      background-color: #f8fafc;
      color: #475569;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 9px;
      padding: 6px 4px;
      border: 1px solid #e2e8f0;
      text-align: left;
    }
    .data-table th.center { text-align: center; }
    
    .data-table td {
      padding: 5px 4px;
      border: 1px solid #e2e8f0;
      vertical-align: middle;
    }
    .data-table tr.even { background-color: #ffffff; }
    .data-table tr.odd { background-color: #f8fafc; }

    .text-cell { word-wrap: break-word; }
    .day-cell { text-align: center; font-size: 12px; }

    /* Footer */
    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      font-size: 9px;
      color: #94a3b8;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
    }
    .legend { display: flex; justify-content: center; gap: 15px; margin-top: 20px; font-size: 10px; color: #475569; }
    .legend span { display: inline-flex; align-items: center; gap: 4px; }
  </style>
</head>
<body>
  <div class="report-header">
    <div class="logo-container">
      <img src="${logoBase64}" alt="Grifo Engenharia" />
    </div>
    <div class="header-info">
      <h1>Relatório de Planejamento Semanal (PCP)</h1>
      <p><strong>Obra:</strong> ${obraNome}</p>
      <p><strong>Período:</strong> ${formatDateRange(weekStart, weekEnd)}</p>
      <p>Gerado em: ${currentDate} às ${currentTime}</p>
    </div>
  </div>

  ${sections}

  <div class="legend">
    <span><strong style="color:#16a34a">✓</strong> Executada</span>
    <span><strong style="color:#dc2626">×</strong> Não Feita</span>
    <span><strong style="color:#94a3b8">●</strong> Planejada</span>
  </div>

  <div class="footer">
    Grifo Engenharia - Sistema Integrado de Gestão
  </div>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    // CORREÇÃO CRÍTICA: Use a SUPABASE_ANON_KEY (Chave Pública) em vez da SERVICE_ROLE_KEY
    // para que o Supabase respeite as políticas RLS do usuário logado.
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Variáveis de ambiente do Supabase ausentes (SUPABASE_URL / SUPABASE_ANON_KEY).");
    }

    // Auth Check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized - No token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cria o cliente SCOPED com o token do usuário (Respeita RLS - Se ele vê na tela, ele pode exportar)
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Opcional: Validar usuário apenas para log
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized - Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[export-pdf] Export solicitado por: ${user.id}`);

    // Parse Body
    let obraId = "",
      obraNome = "",
      weekStart = "",
      groupBy: "setor" | "executante" = "setor",
      executante = "";
    if (req.method === "GET") {
      const u = new URL(req.url);
      obraId = u.searchParams.get("obraId") || "";
      obraNome = u.searchParams.get("obraNome") || "";
      weekStart = u.searchParams.get("weekStart") || "";
      groupBy = (u.searchParams.get("groupBy") as "setor" | "executante") || "setor";
      executante = u.searchParams.get("executante") || "";
    } else {
      const body = await req.json();
      obraId = body.obraId;
      obraNome = body.obraNome;
      weekStart = body.weekStart;
      groupBy = body.groupBy || "setor";
      executante = body.executante || "";
    }

    if (!obraId || !weekStart) {
      return new Response(JSON.stringify({ error: "Dados incompletos (obraId/weekStart)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Busca Obra (O RLS vai bloquear se o usuário não tiver acesso, retornando nulo ou erro)
    // REMOVIDO: A verificação manual "if (obra.usuario_id !== user.id)" que causava o erro 403.
    const { data: obra, error: obraError } = await supabase.from("obras").select("nome_obra").eq("id", obraId).single();

    if (obraError || !obra) {
      console.error(`[export-pdf] Acesso negado ou obra não encontrada: ${obraId}`);
      return new Response(JSON.stringify({ error: "Obra não encontrada ou acesso negado (RLS)." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!obraNome) obraNome = obra.nome_obra || "Obra";

    // Busca Tarefas (O RLS também protege aqui)
    let query = supabase
      .from("tarefas")
      .select("setor, descricao, disciplina, executante, responsavel, encarregado, seg, ter, qua, qui, sex, sab, dom")
      .eq("obra_id", obraId)
      .eq("semana", weekStart);

    if (groupBy === "executante" && executante) {
      query = query.eq("executante", executante);
    }

    query = query
      .order(groupBy === "executante" ? "executante" : "setor", { ascending: true })
      .order("descricao", { ascending: true });

    const { data: tasks, error } = await query;
    if (error) throw error;

    // Período
    const weekStartDate = new Date(weekStart + "T00:00:00");
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    // Gera HTML estilizado
    const html = await generateHtmlContent(tasks || [], obraNome, weekStartDate, weekEndDate, groupBy, executante);

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    console.error("Erro interno:", e);
    return new Response(JSON.stringify({ error: e?.message || "Erro inesperado" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
