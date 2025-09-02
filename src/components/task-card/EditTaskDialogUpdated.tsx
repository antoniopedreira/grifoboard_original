import { Task } from "@/types"
import { 
  ModalShell,
  ModalShellContent,
  ModalShellHeader,
  ModalShellBody,
  ModalShellFooter,
  ModalShellTitle,
  ModalShellDescription
} from "@/components/ui/modal-shell"
import { GrifoButton } from "@/components/ui/grifo-button"
import { GrifoInput } from "@/components/ui/grifo-input"
import { Textarea } from "@/components/ui/textarea"
import { DayPill } from "@/components/ui/day-pill"
import { Trash2, Calendar, Save } from "lucide-react"

interface EditTaskDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  task: Task
  editFormData: any
  onEditFormChange: (data: any) => void
  onDayToggle: (day: string) => void
  onDelete: () => void
  onSave: () => void
  isFormValid: boolean
  onWeekDateChange: (date: Date) => void
}

const EditTaskDialog: React.FC<EditTaskDialogProps> = ({
  isOpen,
  onOpenChange,
  task,
  editFormData,
  onEditFormChange,
  onDayToggle,
  onDelete,
  onSave,
  isFormValid,
  onWeekDateChange
}) => {
  const daysOfWeek = [
    { key: "monday", label: "S" },
    { key: "tuesday", label: "T" },
    { key: "wednesday", label: "Q" },
    { key: "thursday", label: "Q" },
    { key: "friday", label: "S" },
    { key: "saturday", label: "S" },
    { key: "sunday", label: "D" }
  ]

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isFormValid) {
      e.preventDefault()
      onSave()
    } else if (e.key === "Escape") {
      e.preventDefault()
      onOpenChange(false)
    }
  }

  return (
    <ModalShell open={isOpen} onOpenChange={onOpenChange}>
      <ModalShellContent className="max-w-2xl" onKeyDown={handleKeyDown}>
        <ModalShellHeader>
          <ModalShellTitle>Editar Tarefa</ModalShellTitle>
          <ModalShellDescription>
            Atualize os detalhes da tarefa conforme necessário
          </ModalShellDescription>
        </ModalShellHeader>

        <ModalShellBody>
          <div className="grid grid-cols-2 gap-4">
            {/* Descrição - 2 colunas */}
            <div className="col-span-2">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Descrição
              </label>
              <Textarea
                value={editFormData.description || ""}
                onChange={(e) => onEditFormChange({ ...editFormData, description: e.target.value })}
                placeholder="Descrição da tarefa..."
                className="min-h-20"
              />
            </div>

            {/* Item */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Item
              </label>
              <GrifoInput
                value={editFormData.item || ""}
                onChange={(e) => onEditFormChange({ ...editFormData, item: e.target.value })}
                placeholder="Item da tarefa"
              />
            </div>

            {/* Setor */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Setor
              </label>
              <GrifoInput
                value={editFormData.sector || ""}
                onChange={(e) => onEditFormChange({ ...editFormData, sector: e.target.value })}
                placeholder="Setor"
              />
            </div>

            {/* Disciplina */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Disciplina
              </label>
              <GrifoInput
                value={editFormData.discipline || ""}
                onChange={(e) => onEditFormChange({ ...editFormData, discipline: e.target.value })}
                placeholder="Disciplina"
              />
            </div>

            {/* Executante */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Executante
              </label>
              <GrifoInput
                value={editFormData.team || ""}
                onChange={(e) => onEditFormChange({ ...editFormData, team: e.target.value })}
                placeholder="Executante"
              />
            </div>

            {/* Responsável */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Responsável
              </label>
              <GrifoInput
                value={editFormData.responsible || ""}
                onChange={(e) => onEditFormChange({ ...editFormData, responsible: e.target.value })}
                placeholder="Responsável"
              />
            </div>

            {/* Encarregado */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Encarregado
              </label>
              <GrifoInput
                value={editFormData.executor || ""}
                onChange={(e) => onEditFormChange({ ...editFormData, executor: e.target.value })}
                placeholder="Encarregado"
              />
            </div>

            {/* Dias Planejados - 2 colunas */}
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-foreground">
                  Dias Planejados
                </label>
                <div className="flex items-center gap-2">
                  <GrifoButton
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      ["monday", "tuesday", "wednesday", "thursday", "friday"].forEach(day => {
                        if (!editFormData.plannedDays?.includes(day)) {
                          onDayToggle(day)
                        }
                      })
                    }}
                    className="h-7 px-2 text-xs"
                  >
                    Seg-Sex
                  </GrifoButton>
                  <GrifoButton
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      daysOfWeek.forEach(day => {
                        if (!editFormData.plannedDays?.includes(day.key)) {
                          onDayToggle(day.key)
                        }
                      })
                    }}
                    className="h-7 px-2 text-xs"
                  >
                    Todos
                  </GrifoButton>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {daysOfWeek.map(day => (
                  <DayPill
                    key={day.key}
                    day={day.label}
                    isSelected={editFormData.plannedDays?.includes(day.key) || false}
                    onClick={() => onDayToggle(day.key)}
                  />
                ))}
              </div>
            </div>
          </div>
        </ModalShellBody>

        <ModalShellFooter>
          <GrifoButton
            variant="danger"
            onClick={onDelete}
            className="mr-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </GrifoButton>
          
          <div className="flex gap-2">
            <GrifoButton
              variant="neutral"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </GrifoButton>
            <GrifoButton
              variant="primary"
              onClick={onSave}
              disabled={!isFormValid}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </GrifoButton>
          </div>
        </ModalShellFooter>
      </ModalShellContent>
    </ModalShell>
  )
}

export default EditTaskDialog