"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { useIAMUsers } from "@/hooks/use-security"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import type { IAMUser } from "@/lib/types"
import { Eye, ShieldCheck, ShieldOff, Lock, Unlock, Plus, Users, UserCheck, UserX, LogOut } from "lucide-react"
import { toast } from "sonner"

const roles = ["L1 Viewer", "L2 Operador", "L3 Oficial PLD", "L3 Marketing", "L4 Admin", "L4 Seguridad IT", "L5 C-Level"]
const departments = ["Operaciones", "Cumplimiento", "Cobranza", "Comercial", "Soporte", "TI", "Marketing", "Dirección"]

export default function IAMPage() {
  const { data: fetchedUsers, isLoading, error, refetch } = useIAMUsers()
  const [users, setUsers] = React.useState<IAMUser[]>([])
  const [selectedUser, setSelectedUser] = React.useState<IAMUser | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  React.useEffect(() => { if (fetchedUsers) setUsers(fetchedUsers) }, [fetchedUsers])

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error) return <ErrorCard message={error} onRetry={refetch} />
  const [newOpen, setNewOpen] = React.useState(false)
  const [newForm, setNewForm] = React.useState({
    name: "",
    email: "",
    role: "L2 Operador",
    department: "Operaciones",
  })

  const handleView = (user: IAMUser) => {
    setSelectedUser(user)
    setDetailOpen(true)
  }

  const handleToggleStatus = (user: IAMUser) => {
    const newStatus = user.status === "activo" ? "bloqueado" as const : "activo" as const
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
    )
    if (selectedUser?.id === user.id) {
      setSelectedUser({ ...user, status: newStatus })
    }
    toast.success(newStatus === "bloqueado" ? "Usuario bloqueado" : "Usuario desbloqueado", {
      description: `${user.id} — ${user.name}`,
    })
  }

  const handleToggleMFA = (user: IAMUser) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, mfaEnabled: !u.mfaEnabled } : u))
    )
    if (selectedUser?.id === user.id) {
      setSelectedUser({ ...user, mfaEnabled: !user.mfaEnabled })
    }
    toast.success(user.mfaEnabled ? "MFA desactivado" : "MFA activado", {
      description: `${user.name} — ${user.email}`,
    })
  }

  const handleKillSessions = (user: IAMUser) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, activeSessions: 0 } : u))
    )
    if (selectedUser?.id === user.id) {
      setSelectedUser({ ...user, activeSessions: 0 })
    }
    toast.success("Sesiones cerradas", { description: `${user.name} — Todas las sesiones terminadas` })
  }

  const handleNewUser = () => {
    if (!newForm.name || !newForm.email) {
      toast.error("Completa los campos requeridos")
      return
    }
    const newUser: IAMUser = {
      id: `USR-${String(users.length + 1).padStart(3, "0")}`,
      name: newForm.name,
      email: newForm.email,
      role: newForm.role,
      department: newForm.department,
      status: "activo",
      lastAccess: "—",
      mfaEnabled: false,
      activeSessions: 0,
    }
    setUsers([newUser, ...users])
    setNewOpen(false)
    setNewForm({ name: "", email: "", role: "L2 Operador", department: "Operaciones" })
    toast.success("Usuario creado", { description: `${newUser.id} — ${newUser.name}` })
  }

  const statusTabs = [
    { label: "Activo", value: "activo", count: users.filter((u) => u.status === "activo").length },
    { label: "Bloqueado", value: "bloqueado", count: users.filter((u) => u.status === "bloqueado").length },
    { label: "Inactivo", value: "inactivo", count: users.filter((u) => u.status === "inactivo").length },
  ]

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
    { accessorKey: "lastAccess", header: "Último Acceso", cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.lastAccess !== "—" ? new Date(row.original.lastAccess).toLocaleString("es-MX") : "—"}
      </span>
    )},
    {
      id: "actions", header: "",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleView(row.original) }} title="Ver detalle">
            <Eye className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleToggleStatus(row.original) }} title={row.original.status === "activo" ? "Bloquear" : "Desbloquear"}>
            {row.original.status === "activo" ? <Lock className="size-3.5 text-sayo-red" /> : <Unlock className="size-3.5 text-sayo-green" />}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">IAM — Identidad y Accesos</h1>
          <p className="text-sm text-muted-foreground">Usuarios, roles, permisos y sesiones activas</p>
        </div>
        <Button onClick={() => setNewOpen(true)}>
          <Plus className="size-4 mr-1.5" /> Nuevo Usuario
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="size-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-2xl font-bold">{users.length}</p>
            <p className="text-xs text-muted-foreground">Total Usuarios</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <UserCheck className="size-5 mx-auto text-sayo-green mb-1" />
            <p className="text-2xl font-bold text-sayo-green">{users.filter((u) => u.status === "activo").length}</p>
            <p className="text-xs text-muted-foreground">Activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <ShieldCheck className="size-5 mx-auto text-sayo-blue mb-1" />
            <p className="text-2xl font-bold text-sayo-blue">{users.filter((u) => u.mfaEnabled).length}</p>
            <p className="text-xs text-muted-foreground">Con MFA</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <UserX className="size-5 mx-auto text-sayo-red mb-1" />
            <p className="text-2xl font-bold text-sayo-red">{users.filter((u) => u.status === "bloqueado").length}</p>
            <p className="text-xs text-muted-foreground">Bloqueados</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        searchPlaceholder="Buscar usuario..."
        exportFilename="iam_usuarios"
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
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                  selectedUser.status === "activo" ? "bg-green-100 text-green-700" :
                  selectedUser.status === "bloqueado" ? "bg-red-100 text-red-700" :
                  "bg-gray-100 text-gray-500"
                }`}>{selectedUser.status}</span>
                <div className="flex items-center gap-2">
                  {selectedUser.mfaEnabled
                    ? <Badge className="bg-green-100 text-green-700 text-[10px]"><ShieldCheck className="size-3 mr-1" /> MFA Activo</Badge>
                    : <Badge className="bg-red-100 text-red-700 text-[10px]"><ShieldOff className="size-3 mr-1" /> MFA Inactivo</Badge>
                  }
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Nombre</p>
                  <p className="font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Email</p>
                  <p className="text-xs">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Rol</p>
                  <Badge variant="outline" className="text-[10px]">{selectedUser.role}</Badge>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Departamento</p>
                  <p>{selectedUser.department}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Último Acceso</p>
                  <p className="text-xs">{selectedUser.lastAccess !== "—" ? new Date(selectedUser.lastAccess).toLocaleString("es-MX") : "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Sesiones Activas</p>
                  <p className={`font-medium ${selectedUser.activeSessions > 1 ? "text-sayo-orange" : ""}`}>{selectedUser.activeSessions}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedUser && (
              <>
                <Button variant="outline" size="sm" onClick={() => handleToggleMFA(selectedUser)}>
                  {selectedUser.mfaEnabled ? <ShieldOff className="size-3.5 mr-1" /> : <ShieldCheck className="size-3.5 mr-1" />}
                  {selectedUser.mfaEnabled ? "Desactivar MFA" : "Activar MFA"}
                </Button>
                {selectedUser.activeSessions > 0 && (
                  <Button variant="outline" size="sm" className="text-sayo-orange" onClick={() => handleKillSessions(selectedUser)}>
                    <LogOut className="size-3.5 mr-1" /> Cerrar Sesiones
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className={selectedUser.status === "activo" ? "text-sayo-red" : "text-sayo-green"}
                  onClick={() => handleToggleStatus(selectedUser)}
                >
                  {selectedUser.status === "activo" ? <Lock className="size-3.5 mr-1" /> : <Unlock className="size-3.5 mr-1" />}
                  {selectedUser.status === "activo" ? "Bloquear" : "Desbloquear"}
                </Button>
              </>
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
            <DialogDescription>Crear usuario en el sistema IAM</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nombre completo *</label>
              <Input placeholder="Ej: María López" value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email corporativo *</label>
              <Input placeholder="usuario@sayo.mx" value={newForm.email} onChange={(e) => setNewForm({ ...newForm, email: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Rol</label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => setNewForm({ ...newForm, role: r })}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
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
              <div className="flex gap-2 mt-1 flex-wrap">
                {departments.map((d) => (
                  <button
                    key={d}
                    onClick={() => setNewForm({ ...newForm, department: d })}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                      newForm.department === d ? "bg-sayo-cafe text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
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
              <Plus className="size-3.5 mr-1" /> Crear Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
