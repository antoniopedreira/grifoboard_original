import React, { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { Clock, Calendar, TrendingUp } from "lucide-react";
import { differenceInDays, differenceInCalendarDays, format, isPast, isFuture } from "date-fns";
import { ptBR } from "date-fns/locale";

const ProjectCountdown = () => {
  const { userSession } = useAuth();

  const projectInfo = useMemo(() => {
    const obra = userSession?.obraAtiva;
    if (!obra?.data_inicio) return null;

    const startDate = new Date(obra.data_inicio);
    const endDate = (obra as any).data_termino ? new Date((obra as any).data_termino) : null;
    const today = new Date();

    if (!endDate) {
      return {
        hasEndDate: false,
        startDate: format(startDate, "dd/MM/yyyy", { locale: ptBR })
      };
    }

    const totalDays = differenceInCalendarDays(endDate, startDate);
    const elapsedDays = differenceInCalendarDays(today, startDate);
    const remainingDays = differenceInCalendarDays(endDate, today);
    const percentageElapsed = totalDays > 0 ? Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100)) : 0;

    const isOverdue = isPast(endDate) && remainingDays < 0;
    const isCompleted = obra.status === 'concluida';

    return {
      hasEndDate: true,
      startDate: format(startDate, "dd/MM/yyyy", { locale: ptBR }),
      endDate: format(endDate, "dd/MM/yyyy", { locale: ptBR }),
      totalDays,
      elapsedDays,
      remainingDays: Math.abs(remainingDays),
      percentageElapsed: Math.round(percentageElapsed),
      isOverdue,
      isCompleted
    };
  }, [userSession?.obraAtiva]);

  if (!projectInfo) return null;

  if (!projectInfo.hasEndDate) {
    return (
      <div className="minimal-card p-6 min-h-[140px]">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-foreground">Cronograma da Obra</h3>
            <p className="text-xs text-muted-foreground">Início: {projectInfo.startDate}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Data de término não definida
        </p>
      </div>
    );
  }

  const { 
    startDate, 
    endDate, 
    totalDays, 
    elapsedDays, 
    remainingDays, 
    percentageElapsed, 
    isOverdue, 
    isCompleted 
  } = projectInfo;

  const getStatusColor = () => {
    if (isCompleted) return "text-success";
    if (isOverdue) return "text-destructive";
    if (remainingDays <= 30) return "text-warning";
    return "text-primary";
  };

  const getStatusText = () => {
    if (isCompleted) return "Concluída";
    if (isOverdue) return "Atrasada";
    if (remainingDays <= 30) return "Atenção";
    return "No Prazo";
  };

  return (
    <div className="minimal-card p-6 min-h-[140px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-foreground">Cronograma da Obra</h3>
            <p className="text-xs text-muted-foreground">{startDate} - {endDate}</p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor()} bg-opacity-10`}>
          {getStatusText()}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-foreground">
              {isOverdue ? (
                <span className="text-destructive font-medium">
                  {remainingDays} {remainingDays === 1 ? "dia" : "dias"} de atraso
                </span>
              ) : (
                <>
                  <span className={`font-semibold ${getStatusColor()}`}>{remainingDays}</span>
                  <span className="text-muted-foreground"> {remainingDays === 1 ? "dia" : "dias"} restantes</span>
                </>
              )}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progresso do Tempo</span>
            <span className="font-medium">{percentageElapsed}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                isCompleted ? "bg-success" : 
                isOverdue ? "bg-destructive" : 
                percentageElapsed > 80 ? "bg-warning" : 
                "bg-primary"
              }`}
              style={{ width: `${Math.min(100, percentageElapsed)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            {elapsedDays} de {totalDays} dias decorridos
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProjectCountdown);
