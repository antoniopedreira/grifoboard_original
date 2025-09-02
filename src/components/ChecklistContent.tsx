import { useState } from "react"
import { AtividadeChecklist } from "@/types/checklist"
import ChecklistTable from "./ChecklistTable"
import ChecklistForm from "./ChecklistForm"
import ChecklistStats from "./ChecklistStats"
import { ChecklistFiltersBar } from "./checklist-filters/ChecklistFiltersBar"
import { CheckSquare } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { checklistService } from "@/services/checklistService"
import { useEffect } from "react"

const ChecklistContent = () => {
  const { userSession } = useAuth()
  const { toast } = useToast()
  const [atividades, setAtividades] = useState<AtividadeChecklist[]>([])
  const [filteredAtividades, setFilteredAtividades] = useState<AtividadeChecklist[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadAtividades = async () => {
    if (!userSession?.obraAtiva) return
    
    setIsLoading(true)
    try {
      const atividadesData = await checklistService.listarAtividades(userSession.obraAtiva.id)
      setAtividades(atividadesData)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      toast({
        title: "Erro ao carregar atividades",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (userSession?.obraAtiva) {
      loadAtividades()
    }
  }, [userSession?.obraAtiva])

  const handleAtividadeToggle = async (atividadeId: string, concluida: boolean) => {
    try {
      await checklistService.atualizarAtividade(atividadeId, { concluida })
      
      setAtividades(prevAtividades => 
        prevAtividades.map(atividade => 
          atividade.id === atividadeId 
            ? { ...atividade, concluida }
            : atividade
        )
      )
      
      toast({
        title: concluida ? "Atividade concluída" : "Atividade marcada como não concluída",
        description: "Status atualizado com sucesso",
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      toast({
        title: "Erro ao atualizar atividade",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleAtividadeDelete = async (atividadeId: string) => {
    try {
      await checklistService.excluirAtividade(atividadeId)
      
      setAtividades(prevAtividades => 
        prevAtividades.filter(atividade => atividade.id !== atividadeId)
      )
      
      toast({
        title: "Atividade excluída",
        description: "Atividade removida com sucesso",
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      toast({
        title: "Erro ao excluir atividade",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  if (!userSession?.obraAtiva) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-muted-foreground">
          Selecione uma obra para visualizar o checklist
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      <ChecklistFiltersBar 
        atividades={atividades}
        onFilteredAtividadesChange={setFilteredAtividades}
      />
      
      <div className="p-6 space-y-6">
        <div className="flex items-center mb-4">
          <CheckSquare className="h-5 w-5 mr-3 text-brand" />
          <h1 className="text-xl font-semibold text-foreground">Checklist de Atividades</h1>
        </div>
        
        <div className="bg-card border border-border rounded-grifo shadow-grifo">
          <div className="p-4">
            <ChecklistForm onAtividadeCriada={loadAtividades} />
          </div>
          
          <div className="p-4">
            <ChecklistStats atividades={filteredAtividades} />
          </div>
          
          <ChecklistTable 
            atividades={filteredAtividades} 
            isLoading={isLoading}
            onAtividadeToggle={handleAtividadeToggle}
            onAtividadeDelete={handleAtividadeDelete}
          />
        </div>
      </div>
    </div>
  )
}

export default ChecklistContent;
