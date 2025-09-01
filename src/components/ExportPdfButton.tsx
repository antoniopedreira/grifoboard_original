import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Utility function to normalize any date to Monday of its week
function toMondayISO(date: Date): string {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const delta = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Calculate days to subtract to get Monday
  const monday = new Date(date);
  monday.setDate(date.getDate() + delta);
  return monday.toISOString().slice(0, 10); // Return YYYY-MM-DD format
}

interface ExportPdfButtonProps {
  obraId: string;
  obraNome: string;
  weekStartDate: Date;
}

const ExportPdfButton = ({ obraId, obraNome, weekStartDate }: ExportPdfButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleExportPdf = async () => {
    if (!obraId || !obraNome) {
      toast({
        title: "Erro",
        description: "Obra não selecionada. Selecione uma obra antes de exportar.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Normalize weekStartDate to Monday ISO format
      const weekStartISO = toMondayISO(weekStartDate);
      
      console.log('🚀 Exporting PDF for:', { obraId, obraNome, weekStartISO });

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('export-pdf', {
        body: {
          obraId,
          obraNome,
          weekStart: weekStartISO
        }
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        throw error;
      }

    // The function returns HTML content that can be printed or saved as PDF
    if (typeof data === 'string') {
      // Create a new window with the HTML content for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(data);
        printWindow.document.close();
        
        // Auto-print after a short delay to allow content to render
        setTimeout(() => {
          printWindow.print();
          // Don't auto-close, let user decide
        }, 1000);
        
        toast({
          title: "PDF gerado",
          description: "Uma nova janela foi aberta para impressão/download do relatório.",
        });
      } else {
        // Fallback: download as HTML file
        const blob = new Blob([data], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        const filename = `Relatorio_Semanal_${obraNome.replace(/[^a-zA-Z0-9]/g, '_')}_${weekStartISO}.html`;
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Relatório baixado",
          description: "O arquivo HTML foi baixado. Abra-o no navegador e use Ctrl+P para gerar PDF.",
        });
      }
    } else {
      throw new Error('Invalid response format');
    }

    } catch (error: any) {
      console.error('❌ Export PDF error:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: error.message || "Não foi possível gerar o relatório PDF.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExportPdf}
      disabled={isLoading || !obraId}
      className="flex items-center gap-2 hover:bg-primary/5 border-primary/20"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      {isLoading ? "Gerando..." : "Exportar PDF"}
    </Button>
  );
};

export default ExportPdfButton;