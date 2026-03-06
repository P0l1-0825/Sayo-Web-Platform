"use client"

import { useRouter } from "next/navigation"
import { portals, demoUsers } from "@/lib/portals"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Monitor, ShieldCheck, HandCoins, TrendingUp, Headphones, Shield,
  Megaphone, Crown, Settings, User, Globe,
} from "lucide-react"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Monitor, ShieldCheck, HandCoins, TrendingUp, Headphones, Shield,
  Megaphone, Crown, Settings, User, Globe,
}

export default function LoginPage() {
  const router = useRouter()

  const handlePortalSelect = (portalId: string) => {
    const portal = portals.find((p) => p.id === portalId)
    if (portal) {
      router.push(portal.navItems[0]?.href || `/${portalId}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sayo-cream p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-sayo-cafe text-white font-bold text-2xl shadow-lg">
              S
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-sayo-cafe tracking-tight">SAYO</h1>
            <p className="text-sm text-muted-foreground mt-1">Plataforma Financiera Digital</p>
          </div>
          <Badge variant="outline" className="text-xs">
            Demo — Selecciona un portal para acceder
          </Badge>
        </div>

        {/* Portal Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {portals.map((portal) => {
            const Icon = iconMap[portal.icon] || Monitor
            const demoUser = demoUsers.find((u) => u.portal === portal.id)

            return (
              <Card
                key={portal.id}
                className="cursor-pointer hover:shadow-md hover:border-sayo-cafe/30 transition-all duration-200 group"
                onClick={() => handlePortalSelect(portal.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted ${portal.color} group-hover:bg-sayo-cafe group-hover:text-white transition-colors`}>
                      <Icon className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-sayo-cafe transition-colors">
                        {portal.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                        {portal.description}
                      </p>
                      {demoUser && (
                        <p className="text-[10px] text-muted-foreground/70 mt-1.5">
                          {demoUser.name} — {portal.role.replace("_", " ")}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Footer */}
        <div className="text-center space-y-1">
          <p className="text-[11px] text-muted-foreground">
            SAYO Financial S.A. de C.V. SOFOM E.N.R. — Regulado por CNBV
          </p>
          <p className="text-[10px] text-muted-foreground/60">
            v1.0.0 — Entorno de demostración
          </p>
        </div>
      </div>
    </div>
  )
}
