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

function getCurrentDateTimeBR(): { date: string; time: string } {
  // Cria uma data no timezone do Brasil (UTC-3)
  const now = new Date();
  const brazilTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  
  return {
    date: brazilTime.toLocaleDateString("pt-BR"),
    time: brazilTime.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })
  };
}

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

async function generateHtmlContent(
  tasks: TaskData[],
  obraNome: string,
  weekStart: Date,
  weekEnd: Date,
  groupBy: 'setor' | 'executante' = 'setor',
  executanteFilter?: string
): Promise<string> {
  const { date: currentDate, time: currentTime } = getCurrentDateTimeBR();
  
  // Logo em base64 (griffin dourado)
  const logoBase64 = "data:image/png;base64,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";
  
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
                <col style="width:20%">
                <col style="width:10%">
                <col style="width:12%">
                <col style="width:9%">
                <col style="width:9%">
              ` : `
                <col style="width:20%">
                <col style="width:14%">
                <col style="width:13%">
                <col style="width:9%">
                <col style="width:9%">
              `}
              <col style="width:5%">
              <col style="width:5%">
              <col style="width:5%">
              <col style="width:5%">
              <col style="width:5%">
              <col style="width:5%">
              <col style="width:5%">
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

  // HTML completo
  return `<!doctype html>
<html lang="pt-br">
<head>
  <meta charset="utf-8" />
  <title> </title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Disket+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>
    /* CSS de impressão para renderização perfeita */
    @page { 
      size: A4; 
      margin: 16mm 14mm; 
    }
    @page :first { 
      margin-top: 16mm; 
    }
    
    html, body { 
      -webkit-print-color-adjust: exact; 
      print-color-adjust: exact;
      margin: 0;
      color: #111;
      font: 11px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    }
    * { box-sizing: border-box; }
    .page { padding: 0; }
    
    @media print { 
      html, body { margin: 0; }
      .sector { page-break-inside: avoid; }
      thead { display: table-header-group; }
    }

    .logo-header { 
      background: #061928; 
      padding: 20px 40px; 
      margin: -16mm -14mm 20px -14mm;
      border-radius: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .logo-header img { 
      height: 50px; 
      width: auto;
    }
    .logo-header .company-name {
      font-family: 'Disket Mono', monospace;
      font-size: 24px;
      font-weight: 700;
      color: #FFFFFF;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .header { text-align:center; margin-bottom:20px; }
    .header h1 { margin:0 0 8px; font-size:18px; font-weight:700; }
    .meta { color:#666; font-size:11px; margin:4px 0 14px; }
    hr { border:0; border-top:1px solid #e5e7eb; margin: 10px 0 20px; }

    .sector { page-break-inside: avoid; break-inside: avoid; margin: 0 0 24px; }
    .sector-title { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
    .sector-title h2 { margin:0; font-size:15px; font-weight:700; color:#1f2937; }
    .pill { background:#e5e7eb; color:#374151; font-size:11px; padding:3px 8px; border-radius:12px; }

    table.grid { width:100%; border-collapse: collapse; table-layout: fixed; }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
    tr { break-inside: avoid; page-break-inside: avoid; }
    th, td { 
      border:1px solid #d1d5db; 
      padding: 4px 3px; 
      vertical-align: middle; 
      text-align: left;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    th { 
      background:#f3f4f6; 
      font-weight:600; 
      font-size: 10px;
      white-space: nowrap;
      overflow: visible;
      text-overflow: clip;
    }
    tbody tr:nth-child(even) td { background:#fafbfc; }

    .center { text-align:center; }
    .nowrap { white-space:nowrap; }
    .text { 
      word-break: break-word; 
      overflow-wrap: anywhere;
      font-size: 10px;
      line-height: 1.3;
    }
    thead th { word-break: keep-all; }
    .day { 
      text-align:center; 
      font-size: 14px;
      padding: 4px 1px;
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="logo-header">
      <img src="https://qacaerwosglbayjfskyx.supabase.co/storage/v1/object/public/lovable-uploads/grifo-logo-header.png" alt="Grifo Logo" />
      <div class="company-name">Grifo Engenharia</div>
      <img src="https://qacaerwosglbayjfskyx.supabase.co/storage/v1/object/public/lovable-uploads/grifo-logo-header.png" alt="Grifo Logo" />
    </div>
    <div class="header">
      <h1>Relatório Semanal de Atividades – ${obraNome}</h1>
      <div class="meta">Período: ${formatDateRange(weekStart, weekEnd)}</div>
      <div class="meta" style="font-size:11px;">Gerado em: ${currentDate} às ${currentTime}</div>
      <hr />
    </div>

    ${sections}

    <div class="meta" style="text-align:center; border-top:1px solid #e5e7eb; padding-top:12px;">
      <strong>Legenda:</strong> ● Planejada &nbsp;|&nbsp; ✓ Executada &nbsp;|&nbsp; × Não Feita
    </div>
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

    // Gera HTML otimizado para impressão
    const html = await generateHtmlContent(tasks || [], obraNome || "Obra", weekStartDate, weekEndDate, groupBy, executante);
    
    console.log("[export-pdf] HTML gerado com sucesso para conversão no cliente");
    
    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
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
