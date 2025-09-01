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
  [setor: string]: TaskData[];
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR");
}

function formatDateRange(startDate: Date, endDate: Date): string {
  return `${formatDate(startDate)} a ${formatDate(endDate)}`;
}

function formatDayDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${day}/${month}`;
}

function getStatusSymbol(status: string | null): string {
  if (!status || status.trim() === "") return "";
  const normalizedStatus = status.toLowerCase().trim();
  if (normalizedStatus === "executada") return "✓";
  if (normalizedStatus === "não feita" || normalizedStatus === "nao feita") return "×";
  return "●"; // default (ex.: "Planejada")
}

function sortSetores(setores: string[]): string[] {
  return setores.sort((a, b) => {
    const A = (a || "").toUpperCase();
    const B = (b || "").toUpperCase();

    if (A === "GERAL") return -1;
    if (B === "GERAL") return 1;

    const aMatch = A.match(/^SETOR\s+(\d+)$/);
    const bMatch = B.match(/^SETOR\s+(\d+)$/);
    if (aMatch && bMatch) return parseInt(aMatch[1]) - parseInt(bMatch[1]);
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;

    return A.localeCompare(B);
  });
}

function generateHtmlContent(
  tasks: TaskData[],
  obraNome: string,
  weekStart: Date,
  weekEnd: Date
): string {
  // Agrupa por setor
  const groupedTasks: GroupedTasks = {};
  for (const t of tasks) {
    if (!groupedTasks[t.setor]) groupedTasks[t.setor] = [];
    groupedTasks[t.setor].push(t);
  }
  const setores = sortSetores(Object.keys(groupedTasks));

  // Datas da semana
  const d0 = new Date(weekStart);
  const d1 = new Date(weekStart); d1.setDate(d1.getDate() + 1);
  const d2 = new Date(weekStart); d2.setDate(d2.getDate() + 2);
  const d3 = new Date(weekStart); d3.setDate(d3.getDate() + 3);
  const d4 = new Date(weekStart); d4.setDate(d4.getDate() + 4);
  const d5 = new Date(weekStart); d5.setDate(d5.getDate() + 5);
  const d6 = new Date(weekStart); d6.setDate(d6.getDate() + 6);

  let sectionsHtml = "";

  if (setores.length === 0) {
    sectionsHtml = `
      <div style="text-align:center; padding:40px; color:#666; font-style:italic;">
        Nenhuma atividade planejada para a semana.
      </div>`;
  } else {
    for (const setor of setores) {
      const setorTasks = groupedTasks[setor];

      sectionsHtml += `
      <section style="margin-bottom:28px; page-break-inside:avoid;">
        <div style="margin-bottom:12px;">
          <h2 style="font-size:16px; font-weight:700; color:#1f2937; margin:0; display:inline;">
            Setor: ${setor || "Sem Setor"}
          </h2>
          <span style="background:#e5e7eb; color:#374151; padding:4px 8px; border-radius:12px; font-size:12px; margin-left:10px;">
            ${setorTasks.length} atividade${setorTasks.length !== 1 ? "s" : ""}
          </span>
        </div>

        <table class="grid">
          <colgroup>
            <col><!-- 1: Atividade   48mm -->
            <col><!-- 2: Disciplina  16mm -->
            <col><!-- 3: Executante  16mm -->
            <col><!-- 4: Responsável 16mm -->
            <col><!-- 5: Encarregado 18mm -->
            <col><!-- 6: Seg  8mm -->
            <col><!-- 7: Ter  8mm -->
            <col><!-- 8: Qua  8mm -->
            <col><!-- 9: Qui  8mm -->
            <col><!-- 10: Sex 8mm -->
            <col><!-- 11: Sáb 8mm -->
            <col><!-- 12: Dom 8mm -->
          </colgroup>
          <thead>
            <tr>
              <th class="text">Atividade</th>
              <th class="text">Disciplina</th>
              <th class="text">Executante</th>
              <th class="text">Responsável</th>
              <th class="text">Encarregado</th>
              <th>
                <div class="day-header">
                  <span class="name">Seg</span><span class="date">${formatDayDate(d0)}</span>
                </div>
              </th>
              <th>
                <div class="day-header">
                  <span class="name">Ter</span><span class="date">${formatDayDate(d1)}</span>
                </div>
              </th>
              <th>
                <div class="day-header">
                  <span class="name">Qua</span><span class="date">${formatDayDate(d2)}</span>
                </div>
              </th>
              <th>
                <div class="day-header">
                  <span class="name">Qui</span><span class="date">${formatDayDate(d3)}</span>
                </div>
              </th>
              <th>
                <div class="day-header">
                  <span class="name">Sex</span><span class="date">${formatDayDate(d4)}</span>
                </div>
              </th>
              <th>
                <div class="day-header">
                  <span class="name">Sáb</span><span class="date">${formatDayDate(d5)}</span>
                </div>
              </th>
              <th>
                <div class="day-header">
                  <span class="name">Dom</span><span class="date">${formatDayDate(d6)}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>`;

      for (const task of setorTasks) {
        sectionsHtml += `
            <tr>
              <td class="text">${task.descricao ?? ""}</td>
              <td class="text">${task.disciplina ?? ""}</td>
              <td class="text">${task.executante ?? ""}</td>
              <td class="text">${task.responsavel ?? ""}</td>
              <td class="text">${task.encarregado ?? ""}</td>
              <td class="day-cell">${getStatusSymbol(task.seg)}</td>
              <td class="day-cell">${getStatusSymbol(task.ter)}</td>
              <td class="day-cell">${getStatusSymbol(task.qua)}</td>
              <td class="day-cell">${getStatusSymbol(task.qui)}</td>
              <td class="day-cell">${getStatusSymbol(task.sex)}</td>
              <td class="day-cell">${getStatusSymbol(task.sab)}</td>
              <td class="day-cell">${getStatusSymbol(task.dom)}</td>
            </tr>`;
      }

      sectionsHtml += `
          </tbody>
        </table>
      </section>`;
    }
  }

  return `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="utf-8" />
  <title>Relatório Semanal de Atividades</title>
  <style>
    @page { size: A4; margin: 14mm 20mm 16mm 20mm; } /* top, right, bottom, left */

    * { box-sizing: border-box; }
    body { font: 12px/1.35 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color:#111; margin:0; }
    .container { max-width: 170mm; margin: 0 auto; } /* mantém respiro lateral consistente */

    .header { text-align:center; margin-bottom:30px; border-bottom:2px solid #e5e7eb; padding-bottom:20px; }
    .header h1 { font-size:18px; font-weight:700; margin:0 0 10px; }
    .header .subtitle { font-size:14px; color:#6b7280; margin:5px 0; }
    .header .metadata { font-size:11px; color:#9ca3af; margin-top:10px; }

    table.grid { width:100%; border-collapse:collapse; table-layout:fixed; font-size:11px; }
    thead { display: table-header-group; }  /* repete cabeçalho quando quebra página */
    th, td { border:1px solid #e5e7eb; padding:6px 8px; vertical-align: middle; }
    th { background:#fafafa; font-weight:600; }
    tbody tr:nth-child(even) td { background:#fbfcfe; }

    /* Larguras fixas (mm) — iguais em TODAS as tabelas */
    colgroup col:nth-child(1) { width: 48mm; }  /* Atividade   */
    colgroup col:nth-child(2) { width: 16mm; }  /* Disciplina  */
    colgroup col:nth-child(3) { width: 16mm; }  /* Executante  */
    colgroup col:nth-child(4) { width: 16mm; }  /* Responsável */
    colgroup col:nth-child(5) { width: 18mm; }  /* Encarregado */
    colgroup col:nth-child(6),
    colgroup col:nth-child(7),
    colgroup col:nth-child(8),
    colgroup col:nth-child(9),
    colgroup col:nth-child(10),
    colgroup col:nth-child(11),
    colgroup col:nth-child(12) { width: 8mm; }  /* 7 dias → 56mm (Total 170mm) */

    /* Quebra apenas nas colunas de texto; cabeçalho não quebra por letra */
    th.text, td.text { word-break: break-word; overflow-wrap: anywhere; }
    thead th { word-break: keep-all; }

    /* Cabeçalho dos dias (duas linhas, sem quebrar letras) */
    .day-header { text-align:center; line-height:1.05; }
    .day-header .name, .day-header .date { display:block; white-space:nowrap; }
    .day-header .name { font-size:10px; }
    .day-header .date { font-size:9.5px; }

    .day-cell { text-align:center; vertical-align:middle; }
    .legend { margin-top:30px; padding-top:20px; border-top:1px solid #e5e7eb; font-size:11px; color:#6b7280; text-align:center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Relatório Semanal de Atividades – ${obraNome}</h1>
      <div class="subtitle">Período: ${formatDateRange(weekStart, weekEnd)}</div>
      <div class="metadata">Gerado em: ${formatDate(new Date())} às ${new Date().toLocaleTimeString("pt-BR")}</div>
    </div>
    ${sectionsHtml}
    <div class="legend"><strong>Legenda:</strong> ● Planejada | ✓ Executada | × Não Feita</div>
  </div>
</body>
</html>`;
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Variáveis de ambiente do Supabase ausentes (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parâmetros
    let obraId: string, obraNome: string, weekStart: string;
    if (req.method === "GET") {
      const url = new URL(req.url);
      obraId = url.searchParams.get("obraId") || "";
      obraNome = url.searchParams.get("obraNome") || "";
      weekStart = url.searchParams.get("weekStart") || "";
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

    // Consulta
    const { data: tasks, error } = await supabase
      .from("tarefas")
      .select(
        "setor, descricao, disciplina, executante, responsavel, encarregado, seg, ter, qua, qui, sex, sab, dom"
      )
      .eq("obra_id", obraId)
      .eq("semana", weekStart)
      .order("setor", { ascending: true })
      .order("descricao", { ascending: true });

    if (error) throw error;

    // Datas
    const weekStartDate = new Date(weekStart + "T00:00:00");
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    // HTML
    const html = generateHtmlContent(tasks || [], obraNome || "Obra", weekStartDate, weekEndDate);

    // Retorno (HTML para download — o navegador baixa com .html)
    const filename = `Relatorio_Semanal_${(obraNome || "Obra").replace(/\s+/g, "_")}_${weekStart}.html`;
    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Erro inesperado" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
