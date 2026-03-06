"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { leads } from "@/lib/mock-data"
import { formatMoney } from "@/lib/utils"
import type { Lead } from "@/lib/types"
import { Eye, Phone, Plus } from "lucide-react"

const stageColor: Record<string, string> = {
  prospecto: "bg-gray-100 text-gray-700",
  contactado: "bg-blue-100 text-blue-700",
  evaluacion: "bg-yellow-100 text-yellow-700",
  aprobado: "bg-green-100 text-green-700",
  dispersado: "bg-emerald-100 text-emerald-700",
  rechazado: "bg-red-100 text-red-700",
}

const columns: ColumnDef<Lead>[] = [
  { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
  { accessorKey: "name", header: "Nombre" },
  { accessorKey: "product", header: "Producto", cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.original.product}</Badge> },
  { accessorKey: "amount", header: "Monto", cell: ({ row }) => <span className="font-semibold tabular-nums">{row.original.amount > 0 ? formatMoney(row.original.amount) : "—"}</span> },
  { accessorKey: "source", header: "Fuente", cell: ({ row }) => <span className="text-xs">{row.original.source}</span> },
  { accessorKey: "stage", header: "Etapa", cell: ({ row }) => (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${stageColor[row.original.stage]}`}>{row.original.stage}</span>
  )},
  { accessorKey: "score", header: "Score", cell: ({ row }) => (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${row.original.score > 80 ? "bg-sayo-green" : row.original.score > 50 ? "bg-sayo-orange" : "bg-sayo-red"}`} style={{ width: `${row.original.score}%` }} />
      </div>
      <span className="text-xs font-semibold">{row.original.score}</span>
    </div>
  )},
  { accessorKey: "assignedTo", header: "Asignado", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.assignedTo}</span> },
  { accessorKey: "date", header: "Fecha", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.date}</span> },
  {
    id: "actions", header: "",
    cell: () => (
      <div className="flex gap-1">
        <Button variant="ghost" size="icon-xs"><Eye className="size-3.5" /></Button>
        <Button variant="ghost" size="icon-xs"><Phone className="size-3.5 text-sayo-green" /></Button>
      </div>
    ),
  },
]

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Leads</h1>
          <p className="text-sm text-muted-foreground">Prospectos comerciales — fuente, score y etapa</p>
        </div>
        <Button><Plus className="size-4 mr-1.5" /> Nuevo Lead</Button>
      </div>
      <DataTable columns={columns} data={leads} searchKey="name" searchPlaceholder="Buscar por nombre..." />
    </div>
  )
}
