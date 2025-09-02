import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface KpiProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon
  value: string | number
  label: string
  delta?: {
    value: number
    label?: string
  }
}

const Kpi = React.forwardRef<HTMLDivElement, KpiProps>(
  ({ className, icon: Icon, value, label, delta, ...props }, ref) => {
    const deltaColor = delta && delta.value > 0 
      ? "text-success" 
      : delta && delta.value < 0 
        ? "text-danger" 
        : "text-muted-foreground"
    
    const deltaSign = delta && delta.value > 0 ? "+" : ""

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-grifo border border-border bg-card p-6 shadow-grifo",
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">{label}</span>
            </div>
            
            <div className="text-3xl font-bold text-foreground mb-1">
              {value}
            </div>
            
            {delta && (
              <div className={cn("text-sm", deltaColor)}>
                vs sem. anterior: {deltaSign}{delta.value.toFixed(1)} p.p.
                {delta.label && ` ${delta.label}`}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
)
Kpi.displayName = "Kpi"

export { Kpi }
export type { KpiProps }