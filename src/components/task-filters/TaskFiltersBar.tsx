import { useState, useMemo } from "react"
import { Task } from "@/types"
import { FilterBar, FilterChip } from "@/components/ui/filter-bar"

interface TaskFiltersBarProps {
  tasks: Task[]
  onFilteredTasksChange: (filteredTasks: Task[]) => void
}

export function TaskFiltersBar({ tasks, onFilteredTasksChange }: TaskFiltersBarProps) {
  const [activeChip, setActiveChip] = useState("todos")
  const [searchValue, setSearchValue] = useState("")

  const statusCounts = useMemo(() => {
    return {
      todos: tasks.length,
      concluidas: tasks.filter(t => t.isFullyCompleted).length,
      pendentes: tasks.filter(t => !t.isFullyCompleted && !t.causeIfNotDone).length,
      bloqueadas: tasks.filter(t => !t.isFullyCompleted && t.causeIfNotDone).length,
    }
  }, [tasks])

  const chips: FilterChip[] = [
    { id: "todos", label: "Todos", count: statusCounts.todos },
    { id: "concluidas", label: "Concluídas", count: statusCounts.concluidas },
    { id: "pendentes", label: "Pendentes", count: statusCounts.pendentes },
    { id: "bloqueadas", label: "Bloqueadas", count: statusCounts.bloqueadas },
  ]

  const filteredTasks = useMemo(() => {
    let filtered = tasks

    // Apply status filter
    switch (activeChip) {
      case "concluidas":
        filtered = filtered.filter(t => t.isFullyCompleted)
        break
      case "pendentes":
        filtered = filtered.filter(t => !t.isFullyCompleted && !t.causeIfNotDone)
        break
      case "bloqueadas":
        filtered = filtered.filter(t => !t.isFullyCompleted && t.causeIfNotDone)
        break
      default:
        break
    }

    // Apply search filter
    if (searchValue.trim()) {
      const searchLower = searchValue.toLowerCase()
      filtered = filtered.filter(task =>
        task.description.toLowerCase().includes(searchLower) ||
        task.sector.toLowerCase().includes(searchLower) ||
        task.discipline.toLowerCase().includes(searchLower) ||
        task.responsible.toLowerCase().includes(searchLower) ||
        task.executor?.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }, [tasks, activeChip, searchValue])

  // Update filtered tasks when they change
  useMemo(() => {
    onFilteredTasksChange(filteredTasks)
  }, [filteredTasks, onFilteredTasksChange])

  return (
    <FilterBar
      chips={chips}
      activeChip={activeChip}
      onChipChange={setActiveChip}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      searchPlaceholder="Buscar tarefas..."
    />
  )
}