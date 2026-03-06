"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
import { Badge } from "@/components/ui/badge"
import { commissions } from "@/lib/mock-data"
import { formatMoney } from "@/lib/utils"
import type { Commission } from "@/lib/types"

const columns: ColumnDef<Commission>[] = [
  { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
  { accessorKey: "executiveName", header: "Ejecutivo" },
  { accessorKey: "product", header: "Producto", cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.original.product}</Badge> },
  { accessorKey: "clientName", header: "Cliente" },
  { accessorKey: "amount", header: "Monto Operación", cell: ({ row }) => <span className="tabular-nums">{formatMoney(row.original.amount)}</span> },
  { accessorKey: "commissionRate", header: "Tasa %", cell: ({ row }) => <span className="tabular-nums">{row.original.commissionRate}%</span> },
  { accessorKey: "commissionAmount", header: "Comisión", cell: ({ row }) => <span className="font-semibold tabular-nums text-sayo-green">{formatMoney(row.original.commissionAmount)}</span> },
  { accessorKey: "status", header: "Estado", cell: ({ row }) => (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
      row.original.status === "pagada" ? "bg-green-100 text-green-700" :
      row.original.status === "pendiente" ? "bg-yellow-100 text-yellow-700" :
      "bg-red-100 text-red-700"
    }`}>{row.original.status}</span>
  )},
  { accessorKey: "date", header: "Fecha", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.date}</span> },
]

export default function ComisionesPage() {
  const totalPagadas = commissions.filter(c => c.status === "pagada").reduce((s, c) => s + c.commissionAmount, 0)
  const totalPendientes = commissions.filter(c => c.status === "pendiente").reduce((s, c) => s + c.commissionAmount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Comisiones</h1>
        <p className="text-sm text-muted-foreground">Comisiones por ejecutivo, producto y período</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{formatMoney(totalPagadas + totalPendientes)}</p>
          <p className="text-xs text-muted-foreground">Total Comisiones</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-sayo-green">{formatMoney(totalPagadas)}</p>
          <p className="text-xs text-muted-foreground">Pagadas</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-sayo-orange">{formatMoney(totalPendientes)}</p>
          <p className="text-xs text-muted-foreground">Pendientes</p>
        </div>
      </div>

      <DataTable columns={columns} data={commissions} searchKey="executiveName" searchPlaceholder="Buscar por ejecutivo..." />
    </div>
  )
}
