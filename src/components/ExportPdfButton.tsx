import { useState } from "react";
import { FileDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import html2pdf from "html2pdf.js";

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
  const [loading, setLoading] = useState(false);
  const weekStartISO = toMondayISO(weekStartDate);

  const handleDownload = async () => {
    setLoading(true);
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
        setLoading(false);
        return;
      }

      // Generate PDF from HTML using html2pdf.js
      const { html, filename } = data;
      const element = document.createElement('div');
      element.innerHTML = html;
      
      const options = {
        margin: [14, 18, 16, 18] as [number, number, number, number],
        filename,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };

      await html2pdf().set(options).from(element).save();
      
      toast.success("Relatório exportado com sucesso");
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Erro ao baixar relatório");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-primary/20 rounded-md hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <FileDown className="h-4 w-4" />
      {loading ? "Exportando..." : "Exportar PDF"}
    </button>
  );
};
export default ExportPdfButton;