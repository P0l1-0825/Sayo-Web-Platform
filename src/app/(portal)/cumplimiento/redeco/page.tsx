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
import { redecoComplaints } from "@/hooks/use-compliance"
import type { REDECOComplaint } from "@/lib/types"
import { Eye, MessageSquareWarning, Clock, CheckCircle, XCircle, AlertTriangle, Timer } from "lucide-react"

const statusColor = (status: string) => {
  switch (status) {
    case "recibida": return "bg-blue-100 text-blue-700"
    case "en_atencion": return "bg-yellow-100 text-yellow-700"
    case "resuelta": return "bg-green-100 text-green-700"
    case "no_favorable": return "bg-red-100 text-red-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

const statusLabel: Record<string, string> = {
  recibida: "Recibida",
  en_atencion: "En Atencion",
  resuelta: "Resuelta",
  no_favorable: "No Favorable",
}

const getDaysUntilSLA = (slaDate: string) => {
  const today = new Date()
  const sla = new Date(slaDate)
  return Math.ceil((sla.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

const getDaysBetween = (start: string, end: string) => {
  const s = new Date(start)
  const e = new Date(end)
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24))
}

export default function REDECOPage() {
  const [selectedComplaint, setSelectedComplaint] = React.useState<REDECOComplaint | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  const handleView = (complaint: REDECOComplaint) => {
    setSelectedComplaint(complaint)
    setDetailOpen(true)
  }

  const totalRecibidas = redecoComplaints.filter((c) => c.status === "recibida").length
  const totalEnAtencion = redecoComplaints.filter((c) => c.status === "en_atencion").length
  const totalResueltas = redecoComplaints.filter((c) => c.status === "resuelta" || c.status === "no_favorable").length
  const avgResolution = (() => {
    const resolved = redecoComplaints.filter((c) => c.resolvedDate)
    if (resolved.length === 0) return 0
    const totalDays = resolved.reduce((sum, c) => sum + getDaysBetween(c.receivedDate, c.resolvedDate!), 0)
    return Math.round(totalDays / resolved.length)
  })()

  const slaAtRisk = redecoComplaints.filter((c) => c.status !== "resuelta" && c.status !== "no_favorable" && getDaysUntilSLA(c.slaDate) <= 5).length

  const columns: ColumnDef<REDECOComplaint>[] = [
    { accessorKey: "folio", header: "Folio", cell: ({ row }) => <span className="font-mono text-xs">{row.original.folio}</span> },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge className={`text-[10px] ${row.original.type === "REDECO" ? "bg-purple-100 text-purple-700" : "bg-teal-100 text-teal-700"}`}>
          {row.original.type}
        </Badge>
      ),
    },
    { accessorKey: "clientName", header: "Cliente" },
    { accessorKey: "product", header: "Producto", cell: ({ row }) => <span className="text-xs">{row.original.product}</span> },
    { accessorKey: "reason", header: "Motivo", cell: ({ row }) => <span className="text-xs max-w-[180px] truncate block">{row.original.reason}</span> },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor(row.original.status)}`}>
          {row.original.status === "recibida" && <Clock className="size-3" />}
          {row.original.status === "en_atencion" && <AlertTriangle className="size-3" />}
          {row.original.status === "resuelta" && <CheckCircle className="size-3" />}
          {row.original.status === "no_favorable" && <XCircle className="size-3" />}
          {statusLabel[row.original.status]}
        </span>
      ),
    },
    {
      accessorKey: "slaDate",
      header: "SLA",
      cell: ({ row }) => {
        const c = row.original
        if (c.status === "resuelta" || c.status === "no_favorable") {
          return <span className="text-[10px] text-green-600">Cerrada</span>
        }
        const days = getDaysUntilSLA(c.slaDate)
        return (
          <div className="flex items-center gap-1">
            <Timer className={`size-3 ${days <= 3 ? "text-red-500" : days <= 7 ? "text-orange-500" : "text-green-500"}`} />
            <span className={`text-[10px] font-semibold ${days <= 3 ? "text-red-600" : days <= 7 ? "text-orange-600" : "text-green-600"}`}>
              {days < 0 ? `${Math.abs(days)}d vencido` : `${days}d`}
            </span>
          </div>
        )
      },
    },
    { accessorKey: "receivedDate", header: "Recibida", cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.receivedDate}</span> },
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
        <h1 className="text-xl font-bold">REDECO / REUNE — CONDUSEF</h1>
        <p className="text-sm text-muted-foreground">Gestion de quejas y consultas ante CONDUSEF</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-700">{totalRecibidas}</p>
              <p className="text-xs text-blue-600">Recibidas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <MessageSquareWarning className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-yellow-700">{totalEnAtencion}</p>
              <p className="text-xs text-yellow-600">En Atencion</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-700">{totalResueltas}</p>
              <p className="text-xs text-green-600">Resueltas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Timer className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold text-orange-700">{avgResolution}d</p>
              <p className="text-xs text-orange-600">Promedio Resolución</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {slaAtRisk > 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-3 pb-3 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-700 font-medium">{slaAtRisk} queja(s) con SLA proximo a vencer (5 dias o menos)</p>
          </CardContent>
        </Card>
      )}

      {/* REDECO Table */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Quejas REDECO</h2>
        <DataTable
          columns={columns}
          data={redecoComplaints.filter((c) => c.type === "REDECO")}
          searchKey="clientName"
          searchPlaceholder="Buscar por cliente..."
          exportFilename="quejas_redeco"
          onRowClick={handleView}
        />
      </div>

      {/* REUNE Table */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Consultas REUNE</h2>
        <DataTable
          columns={columns}
          data={redecoComplaints.filter((c) => c.type === "REUNE")}
          searchKey="clientName"
          searchPlaceholder="Buscar por cliente..."
          exportFilename="consultas_reune"
          onRowClick={handleView}
        />
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de Queja</DialogTitle>
            <DialogDescription>{selectedComplaint?.folio}</DialogDescription>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <Badge className={`text-xs ${selectedComplaint.type === "REDECO" ? "bg-purple-100 text-purple-700" : "bg-teal-100 text-teal-700"}`}>
                  {selectedComplaint.type}
                </Badge>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(selectedComplaint.status)}`}>
                  {statusLabel[selectedComplaint.status]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Cliente</p>
                  <p className="font-medium">{selectedComplaint.clientName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Producto</p>
                  <p>{selectedComplaint.product}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-muted-foreground uppercase">Motivo</p>
                  <p>{selectedComplaint.reason}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fecha Recepcion</p>
                  <p>{selectedComplaint.receivedDate}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fecha SLA</p>
                  <p className="font-semibold">{selectedComplaint.slaDate}</p>
                </div>
                {selectedComplaint.resolvedDate && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Fecha Resolución</p>
                    <p className="text-green-600">{selectedComplaint.resolvedDate}</p>
                  </div>
                )}
                {selectedComplaint.resolution && (
                  <div className="col-span-2">
                    <p className="text-[10px] text-muted-foreground uppercase">Resolución</p>
                    <p className="text-sm">{selectedComplaint.resolution}</p>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase mb-2">Línea de Tiempo</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-xs">{selectedComplaint.receivedDate} — Queja recibida</span>
                  </div>
                  {selectedComplaint.status !== "recibida" && (
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      <span className="text-xs">En atencion por equipo de cumplimiento</span>
                    </div>
                  )}
                  {selectedComplaint.resolvedDate && (
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-xs">{selectedComplaint.resolvedDate} — Queja resuelta ({getDaysBetween(selectedComplaint.receivedDate, selectedComplaint.resolvedDate)} dias)</span>
                    </div>
                  )}
                  {!selectedComplaint.resolvedDate && (
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                      <span className="text-xs text-orange-600">SLA: {selectedComplaint.slaDate} ({getDaysUntilSLA(selectedComplaint.slaDate)}d restantes)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
