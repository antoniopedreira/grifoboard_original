import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const statusChipVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
  {
    variants: {
      variant: {
        success: "bg-success/10 text-success ring-success/30",
        warning: "bg-warning/10 text-warning ring-warning/30", 
        danger: "bg-danger/10 text-danger ring-danger/30",
        neutral: "bg-surface text-surface-foreground ring-border",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
)

export interface StatusChipProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusChipVariants> {}

const StatusChip = React.forwardRef<HTMLSpanElement, StatusChipProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <span
        className={cn(statusChipVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
StatusChip.displayName = "StatusChip"

export { StatusChip, statusChipVariants }