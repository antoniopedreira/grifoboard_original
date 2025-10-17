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
interface GroupedTasks { [key: string]: TaskData[]; }

const DOW_PT = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];

function formatDate(d: Date) { return d.toLocaleDateString("pt-BR"); }
function formatDateRange(a: Date, b: Date) { return `${formatDate(a)} a ${formatDate(b)}`; }

function getStatusSymbol(status: string | null): string {
  if (!status || !status.trim()) return "";
  const s = status.toLowerCase().trim();
  if (s === "executada") return "✓";
  if (s === "não feita" || s === "nao feita") return "×";
  return "●";
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

function generateHtmlContent(
  tasks: TaskData[],
  obraNome: string,
  weekStart: Date,
  weekEnd: Date,
  groupBy: 'setor' | 'executante' = 'setor',
  executanteFilter?: string
): string {
  // Agrupa por setor ou executante
  const grouped: GroupedTasks = {};
  for (const t of tasks) {
    const key = groupBy === 'executante' ? t.executante : t.setor;
    (grouped[key] ||= []).push(t);
  }
  const keys = groupBy === 'setor' ? sortSetores(Object.keys(grouped)) : Object.keys(grouped).sort();

  // Tabelas por setor ou executante
  let sections = "";
  if (keys.length === 0) {
    sections = `<p style="text-align:center; color:#666; font-style:italic; margin:40px 0">Nenhuma atividade planejada para a semana.</p>`;
  } else {
    for (const key of keys) {
      const rows = grouped[key];
      const isExecutanteGroup = groupBy === 'executante';

      const body = rows.map(r => `
        <tr>
          <td class="text">${r.descricao ?? ""}</td>
          ${isExecutanteGroup ? `<td class="text">${r.setor ?? ""}</td>` : ''}
          <td class="text">${r.disciplina ?? ""}</td>
          ${!isExecutanteGroup ? `<td class="text">${r.executante ?? ""}</td>` : ''}
          <td class="text">${r.responsavel ?? ""}</td>
          <td class="text">${r.encarregado ?? ""}</td>
          <td class="day">${getStatusSymbol(r.seg)}</td>
          <td class="day">${getStatusSymbol(r.ter)}</td>
          <td class="day">${getStatusSymbol(r.qua)}</td>
          <td class="day">${getStatusSymbol(r.qui)}</td>
          <td class="day">${getStatusSymbol(r.sex)}</td>
          <td class="day">${getStatusSymbol(r.sab)}</td>
          <td class="day">${getStatusSymbol(r.dom)}</td>
        </tr>
      `).join("");

      const groupLabel = isExecutanteGroup ? 'Executante' : 'Setor';
      const groupValue = key || (isExecutanteGroup ? "Sem Executante" : "Sem Setor");
      
      sections += `
        <section class="sector">
          <div class="sector-title">
            <h2>${groupLabel}: ${groupValue}</h2>
            <span class="pill">${rows.length} atividade${rows.length !== 1 ? "s" : ""}</span>
          </div>

          <table class="grid">
            <colgroup>
              ${isExecutanteGroup ? `
                <col style="width:28%">
                <col style="width:11%">
                <col style="width:11%">
                <col style="width:9%">
                <col style="width:9%">
              ` : `
                <col style="width:28%">
                <col style="width:11%">
                <col style="width:11%">
                <col style="width:9%">
                <col style="width:9%">
              `}
              <col style="width:2.7%"><col style="width:2.7%"><col style="width:2.7%">
              <col style="width:2.7%"><col style="width:2.7%"><col style="width:2.7%"><col style="width:2.7%">
            </colgroup>

            <thead>
              <tr>
                <th>Atividade</th>
                ${isExecutanteGroup ? '<th>Setor</th>' : ''}
                <th>Disciplina</th>
                ${!isExecutanteGroup ? '<th>Executante</th>' : ''}
                <th>Responsável</th>
                <th>Encarregado</th>
                ${DOW_PT.map(n => `<th class="center nowrap">${n}</th>`).join("")}
              </tr>
            </thead>
            <tbody>${body}</tbody>
          </table>
        </section>
      `;
    }
  }

  return `<!doctype html>
<html lang="pt-br">
<head>
  <meta charset="utf-8" />
  <title>Relatório Semanal de Atividades</title>
  <style>
    * { 
      box-sizing: border-box; 
      margin: 0;
      padding: 0;
    }
    
    body { 
      margin: 0;
      padding: 15px;
      color: #1f2937; 
      font-family: Arial, sans-serif;
      font-size: 9px;
      line-height: 1.3;
    }

    .header { 
      text-align: center; 
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 2px solid #374151;
    }
    
    .header h1 { 
      margin: 0 0 6px; 
      font-size: 16px; 
      font-weight: 700;
      color: #111827;
    }
    
    .meta { 
      color: #6b7280; 
      font-size: 8px; 
      margin: 2px 0;
    }

    .sector { 
      page-break-inside: avoid; 
      margin: 0 0 16px;
    }
    
    .sector-title { 
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 6px;
      padding: 4px 0;
      background: #f9fafb;
      border-left: 3px solid #3b82f6;
      padding-left: 8px;
    }
    
    .sector-title h2 { 
      margin: 0; 
      font-size: 11px; 
      font-weight: 700; 
      color: #111827;
    }
    
    .pill { 
      background: #dbeafe; 
      color: #1e40af; 
      font-size: 8px; 
      padding: 2px 6px; 
      border-radius: 8px;
      white-space: nowrap;
      font-weight: 600;
    }

    table.grid { 
      width: 100%; 
      border-collapse: collapse;
      margin-bottom: 8px;
      font-size: 8px;
    }
    
    thead { 
      display: table-header-group;
    }
    
    th, td { 
      border: 1px solid #d1d5db;
      padding: 4px 3px;
      vertical-align: middle;
    }
    
    th { 
      background: #f3f4f6;
      font-weight: 700;
      color: #374151;
      text-align: left;
      font-size: 8px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    
    tbody tr:nth-child(even) td { 
      background: #f9fafb;
    }
    
    tbody tr:hover td {
      background: #f3f4f6;
    }

    .center { 
      text-align: center;
    }
    
    .nowrap { 
      white-space: nowrap;
    }
    
    .text { 
      word-wrap: break-word;
      overflow-wrap: break-word;
      line-height: 1.4;
    }
    
    .day { 
      text-align: center;
      font-size: 12px;
      font-weight: 700;
      color: #111827;
    }
    
    .footer-legend {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 8px;
      color: #6b7280;
      background: #f9fafb;
      padding: 8px;
      border-radius: 4px;
    }
    
    .footer-legend strong {
      color: #374151;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Relatório Semanal de Atividades – ${obraNome}</h1>
    <div class="meta">Período: ${formatDateRange(weekStart, weekEnd)}</div>
    <div class="meta">Gerado em: ${formatDate(new Date())} às ${new Date().toLocaleTimeString("pt-BR")}</div>
  </div>

  ${sections}

  <div class="footer-legend">
    <strong>Legenda:</strong> ● Planejada &nbsp;|&nbsp; ✓ Executada &nbsp;|&nbsp; × Não Feita
  </div>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Variáveis de ambiente do Supabase ausentes (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
    }
    
    // Authentication check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("[export-pdf] Missing Authorization header");
      return new Response(JSON.stringify({ error: "Unauthorized - No authentication token provided" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Validate JWT and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error("[export-pdf] Authentication failed:", authError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized - Invalid or expired token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    console.log(`[export-pdf] Request from user: ${user.id}`);

    // Params (GET ou POST)
    let obraId = "", obraNome = "", weekStart = "", groupBy: 'setor' | 'executante' = 'setor', executante = "";
    if (req.method === "GET") {
      const u = new URL(req.url);
      obraId = u.searchParams.get("obraId") || "";
      obraNome = u.searchParams.get("obraNome") || "";
      weekStart = u.searchParams.get("weekStart") || "";
      groupBy = (u.searchParams.get("groupBy") as 'setor' | 'executante') || 'setor';
      executante = u.searchParams.get("executante") || "";
    } else {
      const body = await req.json();
      obraId = body.obraId;
      obraNome = body.obraNome;
      weekStart = body.weekStart;
      groupBy = body.groupBy || 'setor';
      executante = body.executante || "";
    }

    if (!obraId || !weekStart) {
      return new Response(JSON.stringify({ error: "obraId e weekStart são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Authorization check - verify user owns the obra
    const { data: obra, error: obraError } = await supabase
      .from("obras")
      .select("usuario_id, nome_obra")
      .eq("id", obraId)
      .single();

    if (obraError || !obra) {
      console.error(`[export-pdf] Obra not found: ${obraId}`, obraError?.message);
      return new Response(JSON.stringify({ error: "Obra not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (obra.usuario_id !== user.id) {
      console.error(`[export-pdf] Unauthorized access attempt: user ${user.id} tried to access obra ${obraId} owned by ${obra.usuario_id}`);
      return new Response(JSON.stringify({ error: "Forbidden - You do not have access to this obra" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[export-pdf] Authorized export for obra: ${obraId}, week: ${weekStart}`);

    // Use the obra name from database if not provided
    if (!obraNome) {
      obraNome = obra.nome_obra || "Obra";
    }

    // Dados
    let query = supabase
      .from("tarefas")
      .select("setor, descricao, disciplina, executante, responsavel, encarregado, seg, ter, qua, qui, sex, sab, dom")
      .eq("obra_id", obraId)
      .eq("semana", weekStart);
    
    // Filter by executante if specified
    if (groupBy === 'executante' && executante) {
      query = query.eq("executante", executante);
    }
    
    query = query.order(groupBy === 'executante' ? "executante" : "setor", { ascending: true })
      .order("descricao", { ascending: true });
    
    const { data: tasks, error } = await query;
    if (error) throw error;

    // Período
    const weekStartDate = new Date(weekStart + "T00:00:00");
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    // Return HTML for client-side PDF generation
    const html = generateHtmlContent(tasks || [], obraNome || "Obra", weekStartDate, weekEndDate, groupBy, executante);

    console.log("[export-pdf] Returning HTML for client-side PDF generation");

    return new Response(JSON.stringify({ html, filename: `Relatorio_Semanal_${(obraNome || "Obra").replace(/\s+/g, "_")}_${weekStart}.pdf` }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Erro inesperado" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
