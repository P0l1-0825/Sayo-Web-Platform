"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { useSystemUsers } from "@/hooks/use-admin"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import type { SystemUser } from "@/lib/types"
import { Eye, UserPlus, Pencil, ShieldCheck, ShieldOff, Trash2, Clock, Mail } from "lucide-react"
import { toast } from "sonner"

const statusColor: Record<string, string> = {
  activo: "bg-green-100 text-green-700",
  inactivo: "bg-gray-100 text-gray-500",
  suspendido: "bg-red-100 text-red-700",
}

const roleOptions = ["L2 Operador", "L2 Gestor Cobranza", "L2 Ejecutivo Comercial", "L2 Soporte", "L3 Back-Office", "L3 Oficial PLD", "L3 Marketing", "L4 Seguridad IT", "L4 Admin", "L5 Ejecutivo"]
const departmentOptions = ["Operaciones", "Cumplimiento", "Cobranza", "Comercial", "Soporte", "TI", "Marketing", "Dirección"]

export default function UsuariosPage() {
  const { data: fetchedUsers, isLoading, error, refetch } = useSystemUsers()
  const [users, setUsers] = React.useState<SystemUser[]>([])
  const [selectedUser, setSelectedUser] = React.useState<SystemUser | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [newOpen, setNewOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [newForm, setNewForm] = React.useState({ name: "", email: "", role: "L2 Operador", department: "Operaciones" })

  React.useEffect(() => { if (fetchedUsers) setUsers(fetchedUsers) }, [fetchedUsers])

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error) return <ErrorCard message={error} onRetry={refetch} />

  const handleView = (user: SystemUser) => {
    setSelectedUser(user)
    setDetailOpen(true)
  }

  const handleEdit = (user: SystemUser) => {
    setSelectedUser(user)
    setNewForm({ name: user.name, email: user.email, role: user.role, department: user.department })
    setEditOpen(true)
  }

  const handleToggleStatus = (user: SystemUser) => {
    const newStatus = user.status === "activo" ? "suspendido" as const : "activo" as const
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)))
    if (selectedUser?.id === user.id) setSelectedUser({ ...user, status: newStatus })
    toast.success(newStatus === "suspendido" ? "Usuario suspendido" : "Usuario activado", { description: `${user.id} — ${user.name}` })
  }

  const handleNewUser = () => {
    if (!newForm.name || !newForm.email) {
      toast.error("Completa nombre y email")
      return
    }
    const newUser: SystemUser = {
      id: `USR-${String(users.length + 1).padStart(3, "0")}`,
      name: newForm.name,
      email: newForm.email,
      role: newForm.role,
      department: newForm.department,
      status: "activo",
      lastLogin: "—",
      createdAt: new Date().toISOString().slice(0, 10),
    }
    setUsers([newUser, ...users])
    setNewOpen(false)
    setNewForm({ name: "", email: "", role: "L2 Operador", department: "Operaciones" })
    toast.success("Usuario creado", { description: `${newUser.id} — ${newUser.name}` })
  }

  const handleSaveEdit = () => {
    if (!selectedUser) return
    setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? { ...u, name: newForm.name, email: newForm.email, role: newForm.role, department: newForm.department } : u)))
    setEditOpen(false)
    toast.success("Usuario actualizado", { description: `${selectedUser.id} — ${newForm.name}` })
  }

  const statusTabs = [
    { label: "Activo", value: "activo", count: users.filter((u) => u.status === "activo").length },
    { label: "Suspendido", value: "suspendido", count: users.filter((u) => u.status === "suspendido").length },
    { label: "Inactivo", value: "inactivo", count: users.filter((u) => u.status === "inactivo").length },
  ]

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
      <span className="text-xs text-muted-foreground">{row.original.lastLogin === "—" ? "—" : new Date(row.original.lastLogin).toLocaleDateString("es-MX")}</span>
    )},
    {
      id: "actions", header: "",
      cell: ({ row }) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon-xs" onClick={() => handleView(row.original)} title="Ver detalle">
            <Eye className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={() => handleEdit(row.original)} title="Editar">
            <Pencil className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={() => handleToggleStatus(row.original)} title={row.original.status === "activo" ? "Suspender" : "Activar"}>
            {row.original.status === "activo" ? <ShieldOff className="size-3.5 text-sayo-red" /> : <ShieldCheck className="size-3.5 text-sayo-green" />}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Usuarios Internos</h1>
          <p className="text-sm text-muted-foreground">CRUD de usuarios del sistema — rol, departamento, estado</p>
        </div>
        <Button onClick={() => setNewOpen(true)}>
          <UserPlus className="size-4 mr-1.5" /> Nuevo Usuario
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        searchPlaceholder="Buscar usuario..."
        exportFilename="usuarios_sistema"
        statusTabs={statusTabs}
        statusKey="status"
        onRowClick={handleView}
      />

      {/* User Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de Usuario</DialogTitle>
            <DialogDescription>{selectedUser?.id} — {selectedUser?.name}</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusColor[selectedUser.status]}`}>
                  {selectedUser.status}
                </span>
                <Badge variant="outline" className="text-xs">{selectedUser.role}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Nombre</p>
                  <p className="font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Email</p>
                  <p className="text-xs flex items-center gap-1"><Mail className="size-3" /> {selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Departamento</p>
                  <p>{selectedUser.department}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Creado</p>
                  <p className="text-xs">{selectedUser.createdAt}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Último Login</p>
                  <p className="text-xs flex items-center gap-1">
                    <Clock className="size-3" />
                    {selectedUser.lastLogin === "—" ? "Nunca" : new Date(selectedUser.lastLogin).toLocaleString("es-MX")}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setDetailOpen(false); if (selectedUser) handleEdit(selectedUser) }}>
              <Pencil className="size-3.5 mr-1" /> Editar
            </Button>
            {selectedUser && (
              <Button variant="outline" size="sm" className={selectedUser.status === "activo" ? "text-sayo-red" : "text-sayo-green"} onClick={() => handleToggleStatus(selectedUser)}>
                {selectedUser.status === "activo" ? <><ShieldOff className="size-3.5 mr-1" /> Suspender</> : <><ShieldCheck className="size-3.5 mr-1" /> Activar</>}
              </Button>
            )}
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New User Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Usuario</DialogTitle>
            <DialogDescription>Crear usuario interno del sistema</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nombre *</label>
              <Input placeholder="Ej: Juan Pérez" value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email *</label>
              <Input placeholder="juan.perez@sayo.mx" value={newForm.email} onChange={(e) => setNewForm({ ...newForm, email: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Rol</label>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                {roleOptions.map((r) => (
                  <button
                    key={r}
                    onClick={() => setNewForm({ ...newForm, role: r })}
                    className={`px-2.5 py-1 text-[10px] rounded-full transition-colors ${
                      newForm.role === r ? "bg-sayo-cafe text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Departamento</label>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                {departmentOptions.map((d) => (
                  <button
                    key={d}
                    onClick={() => setNewForm({ ...newForm, department: d })}
                    className={`px-2.5 py-1 text-[10px] rounded-full transition-colors ${
                      newForm.department === d ? "bg-sayo-blue text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleNewUser}>
              <UserPlus className="size-3.5 mr-1" /> Crear Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>{selectedUser?.id}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nombre</label>
              <Input value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <Input value={newForm.email} onChange={(e) => setNewForm({ ...newForm, email: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Rol</label>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                {roleOptions.map((r) => (
                  <button key={r} onClick={() => setNewForm({ ...newForm, role: r })} className={`px-2.5 py-1 text-[10px] rounded-full transition-colors ${newForm.role === r ? "bg-sayo-cafe text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Departamento</label>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                {departmentOptions.map((d) => (
                  <button key={d} onClick={() => setNewForm({ ...newForm, department: d })} className={`px-2.5 py-1 text-[10px] rounded-full transition-colors ${newForm.department === d ? "bg-sayo-blue text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleSaveEdit}>
              <Pencil className="size-3.5 mr-1" /> Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
