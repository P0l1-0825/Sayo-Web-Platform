"use client"

import { useRouter } from "next/navigation"
import { portals } from "@/lib/portals"
import type { PortalConfig } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Home } from "lucide-react"

interface PortalSwitcherProps {
  currentPortal: PortalConfig
}

export function PortalSwitcher({ currentPortal }: PortalSwitcherProps) {
  const router = useRouter()
  const internalPortals = portals.filter((p) => p.id !== "sayo-mx")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors outline-none">
        <span>{currentPortal.shortName}</span>
        <ChevronDown className="size-3 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Cambiar Portal</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push("/login")}
          >
            <Home className="size-3.5 text-sayo-cafe" />
            <span className="text-xs font-semibold">Selector de Portales</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {internalPortals.map((portal) => (
            <DropdownMenuItem
              key={portal.id}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => router.push(portal.navItems[0]?.href || `/${portal.id}`)}
            >
              <span className={`text-xs font-semibold ${portal.color}`}>
                {portal.shortName}
              </span>
              <span className="text-xs text-muted-foreground">{portal.description.slice(0, 40)}...</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
