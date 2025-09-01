import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  return date.toLocaleDateString('pt-BR');
}

function formatDateRange(startDate: Date, endDate: Date): string {
  return `${formatDate(startDate)} a ${formatDate(endDate)}`;
}

function formatDayDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}/${month}`;
}

function getStatusSymbol(status: string | null): string {
  if (!status || status.trim() === '') return '';
  
  const normalizedStatus = status.toLowerCase().trim();
  
  if (normalizedStatus === 'executada') return '✓';
  if (normalizedStatus === 'não feita' || normalizedStatus === 'nao feita') return '×';
  return '●'; // Default for 'Planejada' or any other value
}

function sortSetores(setores: string[]): string[] {
  return setores.sort((a, b) => {
    const aUpper = a.toUpperCase();
    const bUpper = b.toUpperCase();
    
    // "GERAL" sempre primeiro
    if (aUpper === 'GERAL') return -1;
    if (bUpper === 'GERAL') return 1;
    
    // "SETOR X" em ordem numérica
    const aMatch = aUpper.match(/^SETOR\s+(\d+)$/);
    const bMatch = bUpper.match(/^SETOR\s+(\d+)$/);
    
    if (aMatch && bMatch) {
      return parseInt(aMatch[1]) - parseInt(bMatch[1]);
    }
    
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    
    // Ordem alfabética para os demais
    return aUpper.localeCompare(bUpper);
  });
}

function generateHtmlContent(
  tasks: TaskData[],
  obraNome: string,
  weekStart: Date,
  weekEnd: Date
): string {
  // Agrupar por setor
  const groupedTasks: GroupedTasks = {};
  
  tasks.forEach(task => {
    if (!groupedTasks[task.setor]) {
      groupedTasks[task.setor] = [];
    }
    groupedTasks[task.setor].push(task);
  });
  
  const setores = sortSetores(Object.keys(groupedTasks));
  
  // Gerar conteúdo HTML
  let sectionsHtml = '';
  
  // Calcular as datas dos dias da semana
  const mondayDate = new Date(weekStart);
  const tuesdayDate = new Date(weekStart);
  tuesdayDate.setDate(tuesdayDate.getDate() + 1);
  const wednesdayDate = new Date(weekStart);
  wednesdayDate.setDate(wednesdayDate.getDate() + 2);
  const thursdayDate = new Date(weekStart);
  thursdayDate.setDate(thursdayDate.getDate() + 3);
  const fridayDate = new Date(weekStart);
  fridayDate.setDate(fridayDate.getDate() + 4);
  const saturdayDate = new Date(weekStart);
  saturdayDate.setDate(saturdayDate.getDate() + 5);
  const sundayDate = new Date(weekStart);
  sundayDate.setDate(sundayDate.getDate() + 6);
  
  if (setores.length === 0) {
    sectionsHtml = `
      <div style="text-align: center; padding: 40px; color: #666; font-style: italic;">
        Nenhuma atividade planejada para a semana.
      </div>
    `;
  } else {
    setores.forEach(setor => {
      const setorTasks = groupedTasks[setor];
      
      sectionsHtml += `
        <section style="margin-bottom: 30px; page-break-inside: avoid;">
          <div style="margin-bottom: 15px;">
            <h2 style="font-size: 16px; font-weight: bold; color: #1f2937; margin: 0; display: inline;">
              Setor: ${setor}
            </h2>
            <span style="background: #e5e7eb; color: #374151; padding: 4px 8px; border-radius: 12px; font-size: 12px; margin-left: 10px;">
              ${setorTasks.length} atividade${setorTasks.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <table>
            <colgroup>
              <col><!-- Atividade: 50mm -->
              <col><!-- Disciplina: 20mm -->
              <col><!-- Executante: 20mm -->
              <col><!-- Responsável: 20mm -->
              <col><!-- Encarregado: 20mm -->
              <col><!-- Seg: 5.7mm -->
              <col><!-- Ter: 5.7mm -->
              <col><!-- Qua: 5.7mm -->
              <col><!-- Qui: 5.7mm -->
              <col><!-- Sex: 5.7mm -->
              <col><!-- Sab: 5.7mm -->
              <col><!-- Dom: 5.7mm -->
            </colgroup>
            <thead>
              <tr style="background: #fafafa; border-bottom: 1px solid #e5e7eb;">
                <th style="padding: 8px 6px; text-align: left; font-weight: bold; border: 1px solid #e5e7eb;">Atividade</th>
                <th style="padding: 8px 6px; text-align: left; font-weight: bold; border: 1px solid #e5e7eb;">Disciplina</th>
                <th style="padding: 8px 6px; text-align: left; font-weight: bold; border: 1px solid #e5e7eb;">Executante</th>
                <th style="padding: 8px 6px; text-align: left; font-weight: bold; border: 1px solid #e5e7eb;">Responsável</th>
                <th style="padding: 8px 6px; text-align: left; font-weight: bold; border: 1px solid #e5e7eb;">Encarregado</th>
                <th class="day-header" style="padding: 4px 2px; text-align: center; font-weight: bold; border: 1px solid #e5e7eb;">Seg<br><small>${formatDayDate(mondayDate)}</small></th>
                <th class="day-header" style="padding: 4px 2px; text-align: center; font-weight: bold; border: 1px solid #e5e7eb;">Ter<br><small>${formatDayDate(tuesdayDate)}</small></th>
                <th class="day-header" style="padding: 4px 2px; text-align: center; font-weight: bold; border: 1px solid #e5e7eb;">Qua<br><small>${formatDayDate(wednesdayDate)}</small></th>
                <th class="day-header" style="padding: 4px 2px; text-align: center; font-weight: bold; border: 1px solid #e5e7eb;">Qui<br><small>${formatDayDate(thursdayDate)}</small></th>
                <th class="day-header" style="padding: 4px 2px; text-align: center; font-weight: bold; border: 1px solid #e5e7eb;">Sex<br><small>${formatDayDate(fridayDate)}</small></th>
                <th class="day-header" style="padding: 4px 2px; text-align: center; font-weight: bold; border: 1px solid #e5e7eb;">Sáb<br><small>${formatDayDate(saturdayDate)}</small></th>
                <th class="day-header" style="padding: 4px 2px; text-align: center; font-weight: bold; border: 1px solid #e5e7eb;">Dom<br><small>${formatDayDate(sundayDate)}</small></th>
              </tr>
            </thead>
            <tbody>
      `;
      
      setorTasks.forEach(task => {
        sectionsHtml += `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 6px; border: 1px solid #e5e7eb; vertical-align: top;">${task.descricao}</td>
            <td style="padding: 8px 6px; border: 1px solid #e5e7eb; vertical-align: top;">${task.disciplina}</td>
            <td style="padding: 8px 6px; border: 1px solid #e5e7eb; vertical-align: top;">${task.executante}</td>
            <td style="padding: 8px 6px; border: 1px solid #e5e7eb; vertical-align: top;">${task.responsavel}</td>
            <td style="padding: 8px 6px; border: 1px solid #e5e7eb; vertical-align: top;">${task.encarregado}</td>
            <td class="day-cell" style="padding: 8px 4px; border: 1px solid #e5e7eb;">${getStatusSymbol(task.seg)}</td>
            <td class="day-cell" style="padding: 8px 4px; border: 1px solid #e5e7eb;">${getStatusSymbol(task.ter)}</td>
            <td class="day-cell" style="padding: 8px 4px; border: 1px solid #e5e7eb;">${getStatusSymbol(task.qua)}</td>
            <td class="day-cell" style="padding: 8px 4px; border: 1px solid #e5e7eb;">${getStatusSymbol(task.qui)}</td>
            <td class="day-cell" style="padding: 8px 4px; border: 1px solid #e5e7eb;">${getStatusSymbol(task.sex)}</td>
            <td class="day-cell" style="padding: 8px 4px; border: 1px solid #e5e7eb;">${getStatusSymbol(task.sab)}</td>
            <td class="day-cell" style="padding: 8px 4px; border: 1px solid #e5e7eb;">${getStatusSymbol(task.dom)}</td>
          </tr>
        `;
      });
      
      sectionsHtml += `
            </tbody>
          </table>
        </section>
      `;
    });
  }
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Relatório Semanal de Atividades</title>
  <style>
    @page {
      size: A4;
      margin: 14mm 24mm 16mm 24mm;
    }
    
    body {
      font-family: Arial, sans-serif;
      font-size: 12px;
      line-height: 1.4;
      color: #1f2937;
      margin: 0;
      padding: 0;
    }
    
    .container {
      max-width: 170mm;
      margin: 0 auto;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 20px;
    }
    
    .header h1 {
      font-size: 18px;
      font-weight: bold;
      margin: 0 0 10px 0;
      color: #1f2937;
    }
    
    .header .subtitle {
      font-size: 14px;
      color: #6b7280;
      margin: 5px 0;
    }
    
    .header .metadata {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 10px;
    }
    
    table {
      width: 100%;
      table-layout: fixed;
      border-collapse: collapse;
      font-size: 11px;
    }
    
    colgroup col:nth-child(1) { width: 50mm; }
    colgroup col:nth-child(2) { width: 20mm; }
    colgroup col:nth-child(3) { width: 20mm; }
    colgroup col:nth-child(4) { width: 20mm; }
    colgroup col:nth-child(5) { width: 20mm; }
    colgroup col:nth-child(6) { width: 5.7mm; }
    colgroup col:nth-child(7) { width: 5.7mm; }
    colgroup col:nth-child(8) { width: 5.7mm; }
    colgroup col:nth-child(9) { width: 5.7mm; }
    colgroup col:nth-child(10) { width: 5.7mm; }
    colgroup col:nth-child(11) { width: 5.7mm; }
    colgroup col:nth-child(12) { width: 5.7mm; }
    
    th, td {
      word-break: break-word;
      overflow-wrap: break-word;
    }
    
    .day-header {
      text-align: center;
    }
    
    .day-cell {
      text-align: center;
      vertical-align: middle;
    }
    
    .legend {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 11px;
      color: #6b7280;
      text-align: center;
    }
    
    thead {
      display: table-header-group;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Relatório Semanal de Atividades – ${obraNome}</h1>
      <div class="subtitle">
        Período: ${formatDateRange(weekStart, weekEnd)}
      </div>
      <div class="metadata">
        Gerado em: ${formatDate(new Date())} às ${new Date().toLocaleTimeString('pt-BR')}
      </div>
    </div>
    
    ${sectionsHtml}
    
    <div class="legend">
      <strong>Legenda:</strong> ● Planejada | ✓ Executada | × Não Feita
    </div>
  </div>
</body>
</html>
  `;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured');
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle both GET and POST requests
    let obraId: string, obraNome: string, weekStart: string;
    
    if (req.method === 'GET') {
      const url = new URL(req.url);
      obraId = url.searchParams.get('obraId') || '';
      obraNome = url.searchParams.get('obraNome') || '';
      weekStart = url.searchParams.get('weekStart') || '';
    } else {
      const body = await req.json();
      obraId = body.obraId;
      obraNome = body.obraNome;
      weekStart = body.weekStart;
    }

    console.log('📊 Generating PDF for:', { obraId, obraNome, weekStart });

    // Validate required parameters
    if (!obraId || !weekStart) {
      return new Response(
        JSON.stringify({ error: 'obraId and weekStart are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Query tasks from Supabase
    const { data: tasks, error } = await supabase
      .from('tarefas')
      .select('setor, descricao, disciplina, executante, responsavel, encarregado, seg, ter, qua, qui, sex, sab, dom')
      .eq('obra_id', obraId)
      .eq('semana', weekStart)
      .order('setor', { ascending: true })
      .order('descricao', { ascending: true });

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log('✅ Found', tasks?.length || 0, 'tasks');

    // Parse week start date and calculate week end
    const weekStartDate = new Date(weekStart + 'T00:00:00');
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    // Generate HTML content
    const htmlContent = generateHtmlContent(
      tasks || [],
      obraNome || 'Obra',
      weekStartDate,
      weekEndDate
    );

    // Return HTML content for download
    const filename = `Relatorio_Semanal_${(obraNome || 'Obra').replace(/\s+/g, '_')}_${weekStart}.html`;
    
    return new Response(htmlContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });

  } catch (error: any) {
    console.error('❌ Error in export-pdf function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});