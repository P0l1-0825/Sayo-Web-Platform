"use client"

import * as React from "react"
import { StatCard } from "@/components/dashboard/stat-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import { AreaChartComponent } from "@/components/charts/area-chart"
import { DonutChartComponent } from "@/components/charts/donut-chart"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { adminStats, useSystemUsers, useRolePermissions } from "@/hooks/use-admin"
import { monthlyTrend6M, productDistribution } from "@/hooks/use-accounts"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import { ArrowRight, Users, Shield, Database, Activity } from "lucide-react"
import { toast } from "sonner"

export default function AdminDashboard() {
  const { data: systemUsers, isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useSystemUsers()
  const { data: roles, isLoading: rolesLoading, error: rolesError, refetch: refetchRoles } = useRolePermissions()
  const [activityOpen, setActivityOpen] = React.useState(false)

  if (usersLoading || rolesLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (usersError) return <ErrorCard message={usersError} onRetry={refetchUsers} />
  if (rolesError) return <ErrorCard message={rolesError} onRetry={refetchRoles} />

  const quickLinks = [
    { label: "Usuarios", href: "/admin/usuarios", icon: Users, count: systemUsers?.length ?? 0, desc: "Gestión de usuarios internos" },
    { label: "Roles", href: "/admin/roles", icon: Shield, count: roles?.length ?? 0, desc: "Roles y permisos" },
    { label: "Catálogos", href: "/admin/catalogos", icon: Database, count: 12, desc: "Catálogos del sistema" },
  ]

  const recentActivity = [
    { action: "Usuario creado", detail: "USR-007 — Nuevo operador L2", time: "Hace 2h", type: "create" },
    { action: "Rol modificado", detail: "L3 Back-Office — Permiso reportes habilitado", time: "Hace 4h", type: "edit" },
    { action: "Catálogo actualizado", detail: "Bancos — 2 nuevas instituciones", time: "Hace 6h", type: "edit" },
    { action: "Usuario suspendido", detail: "USR-006 — ex.empleado@sayo.mx", time: "Hace 1d", type: "delete" },
    { action: "Tarifa actualizada", detail: "Comisión SPEI: $4.50 → $5.00", time: "Hace 2d", type: "edit" },
  ]

  const actionColors: Record<string, string> = {
    create: "text-green-600",
    edit: "text-blue-600",
    delete: "text-red-600",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Admin & Configuración</h1>
        <p className="text-sm text-muted-foreground">Administración del sistema — usuarios, roles, catálogos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminStats.map((stat) => (
          <StatCard key={stat.title} data={stat} />
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickLinks.map((link) => {
          const Icon = link.icon
          return (
            <Card key={link.label} className="cursor-pointer hover:border-primary transition-colors" onClick={() => window.location.href = link.href}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sayo-cream">
                  <Icon className="size-5 text-sayo-cafe" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{link.label}</p>
                  <p className="text-xs text-muted-foreground">{link.desc}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{link.count}</Badge>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Crecimiento Usuarios" description="Últimos 6 meses" className="lg:col-span-2">
          <AreaChartComponent data={monthlyTrend6M} color="var(--chart-1)" />
        </ChartCard>
        <ChartCard title="Por Producto" description="Distribución de cuentas">
          <DonutChartComponent data={productDistribution} />
        </ChartCard>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <Activity className="size-4 text-muted-foreground" />
            Actividad Reciente
          </h2>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setActivityOpen(true)}>
            Ver todo
          </Button>
        </div>
        <div className="space-y-2">
          {recentActivity.slice(0, 3).map((act, i) => (
            <Card key={i} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActivityOpen(true)}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`size-2 rounded-full ${act.type === "create" ? "bg-green-500" : act.type === "edit" ? "bg-blue-500" : "bg-red-500"}`} />
                <div className="flex-1">
                  <p className={`text-xs font-medium ${actionColors[act.type]}`}>{act.action}</p>
                  <p className="text-xs text-muted-foreground">{act.detail}</p>
                </div>
                <span className="text-[10px] text-muted-foreground">{act.time}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Activity Dialog */}
      <Dialog open={activityOpen} onOpenChange={setActivityOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Actividad del Sistema</DialogTitle>
            <DialogDescription>Últimas acciones administrativas</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[50vh] overflow-y-auto">
            {recentActivity.map((act, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className={`size-2.5 rounded-full mt-1 shrink-0 ${act.type === "create" ? "bg-green-500" : act.type === "edit" ? "bg-blue-500" : "bg-red-500"}`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${actionColors[act.type]}`}>{act.action}</p>
                  <p className="text-xs text-muted-foreground">{act.detail}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
