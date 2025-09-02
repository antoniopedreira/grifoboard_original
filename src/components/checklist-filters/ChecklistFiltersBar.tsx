import { useState, useMemo } from "react"
import { AtividadeChecklist } from "@/types/checklist"
import { FilterBar, FilterChip } from "@/components/ui/filter-bar"

interface ChecklistFiltersBarProps {
  atividades: AtividadeChecklist[]
  onFilteredAtividadesChange: (filteredAtividades: AtividadeChecklist[]) => void
}

export function ChecklistFiltersBar({ 
  atividades, 
  onFilteredAtividadesChange 
}: ChecklistFiltersBarProps) {
  const [activeChip, setActiveChip] = useState("todos")
  const [searchValue, setSearchValue] = useState("")

  const statusCounts = useMemo(() => {
    return {
      todos: atividades.length,
      concluidas: atividades.filter(a => a.concluida).length,
      pendentes: atividades.filter(a => !a.concluida).length,
    }
  }, [atividades])

  const chips: FilterChip[] = [
    { id: "todos", label: "Todos", count: statusCounts.todos },
    { id: "concluidas", label: "Concluídas", count: statusCounts.concluidas },
    { id: "pendentes", label: "Pendentes", count: statusCounts.pendentes },
  ]

  const filteredAtividades = useMemo(() => {
    let filtered = atividades

    // Apply status filter
    switch (activeChip) {
      case "concluidas":
        filtered = filtered.filter(a => a.concluida)
        break
      case "pendentes":
        filtered = filtered.filter(a => !a.concluida)
        break
      default:
        break
    }

    // Apply search filter
    if (searchValue.trim()) {
      const searchLower = searchValue.toLowerCase()
      filtered = filtered.filter(atividade =>
        atividade.descricao?.toLowerCase().includes(searchLower) ||
        atividade.local?.toLowerCase().includes(searchLower) ||
        atividade.setor?.toLowerCase().includes(searchLower) ||
        atividade.responsavel?.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }, [atividades, activeChip, searchValue])

  // Update filtered activities when they change
  useMemo(() => {
    onFilteredAtividadesChange(filteredAtividades)
  }, [filteredAtividades, onFilteredAtividadesChange])

  return (
    <FilterBar
      chips={chips}
      activeChip={activeChip}
      onChipChange={setActiveChip}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      searchPlaceholder="Buscar atividades..."
    />
  )
}