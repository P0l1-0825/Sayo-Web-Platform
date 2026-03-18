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
import { useAuditLogs } from "@/hooks/use-security"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import type { AuditLog } from "@/lib/types"
import { Eye, FileText, CheckCircle, XCircle, ShieldAlert, Activity } from "lucide-react"
import { toast } from "sonner"

const actionColors: Record<string, string> = {
  LOGIN_SUCCESS: "bg-green-100 text-green-700",
  LOGIN_FAILED: "bg-red-100 text-red-700",
  TRANSFER_APPROVED: "bg-blue-100 text-blue-700",
  TRANSFER_REJECTED: "bg-orange-100 text-orange-700",
  USER_CREATED: "bg-purple-100 text-purple-700",
  USER_BLOCKED: "bg-red-100 text-red-700",
  CONFIG_CHANGED: "bg-yellow-100 text-yellow-700",
  REPORT_GENERATED: "bg-gray-100 text-gray-700",
}

export default function LogsPage() {
  const { data: fetchedLogs, isLoading, error, refetch } = useAuditLogs()
  const [logs, setLogs] = React.useState<AuditLog[]>([])
  const [selectedLog, setSelectedLog] = React.useState<AuditLog | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  React.useEffect(() => { if (fetchedLogs) setLogs(fetchedLogs) }, [fetchedLogs])

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error) return <ErrorCard message={error} onRetry={refetch} />

  const handleView = (log: AuditLog) => {
    setSelectedLog(log)
    setDetailOpen(true)
  }

  const handleExportLog = (log: AuditLog) => {
    toast.success("Log exportado", { description: `${log.id} copiado al portapapeles` })
  }

  const resultTabs = [
    { label: "Exitoso", value: "exitoso", count: logs.filter((l) => l.result === "exitoso").length },
    { label: "Fallido", value: "fallido", count: logs.filter((l) => l.result === "fallido").length },
    { label: "Bloqueado", value: "bloqueado", count: logs.filter((l) => l.result === "bloqueado").length },
  ]

  const columns: ColumnDef<AuditLog>[] = [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
    { accessorKey: "timestamp", header: "Fecha/Hora", cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{new Date(row.original.timestamp).toLocaleString("es-MX")}</span>
    )},
    { accessorKey: "action", header: "Acción", cell: ({ row }) => (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium font-mono ${actionColors[row.original.action] || "bg-gray-100 text-gray-700"}`}>
        {row.original.action}
      </span>
    )},
    { accessorKey: "user", header: "Usuario", cell: ({ row }) => <span className="text-xs">{row.original.user}</span> },
    { accessorKey: "ip", header: "IP", cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.ip}</span> },
    { accessorKey: "resource", header: "Recurso", cell: ({ row }) => <span className="text-xs">{row.original.resource}</span> },
    { accessorKey: "result", header: "Resultado", cell: ({ row }) => (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
        row.original.result === "exitoso" ? "bg-green-100 text-green-700" :
        row.original.result === "fallido" ? "bg-red-100 text-red-700" :
        "bg-orange-100 text-orange-700"
      }`}>
        {row.original.result === "exitoso" && <CheckCircle className="size-3" />}
        {row.original.result === "fallido" && <XCircle className="size-3" />}
        {row.original.result === "bloqueado" && <ShieldAlert className="size-3" />}
        {row.original.result}
      </span>
    )},
    {
      id: "actions", header: "",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleView(row.original) }} title="Ver detalle">
            <Eye className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleExportLog(row.original) }} title="Exportar log">
            <FileText className="size-3.5 text-muted-foreground" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">Registro de auditoría — acciones, usuarios, IPs y resultados</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="size-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-2xl font-bold">{logs.length}</p>
            <p className="text-xs text-muted-foreground">Total Logs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="size-5 mx-auto text-sayo-green mb-1" />
            <p className="text-2xl font-bold text-sayo-green">{logs.filter((l) => l.result === "exitoso").length}</p>
            <p className="text-xs text-muted-foreground">Exitosos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="size-5 mx-auto text-sayo-red mb-1" />
            <p className="text-2xl font-bold text-sayo-red">{logs.filter((l) => l.result === "fallido").length}</p>
            <p className="text-xs text-muted-foreground">Fallidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <ShieldAlert className="size-5 mx-auto text-sayo-orange mb-1" />
            <p className="text-2xl font-bold text-sayo-orange">{logs.filter((l) => l.result === "bloqueado").length}</p>
            <p className="text-xs text-muted-foreground">Bloqueados</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        searchKey="action"
        searchPlaceholder="Buscar por acción..."
        exportFilename="audit_logs"
        statusTabs={resultTabs}
        statusKey="result"
        onRowClick={handleView}
      />

      {/* Log Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle del Log</DialogTitle>
            <DialogDescription>{selectedLog?.id}</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium font-mono ${actionColors[selectedLog.action] || "bg-gray-100 text-gray-700"}`}>
                  {selectedLog.action}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                  selectedLog.result === "exitoso" ? "bg-green-100 text-green-700" :
                  selectedLog.result === "fallido" ? "bg-red-100 text-red-700" :
                  "bg-orange-100 text-orange-700"
                }`}>
                  {selectedLog.result === "exitoso" && <CheckCircle className="size-3" />}
                  {selectedLog.result === "fallido" && <XCircle className="size-3" />}
                  {selectedLog.result === "bloqueado" && <ShieldAlert className="size-3" />}
                  {selectedLog.result}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fecha/Hora</p>
                  <p className="text-xs">{new Date(selectedLog.timestamp).toLocaleString("es-MX")}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">ID Log</p>
                  <p className="font-mono text-xs">{selectedLog.id}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Usuario</p>
                  <p className="text-xs font-medium">{selectedLog.user}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Dirección IP</p>
                  <p className="font-mono text-xs">{selectedLog.ip}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Recurso</p>
                  <p className="text-xs">{selectedLog.resource}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Acción</p>
                  <Badge variant="outline" className="text-[10px] font-mono">{selectedLog.action}</Badge>
                </div>
                {selectedLog.details && (
                  <div className="col-span-2">
                    <p className="text-[10px] text-muted-foreground uppercase">Detalles</p>
                    <p className="text-sm">{selectedLog.details}</p>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-lg border bg-muted/20">
                <p className="text-[10px] text-muted-foreground uppercase mb-1">Registro completo</p>
                <pre className="text-[10px] font-mono text-muted-foreground overflow-x-auto">
{JSON.stringify({
  id: selectedLog.id,
  action: selectedLog.action,
  user: selectedLog.user,
  ip: selectedLog.ip,
  resource: selectedLog.resource,
  result: selectedLog.result,
  timestamp: selectedLog.timestamp,
}, null, 2)}
                </pre>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => selectedLog && handleExportLog(selectedLog)}>
              <FileText className="size-3.5 mr-1" /> Copiar Log
            </Button>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
