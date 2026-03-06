"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { transactions } from "@/lib/mock-data"
import { formatMoney, formatClabe, getStatusColor } from "@/lib/utils"
import type { Transaction } from "@/lib/types"
import { ArrowDownLeft, ArrowUpRight, Eye } from "lucide-react"

const columns: ColumnDef<Transaction>[] = [
  { accessorKey: "claveRastreo", header: "Clave Rastreo", cell: ({ row }) => <span className="font-mono text-xs">{row.original.claveRastreo}</span> },
  {
    accessorKey: "type", header: "Tipo",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        {row.original.type.includes("IN") ? (
          <ArrowDownLeft className="size-3.5 text-sayo-green" />
        ) : (
          <ArrowUpRight className="size-3.5 text-sayo-red" />
        )}
        <Badge variant="outline" className="text-[10px]">{row.original.type}</Badge>
      </div>
    ),
  },
  { accessorKey: "senderName", header: "Origen" },
  { accessorKey: "senderBank", header: "Banco Origen", cell: ({ row }) => <span className="text-xs">{row.original.senderBank}</span> },
  { accessorKey: "receiverName", header: "Destino" },
  { accessorKey: "receiverBank", header: "Banco Destino", cell: ({ row }) => <span className="text-xs">{row.original.receiverBank}</span> },
  { accessorKey: "amount", header: "Monto", cell: ({ row }) => <span className="font-semibold tabular-nums">{formatMoney(row.original.amount)}</span> },
  { accessorKey: "concept", header: "Concepto", cell: ({ row }) => <span className="text-xs text-muted-foreground truncate max-w-[120px] block">{row.original.concept}</span> },
  { accessorKey: "status", header: "Estado", cell: ({ row }) => <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusColor(row.original.status)}`}>{row.original.status}</span> },
  { accessorKey: "hour", header: "Hora", cell: ({ row }) => <span className="text-muted-foreground text-xs tabular-nums">{row.original.hour}</span> },
  {
    id: "actions", header: "",
    cell: () => (
      <Button variant="ghost" size="icon-xs">
        <Eye className="size-3.5" />
      </Button>
    ),
  },
]

export default function SPEIPage() {
  const speiIn = transactions.filter((t) => t.type === "SPEI_IN")
  const speiOut = transactions.filter((t) => t.type === "SPEI_OUT")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Operaciones SPEI</h1>
        <p className="text-sm text-muted-foreground">Transferencias electrónicas interbancarias</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-green-50">
              <ArrowDownLeft className="size-5 text-sayo-green" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">SPEI Entrada</p>
              <p className="text-lg font-bold">{speiIn.length} ops</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-red-50">
              <ArrowUpRight className="size-5 text-sayo-red" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">SPEI Salida</p>
              <p className="text-lg font-bold">{speiOut.length} ops</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50">
              <span className="text-sayo-blue font-bold text-sm">Σ</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Procesado</p>
              <p className="text-lg font-bold">{formatMoney(transactions.reduce((s, t) => s + t.amount, 0))}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Table */}
      <DataTable
        columns={columns}
        data={transactions}
        searchKey="claveRastreo"
        searchPlaceholder="Buscar por clave de rastreo..."
        pageSize={20}
      />
    </div>
  )
}
