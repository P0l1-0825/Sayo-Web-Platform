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
import { soporteStats, useSupportTickets } from "@/hooks/use-support"
import { channelDistribution } from "@/hooks/use-accounts"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import type { SupportTicket } from "@/lib/types"
import { MessageSquare, Clock, AlertTriangle, CheckCircle, ArrowUpRight } from "lucide-react"
import { toast } from "sonner"

const ticketsTrend = [
  { name: "Lun", value: 28, resueltos: 25 },
  { name: "Mar", value: 32, resueltos: 30 },
  { name: "Mié", value: 25, resueltos: 24 },
  { name: "Jue", value: 35, resueltos: 31 },
  { name: "Vie", value: 23, resueltos: 20 },
]

const priorityColor: Record<string, string> = {
  urgente: "bg-red-100 text-red-700",
  alta: "bg-orange-100 text-orange-700",
  media: "bg-yellow-100 text-yellow-700",
  baja: "bg-gray-100 text-gray-500",
}

const statusColor: Record<string, string> = {
  abierto: "bg-red-100 text-red-700",
  en_progreso: "bg-blue-100 text-blue-700",
  esperando: "bg-yellow-100 text-yellow-700",
  resuelto: "bg-green-100 text-green-700",
  cerrado: "bg-gray-100 text-gray-500",
}

export default function SoporteDashboard() {
  const { data: supportTickets, isLoading, error, refetch } = useSupportTickets()
  const [selectedTicket, setSelectedTicket] = React.useState<SupportTicket | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error) return <ErrorCard message={error} onRetry={refetch} />
  if (!supportTickets) return null

  const handleView = (ticket: SupportTicket) => {
    setSelectedTicket(ticket)
    setDetailOpen(true)
  }

  const handleRespond = (ticket: SupportTicket) => {
    toast.success("Respuesta enviada", { description: `Ticket ${ticket.id} — ${ticket.clientName}` })
  }

  const handleEscalate = (ticket: SupportTicket) => {
    toast.info("Ticket escalado", { description: `${ticket.id} escalado al supervisor` })
  }

  const urgentTickets = supportTickets.filter((t) => t.priority === "urgente" || t.priority === "alta")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Soporte & UNE</h1>
        <p className="text-sm text-muted-foreground">Atención al cliente — tickets, SLA y satisfacción</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {soporteStats.map((stat) => (
          <StatCard key={stat.title} data={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Tickets Semana" description="Abiertos vs resueltos" className="lg:col-span-2">
          <BarChartComponent data={ticketsTrend} dataKey="value" secondaryDataKey="resueltos" color="var(--chart-4)" secondaryColor="var(--chart-2)" />
        </ChartCard>
        <ChartCard title="Por Canal" description="Distribución de tickets">
          <DonutChartComponent data={channelDistribution} />
        </ChartCard>
      </div>

      {/* Urgent/High Priority Tickets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <AlertTriangle className="size-4 text-sayo-red" />
            Tickets Urgentes / Alta Prioridad
          </h2>
          <Badge variant="outline">{urgentTickets.length} tickets</Badge>
        </div>
        <div className="space-y-2">
          {urgentTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleView(ticket)}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className={`size-4 ${ticket.priority === "urgente" ? "text-sayo-red" : "text-sayo-orange"}`} />
                  <span className="font-mono text-xs">{ticket.id}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{ticket.subject}</p>
                  <p className="text-xs text-muted-foreground">{ticket.clientName} — {ticket.category} — {ticket.channel}</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityColor[ticket.priority]}`}>
                  {ticket.priority}
                </span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor[ticket.status]}`}>
                  {ticket.status.replace("_", " ")}
                </span>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon-xs" onClick={() => handleRespond(ticket)} title="Responder">
                    <MessageSquare className="size-3.5 text-sayo-blue" />
                  </Button>
                  <Button variant="ghost" size="icon-xs" onClick={() => handleEscalate(ticket)} title="Escalar">
                    <ArrowUpRight className="size-3.5 text-sayo-red" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {urgentTickets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="size-8 mx-auto mb-2 text-sayo-green" />
              <p className="text-sm">No hay tickets urgentes pendientes</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle del Ticket</DialogTitle>
            <DialogDescription>{selectedTicket?.id} — {selectedTicket?.subject}</DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${priorityColor[selectedTicket.priority]}`}>
                    {selectedTicket.priority}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusColor[selectedTicket.status]}`}>
                    {selectedTicket.status.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Clock className="size-3 text-muted-foreground" />
                  <span className="text-muted-foreground">SLA: {new Date(selectedTicket.slaDeadline).toLocaleString("es-MX")}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Cliente</p>
                  <p className="font-medium">{selectedTicket.clientName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">ID Cliente</p>
                  <p className="font-mono text-xs">{selectedTicket.clientId}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Canal</p>
                  <Badge variant="outline" className="text-[10px]">{selectedTicket.channel}</Badge>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Categoría</p>
                  <p>{selectedTicket.category}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Asignado a</p>
                  <p>{selectedTicket.assignedTo}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Creado</p>
                  <p className="text-xs">{new Date(selectedTicket.createdAt).toLocaleString("es-MX")}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-muted-foreground uppercase">Descripción</p>
                  <p className="text-sm">{selectedTicket.description}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => selectedTicket && handleRespond(selectedTicket)}>
              <MessageSquare className="size-3.5 mr-1" /> Responder
            </Button>
            <Button variant="outline" size="sm" className="text-sayo-red" onClick={() => selectedTicket && handleEscalate(selectedTicket)}>
              <ArrowUpRight className="size-3.5 mr-1" /> Escalar
            </Button>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
