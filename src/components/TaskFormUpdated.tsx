import { useState } from "react"
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
import { Calendar, Plus } from "lucide-react"

interface TaskFormProps {
  onTaskCreate: (task: Omit<Task, "id" | "dailyStatus" | "isFullyCompleted">) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  currentWeekStartDate?: Date
}

const TaskForm: React.FC<TaskFormProps> = ({
  onTaskCreate,
  isOpen,
  onOpenChange,
  currentWeekStartDate
}) => {
  const [formData, setFormData] = useState({
    description: "",
    item: "",
    sector: "",
    discipline: "",
    team: "",
    responsible: "",
    executor: "",
    plannedDays: [] as string[]
  })

  const daysOfWeek = [
    { key: "monday", label: "S" },
    { key: "tuesday", label: "T" },
    { key: "wednesday", label: "Q" },
    { key: "thursday", label: "Q" },
    { key: "friday", label: "S" },
    { key: "saturday", label: "S" },
    { key: "sunday", label: "D" }
  ]

  const isFormValid = formData.description.trim().length > 0 && 
                     formData.sector.trim().length > 0 &&
                     formData.plannedDays.length > 0

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      plannedDays: prev.plannedDays.includes(day)
        ? prev.plannedDays.filter(d => d !== day)
        : [...prev.plannedDays, day]
    }))
  }

  const handleSubmit = () => {
    if (!isFormValid) return

    onTaskCreate({
      ...formData,
      plannedDays: formData.plannedDays as any,
      weekStartDate: currentWeekStartDate || new Date(),
      causeIfNotDone: ""
    })
    
    // Reset form
    setFormData({
      description: "",
      item: "",
      sector: "",
      discipline: "",
      team: "",
      responsible: "",
      executor: "",
      plannedDays: []
    })
    
    onOpenChange(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isFormValid) {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === "Escape") {
      e.preventDefault()
      onOpenChange(false)
    }
  }

  return (
    <ModalShell open={isOpen} onOpenChange={onOpenChange}>
      <ModalShellContent className="max-w-2xl" onKeyDown={handleKeyDown}>
        <ModalShellHeader>
          <ModalShellTitle>Nova Tarefa</ModalShellTitle>
          <ModalShellDescription>
            Crie uma nova tarefa para o seu projeto
          </ModalShellDescription>
        </ModalShellHeader>

        <ModalShellBody>
          <div className="grid grid-cols-2 gap-4">
            {/* Descrição - 2 colunas */}
            <div className="col-span-2">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Descrição *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                value={formData.item}
                onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                placeholder="Item da tarefa"
              />
            </div>

            {/* Setor */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Setor *
              </label>
              <GrifoInput
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                placeholder="Setor"
              />
            </div>

            {/* Disciplina */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Disciplina
              </label>
              <GrifoInput
                value={formData.discipline}
                onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                placeholder="Disciplina"
              />
            </div>

            {/* Executante */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Executante
              </label>
              <GrifoInput
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                placeholder="Executante"
              />
            </div>

            {/* Responsável */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Responsável
              </label>
              <GrifoInput
                value={formData.responsible}
                onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                placeholder="Responsável"
              />
            </div>

            {/* Encarregado */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Encarregado
              </label>
              <GrifoInput
                value={formData.executor}
                onChange={(e) => setFormData({ ...formData, executor: e.target.value })}
                placeholder="Encarregado"
              />
            </div>

            {/* Dias Planejados - 2 colunas */}
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-foreground">
                  Dias Planejados *
                </label>
                <div className="flex items-center gap-2">
                  <GrifoButton
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      ["monday", "tuesday", "wednesday", "thursday", "friday"].forEach(day => {
                        if (!formData.plannedDays.includes(day)) {
                          handleDayToggle(day)
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
                        if (!formData.plannedDays.includes(day.key)) {
                          handleDayToggle(day.key)
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
                    isSelected={formData.plannedDays.includes(day.key)}
                    onClick={() => handleDayToggle(day.key)}
                  />
                ))}
              </div>
            </div>
          </div>
        </ModalShellBody>

        <ModalShellFooter>
          <div className="flex gap-2 ml-auto">
            <GrifoButton
              variant="neutral"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </GrifoButton>
            <GrifoButton
              variant="primary"
              onClick={handleSubmit}
              disabled={!isFormValid}
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Tarefa
            </GrifoButton>
          </div>
        </ModalShellFooter>
      </ModalShellContent>
    </ModalShell>
  )
}

export default TaskForm