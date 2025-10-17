import { useMemo } from "react";
import { FileDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const weekStartISO = toMondayISO(weekStartDate);

  const filename = `Relatorio_Semanal_${obraNome.replace(/\s+/g,"_")}_${weekStartISO}.pdf`;

  const handleDownload = async () => {
    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Você precisa estar autenticado para exportar relatórios");
        return;
      }

      // Call the edge function with authentication
      const { data, error } = await supabase.functions.invoke('export-pdf', {
        body: { obraId, obraNome, weekStart: weekStartISO },
      });

      if (error) {
        console.error("Export error:", error);
        toast.error("Erro ao exportar relatório");
        return;
      }

      // Create blob from response and download
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Relatório exportado com sucesso");
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Erro ao baixar relatório");
    }
  };

  return (
    <button 
      onClick={handleDownload}
      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-primary/20 rounded-md hover:bg-primary/5 transition-colors"
    >
      <FileDown className="h-4 w-4" />
      Exportar PDF
    </button>
  );
};
export default ExportPdfButton;