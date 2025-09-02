import * as React from "react"
import { cn } from "@/lib/utils"
import { GrifoButton } from "./grifo-button"
import { GrifoInput } from "./grifo-input"
import { Search } from "lucide-react"

export interface FilterChip {
  id: string
  label: string
  count?: number
}

interface FilterBarProps {
  chips: FilterChip[]
  activeChip: string
  onChipChange: (chipId: string) => void
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
}

export function FilterBar({
  chips,
  activeChip,
  onChipChange,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar..."
}: FilterBarProps) {
  return (
    <div className="sticky top-16 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="flex items-center justify-between gap-4 p-4">
        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {chips.map((chip) => (
            <GrifoButton
              key={chip.id}
              variant={activeChip === chip.id ? "primary" : "neutral"}
              size="sm"
              className={cn(
                "whitespace-nowrap",
                activeChip === chip.id && "shadow-sm"
              )}
              onClick={() => onChipChange(chip.id)}
            >
              {chip.label}
              {chip.count !== undefined && (
                <span className={cn(
                  "ml-1 px-1.5 py-0.5 rounded text-xs",
                  activeChip === chip.id 
                    ? "bg-accent-foreground/20 text-accent-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {chip.count}
                </span>
              )}
            </GrifoButton>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <GrifoInput
            type="search"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
    </div>
  )
}