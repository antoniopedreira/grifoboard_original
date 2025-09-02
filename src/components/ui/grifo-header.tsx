import * as React from "react"
import { Building2 } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import { GrifoButton } from "./grifo-button"
import { cn } from "@/lib/utils"

export function GrifoHeader() {
  const { userSession, setObraAtiva } = useAuth()
  const navigate = useNavigate()

  const handleMudarObra = () => {
    setObraAtiva(null)
    navigate("/obras")
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-background border-b border-border">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-brand rounded-lg flex items-center justify-center">
              <span className="text-brand-foreground font-bold text-lg">G</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">GrifoBoard</h1>
              <p className="text-xs text-muted-foreground">Controle do PCP de Obra</p>
            </div>
          </div>

          {/* Right side content */}
          <div className="flex items-center space-x-4">
            {/* Obra ativa info */}
            {userSession?.obraAtiva && (
              <div className="hidden md:flex items-center bg-surface/50 rounded-lg px-3 py-2 border border-border">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center mr-3">
                    <Building2 className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Obra ativa:</div>
                    <div className="font-semibold text-sm text-foreground max-w-48 truncate">
                      {userSession.obraAtiva.nome_obra}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mudar obra button */}
            {userSession?.obraAtiva && (
              <GrifoButton
                variant="neutral"
                size="sm"
                onClick={handleMudarObra}
                className="hidden sm:inline-flex"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Mudar Obra
              </GrifoButton>
            )}

            {/* Status indicator */}
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span className="text-muted-foreground hidden sm:inline">
                  Atualizado agora
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default GrifoHeader