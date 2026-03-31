"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { portals } from "@/lib/portals"

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SearchResult {
  label: string
  href: string
  portal: string
  icon: string
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")

  // Build flat list of all nav items across all portals
  const allItems = React.useMemo<SearchResult[]>(() => {
    return portals.flatMap((portal) =>
      portal.navItems.map((item) => ({
        label: item.label,
        href: item.href,
        portal: portal.name,
        icon: item.icon,
      }))
    )
  }, [])

  const filtered = React.useMemo(() => {
    if (!query.trim()) return allItems.slice(0, 12)
    const q = query.toLowerCase()
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.portal.toLowerCase().includes(q) ||
        item.href.toLowerCase().includes(q)
    )
  }, [query, allItems])

  const handleSelect = (href: string) => {
    onOpenChange(false)
    setQuery("")
    router.push(href)
  }

  // Reset query when dialog closes
  React.useEffect(() => {
    if (!open) setQuery("")
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Search className="size-4 text-muted-foreground shrink-0" />
          <Input
            placeholder="Buscar secciones, portales, acciones..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 p-0 h-auto text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground shrink-0">
            ESC
          </kbd>
        </div>
        <div className="max-h-[320px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No se encontraron resultados para &ldquo;{query}&rdquo;
            </p>
          ) : (
            <div className="space-y-1">
              {filtered.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleSelect(item.href)}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.portal}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{item.href}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
