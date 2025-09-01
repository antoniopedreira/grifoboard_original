import { useMemo } from "react";
import { FileDown } from "lucide-react";

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

  const href = useMemo(() => {
    const q = new URLSearchParams({ obraId, obraNome, weekStart: weekStartISO }).toString();
    return `https://qacaerwosglbayjfskyx.supabase.co/functions/v1/export-pdf?${q}`;
  }, [obraId, obraNome, weekStartISO]);

  const filename = `Relatorio_Semanal_${obraNome.replace(/\s+/g,"_")}_${weekStartISO}.html`;

  const handleDownload = () => {
    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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