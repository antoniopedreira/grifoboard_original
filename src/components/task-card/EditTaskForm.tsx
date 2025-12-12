import { Task, DayOfWeek } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Users, Briefcase, Layers, HardHat, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditTaskFormProps {
  task: Task;
  editFormData: any;
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
      {/* Área de Scroll */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50">
        {/* Seção 1: Definição */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-secondary" />
            <h3 className="text-sm font-bold text-slate-700 uppercase">Definição da Atividade</h3>
          </div>

          <div className="grid gap-4 bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500">
                Descrição da Tarefa <span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={editFormData.description}
                onChange={(e) => onEditFormChange("description", e.target.value)}
                className="resize-none border-slate-200 focus:border-secondary min-h-[70px]"
                placeholder="Descreva a atividade..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500">
                  Setor <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={editFormData.sector}
                  onChange={(e) => onEditFormChange("sector", e.target.value)}
                  className="border-slate-200"
                  placeholder="Setor/Local"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500">Disciplina</Label>
                <Input
                  value={editFormData.discipline}
                  onChange={(e) => onEditFormChange("discipline", e.target.value)}
                  className="border-slate-200"
                  placeholder="Ex: Elétrica"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Seção 2: Equipe */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-secondary" />
            <h3 className="text-sm font-bold text-slate-700 uppercase">Equipe Responsável</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500">
                Responsável <span className="text-red-500">*</span>
              </Label>
              <Input
                value={editFormData.responsible}
                onChange={(e) => onEditFormChange("responsible", e.target.value)}
                className="border-slate-200"
                placeholder="Engenheiro"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500">Executante</Label>
              <Input
                value={editFormData.team}
                onChange={(e) => onEditFormChange("team", e.target.value)}
                className="border-slate-200"
                placeholder="Equipe"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-semibold text-slate-500">Encarregado</Label>
              <Input
                value={editFormData.executor}
                onChange={(e) => onEditFormChange("executor", e.target.value)}
                className="border-slate-200"
                placeholder="Líder"
              />
            </div>
          </div>
        </section>

        {/* Seção 3: Planejamento */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-secondary" />
            <h3 className="text-sm font-bold text-slate-700 uppercase">Planejamento Semanal</h3>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm">
            <div className="flex justify-between items-center gap-2">
              {days.map((day) => {
                const isSelected = editFormData.plannedDays.includes(day.key);
                return (
                  <button
                    key={day.key}
                    onClick={() => onDayToggle(day.key)}
                    className={cn(
                      "flex flex-col items-center justify-center w-11 h-16 rounded-lg transition-all duration-200 border-2",
                      isSelected
                        ? "bg-secondary text-white border-secondary shadow-md transform -translate-y-1"
                        : "bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100 hover:border-slate-200",
                    )}
                  >
                    <span className="text-[10px] font-bold uppercase mb-1">{day.label}</span>
                    <div className={cn("w-2 h-2 rounded-full", isSelected ? "bg-white" : "bg-slate-300")} />
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Footer Fixo */}
      <div className="p-4 border-t border-slate-100 bg-white sticky bottom-0 z-10 flex justify-end gap-3">
        <Button variant="outline" onClick={onSave}>
          Cancelar
        </Button>
        <Button onClick={onSave} disabled={!isFormValid()} className="bg-primary hover:bg-primary/90 min-w-[140px]">
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
};

export default EditTaskForm;
