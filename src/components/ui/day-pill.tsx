import * as React from "react"
import { cn } from "@/lib/utils"

interface DayPillProps {
  day: string
  isSelected: boolean
  isCompleted?: boolean
  onClick: () => void
  className?: string
}

const DayPill = React.forwardRef<HTMLButtonElement, DayPillProps>(
  ({ day, isSelected, isCompleted, onClick, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center justify-center h-8 min-w-8 px-2 rounded-full text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
          isSelected && !isCompleted && "bg-accent text-accent-foreground",
          isCompleted && "bg-success text-success-foreground",
          !isSelected && !isCompleted && "bg-surface text-surface-foreground hover:bg-surface/80",
          className
        )}
        {...props}
      >
        {day}
      </button>
    )
  }
)
DayPill.displayName = "DayPill"

export { DayPill }