import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const ModalShell = DialogPrimitive.Root

const ModalShellTrigger = DialogPrimitive.Trigger

const ModalShellPortal = DialogPrimitive.Portal

const ModalShellClose = DialogPrimitive.Close

const ModalShellOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
ModalShellOverlay.displayName = DialogPrimitive.Overlay.displayName

const ModalShellContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <ModalShellPortal>
    <ModalShellOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl max-h-[85vh] translate-x-[-50%] translate-y-[-50%] gap-0 border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-grifo",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </ModalShellPortal>
))
ModalShellContent.displayName = DialogPrimitive.Content.displayName

const ModalShellHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "sticky top-0 flex flex-col space-y-1.5 p-6 bg-background border-b border-border z-10",
      className
    )}
    {...props}
  />
)
ModalShellHeader.displayName = "ModalShellHeader"

const ModalShellBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex-1 overflow-y-auto p-6",
      className
    )}
    {...props}
  />
)
ModalShellBody.displayName = "ModalShellBody"

const ModalShellFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "sticky bottom-0 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 bg-background border-t border-border z-10",
      className
    )}
    {...props}
  />
)
ModalShellFooter.displayName = "ModalShellFooter"

const ModalShellTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
ModalShellTitle.displayName = DialogPrimitive.Title.displayName

const ModalShellDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
ModalShellDescription.displayName = DialogPrimitive.Description.displayName

export {
  ModalShell,
  ModalShellPortal,
  ModalShellOverlay,
  ModalShellTrigger,
  ModalShellClose,
  ModalShellContent,
  ModalShellHeader,
  ModalShellBody,
  ModalShellFooter,
  ModalShellTitle,
  ModalShellDescription,
}