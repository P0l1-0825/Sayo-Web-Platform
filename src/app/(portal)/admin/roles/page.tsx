"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
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
import { useRolePermissions } from "@/hooks/use-admin"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import type { RolePermission } from "@/lib/types"
import { Shield, Users, Plus, Check, X, Eye, Pencil, Copy } from "lucide-react"
import { toast } from "sonner"

export default function RolesPage() {
  const { data: fetchedRoles, isLoading, error, refetch } = useRolePermissions()
  const [roles, setRoles] = React.useState<RolePermission[]>([])
  const [selectedRole, setSelectedRole] = React.useState<RolePermission | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [newOpen, setNewOpen] = React.useState(false)
  const [editPerms, setEditPerms] = React.useState<Record<string, boolean>>({})
  const [editName, setEditName] = React.useState("")
  const [editDesc, setEditDesc] = React.useState("")

  React.useEffect(() => { if (fetchedRoles) setRoles(fetchedRoles) }, [fetchedRoles])

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error) return <ErrorCard message={error} onRetry={refetch} />

  const handleView = (role: RolePermission) => {
    setSelectedRole(role)
    setDetailOpen(true)
  }

  const handleEditOpen = (role: RolePermission) => {
    setSelectedRole(role)
    setEditPerms({ ...role.permissions })
    setEditName(role.name)
    setEditDesc(role.description)
    setEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!selectedRole) return
    setRoles((prev) => prev.map((r) => (r.id === selectedRole.id ? { ...r, name: editName, description: editDesc, permissions: editPerms } : r)))
    setEditOpen(false)
    toast.success("Rol actualizado", { description: `${selectedRole.id} — ${editName}` })
  }

  const handleTogglePerm = (key: string) => {
    setEditPerms((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleNewOpen = () => {
    setEditName("")
    setEditDesc("")
    setEditPerms({
      dashboard: true,
      operaciones: false,
      cumplimiento: false,
      cobranza: false,
      comercial: false,
      soporte: false,
      seguridad: false,
      marketing: false,
      ejecutivo: false,
      admin: false,
    })
    setNewOpen(true)
  }

  const handleCreateRole = () => {
    if (!editName) {
      toast.error("Ingresa el nombre del rol")
      return
    }
    const newRole: RolePermission = {
      id: `ROL-${String(roles.length + 1).padStart(3, "0")}`,
      name: editName,
      description: editDesc || "Nuevo rol",
      permissions: editPerms,
      userCount: 0,
    }
    setRoles([...roles, newRole])
    setNewOpen(false)
    toast.success("Rol creado", { description: `${newRole.id} — ${newRole.name}` })
  }

  const handleDuplicate = (role: RolePermission) => {
    const dup: RolePermission = {
      ...role,
      id: `ROL-${String(roles.length + 1).padStart(3, "0")}`,
      name: `${role.name} (Copia)`,
      userCount: 0,
    }
    setRoles([...roles, dup])
    toast.success("Rol duplicado", { description: `${dup.id} — ${dup.name}` })
  }

  const totalPerms = (perms: Record<string, boolean>) => Object.values(perms).filter(Boolean).length
  const totalPermCount = (perms: Record<string, boolean>) => Object.keys(perms).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Roles y Permisos</h1>
          <p className="text-sm text-muted-foreground">Configuración de roles — módulos y permisos por perfil</p>
        </div>
        <Button onClick={handleNewOpen}>
          <Plus className="size-4 mr-1.5" /> Nuevo Rol
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="size-5 mx-auto text-sayo-blue mb-1" />
            <p className="text-2xl font-bold">{roles.length}</p>
            <p className="text-xs text-muted-foreground">Total Roles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="size-5 mx-auto text-sayo-green mb-1" />
            <p className="text-2xl font-bold">{roles.reduce((s, r) => s + r.userCount, 0)}</p>
            <p className="text-xs text-muted-foreground">Usuarios Asignados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Check className="size-5 mx-auto text-sayo-purple mb-1" />
            <p className="text-2xl font-bold">{roles.reduce((s, r) => s + totalPerms(r.permissions), 0)}</p>
            <p className="text-xs text-muted-foreground">Permisos Habilitados</p>
          </CardContent>
        </Card>
      </div>

      {/* Roles List */}
      <div className="space-y-4">
        {roles.map((role) => (
          <Card key={role.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleView(role)}>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="size-5 text-sayo-blue" />
                  <div>
                    <h3 className="text-sm font-bold">{role.name}</h3>
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="size-3.5" />
                    <span>{role.userCount}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{totalPerms(role.permissions)}/{totalPermCount(role.permissions)}</Badge>
                  <Button variant="outline" size="sm" onClick={() => handleEditOpen(role)}>
                    <Pencil className="size-3 mr-1" /> Editar
                  </Button>
                  <Button variant="ghost" size="icon-xs" onClick={() => handleDuplicate(role)} title="Duplicar">
                    <Copy className="size-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(role.permissions).map(([perm, enabled]) => (
                  <Badge
                    key={perm}
                    variant="outline"
                    className={`text-[10px] ${enabled ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-400 border-red-200"}`}
                  >
                    {enabled ? <Check className="size-2.5 mr-0.5" /> : <X className="size-2.5 mr-0.5" />}
                    {perm}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Role Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de Rol</DialogTitle>
            <DialogDescription>{selectedRole?.id} — {selectedRole?.name}</DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="size-4 text-sayo-blue" />
                  <span className="text-sm font-medium">{selectedRole.name}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="size-3" />
                  {selectedRole.userCount} usuarios
                </div>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase mb-1">Descripción</p>
                <p className="text-sm">{selectedRole.description}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase mb-2">Permisos ({totalPerms(selectedRole.permissions)}/{totalPermCount(selectedRole.permissions)})</p>
                <div className="space-y-1">
                  {Object.entries(selectedRole.permissions).map(([perm, enabled]) => (
                    <div key={perm} className="flex items-center justify-between py-1.5 border-b last:border-0">
                      <span className="text-xs capitalize">{perm.replace(/_/g, " ")}</span>
                      {enabled ? (
                        <span className="flex items-center gap-1 text-xs text-green-600"><Check className="size-3" /> Habilitado</span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-red-400"><X className="size-3" /> Deshabilitado</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setDetailOpen(false); if (selectedRole) handleEditOpen(selectedRole) }}>
              <Pencil className="size-3.5 mr-1" /> Editar
            </Button>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Rol</DialogTitle>
            <DialogDescription>{selectedRole?.id}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nombre del Rol</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Descripción</label>
              <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Permisos</label>
              <div className="space-y-1 mt-2">
                {Object.entries(editPerms).map(([perm, enabled]) => (
                  <button
                    key={perm}
                    onClick={() => handleTogglePerm(perm)}
                    className="flex items-center justify-between w-full py-2 px-3 rounded-lg border hover:bg-muted/50 transition-colors text-left"
                  >
                    <span className="text-xs capitalize">{perm.replace(/_/g, " ")}</span>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${enabled ? "text-green-600" : "text-red-400"}`}>
                      {enabled ? <Check className="size-3" /> : <X className="size-3" />}
                      {enabled ? "ON" : "OFF"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleSaveEdit}>
              <Check className="size-3.5 mr-1" /> Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Role Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Rol</DialogTitle>
            <DialogDescription>Crear rol con permisos personalizados</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nombre del Rol *</label>
              <Input placeholder="Ej: L2 Analista" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Descripción</label>
              <Input placeholder="Descripción del rol..." value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Permisos</label>
              <div className="space-y-1 mt-2">
                {Object.entries(editPerms).map(([perm, enabled]) => (
                  <button
                    key={perm}
                    onClick={() => handleTogglePerm(perm)}
                    className="flex items-center justify-between w-full py-2 px-3 rounded-lg border hover:bg-muted/50 transition-colors text-left"
                  >
                    <span className="text-xs capitalize">{perm.replace(/_/g, " ")}</span>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${enabled ? "text-green-600" : "text-red-400"}`}>
                      {enabled ? <Check className="size-3" /> : <X className="size-3" />}
                      {enabled ? "ON" : "OFF"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleCreateRole}>
              <Plus className="size-3.5 mr-1" /> Crear Rol
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
