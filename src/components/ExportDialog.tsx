import { useState } from "react";
import { FileDown, Building2, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRegistry } from "@/context/RegistryContext";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface ExportDialogProps {
  obraId: string;
  obraNome: string;
  weekStartDate: Date;
}

// Utility function to normalize any date to Monday of its week
function toMondayISO(date: Date): string {
  const dayOfWeek = date.getDay();
  const delta = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(date);
  monday.setDate(date.getDate() + delta);
  return monday.toISOString().slice(0, 10);
}

const ExportDialog = ({ obraId, obraNome, weekStartDate }: ExportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [exportType, setExportType] = useState<"setor" | "executante">("setor");
  const [selectedExecutante, setSelectedExecutante] = useState<string>("");
  const [loading, setLoading] = useState(false);
  
  const { teams } = useRegistry();

  const weekStartISO = toMondayISO(weekStartDate);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleExportTypeChange = (value: string) => {
    setExportType(value as "setor" | "executante");
  };

  const handleExport = async () => {
    if (exportType === "executante" && !selectedExecutante) {
      toast.error("Selecione um executante");
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Você precisa estar autenticado para exportar relatórios");
        return;
      }

      toast.info("Gerando PDF...");

      // Get Supabase URL from environment
      const functionUrl = 'https://qacaerwosglbayjfskyx.supabase.co/functions/v1/export-pdf';

      // Call the edge function to get HTML
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          obraId, 
          obraNome, 
          weekStart: weekStartISO,
          groupBy: exportType,
          executante: exportType === "executante" ? selectedExecutante : undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        console.error("Export error:", errorData);
        toast.error("Erro ao exportar relatório");
        return;
      }

      // Get HTML content
      const htmlContent = await response.text();
      
      // Create a temporary container to render HTML
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.width = '210mm'; // A4 width
      container.innerHTML = htmlContent;
      document.body.appendChild(container);

      // Wait for fonts and images to load
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 500));

      // Convert HTML to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 794, // A4 width in pixels at 96 DPI
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // Clean up
      document.body.removeChild(container);

      // Create blob and open in new window
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Open PDF in new window with browser's PDF viewer
      window.open(pdfUrl, '_blank');
      
      toast.success("PDF gerado com sucesso!");
      setOpen(false);
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Erro ao gerar PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-primary/20 rounded-md hover:bg-primary/5 transition-colors">
          <FileDown className="h-4 w-4" />
          Exportar PDF
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar Relatório Semanal</DialogTitle>
          <DialogDescription>
            Escolha o tipo de agrupamento para o relatório
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <RadioGroup value={exportType} onValueChange={handleExportTypeChange}>
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
              <RadioGroupItem value="setor" id="setor" />
              <Label htmlFor="setor" className="flex items-center gap-2 cursor-pointer flex-1">
                <Building2 className="h-4 w-4" />
                <div>
                  <div className="font-medium">Por Setor</div>
                  <div className="text-xs text-muted-foreground">Agrupar atividades por setores</div>
                </div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
              <RadioGroupItem value="executante" id="executante" />
              <Label htmlFor="executante" className="flex items-center gap-2 cursor-pointer flex-1">
                <User className="h-4 w-4" />
                <div>
                  <div className="font-medium">Por Executante</div>
                  <div className="text-xs text-muted-foreground">Agrupar atividades por executante</div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {exportType === "executante" && (
            <div className="space-y-2">
              <Label htmlFor="executante-select">Selecione o Executante</Label>
              <Select value={selectedExecutante} onValueChange={setSelectedExecutante}>
                <SelectTrigger id="executante-select">
                  <SelectValue placeholder="Escolha um executante" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((exec) => (
                    <SelectItem key={exec} value={exec}>
                      {exec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={loading}>
            {loading ? "Exportando..." : "Exportar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
