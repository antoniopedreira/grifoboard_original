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

function getStatusSymbol(status: string | null): string {
  if (!status || status.trim() === '') return '';
  
  const normalizedStatus = status.toLowerCase().trim();
  
  if (normalizedStatus === 'executada') return '●';
  if (normalizedStatus === 'não feita' || normalizedStatus === 'nao feita') return '×';
  return '✓'; // Default for 'Planejada' or any other value
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
          
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead style="display: table-header-group;">
              <tr style="background: #fafafa; border-bottom: 1px solid #e5e7eb;">
                <th style="padding: 8px 6px; text-align: left; font-weight: bold; border: 1px solid #e5e7eb;">Atividade</th>
                <th style="padding: 8px 6px; text-align: left; font-weight: bold; border: 1px solid #e5e7eb;">Disciplina</th>
                <th style="padding: 8px 6px; text-align: left; font-weight: bold; border: 1px solid #e5e7eb;">Executante</th>
                <th style="padding: 8px 6px; text-align: left; font-weight: bold; border: 1px solid #e5e7eb;">Responsável</th>
                <th style="padding: 8px 6px; text-align: left; font-weight: bold; border: 1px solid #e5e7eb;">Encarregado</th>
                <th style="padding: 8px 4px; text-align: center; font-weight: bold; border: 1px solid #e5e7eb; width: 30px;">Seg</th>
                <th style="padding: 8px 4px; text-align: center; font-weight: bold; border: 1px solid #e5e7eb; width: 30px;">Ter</th>
                <th style="padding: 8px 4px; text-align: center; font-weight: bold; border: 1px solid #e5e7eb; width: 30px;">Qua</th>
                <th style="padding: 8px 4px; text-align: center; font-weight: bold; border: 1px solid #e5e7eb; width: 30px;">Qui</th>
                <th style="padding: 8px 4px; text-align: center; font-weight: bold; border: 1px solid #e5e7eb; width: 30px;">Sex</th>
                <th style="padding: 8px 4px; text-align: center; font-weight: bold; border: 1px solid #e5e7eb; width: 30px;">Sáb</th>
                <th style="padding: 8px 4px; text-align: center; font-weight: bold; border: 1px solid #e5e7eb; width: 30px;">Dom</th>
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
            <td style="padding: 8px 4px; border: 1px solid #e5e7eb; text-align: center; vertical-align: middle;">${getStatusSymbol(task.seg)}</td>
            <td style="padding: 8px 4px; border: 1px solid #e5e7eb; text-align: center; vertical-align: middle;">${getStatusSymbol(task.ter)}</td>
            <td style="padding: 8px 4px; border: 1px solid #e5e7eb; text-align: center; vertical-align: middle;">${getStatusSymbol(task.qua)}</td>
            <td style="padding: 8px 4px; border: 1px solid #e5e7eb; text-align: center; vertical-align: middle;">${getStatusSymbol(task.qui)}</td>
            <td style="padding: 8px 4px; border: 1px solid #e5e7eb; text-align: center; vertical-align: middle;">${getStatusSymbol(task.sex)}</td>
            <td style="padding: 8px 4px; border: 1px solid #e5e7eb; text-align: center; vertical-align: middle;">${getStatusSymbol(task.sab)}</td>
            <td style="padding: 8px 4px; border: 1px solid #e5e7eb; text-align: center; vertical-align: middle;">${getStatusSymbol(task.dom)}</td>
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
      margin: 14mm 12mm 16mm 12mm;
    }
    
    body {
      font-family: Arial, sans-serif;
      font-size: 12px;
      line-height: 1.4;
      color: #1f2937;
      margin: 0;
      padding: 0;
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
    <strong>Legenda:</strong> ✓ Planejada | ● Executada | × Não Feita
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

    const { obraId, obraNome, weekStart } = await req.json();

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

    // For now, return HTML content directly since jsPDF needs to run in browser context
    // In a real implementation, you would use Puppeteer or similar to generate PDF from HTML
    const filename = `Relatorio_Semanal_${(obraNome || 'Obra').replace(/[^a-zA-Z0-9]/g, '_')}_${weekStart}.html`;
    
    return new Response(htmlContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${filename}"`,
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