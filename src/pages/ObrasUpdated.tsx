import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Obra } from "@/types/supabase"
import { obrasService } from "@/services/obraService"
import { GrifoCard, GrifoCardContent, GrifoCardHeader, GrifoCardTitle } from "@/components/ui/grifo-card"
import { GrifoButton } from "@/components/ui/grifo-button"
import { StatusChip } from "@/components/ui/status-chip"
import { Building2, MapPin, Calendar, TrendingUp, AlertTriangle } from "lucide-react"

const ObrasUpdated = () => {
  const [obras, setObras] = useState<Obra[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { setObraAtiva, userSession } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    loadObras()
  }, [])

  const loadObras = async () => {
    try {
      setIsLoading(true)
      const obrasData = await obrasService.listarObras()
      setObras(obrasData)
    } catch (error) {
      toast({
        title: "Erro ao carregar obras",
        description: "Não foi possível carregar a lista de obras.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleObraSelect = (obra: Obra) => {
    setObraAtiva(obra)
    navigate("/")
    toast({
      title: "Obra selecionada",
      description: `Trabalho ativado para a obra: ${obra.nome_obra}`,
    })
  }

  const getRiskVariant = (risk?: string) => {
    switch (risk?.toLowerCase()) {
      case "alto": return "danger"
      case "médio": return "warning"
      case "baixo": return "success"
      default: return "neutral"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-alt flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
          <p className="text-muted-foreground">Carregando obras...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-alt">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-brand rounded-xl flex items-center justify-center">
              <span className="text-brand-foreground font-bold text-2xl">G</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Minhas Obras</h1>
          <p className="text-muted-foreground">
            Selecione uma obra para acessar o sistema de controle PCP
          </p>
        </div>

        {/* Obras Grid */}
        {obras.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Nenhuma obra encontrada</h3>
            <p className="text-muted-foreground">
              Você não tem acesso a nenhuma obra no momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {obras.map((obra) => (
              <GrifoCard 
                key={obra.id} 
                className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer group"
              >
                <GrifoCardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <GrifoCardTitle className="text-lg line-clamp-2 mb-2">
                        {obra.nome_obra}
                      </GrifoCardTitle>
                      
                      {obra.nome_obra && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          São Paulo, SP
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      {/* Progresso */}
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Avanço</div>
                        <div className="text-lg font-semibold text-foreground">
                          {Math.round(Math.random() * 100)}%
                        </div>
                      </div>
                      
                      {/* Risco */}
                      <StatusChip 
                        variant={getRiskVariant("Baixo")}
                        className="text-xs"
                      >
                        Risco Baixo
                      </StatusChip>
                    </div>
                  </div>
                </GrifoCardHeader>
                
                <GrifoCardContent>
                  <div className="space-y-4">
                    {/* Métricas */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground">Tarefas Ativas</div>
                        <div className="text-sm font-medium text-foreground">
                          {Math.floor(Math.random() * 50) + 10}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">PCP Semanal</div>
                        <div className="text-sm font-medium text-success">
                          {Math.round(Math.random() * 30) + 70}%
                        </div>
                      </div>
                    </div>

                    {/* Próximo Marco */}
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Próximo Marco</div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-foreground">
                          Conclusão da Fundação - {new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    {/* CTA */}
                    <GrifoButton
                      variant="primary"
                      className="w-full group-hover:scale-105 transition-transform"
                      onClick={() => handleObraSelect(obra)}
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      Entrar na Obra
                    </GrifoButton>
                  </div>
                </GrifoCardContent>
              </GrifoCard>
            ))}
          </div>
        )}

        {/* Footer Info */}
        <div className="text-center py-6">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            Sistema atualizado em tempo real
          </div>
        </div>
      </div>
    </div>
  )
}

export default ObrasUpdated