"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { creditAccounts } from "@/lib/mock-data"
import { formatMoney } from "@/lib/utils"
import type { CreditAccount } from "@/lib/types"
import { Eye, Phone, Mail } from "lucide-react"

const columns: ColumnDef<CreditAccount>[] = [
  { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
  { accessorKey: "clientName", header: "Cliente" },
  { accessorKey: "productType", header: "Producto", cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.original.productType}</Badge> },
  { accessorKey: "currentBalance", header: "Saldo Actual", cell: ({ row }) => <span className="font-semibold tabular-nums">{formatMoney(row.original.currentBalance)}</span> },
  { accessorKey: "pastDueAmount", header: "Monto Vencido", cell: ({ row }) => <span className="font-semibold tabular-nums text-sayo-red">{formatMoney(row.original.pastDueAmount)}</span> },
  { accessorKey: "daysPastDue", header: "Días Mora", cell: ({ row }) => (
    <span className={`font-bold text-sm ${
      row.original.daysPastDue > 90 ? "text-sayo-red" :
      row.original.daysPastDue > 60 ? "text-sayo-orange" :
      "text-sayo-blue"
    }`}>{row.original.daysPastDue}</span>
  )},
  { accessorKey: "moraCategory", header: "Categoría", cell: ({ row }) => (
    <Badge className={`text-[10px] ${
      row.original.moraCategory === "90+" ? "bg-red-100 text-red-700" :
      row.original.moraCategory === "61-90" ? "bg-orange-100 text-orange-700" :
      row.original.moraCategory === "31-60" ? "bg-yellow-100 text-yellow-700" :
      "bg-blue-100 text-blue-700"
    }`}>{row.original.moraCategory}</Badge>
  )},
  { accessorKey: "status", header: "Estado", cell: ({ row }) => (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
      row.original.status === "castigado" ? "bg-red-100 text-red-700" :
      row.original.status === "vencido" ? "bg-orange-100 text-orange-700" :
      "bg-green-100 text-green-700"
    }`}>{row.original.status}</span>
  )},
  { accessorKey: "assignedAgent", header: "Agente", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.assignedAgent}</span> },
  {
    id: "actions", header: "",
    cell: () => (
      <div className="flex gap-1">
        <Button variant="ghost" size="icon-xs"><Eye className="size-3.5" /></Button>
        <Button variant="ghost" size="icon-xs"><Phone className="size-3.5 text-sayo-green" /></Button>
        <Button variant="ghost" size="icon-xs"><Mail className="size-3.5 text-sayo-blue" /></Button>
      </div>
    ),
  },
]

export default function CarteraPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Cartera Vencida</h1>
        <p className="text-sm text-muted-foreground">Créditos con atraso — días mora, monto vencido y acciones</p>
      </div>
      <DataTable columns={columns} data={creditAccounts} searchKey="clientName" searchPlaceholder="Buscar por cliente..." />
    </div>
  )
}
