"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { iamUsers } from "@/lib/mock-data"
import type { IAMUser } from "@/lib/types"
import { Eye, ShieldCheck, ShieldOff } from "lucide-react"

const columns: ColumnDef<IAMUser>[] = [
  { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
  { accessorKey: "name", header: "Nombre" },
  { accessorKey: "email", header: "Email", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.email}</span> },
  { accessorKey: "role", header: "Rol", cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.original.role}</Badge> },
  { accessorKey: "department", header: "Depto.", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.department}</span> },
  { accessorKey: "status", header: "Estado", cell: ({ row }) => (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
      row.original.status === "activo" ? "bg-green-100 text-green-700" :
      row.original.status === "bloqueado" ? "bg-red-100 text-red-700" :
      "bg-gray-100 text-gray-500"
    }`}>{row.original.status}</span>
  )},
  { accessorKey: "mfaEnabled", header: "MFA", cell: ({ row }) => (
    row.original.mfaEnabled
      ? <ShieldCheck className="size-4 text-green-600" />
      : <ShieldOff className="size-4 text-red-400" />
  )},
  { accessorKey: "activeSessions", header: "Sesiones", cell: ({ row }) => (
    <span className={`text-xs font-medium ${row.original.activeSessions > 1 ? "text-sayo-orange" : ""}`}>
      {row.original.activeSessions}
    </span>
  )},
  {
    id: "actions", header: "",
    cell: () => <Button variant="ghost" size="icon-xs"><Eye className="size-3.5" /></Button>,
  },
]

export default function IAMPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">IAM — Identidad y Accesos</h1>
        <p className="text-sm text-muted-foreground">Usuarios, roles, permisos y sesiones activas</p>
      </div>
      <DataTable columns={columns} data={iamUsers} searchKey="name" searchPlaceholder="Buscar usuario..." />
    </div>
  )
}
