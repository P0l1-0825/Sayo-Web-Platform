"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { systemUsers } from "@/lib/mock-data"
import type { SystemUser } from "@/lib/types"
import { Eye, UserPlus, Pencil } from "lucide-react"

const statusColor: Record<string, string> = {
  activo: "bg-green-100 text-green-700",
  inactivo: "bg-gray-100 text-gray-500",
  suspendido: "bg-red-100 text-red-700",
}

const columns: ColumnDef<SystemUser>[] = [
  { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
  { accessorKey: "name", header: "Nombre" },
  { accessorKey: "email", header: "Email", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.email}</span> },
  { accessorKey: "role", header: "Rol", cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.original.role}</Badge> },
  { accessorKey: "department", header: "Depto.", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.department}</span> },
  { accessorKey: "status", header: "Estado", cell: ({ row }) => (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor[row.original.status]}`}>{row.original.status}</span>
  )},
  { accessorKey: "lastLogin", header: "Último Login", cell: ({ row }) => (
    <span className="text-xs text-muted-foreground">{new Date(row.original.lastLogin).toLocaleDateString("es-MX")}</span>
  )},
  {
    id: "actions", header: "",
    cell: () => (
      <div className="flex gap-1">
        <Button variant="ghost" size="icon-xs"><Eye className="size-3.5" /></Button>
        <Button variant="ghost" size="icon-xs"><Pencil className="size-3.5" /></Button>
      </div>
    ),
  },
]

export default function UsuariosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Usuarios Internos</h1>
          <p className="text-sm text-muted-foreground">CRUD de usuarios del sistema — rol, departamento, estado</p>
        </div>
        <Button><UserPlus className="size-4 mr-1.5" /> Nuevo Usuario</Button>
      </div>
      <DataTable columns={columns} data={systemUsers} searchKey="name" searchPlaceholder="Buscar usuario..." />
    </div>
  )
}
