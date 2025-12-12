import { Task, DayOfWeek } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Users, Briefcase, Layers, HardHat, CheckCircle2, XCircle, Save, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EditTaskFormProps {
  task: Task;
  editFormData: any; // Tipado como any para flexibilidade com o hook, mas idealmente seria o tipo do form
  onEditFormChange: (field: string, value: string) => void;
  onDayToggle: (day: DayOfWeek) => void;
  onDelete: () => void;
  onSave: () => void;
  isFormValid: () => boolean;
  onWeekDateChange: (date: Date) => void;
}

const EditTaskForm: React.FC<EditTaskFormProps> = ({
  editFormData,
  onEditFormChange,
  onDayToggle,
  onSave,
  isFormValid,
}) => {
  const days: { key: DayOfWeek; label: string }[] = [
    { key: "mon", label: "Seg" },
    { key: "tue", label: "Ter" },
    { key: "wed", label: "Qua" },
    { key: "thu", label: "Qui" },
    { key: "fri", label: "Sex" },
    { key: "sat", label: "Sáb" },
    { key: "sun", label: "Dom" },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Corpo do Formulário com Scroll */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Seção 1: O Que? (Definição da Atividade) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-primary/10 rounded-md">
              <Briefcase className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Definição da Atividade</h3>
          </div>

          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500">
                Descrição da Tarefa <span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={editFormData.description}
                onChange={(e) => onEditFormChange("description", e.target.value)}
                className="resize-none bg-white border-slate-200 focus:border-secondary focus:ring-secondary/20 min-h-[80px]"
                placeholder="Ex: Instalação de tubulação de água fria no 3º Pavimento"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500">
                  Setor <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Layers className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    value={editFormData.sector}
                    onChange={(e) => onEditFormChange("sector", e.target.value)}
                    className="pl-9 bg-white border-slate-200"
                    placeholder="Ex: Torre A"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500">Disciplina</Label>
                <Input
                  value={editFormData.discipline}
                  onChange={(e) => onEditFormChange("discipline", e.target.value)}
                  className="bg-white border-slate-200"
                  placeholder="Ex: Hidráulica"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="h-px bg-slate-200" />

        {/* Seção 2: Quem? (Responsáveis) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-primary/10 rounded-md">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Equipe Responsável</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500">
                Responsável <span className="text-red-500">*</span>
              </Label>
              <Input
                value={editFormData.responsible}
                onChange={(e) => onEditFormChange("responsible", e.target.value)}
                className="bg-white border-slate-200"
                placeholder="Nome do Eng/Mestre"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500">Executante</Label>
              <Input
                value={editFormData.team}
                onChange={(e) => onEditFormChange("team", e.target.value)}
                className="bg-white border-slate-200"
                placeholder="Empresa/Equipe"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500">Encarregado</Label>
              <div className="relative">
                <HardHat className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  value={editFormData.executor}
                  onChange={(e) => onEditFormChange("executor", e.target.value)}
                  className="pl-9 bg-white border-slate-200"
                  placeholder="Nome do líder"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="h-px bg-slate-200" />

        {/* Seção 3: Quando? (Planejamento) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-primary/10 rounded-md">
              <CalendarIcon className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Planejamento Semanal</h3>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <Label className="text-xs font-semibold text-slate-500 mb-3 block">
              Dias de Execução <span className="text-red-500">*</span>
            </Label>
            <div className="flex justify-between items-center gap-2">
              {days.map((day) => {
                const isSelected = editFormData.plannedDays.includes(day.key);
                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => onDayToggle(day.key)}
                    className={cn(
                      "flex flex-col items-center justify-center w-10 h-14 rounded-lg transition-all duration-200 border-2",
                      isSelected
                        ? "bg-secondary text-white border-secondary shadow-md transform scale-105"
                        : "bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100 hover:border-slate-200",
                    )}
                  >
                    <span className="text-[10px] font-bold uppercase">{day.label}</span>
                    <div className={cn("w-1.5 h-1.5 rounded-full mt-1", isSelected ? "bg-white" : "bg-slate-300")} />
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 mt-3 text-center">
              Clique nos dias para marcar/desmarcar a programação.
            </p>
          </div>
        </section>
      </div>

      {/* Footer Fixo */}
      <div className="p-4 bg-white border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 z-10">
        <Button
          variant="outline"
          onClick={onSave} // Em alguns casos pode ser usado como "Cancelar", mas aqui vamos focar no Save
          className="border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          Cancelar
        </Button>
        <Button
          onClick={onSave}
          disabled={!isFormValid()}
          className={cn(
            "gap-2 px-6 shadow-lg transition-all",
            isFormValid() ? "bg-primary hover:bg-primary/90" : "bg-slate-300 cursor-not-allowed",
          )}
        >
          <Save className="h-4 w-4" />
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
};

export default EditTaskForm;
