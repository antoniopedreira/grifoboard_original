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

  // URL da Logo fornecida
  const logoUrl = "https://qacaerwosglbayjfskyx.supabase.co/storage/v1/object/public/templates/LogoSemFundo.png";

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
      margin: -15mm -10mm 20px -10mm; /* Expand to full width ignoring margin */
      padding: 15px 30px;
      background-color: #0F1F2C; /* Cor do Header solicitada */
      color: #ffffff; /* Texto Branco */
      border-bottom: 3px solid #EAB308; /* Linha dourada para dar um toque Grifo */
    }
    .logo-container img { height: 50px; width: auto; }
    
    .header-info { text-align: right; }
    .header-info h1 { margin: 0; font-size: 18px; font-weight: 700; color: #ffffff; text-transform: uppercase; }
    .header-info p { margin: 2px 0 0; color: #cbd5e1; font-size: 11px; }

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
      <img src="${logoUrl}" alt="Grifo Engenharia" />
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
    // Use SUPABASE_ANON_KEY (Public) para respeitar o RLS do usuário
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

    // Busca Obra (RLS protege)
    const { data: obra, error: obraError } = await supabase.from("obras").select("nome_obra").eq("id", obraId).single();

    if (obraError || !obra) {
      console.error(`[export-pdf] Acesso negado ou obra não encontrada: ${obraId}`);
      return new Response(JSON.stringify({ error: "Obra não encontrada ou acesso negado (RLS)." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!obraNome) obraNome = obra.nome_obra || "Obra";

    // Busca Tarefas (RLS protege)
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
