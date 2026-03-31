"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronRight, Search, LogOut, User, Settings } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { PortalSwitcher } from "./portal-switcher"
import { SearchDialog } from "./search-dialog"
import { NotificationsDropdown } from "./notifications-dropdown"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import type { PortalConfig } from "@/lib/types"
import { toast } from "sonner"

interface HeaderProps {
  portal: PortalConfig
}

export function Header({ portal }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isDemoMode } = useAuth()
  const [searchOpen, setSearchOpen] = React.useState(false)

  // Cmd+K / Ctrl+K shortcut
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

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

  const handleLogout = async () => {
    await logout()
    toast.success("Sesión cerrada")
    router.push("/login?logout=true")
  }

  // Get user initials for avatar
  const initials = user
    ? user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "SA"

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2">
        <nav className="flex items-center gap-1 text-sm">
          {breadcrumbs.map((crumb, i) => (
            <div key={crumb.href} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="size-3.5 text-muted-foreground" />}
              {crumb.isLast ? (
                <span className="font-medium text-foreground">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Demo Mode Badge */}
        {isDemoMode && (
          <Badge variant="outline" className="text-[9px] text-orange-600 border-orange-300 bg-orange-50">
            DEMO
          </Badge>
        )}

        {/* Search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <Search className="size-3.5" />
          <span className="hidden sm:inline text-xs">Buscar...</span>
          <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
            ⌘K
          </kbd>
        </button>
        <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

        {/* Notifications */}
        <NotificationsDropdown />

        {/* Portal Switcher */}
        <PortalSwitcher currentPortal={portal} />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <Avatar size="sm">
                <AvatarFallback className="bg-sayo-cafe text-white text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {user && (
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-medium leading-none">{user.fullName}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{user.role.replace(/_/g, " ")}</p>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div>
                  <p className="text-sm font-medium">{user?.fullName || "Usuario"}</p>
                  <p className="text-[10px] text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => router.push("/cliente/perfil")}>
                <User className="size-3.5" />
                <span className="text-xs">Mi Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => router.push("/admin")}>
                <Settings className="size-3.5" />
                <span className="text-xs">Configuración</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer gap-2 text-red-600 focus:text-red-600" onClick={handleLogout}>
                <LogOut className="size-3.5" />
                <span className="text-xs">Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
