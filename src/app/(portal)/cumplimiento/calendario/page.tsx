"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
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
import { regulatoryCalendar } from "@/hooks/use-compliance"
import type { RegulatoryCalendarEvent } from "@/lib/types"
import { CalendarClock, CheckCircle, Clock, AlertTriangle, Eye, Calendar } from "lucide-react"
import { toast } from "sonner"

const statusColor = (status: string) => {
  switch (status) {
    case "completado": return "bg-green-100 text-green-700"
    case "pendiente": return "bg-yellow-100 text-yellow-700"
    case "vencido": return "bg-red-100 text-red-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

const typeColor = (type: string) => {
  switch (type) {
    case "reporte": return "bg-blue-100 text-blue-700"
    case "auditoria": return "bg-purple-100 text-purple-700"
    case "capacitacion": return "bg-teal-100 text-teal-700"
    case "entrega": return "bg-orange-100 text-orange-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

const getDaysUntil = (dateStr: string) => {
  const today = new Date()
  const due = new Date(dateStr)
  const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

export default function CalendarioPage() {
  const [events, setEvents] = React.useState(regulatoryCalendar)
  const [selectedEvent, setSelectedEvent] = React.useState<RegulatoryCalendarEvent | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  const handleView = (event: RegulatoryCalendarEvent) => {
    setSelectedEvent(event)
    setDetailOpen(true)
  }

  const handleMarkComplete = (event: RegulatoryCalendarEvent) => {
    setEvents((prev) => prev.map((e) => e.id === event.id ? { ...e, status: "completado" as const } : e))
    setDetailOpen(false)
    toast.success("Entrega marcada como completada", { description: event.title })
  }

  const pendingEvents = events.filter((e) => e.status === "pendiente")
  const upcomingEvents = pendingEvents
    .map((e) => ({ ...e, daysUntil: getDaysUntil(e.dueDate) }))
    .sort((a, b) => a.daysUntil - b.daysUntil)

  const columns: ColumnDef<RegulatoryCalendarEvent>[] = [
    { accessorKey: "title", header: "Obligacion" },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${typeColor(row.original.type)}`}>
          {row.original.type}
        </span>
      ),
    },
    {
      accessorKey: "entity",
      header: "Entidad",
      cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.original.entity}</Badge>,
    },
    {
      accessorKey: "dueDate",
      header: "Fecha Limite",
      cell: ({ row }) => {
        const days = getDaysUntil(row.original.dueDate)
        return (
          <div className="flex items-center gap-2">
            <span className="text-xs">{row.original.dueDate}</span>
            {row.original.status === "pendiente" && (
              <span className={`text-[10px] font-semibold ${days < 0 ? "text-red-600" : days <= 7 ? "text-orange-600" : days <= 30 ? "text-yellow-600" : "text-green-600"}`}>
                {days < 0 ? `${Math.abs(days)}d vencido` : days === 0 ? "Hoy" : `${days}d`}
              </span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor(row.original.status)}`}>
          {row.original.status === "completado" && <CheckCircle className="size-3" />}
          {row.original.status === "pendiente" && <Clock className="size-3" />}
          {row.original.status === "vencido" && <AlertTriangle className="size-3" />}
          {row.original.status}
        </span>
      ),
    },
    { accessorKey: "assignedTo", header: "Responsable" },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleView(row.original) }}>
          <Eye className="size-3.5" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Calendario Regulatorio</h1>
        <p className="text-sm text-muted-foreground">Fechas de entrega y obligaciones regulatorias</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-yellow-700">{events.filter((e) => e.status === "pendiente").length}</p>
              <p className="text-xs text-yellow-600">Pendientes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-700">{events.filter((e) => e.status === "completado").length}</p>
              <p className="text-xs text-green-600">Completados</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-red-700">{upcomingEvents.filter((e) => e.daysUntil <= 7).length}</p>
              <p className="text-xs text-red-500">Próximos a Vencer (7d)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deadlines */}
      {upcomingEvents.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3">Próximos Vencimientos</h2>
          <div className="space-y-2">
            {upcomingEvents.slice(0, 5).map((event) => (
              <Card key={event.id} className={`hover:shadow-sm transition-shadow ${event.daysUntil < 0 ? "border-red-200 bg-red-50/50" : event.daysUntil <= 7 ? "border-orange-200 bg-orange-50/50" : ""}`}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${event.daysUntil < 0 ? "bg-red-100" : event.daysUntil <= 7 ? "bg-orange-100" : "bg-muted"}`}>
                      <CalendarClock className={`size-5 ${event.daysUntil < 0 ? "text-red-600" : event.daysUntil <= 7 ? "text-orange-600" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px]">{event.entity}</Badge>
                        <span className="text-[10px] text-muted-foreground">{event.dueDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${event.daysUntil < 0 ? "text-red-600" : event.daysUntil <= 7 ? "text-orange-600" : "text-green-600"}`}>
                      {event.daysUntil < 0 ? `${Math.abs(event.daysUntil)} dias vencido` : event.daysUntil === 0 ? "HOY" : `${event.daysUntil} dias`}
                    </p>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${typeColor(event.type)}`}>
                      {event.type}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Full Calendar Table */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Todas las Obligaciones</h2>
        <DataTable
          columns={columns}
          data={events}
          searchKey="title"
          searchPlaceholder="Buscar obligacion..."
          exportFilename="calendario_regulatorio"
          onRowClick={handleView}
        />
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de Obligacion</DialogTitle>
            <DialogDescription>{selectedEvent?.title}</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(selectedEvent.status)}`}>
                  {selectedEvent.status}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${typeColor(selectedEvent.type)}`}>
                  {selectedEvent.type}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Entidad</p>
                  <p className="font-medium">{selectedEvent.entity}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fecha Limite</p>
                  <p className="font-semibold">{selectedEvent.dueDate}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Responsable</p>
                  <p>{selectedEvent.assignedTo}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Dias Restantes</p>
                  {(() => {
                    const days = getDaysUntil(selectedEvent.dueDate)
                    return <p className={`font-bold ${days < 0 ? "text-red-600" : days <= 7 ? "text-orange-600" : "text-green-600"}`}>{days < 0 ? `${Math.abs(days)} vencido` : days}</p>
                  })()}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedEvent?.status === "pendiente" && (
              <Button size="sm" className="bg-accent-green hover:bg-accent-green/90 text-white" onClick={() => selectedEvent && handleMarkComplete(selectedEvent)}>
                <CheckCircle className="size-3.5 mr-1" /> Marcar Completado
              </Button>
            )}
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
