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
    // CORREÇÃO: h-full garante que ocupe todo espaço disponível dado pelo DialogContent
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Área de Scroll: flex-1 e overflow-y-auto habilitam a rolagem aqui */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* Seção 1: Definição */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-primary/10 rounded-md">
              <Briefcase className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Definição da Atividade</h3>
          </div>

          <div className="grid gap-4 bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500">
                Descrição da Tarefa <span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={editFormData.description}
                onChange={(e) => onEditFormChange("description", e.target.value)}
                className="resize-none bg-slate-50 border-slate-200 focus:bg-white transition-colors min-h-[80px]"
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
                    className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    placeholder="Ex: Torre A"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500">Disciplina</Label>
                <Input
                  value={editFormData.discipline}
                  onChange={(e) => onEditFormChange("discipline", e.target.value)}
                  className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  placeholder="Ex: Hidráulica"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Seção 2: Equipe */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-primary/10 rounded-md">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Equipe Responsável</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500">
                Responsável <span className="text-red-500">*</span>
              </Label>
              <Input
                value={editFormData.responsible}
                onChange={(e) => onEditFormChange("responsible", e.target.value)}
                className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                placeholder="Nome do Eng/Mestre"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500">Executante</Label>
              <Input
                value={editFormData.team}
                onChange={(e) => onEditFormChange("team", e.target.value)}
                className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                placeholder="Empresa/Equipe"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-semibold text-slate-500">Encarregado</Label>
              <div className="relative">
                <HardHat className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  value={editFormData.executor}
                  onChange={(e) => onEditFormChange("executor", e.target.value)}
                  className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  placeholder="Nome do líder"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Seção 3: Planejamento */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-primary/10 rounded-md">
              <CalendarIcon className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Planejamento Semanal</h3>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm">
            <Label className="text-xs font-semibold text-slate-500 mb-4 block">
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
            <p className="text-[10px] text-slate-400 mt-4 text-center">
              Selecione os dias programados para esta atividade.
            </p>
          </div>
        </section>
      </div>

      {/* Footer Fixo */}
      <div className="flex-none p-4 bg-white border-t border-slate-100 flex justify-end gap-3 shadow-[-10px_0_20px_rgba(0,0,0,0.02)]">
        <Button
          variant="outline"
          onClick={onSave} // Fecha o modal implicitamente se não houver mudanças, ou salva
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
