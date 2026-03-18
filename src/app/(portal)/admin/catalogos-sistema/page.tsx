"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { expandedCatalogs } from "@/hooks/use-admin"
import type { CatalogItem } from "@/lib/types"
import { Database, Plus, Pencil, CheckCircle, XCircle, ToggleRight, ToggleLeft } from "lucide-react"
import { toast } from "sonner"

const catalogTabs = [
  { id: "bancos", label: "Bancos", icon: "🏦" },
  { id: "monedas", label: "Monedas", icon: "💱" },
  { id: "estados", label: "Estados", icon: "📍" },
  { id: "productos", label: "Productos", icon: "📦" },
  { id: "motivosRechazo", label: "Motivos Rechazo", icon: "🚫" },
]

export default function CatalogosSistemaPage() {
  const [activeCatalog, setActiveCatalog] = React.useState("bancos")
  const [catalogs, setCatalogs] = React.useState(expandedCatalogs)
  const [editOpen, setEditOpen] = React.useState(false)
  const [addOpen, setAddOpen] = React.useState(false)
  const [editItem, setEditItem] = React.useState<CatalogItem | null>(null)
  const [newKey, setNewKey] = React.useState("")
  const [newName, setNewName] = React.useState("")
  const [newDesc, setNewDesc] = React.useState("")

  const currentItems = catalogs[activeCatalog] || []

  const handleToggleActive = (item: CatalogItem) => {
    setCatalogs((prev) => ({
      ...prev,
      [activeCatalog]: prev[activeCatalog].map((i) => i.id === item.id ? { ...i, active: !i.active } : i),
    }))
    toast.info(`${item.name} ${item.active ? "desactivado" : "activado"}`)
  }

  const handleEdit = (item: CatalogItem) => {
    setEditItem(item)
    setNewKey(item.key)
    setNewName(item.name)
    setNewDesc(item.description || "")
    setEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editItem) return
    setCatalogs((prev) => ({
      ...prev,
      [activeCatalog]: prev[activeCatalog].map((i) => i.id === editItem.id ? { ...i, key: newKey, name: newName, description: newDesc } : i),
    }))
    setEditOpen(false)
    toast.success("Registro actualizado")
  }

  const handleAdd = () => {
    const newItem: CatalogItem = {
      id: `NEW-${Date.now()}`,
      catalogType: activeCatalog,
      key: newKey,
      name: newName,
      description: newDesc || undefined,
      active: true,
      order: currentItems.length + 1,
    }
    setCatalogs((prev) => ({
      ...prev,
      [activeCatalog]: [...prev[activeCatalog], newItem],
    }))
    setAddOpen(false)
    setNewKey("")
    setNewName("")
    setNewDesc("")
    toast.success("Registro agregado", { description: newName })
  }

  const columns: ColumnDef<CatalogItem>[] = [
    { accessorKey: "order", header: "#", cell: ({ row }) => <span className="text-muted-foreground text-xs tabular-nums">{row.original.order}</span> },
    { accessorKey: "key", header: "Clave", cell: ({ row }) => <span className="font-mono text-xs font-semibold">{row.original.key}</span> },
    { accessorKey: "name", header: "Nombre" },
    { accessorKey: "description", header: "Descripcion", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.description || "—"}</span> },
    {
      accessorKey: "active",
      header: "Estado",
      cell: ({ row }) => (
        <button onClick={(e) => { e.stopPropagation(); handleToggleActive(row.original) }} className="flex items-center gap-1">
          {row.original.active ? (
            <ToggleRight className="size-5 text-green-600" />
          ) : (
            <ToggleLeft className="size-5 text-gray-400" />
          )}
          <span className={`text-[10px] font-medium ${row.original.active ? "text-green-600" : "text-gray-400"}`}>
            {row.original.active ? "Activo" : "Inactivo"}
          </span>
        </button>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleEdit(row.original) }}>
          <Pencil className="size-3.5" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Catalogos del Sistema</h1>
          <p className="text-sm text-muted-foreground">Configuración de catalogos operativos — CRUD completo</p>
        </div>
        <Button onClick={() => { setNewKey(""); setNewName(""); setNewDesc(""); setAddOpen(true) }} className="bg-accent-green hover:bg-accent-green/90 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Agregar Registro
        </Button>
      </div>

      {/* Catalog Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {catalogTabs.map((tab) => {
          const items = catalogs[tab.id] || []
          const activeCount = items.filter((i) => i.active).length
          return (
            <Card
              key={tab.id}
              className={`cursor-pointer transition-all ${activeCatalog === tab.id ? "ring-2 ring-sayo-cafe bg-sayo-cream" : "hover:shadow-sm"}`}
              onClick={() => setActiveCatalog(tab.id)}
            >
              <CardContent className="pt-3 pb-3 text-center">
                <p className="text-lg mb-0.5">{tab.icon}</p>
                <p className="text-xs font-semibold">{tab.label}</p>
                <p className="text-lg font-bold tabular-nums">{items.length}</p>
                <p className="text-[10px] text-muted-foreground">{activeCount} activos</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Current Catalog Table */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Database className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Catalogo: {catalogTabs.find((t) => t.id === activeCatalog)?.label}</h2>
          <Badge variant="outline" className="text-[10px]">{currentItems.length} registros</Badge>
        </div>
        <DataTable
          columns={columns}
          data={currentItems}
          searchKey="name"
          searchPlaceholder="Buscar en catalogo..."
          exportFilename={`catalogo_${activeCatalog}`}
        />
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Registro</DialogTitle>
            <DialogDescription>{editItem?.id}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Clave</Label>
              <Input value={newKey} onChange={(e) => setNewKey(e.target.value)} className="font-mono" />
            </div>
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Descripcion (opcional)</Label>
              <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleSaveEdit} className="bg-sayo-cafe hover:bg-sayo-cafe-light" disabled={!newKey || !newName}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Registro</DialogTitle>
            <DialogDescription>Nuevo registro en {catalogTabs.find((t) => t.id === activeCatalog)?.label}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Clave</Label>
              <Input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="Ej: 002, MXN, AGS" className="font-mono" />
            </div>
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre del registro" />
            </div>
            <div className="space-y-2">
              <Label>Descripcion (opcional)</Label>
              <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Descripcion breve" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleAdd} className="bg-accent-green hover:bg-accent-green/90 text-white" disabled={!newKey || !newName}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
