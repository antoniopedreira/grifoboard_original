import * as React from "react"
import { cn } from "@/lib/utils"

const GrifoCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-grifo border border-border bg-card text-card-foreground shadow-grifo",
      className
    )}
    {...props}
  />
))
GrifoCard.displayName = "GrifoCard"

const GrifoCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
GrifoCardHeader.displayName = "GrifoCardHeader"

const GrifoCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
GrifoCardTitle.displayName = "GrifoCardTitle"

const GrifoCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
GrifoCardDescription.displayName = "GrifoCardDescription"

const GrifoCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
GrifoCardContent.displayName = "GrifoCardContent"

const GrifoCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
GrifoCardFooter.displayName = "GrifoCardFooter"

export { 
  GrifoCard, 
  GrifoCardHeader, 
  GrifoCardFooter, 
  GrifoCardTitle, 
  GrifoCardDescription, 
  GrifoCardContent 
}