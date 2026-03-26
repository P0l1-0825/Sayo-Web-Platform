"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { portals, getPortalsByRole } from "@/lib/portals"
import { Loader2, LogOut, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import * as LucideIcons from "lucide-react"
import type { PortalConfig } from "@/lib/types"

// Map icon string names to Lucide components
function PortalIcon({ name, className }: { name: string; className?: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (LucideIcons as any)[name] as React.ComponentType<{ className?: string }> | undefined
  if (!Icon) return <LucideIcons.Layout className={className} />
  return <Icon className={className} />
}

// Portal color accent map (tailwind bg classes matching the portal color)
const portalBgMap: Record<string, string> = {
  "text-blue-600": "bg-blue-50 border-blue-200 group-hover:border-blue-400",
  "text-red-600": "bg-red-50 border-red-200 group-hover:border-red-400",
  "text-orange-600": "bg-orange-50 border-orange-200 group-hover:border-orange-400",
  "text-green-600": "bg-green-50 border-green-200 group-hover:border-green-400",
  "text-purple-600": "bg-purple-50 border-purple-200 group-hover:border-purple-400",
  "text-slate-600": "bg-slate-50 border-slate-200 group-hover:border-slate-400",
  "text-pink-600": "bg-pink-50 border-pink-200 group-hover:border-pink-400",
  "text-amber-600": "bg-amber-50 border-amber-200 group-hover:border-amber-400",
  "text-gray-600": "bg-gray-50 border-gray-200 group-hover:border-gray-400",
  "text-emerald-600": "bg-emerald-50 border-emerald-200 group-hover:border-emerald-400",
  "text-[#472913]": "bg-[#FAF8F5] border-[#C1B6AE] group-hover:border-[#472913]",
  "text-teal-600": "bg-teal-50 border-teal-200 group-hover:border-teal-400",
  "text-indigo-600": "bg-indigo-50 border-indigo-200 group-hover:border-indigo-400",
}

const portalIconBgMap: Record<string, string> = {
  "text-blue-600": "bg-blue-100",
  "text-red-600": "bg-red-100",
  "text-orange-600": "bg-orange-100",
  "text-green-600": "bg-green-100",
  "text-purple-600": "bg-purple-100",
  "text-slate-600": "bg-slate-100",
  "text-pink-600": "bg-pink-100",
  "text-amber-600": "bg-amber-100",
  "text-gray-600": "bg-gray-100",
  "text-emerald-600": "bg-emerald-100",
  "text-[#472913]": "bg-[#F0EDE8]",
  "text-teal-600": "bg-teal-100",
  "text-indigo-600": "bg-indigo-100",
}

function PortalCard({ portal, onClick }: { portal: PortalConfig; onClick: () => void }) {
  const cardBg = portalBgMap[portal.color] ?? "bg-white border-border group-hover:border-primary"
  const iconBg = portalIconBgMap[portal.color] ?? "bg-muted"

  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col gap-3 p-5 rounded-2xl border-2 transition-all duration-200 text-left w-full ${cardBg} hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#472913]/40`}
    >
      {/* Icon */}
      <div className={`flex size-11 items-center justify-center rounded-xl ${iconBg} transition-transform group-hover:scale-105`}>
        <PortalIcon name={portal.icon} className={`size-5 ${portal.color}`} />
      </div>

      {/* Name + role badge */}
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground leading-tight">{portal.name}</p>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{portal.description}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0.5 border-current/30">
          {portal.role}
        </Badge>
        <ChevronRight className={`size-4 ${portal.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
      </div>
    </button>
  )
}

export default function PortalsPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, user, logout } = useAuth()

  // Auth guard
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF8F5]">
        <div className="text-center space-y-4">
          <div
            className="flex size-14 items-center justify-center rounded-2xl text-white font-bold text-2xl shadow-lg mx-auto"
            style={{ background: "linear-gradient(135deg, #472913 0%, #6B4226 100%)" }}
          >
            S
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            <span className="text-sm">Cargando...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) return null

  // Get portals accessible to this user
  const accessiblePortals = getPortalsByRole(user.role)

  // If user only has one portal and is not superadmin, redirect directly
  if (accessiblePortals.length === 1 && user.role !== "L6_SUPERADMIN") {
    router.replace(`/${accessiblePortals[0].id}`)
    return null
  }

  const handlePortalClick = (portal: PortalConfig) => {
    router.push(`/${portal.id}`)
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Top bar */}
      <header className="border-b border-[#E1DBD6] bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex size-8 items-center justify-center rounded-lg text-white font-bold text-sm shadow-sm"
              style={{ background: "linear-gradient(135deg, #472913 0%, #6B4226 100%)" }}
            >
              S
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "#472913" }}>SAYO</p>
              <p className="text-[10px] text-muted-foreground leading-none">Plataforma Financiera Digital</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-foreground">{user.fullName}</p>
              <p className="text-[10px] text-muted-foreground font-mono">{user.role}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-4" />
              <span className="ml-1.5 hidden sm:inline text-xs">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: "#472913" }}>
            Bienvenido, {user.fullName.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {user.role === "L6_SUPERADMIN"
              ? `Acceso completo — ${accessiblePortals.length} portales disponibles`
              : `Selecciona el portal al que deseas acceder`}
          </p>
        </div>

        {/* Superadmin badge */}
        {user.role === "L6_SUPERADMIN" && (
          <div
            className="flex items-center gap-2.5 p-3.5 rounded-xl mb-7 text-sm border"
            style={{
              background: "linear-gradient(135deg, #472913/5 0%, #6B4226/5 100%)",
              borderColor: "#C1B6AE",
              backgroundColor: "#F5F0EB",
            }}
          >
            <div
              className="flex size-7 items-center justify-center rounded-lg text-white font-bold text-xs shrink-0"
              style={{ background: "linear-gradient(135deg, #472913 0%, #6B4226 100%)" }}
            >
              L6
            </div>
            <div>
              <p className="font-semibold text-[#472913] text-xs">Superadministrador</p>
              <p className="text-[#6B4226] text-[11px]">Tienes acceso completo a todos los portales de la plataforma</p>
            </div>
          </div>
        )}

        {/* Portal grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {accessiblePortals.map((portal) => (
            <PortalCard
              key={portal.id}
              portal={portal}
              onClick={() => handlePortalClick(portal)}
            />
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-muted-foreground mt-10">
          SOLVENDOM SOFOM E.N.R. | Regulado por CNBV | {new Date().getFullYear()}
        </p>
      </main>
    </div>
  )
}
