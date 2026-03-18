"use client"

import * as React from "react"
import { StatCard } from "@/components/dashboard/stat-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import { BarChartComponent } from "@/components/charts/bar-chart"
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
import { comercialStats, useLeads } from "@/hooks/use-commercial"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import { formatMoney } from "@/lib/utils"
import type { Lead } from "@/lib/types"
import { User, Phone, Mail, ArrowRight, TrendingUp } from "lucide-react"
import { toast } from "sonner"

const pipelineValue = [
  { name: "Prospecto", value: 3200000 },
  { name: "Contactado", value: 5100000 },
  { name: "Evaluación", value: 8500000 },
  { name: "Aprobado", value: 6200000 },
  { name: "Dispersado", value: 2800000 },
]

const leadsBySource = [
  { name: "Web", value: 18 },
  { name: "Referido", value: 12 },
  { name: "Campaña", value: 8 },
  { name: "Orgánico", value: 6 },
  { name: "Alianza", value: 3 },
]

const stageColor: Record<string, string> = {
  prospecto: "bg-gray-100 text-gray-700",
  contactado: "bg-blue-100 text-blue-700",
  evaluacion: "bg-yellow-100 text-yellow-700",
  aprobado: "bg-green-100 text-green-700",
  dispersado: "bg-emerald-100 text-emerald-700",
  rechazado: "bg-red-100 text-red-700",
}

export default function ComercialDashboard() {
  const { data: leads, isLoading, error, refetch } = useLeads()
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error) return <ErrorCard message={error} onRetry={refetch} />
  if (!leads) return null

  const handleView = (lead: Lead) => {
    setSelectedLead(lead)
    setDetailOpen(true)
  }

  const handleCall = (lead: Lead) => {
    toast.success("Llamada iniciada", { description: `Contactando a ${lead.name} — ${lead.phone}` })
  }

  const handleEmail = (lead: Lead) => {
    toast.success("Email enviado", { description: `Notificación comercial enviada a ${lead.email}` })
  }

  const topLeads = leads.filter((l) => l.score > 50).slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Comercial</h1>
        <p className="text-sm text-muted-foreground">Pipeline comercial, leads y conversión</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {comercialStats.map((stat) => (
          <StatCard key={stat.title} data={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Pipeline por Etapa" description="Valor por fase del funnel" className="lg:col-span-2">
          <BarChartComponent data={pipelineValue} color="var(--chart-2)" formatY="currency" />
        </ChartCard>
        <ChartCard title="Leads por Fuente" description="Distribución de origen">
          <DonutChartComponent data={leadsBySource} />
        </ChartCard>
      </div>

      {/* Top Leads Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <TrendingUp className="size-4 text-sayo-green" />
            Top Leads por Score
          </h2>
          <Badge variant="outline">{leads.length} leads totales</Badge>
        </div>
        <div className="space-y-2">
          {topLeads.map((lead) => (
            <Card key={lead.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleView(lead)}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <User className="size-4 text-muted-foreground" />
                  <span className="font-mono text-xs">{lead.id}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">{lead.product} — {lead.assignedTo}</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  {lead.amount > 0 && (
                    <div className="text-center">
                      <p className="text-muted-foreground">Monto</p>
                      <p className="font-semibold tabular-nums">{formatMoney(lead.amount)}</p>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-muted-foreground">Score</p>
                    <p className={`font-bold text-sm ${lead.score > 80 ? "text-sayo-green" : "text-sayo-orange"}`}>{lead.score}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${stageColor[lead.stage]}`}>
                  {lead.stage}
                </span>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon-xs" onClick={() => handleCall(lead)} title="Llamar">
                    <Phone className="size-3.5 text-sayo-green" />
                  </Button>
                  <Button variant="ghost" size="icon-xs" onClick={() => handleEmail(lead)} title="Email">
                    <Mail className="size-3.5 text-sayo-blue" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Lead Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle del Lead</DialogTitle>
            <DialogDescription>{selectedLead?.id} — {selectedLead?.name}</DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${stageColor[selectedLead.stage]}`}>
                  {selectedLead.stage}
                </span>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${selectedLead.score > 80 ? "bg-sayo-green" : selectedLead.score > 50 ? "bg-sayo-orange" : "bg-sayo-red"}`}
                        style={{ width: `${selectedLead.score}%` }}
                      />
                    </div>
                    <span className={`text-lg font-bold ${selectedLead.score > 80 ? "text-sayo-green" : selectedLead.score > 50 ? "text-sayo-orange" : "text-sayo-red"}`}>
                      {selectedLead.score}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Score</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Nombre</p>
                  <p className="font-medium">{selectedLead.name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Producto</p>
                  <p>{selectedLead.product}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Email</p>
                  <p className="text-xs">{selectedLead.email}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Teléfono</p>
                  <p className="text-xs">{selectedLead.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Monto</p>
                  <p className="font-semibold">{selectedLead.amount > 0 ? formatMoney(selectedLead.amount) : "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fuente</p>
                  <Badge variant="outline" className="text-[10px]">{selectedLead.source}</Badge>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Ejecutivo</p>
                  <p>{selectedLead.assignedTo}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fecha</p>
                  <p>{selectedLead.date}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => selectedLead && handleCall(selectedLead)}>
              <Phone className="size-3.5 mr-1" /> Llamar
            </Button>
            <Button variant="outline" size="sm" onClick={() => selectedLead && handleEmail(selectedLead)}>
              <Mail className="size-3.5 mr-1" /> Email
            </Button>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
