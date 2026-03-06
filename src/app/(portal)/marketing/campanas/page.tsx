"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { campaigns } from "@/lib/mock-data"
import type { Campaign } from "@/lib/types"
import { Eye, BarChart3 } from "lucide-react"

const statusColor: Record<string, string> = {
  activa: "bg-green-100 text-green-700",
  pausada: "bg-yellow-100 text-yellow-700",
  finalizada: "bg-gray-100 text-gray-500",
  borrador: "bg-gray-100 text-gray-500",
  programada: "bg-purple-100 text-purple-700",
}

const columns: ColumnDef<Campaign>[] = [
  { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
  { accessorKey: "name", header: "Campaña" },
  { accessorKey: "channel", header: "Canal", cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.original.channel}</Badge> },
  { accessorKey: "status", header: "Estado", cell: ({ row }) => (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor[row.original.status]}`}>{row.original.status}</span>
  )},
  { accessorKey: "audience", header: "Audiencia", cell: ({ row }) => <span className="text-xs">{row.original.audience.toLocaleString()}</span> },
  { accessorKey: "sent", header: "Enviados", cell: ({ row }) => <span className="text-xs">{row.original.sent.toLocaleString()}</span> },
  { accessorKey: "opened", header: "Abiertos", cell: ({ row }) => {
    const rate = row.original.sent > 0 ? ((row.original.opened / row.original.sent) * 100).toFixed(1) : "0"
    return <span className="text-xs">{row.original.opened.toLocaleString()} ({rate}%)</span>
  }},
  { accessorKey: "converted", header: "Conversiones", cell: ({ row }) => (
    <span className="text-xs font-medium text-sayo-green">{row.original.converted.toLocaleString()}</span>
  )},
  { accessorKey: "startDate", header: "Inicio", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.startDate}</span> },
  {
    id: "actions", header: "",
    cell: () => (
      <div className="flex gap-1">
        <Button variant="ghost" size="icon-xs"><Eye className="size-3.5" /></Button>
        <Button variant="ghost" size="icon-xs"><BarChart3 className="size-3.5 text-sayo-blue" /></Button>
      </div>
    ),
  },
]

export default function CampanasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Campañas</h1>
        <p className="text-sm text-muted-foreground">Gestión de campañas — canal, audiencia, métricas y rendimiento</p>
      </div>
      <DataTable columns={columns} data={campaigns} searchKey="name" searchPlaceholder="Buscar campaña..." />
    </div>
  )
}
