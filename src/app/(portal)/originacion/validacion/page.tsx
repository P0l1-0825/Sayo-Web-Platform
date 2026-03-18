"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { useCreditApplications } from "@/hooks/use-originacion"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import { formatMoney } from "@/lib/utils"
import type { CreditApplication } from "@/lib/types"
import { Eye, CheckCircle, XCircle, ShieldCheck, FileSearch, Send, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

export default function ValidacionPage() {
  const { data: fetchedApps, isLoading, error, refetch } = useCreditApplications()
  const [apps, setApps] = React.useState<CreditApplication[]>([])
  const [selectedApp, setSelectedApp] = React.useState<CreditApplication | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  React.useEffect(() => {
    if (fetchedApps) setApps(fetchedApps.filter((a) => a.status === "por_aprobar" || a.status === "capturada"))
  }, [fetchedApps])

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error) return <ErrorCard message={error} onRetry={refetch} />

  const handleView = (app: CreditApplication) => {
    setSelectedApp(app)
    setDetailOpen(true)
  }

  const handleApprove = (app: CreditApplication) => {
    setApps((prev) => prev.map((a) => a.id === app.id ? { ...a, status: "en_comite" as const } : a))
    setDetailOpen(false)
    toast.success("Solicitud enviada a Comité", { description: `${app.folio} — ${app.clientName}` })
  }

  const handleReject = (app: CreditApplication) => {
    setApps((prev) => prev.map((a) => a.id === app.id ? { ...a, status: "rechazada" as const } : a))
    setDetailOpen(false)
    toast.error("Solicitud rechazada", { description: `${app.folio} — ${app.clientName}` })
  }

  const handleRequestInfo = (app: CreditApplication) => {
    toast.info("Solicitud de información adicional enviada", { description: `${app.folio} — ${app.clientName}` })
  }

  const columns: ColumnDef<CreditApplication>[] = [
    { accessorKey: "folio", header: "Folio", cell: ({ row }) => <span className="font-mono text-xs">{row.original.folio}</span> },
    { accessorKey: "clientName", header: "Cliente" },
    {
      accessorKey: "clientType",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[10px]">{row.original.clientType === "PFAE" ? "PFAE" : "PM"}</Badge>
      ),
    },
    {
      accessorKey: "amount",
      header: "Monto",
      cell: ({ row }) => <span className="font-semibold tabular-nums">{formatMoney(row.original.amount)}</span>,
    },
    {
      accessorKey: "bureauScore",
      header: "Score Buro",
      cell: ({ row }) => {
        const score = row.original.bureauScore
        if (!score) return <span className="text-muted-foreground text-xs">Pendiente</span>
        return (
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full ${score >= 700 ? "bg-green-500" : score >= 600 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${Math.min(100, (score / 850) * 100)}%` }} />
            </div>
            <span className="text-xs font-semibold tabular-nums">{score}</span>
          </div>
        )
      },
    },
    {
      id: "validaciones",
      header: "Validaciones",
      cell: ({ row }) => {
        const v = row.original.validations
        if (!v) return <span className="text-muted-foreground text-xs">Sin validar</span>
        const done = Object.values(v).filter(Boolean).length
        const total = Object.values(v).length
        return (
          <div className="flex items-center gap-1">
            <span className={`text-xs font-semibold ${done === total ? "text-green-600" : "text-orange-600"}`}>{done}/{total}</span>
            {done === total ? <CheckCircle className="size-3 text-green-600" /> : <AlertTriangle className="size-3 text-orange-500" />}
          </div>
        )
      },
    },
    { accessorKey: "assignedTo", header: "Asignado" },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon-xs" onClick={() => handleView(row.original)} title="Ver detalle">
            <Eye className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={() => handleApprove(row.original)} title="Enviar a Comité">
            <Send className="size-3.5 text-green-600" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={() => handleReject(row.original)} title="Rechazar">
            <XCircle className="size-3.5 text-red-500" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Validación de Solicitudes</h1>
        <p className="text-sm text-muted-foreground">Revision de documentos, buro de credito y listas de control</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <FileSearch className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-700">{apps.filter((a) => a.status === "por_aprobar").length}</p>
              <p className="text-xs text-blue-600">Pendientes de Validación</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-700">{apps.filter((a) => a.status === "en_comite").length}</p>
              <p className="text-xs text-green-600">Enviadas a Comité</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-red-700">{apps.filter((a) => a.status === "rechazada").length}</p>
              <p className="text-xs text-red-500">Rechazadas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={apps}
        searchKey="clientName"
        searchPlaceholder="Buscar por cliente..."
        exportFilename="validación_solicitudes"
        onRowClick={handleView}
      />

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Validación de Solicitud</DialogTitle>
            <DialogDescription>{selectedApp?.folio} — {selectedApp?.clientName}</DialogDescription>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <Badge variant="outline">{selectedApp.clientType === "PFAE" ? "PFAE" : "PM"}</Badge>
                <div className="text-right">
                  <p className="text-xl font-bold tabular-nums">{formatMoney(selectedApp.amount)}</p>
                  <p className="text-xs text-muted-foreground">{selectedApp.product}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Score Buro</p>
                  <p className="font-bold text-lg">{selectedApp.bureauScore || "Pendiente"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Tasa / Plazo</p>
                  <p>{selectedApp.rate}% — {selectedApp.term} meses</p>
                </div>
              </div>
              {selectedApp.validations && (
                <div className="p-3 rounded-lg border space-y-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">Checklist de Validaciones</p>
                  <div className="space-y-1.5">
                    {Object.entries(selectedApp.validations).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                        <span className="capitalize">{key.replace(/_/g, " ")}</span>
                        {value ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs font-medium"><CheckCircle className="size-3.5" /> Aprobado</span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-500 text-xs font-medium"><XCircle className="size-3.5" /> Pendiente</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => selectedApp && handleRequestInfo(selectedApp)}>
              <AlertTriangle className="size-3.5 mr-1" /> Solicitar Info
            </Button>
            <Button variant="outline" size="sm" className="text-red-600" onClick={() => selectedApp && handleReject(selectedApp)}>
              <XCircle className="size-3.5 mr-1" /> Rechazar
            </Button>
            <Button size="sm" className="bg-accent-green hover:bg-accent-green/90 text-white" onClick={() => selectedApp && handleApprove(selectedApp)}>
              <Send className="size-3.5 mr-1" /> Enviar a Comité
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
