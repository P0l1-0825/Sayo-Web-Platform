"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { complianceAlerts } from "@/lib/mock-data"
import { formatMoney, getSeverityColor } from "@/lib/utils"
import type { ComplianceAlert } from "@/lib/types"
import { Eye, ArrowUpRight, XCircle, AlertTriangle } from "lucide-react"

const columns: ColumnDef<ComplianceAlert>[] = [
  { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
  { accessorKey: "type", header: "Tipo", cell: ({ row }) => <span className="text-sm font-medium">{row.original.type}</span> },
  { accessorKey: "clientName", header: "Cliente" },
  {
    accessorKey: "severity", header: "Severidad",
    cell: ({ row }) => (
      <Badge className={getSeverityColor(row.original.severity)}>
        {row.original.severity}
      </Badge>
    ),
  },
  {
    accessorKey: "status", header: "Estado",
    cell: ({ row }) => (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
        row.original.status === "activa" ? "bg-red-100 text-red-700" :
        row.original.status === "investigando" ? "bg-blue-100 text-blue-700" :
        row.original.status === "escalada" ? "bg-purple-100 text-purple-700" :
        "bg-green-100 text-green-700"
      }`}>{row.original.status}</span>
    ),
  },
  { accessorKey: "riskScore", header: "Score", cell: ({ row }) => (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${row.original.riskScore > 80 ? "bg-sayo-red" : row.original.riskScore > 60 ? "bg-sayo-orange" : "bg-sayo-green"}`} style={{ width: `${row.original.riskScore}%` }} />
      </div>
      <span className="text-xs font-semibold tabular-nums">{row.original.riskScore}</span>
    </div>
  )},
  { accessorKey: "amount", header: "Monto", cell: ({ row }) => <span className="font-semibold tabular-nums">{formatMoney(row.original.amount || 0)}</span> },
  { accessorKey: "assignedTo", header: "Asignado", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.assignedTo}</span> },
  { accessorKey: "date", header: "Fecha", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.date}</span> },
  {
    id: "actions", header: "",
    cell: () => (
      <div className="flex gap-1">
        <Button variant="ghost" size="icon-xs"><Eye className="size-3.5" /></Button>
        <Button variant="ghost" size="icon-xs"><ArrowUpRight className="size-3.5 text-sayo-orange" /></Button>
        <Button variant="ghost" size="icon-xs"><XCircle className="size-3.5 text-muted-foreground" /></Button>
      </div>
    ),
  },
]

export default function AlertasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Alertas PLD/FT</h1>
          <p className="text-sm text-muted-foreground">Operaciones inusuales, structuring y coincidencias PEP</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1"><AlertTriangle className="size-3" /> 12 activas</Badge>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={complianceAlerts}
        searchKey="clientName"
        searchPlaceholder="Buscar por cliente..."
      />
    </div>
  )
}
