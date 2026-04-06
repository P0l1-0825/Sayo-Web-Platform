"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Workflow, Zap, Mail, MessageCircle, Play, Pause, CheckCircle } from "lucide-react"
import { api, isDemoMode } from "@/lib/api-client"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"

interface Automatizacion {
  id: string; nombre: string; trigger: string; canal: string; pasos: number; contactosActivos: number; enviados: number; abiertos: number; conversiones: number; status: "activa" | "pausada" | "borrador"; ultimaEjecucion: string
}

const demoAutos: Automatizacion[] = [
  { id: "AUT-001", nombre: "Onboarding Nuevo Cliente", trigger: "Crédito aprobado", canal: "Email + WhatsApp", pasos: 5, contactosActivos: 120, enviados: 450, abiertos: 380, conversiones: 95, status: "activa", ultimaEjecucion: "2026-03-18 09:00" },
  { id: "AUT-002", nombre: "Recordatorio de Pago", trigger: "3 días antes de vencimiento", canal: "SMS + WhatsApp", pasos: 3, contactosActivos: 2800, enviados: 8400, abiertos: 7200, conversiones: 6800, status: "activa", ultimaEjecucion: "2026-03-18 08:00" },
  { id: "AUT-003", nombre: "Reactivación Cartera", trigger: "Sin actividad 60 días", canal: "Email", pasos: 4, contactosActivos: 450, enviados: 1200, abiertos: 480, conversiones: 85, status: "activa", ultimaEjecucion: "2026-03-17 10:00" },
  { id: "AUT-004", nombre: "NPS Post-Servicio", trigger: "Ticket resuelto", canal: "Email", pasos: 2, contactosActivos: 0, enviados: 320, abiertos: 180, conversiones: 145, status: "pausada", ultimaEjecucion: "2026-03-10 14:00" },
  { id: "AUT-005", nombre: "Cross-sell Tarjeta", trigger: "6 meses con crédito", canal: "Email + Push", pasos: 6, contactosActivos: 890, enviados: 0, abiertos: 0, conversiones: 0, status: "borrador", ultimaEjecucion: "" },
]

export default function AutomatizacionesPage() {
  const [automations, setAutomations] = React.useState<Automatizacion[]>(demoAutos)
  const [loading, setLoading] = React.useState(!isDemoMode)

  React.useEffect(() => {
    if (isDemoMode) return
    async function load() {
      try {
        const result = await api.get<Automatizacion[]>("/api/v1/marketing/automations")
        if (result?.length) setAutomations(result)
      } catch {
        // fallback to demo data already set
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <DashboardSkeleton variant="stats-and-table" />

  const activas = automations.filter((a) => a.status === "activa").length
  const totalEnviados = automations.reduce((s, a) => s + a.enviados, 0)
  const totalConversiones = automations.reduce((s, a) => s + a.conversiones, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Automatizaciones</h1>
        <p className="text-sm text-muted-foreground">Flujos Twilio, triggers y secuencias automatizadas</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><Workflow className="size-5 mx-auto text-muted-foreground mb-1" /><p className="text-2xl font-bold">{automations.length}</p><p className="text-xs text-muted-foreground">Automatizaciones</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Zap className="size-5 mx-auto text-sayo-green mb-1" /><p className="text-2xl font-bold text-sayo-green">{activas}</p><p className="text-xs text-muted-foreground">Activas</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Mail className="size-5 mx-auto text-blue-500 mb-1" /><p className="text-2xl font-bold">{totalEnviados.toLocaleString()}</p><p className="text-xs text-muted-foreground">Mensajes Enviados</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><CheckCircle className="size-5 mx-auto text-sayo-orange mb-1" /><p className="text-2xl font-bold text-sayo-orange">{totalConversiones.toLocaleString()}</p><p className="text-xs text-muted-foreground">Conversiones</p></CardContent></Card>
      </div>

      <Card><CardContent className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-muted-foreground">
              <th className="pb-2">Nombre</th><th className="pb-2">Trigger</th><th className="pb-2">Canal</th><th className="pb-2">Pasos</th><th className="pb-2">Activos</th><th className="pb-2">Enviados</th><th className="pb-2">Conv.</th><th className="pb-2">Estado</th><th className="pb-2">Última Ejec.</th>
            </tr></thead>
            <tbody>{automations.map((a) => (
              <tr key={a.id} className="border-b last:border-0 hover:bg-muted/50">
                <td className="py-2 font-medium">{a.nombre}</td>
                <td className="py-2 text-xs">{a.trigger}</td>
                <td className="py-2"><Badge variant="outline" className="text-[10px]">{a.canal}</Badge></td>
                <td className="py-2 tabular-nums text-center">{a.pasos}</td>
                <td className="py-2 tabular-nums">{a.contactosActivos.toLocaleString()}</td>
                <td className="py-2 tabular-nums">{a.enviados.toLocaleString()}</td>
                <td className="py-2 tabular-nums font-semibold text-sayo-green">{a.conversiones.toLocaleString()}</td>
                <td className="py-2"><span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${a.status === "activa" ? "bg-green-100 text-green-700" : a.status === "pausada" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}>
                  {a.status === "activa" && <Play className="size-2.5" />}{a.status === "pausada" && <Pause className="size-2.5" />}{a.status}
                </span></td>
                <td className="py-2 text-xs tabular-nums text-muted-foreground">{a.ultimaEjecucion || "—"}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </CardContent></Card>
    </div>
  )
}
