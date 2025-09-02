import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const grifoButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-foreground hover:bg-accent/90 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
        ghost: "text-accent hover:bg-accent/10 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
        danger: "bg-danger text-danger-foreground hover:bg-danger/90 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
        neutral: "bg-card text-card-foreground hover:bg-surface/80 border border-border focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface GrifoButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof grifoButtonVariants> {
  asChild?: boolean
}

const GrifoButton = React.forwardRef<HTMLButtonElement, GrifoButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(grifoButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
GrifoButton.displayName = "GrifoButton"

export { GrifoButton, grifoButtonVariants }