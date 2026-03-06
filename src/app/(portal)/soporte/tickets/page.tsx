"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { supportTickets } from "@/lib/mock-data"
import type { SupportTicket } from "@/lib/types"
import { Eye, MessageSquare } from "lucide-react"

const priorityColor: Record<string, string> = {
  urgente: "bg-red-100 text-red-700",
  alta: "bg-orange-100 text-orange-700",
  media: "bg-yellow-100 text-yellow-700",
  baja: "bg-gray-100 text-gray-500",
}

const statusColor: Record<string, string> = {
  abierto: "bg-red-100 text-red-700",
  en_progreso: "bg-blue-100 text-blue-700",
  esperando: "bg-yellow-100 text-yellow-700",
  resuelto: "bg-green-100 text-green-700",
  cerrado: "bg-gray-100 text-gray-500",
}

const columns: ColumnDef<SupportTicket>[] = [
  { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
  { accessorKey: "subject", header: "Asunto" },
  { accessorKey: "clientName", header: "Cliente" },
  { accessorKey: "priority", header: "Prioridad", cell: ({ row }) => (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityColor[row.original.priority]}`}>{row.original.priority}</span>
  )},
  { accessorKey: "status", header: "Estado", cell: ({ row }) => (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor[row.original.status]}`}>{row.original.status.replace("_", " ")}</span>
  )},
  { accessorKey: "channel", header: "Canal", cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.original.channel}</Badge> },
  { accessorKey: "category", header: "Categoría", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.category}</span> },
  { accessorKey: "assignedTo", header: "Asignado", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.assignedTo}</span> },
  {
    id: "actions", header: "",
    cell: () => (
      <div className="flex gap-1">
        <Button variant="ghost" size="icon-xs"><Eye className="size-3.5" /></Button>
        <Button variant="ghost" size="icon-xs"><MessageSquare className="size-3.5 text-sayo-blue" /></Button>
      </div>
    ),
  },
]

export default function TicketsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Tickets</h1>
        <p className="text-sm text-muted-foreground">Gestión de tickets de soporte — prioridad, SLA y resolución</p>
      </div>
      <DataTable columns={columns} data={supportTickets} searchKey="subject" searchPlaceholder="Buscar por asunto..." />
    </div>
  )
}
