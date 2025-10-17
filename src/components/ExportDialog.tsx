import { useState } from "react";
import { FileDown, Building2, User } from "lucide-react";
import html2pdf from "html2pdf.js";
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

      const { data, error } = await supabase.functions.invoke('export-pdf', {
        body: { 
          obraId, 
          obraNome, 
          weekStart: weekStartISO,
          groupBy: exportType,
          executante: exportType === "executante" ? selectedExecutante : undefined
        },
      });

      if (error) {
        console.error("Export error:", error);
        toast.error("Erro ao exportar relatório");
        return;
      }

      // Generate PDF from HTML using html2pdf.js
      const { html, filename: baseFilename } = data;
      const element = document.createElement('div');
      element.innerHTML = html;
      document.body.appendChild(element);
      
      const filenameSuffix = exportType === "executante" 
        ? `_${selectedExecutante.replace(/\s+/g, "_")}`
        : "";
      const filename = baseFilename.replace('.pdf', `${filenameSuffix}.pdf`);
      
      const options = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' as const,
          compress: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(options).from(element).save();
      document.body.removeChild(element);
      
      toast.success("Relatório exportado com sucesso");
      setOpen(false);
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Erro ao baixar relatório");
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
