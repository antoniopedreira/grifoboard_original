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
interface GroupedTasks { [setor: string]: TaskData[]; }

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
  weekEnd: Date
): string {
  // Agrupa por setor
  const grouped: GroupedTasks = {};
  for (const t of tasks) (grouped[t.setor] ||= []).push(t);
  const setores = sortSetores(Object.keys(grouped));

  // Tabelas por setor
  let sections = "";
  if (setores.length === 0) {
    sections = `<p style="text-align:center; color:#666; font-style:italic; margin:40px 0">Nenhuma atividade planejada para a semana.</p>`;
  } else {
    for (const setor of setores) {
      const rows = grouped[setor];

      const body = rows.map(r => `
        <tr>
          <td class="text">${r.descricao ?? ""}</td>
          <td class="text">${r.disciplina ?? ""}</td>
          <td class="text">${r.executante ?? ""}</td>
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

      sections += `
        <section class="sector">
          <div class="sector-title">
            <h2>Setor: ${setor || "Sem Setor"}</h2>
            <span class="pill">${rows.length} atividade${rows.length !== 1 ? "s" : ""}</span>
          </div>

          <table class="grid">
            <!-- COLUNAS EM % — iguais em TODAS as tabelas -->
            <colgroup>
              <col style="width:28%"> <!-- Atividade -->
              <col style="width:12%"> <!-- Disciplina -->
              <col style="width:12%"> <!-- Executante -->
              <col style="width:12%"> <!-- Responsável -->
              <col style="width:12%"> <!-- Encarregado -->
              <col style="width:3.43%"><col style="width:3.43%"><col style="width:3.43%">
              <col style="width:3.43%"><col style="width:3.43%"><col style="width:3.43%"><col style="width:3.43%">
            </colgroup>

            <thead>
              <tr>
                <th>Atividade</th>
                <th>Disciplina</th>
                <th>Executante</th>
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
  <title>Relatório Semanal de Atividades</title>
  <style>
    /* MARGEM PEQUENA DOS LADOS + GUTTER INTERNO */
    @page { size: A4; margin: 14mm 18mm 16mm 18mm; } /* top right bottom left */
    .page { padding: 0 6mm; } /* respiro interno adicional nas laterais */

    * { box-sizing: border-box; }
    body { margin:0; color:#111; font: 12px/1.35 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; }

    .header { text-align:center; margin-bottom:16px; }
    .header h1 { margin:0 0 6px; font-size:20px; font-weight:700; }
    .meta { color:#666; font-size:12px; margin:4px 0 12px; }
    hr { border:0; border-top:1px solid #e5e7eb; margin: 8px 0 18px; }

    .sector { page-break-inside: avoid; margin: 0 0 22px; }
    .sector-title { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
    .sector-title h2 { margin:0; font-size:16px; font-weight:700; color:#1f2937; }
    .pill { background:#e5e7eb; color:#374151; font-size:12px; padding:4px 8px; border-radius:12px; }

    table.grid { width:100%; border-collapse: collapse; table-layout: fixed; }
    thead { display: table-header-group; } /* mantém cabeçalho nas quebras */
    th, td { border:1px solid #e5e7eb; padding:6px 8px; vertical-align: middle; }
    th { background:#fafafa; font-weight:600; }
    tbody tr:nth-child(even) td { background:#fbfcfe; }

    .center { text-align:center; }
    .nowrap { white-space:nowrap; }
    .text { word-break: break-word; overflow-wrap:anywhere; }
    thead th { word-break: keep-all; }
    .day { text-align:center; }

    td, th { line-height: 1.25; }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <h1>Relatório Semanal de Atividades – ${obraNome}</h1>
      <div class="meta">Período: ${formatDateRange(weekStart, weekEnd)}</div>
      <div class="meta" style="font-size:11px;">Gerado em: ${formatDate(new Date())} às ${new Date().toLocaleTimeString("pt-BR")}</div>
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
    let obraId = "", obraNome = "", weekStart = "";
    if (req.method === "GET") {
      const u = new URL(req.url);
      obraId = u.searchParams.get("obraId") || "";
      obraNome = u.searchParams.get("obraNome") || "";
      weekStart = u.searchParams.get("weekStart") || "";
    } else {
      const body = await req.json();
      obraId = body.obraId;
      obraNome = body.obraNome;
      weekStart = body.weekStart;
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
    const { data: tasks, error } = await supabase
      .from("tarefas")
      .select("setor, descricao, disciplina, executante, responsavel, encarregado, seg, ter, qua, qui, sex, sab, dom")
      .eq("obra_id", obraId)
      .eq("semana", weekStart)
      .order("setor", { ascending: true })
      .order("descricao", { ascending: true });
    if (error) throw error;

    // Período
    const weekStartDate = new Date(weekStart + "T00:00:00");
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    // HTML alinhado com margem pequena + gutter
    const html = generateHtmlContent(tasks || [], obraNome || "Obra", weekStartDate, weekEndDate);

    const filename = `Relatorio_Semanal_${(obraNome || "Obra").replace(/\s+/g, "_")}_${weekStart}.html`;
    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="${filename}"`,
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
