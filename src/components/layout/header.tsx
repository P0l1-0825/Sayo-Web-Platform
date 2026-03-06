"use client"

import { usePathname } from "next/navigation"
import { Bell, ChevronRight, Search } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { PortalSwitcher } from "./portal-switcher"
import type { PortalConfig } from "@/lib/types"

interface HeaderProps {
  portal: PortalConfig
}

export function Header({ portal }: HeaderProps) {
  const pathname = usePathname()

  // Generate breadcrumbs from pathname
  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbs = segments.map((segment, index) => {
    const label = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
    return {
      label: index === 0 ? portal.name : label,
      href: "/" + segments.slice(0, index + 1).join("/"),
      isLast: index === segments.length - 1,
    }
  })

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2">
        <nav className="flex items-center gap-1 text-sm">
          {breadcrumbs.map((crumb, i) => (
            <div key={crumb.href} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="size-3.5 text-muted-foreground" />}
              <span
                className={
                  crumb.isLast
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                }
              >
                {crumb.label}
              </span>
            </div>
          ))}
        </nav>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <button className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          <Search className="size-4" />
        </button>

        {/* Notifications */}
        <button className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 flex size-2 rounded-full bg-sayo-red" />
        </button>

        {/* Portal Switcher */}
        <PortalSwitcher currentPortal={portal} />

        {/* User Avatar */}
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            <AvatarFallback className="bg-sayo-cafe text-white text-xs">
              CM
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
