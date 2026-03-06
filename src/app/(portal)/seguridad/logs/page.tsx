"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
import { Badge } from "@/components/ui/badge"
import { auditLogs } from "@/lib/mock-data"
import type { AuditLog } from "@/lib/types"

const columns: ColumnDef<AuditLog>[] = [
  { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
  { accessorKey: "timestamp", header: "Fecha/Hora", cell: ({ row }) => (
    <span className="text-xs text-muted-foreground">{new Date(row.original.timestamp).toLocaleString("es-MX")}</span>
  )},
  { accessorKey: "action", header: "Acción", cell: ({ row }) => (
    <Badge variant="outline" className="text-[10px] font-mono">{row.original.action}</Badge>
  )},
  { accessorKey: "user", header: "Usuario", cell: ({ row }) => <span className="text-xs">{row.original.user}</span> },
  { accessorKey: "ip", header: "IP", cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.ip}</span> },
  { accessorKey: "resource", header: "Recurso", cell: ({ row }) => <span className="text-xs">{row.original.resource}</span> },
  { accessorKey: "result", header: "Resultado", cell: ({ row }) => (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
      row.original.result === "exitoso" ? "bg-green-100 text-green-700" :
      row.original.result === "fallido" ? "bg-red-100 text-red-700" :
      "bg-orange-100 text-orange-700"
    }`}>{row.original.result}</span>
  )},
]

export default function LogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">Registro de auditoría — acciones, usuarios, IPs y resultados</p>
      </div>
      <DataTable columns={columns} data={auditLogs} searchKey="action" searchPlaceholder="Buscar por acción..." />
    </div>
  )
}
