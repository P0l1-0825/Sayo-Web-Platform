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
import { systemParameters } from "@/hooks/use-admin"
import type { ParameterConfig } from "@/lib/types"
import { Settings, Pencil, Shield, CreditCard, Landmark, Bell } from "lucide-react"
import { toast } from "sonner"

const categoryConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  general: { label: "General", color: "bg-gray-100 text-gray-700", icon: <Settings className="h-4 w-4" /> },
  credito: { label: "Crédito", color: "bg-blue-100 text-blue-700", icon: <CreditCard className="h-4 w-4" /> },
  pld: { label: "PLD", color: "bg-red-100 text-red-700", icon: <Shield className="h-4 w-4" /> },
  tesoreria: { label: "Tesorería", color: "bg-purple-100 text-purple-700", icon: <Landmark className="h-4 w-4" /> },
  notificaciones: { label: "Notificaciones", color: "bg-green-100 text-green-700", icon: <Bell className="h-4 w-4" /> },
}

export default function ParametrosPage() {
  const [params, setParams] = React.useState(systemParameters)
  const [editOpen, setEditOpen] = React.useState(false)
  const [editParam, setEditParam] = React.useState<ParameterConfig | null>(null)
  const [editValue, setEditValue] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState<string>("all")

  const filteredParams = activeCategory === "all" ? params : params.filter((p) => p.category === activeCategory)

  const handleEdit = (param: ParameterConfig) => {
    setEditParam(param)
    setEditValue(param.value)
    setEditOpen(true)
  }

  const handleSave = () => {
    if (!editParam) return

    // Validate based on type
    if (editParam.type === "number" && isNaN(Number(editValue))) {
      toast.error("El valor debe ser numerico")
      return
    }
    if (editParam.type === "boolean" && editValue !== "true" && editValue !== "false") {
      toast.error("El valor debe ser true o false")
      return
    }

    setParams((prev) => prev.map((p) => p.id === editParam.id ? {
      ...p,
      value: editValue,
      lastModified: new Date().toISOString().split("T")[0],
      modifiedBy: "Admin Demo",
    } : p))
    setEditOpen(false)
    toast.success("Parametro actualizado", { description: editParam.key })
  }

  const categoryCounts = Object.entries(categoryConfig).map(([key, config]) => ({
    key,
    ...config,
    count: params.filter((p) => p.category === key).length,
  }))

  const columns: ColumnDef<ParameterConfig>[] = [
    {
      accessorKey: "category",
      header: "Categoria",
      cell: ({ row }) => {
        const cat = categoryConfig[row.original.category]
        return (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${cat.color}`}>
            {cat.label}
          </span>
        )
      },
    },
    { accessorKey: "key", header: "Clave", cell: ({ row }) => <span className="font-mono text-xs font-semibold">{row.original.key}</span> },
    { accessorKey: "description", header: "Descripcion", cell: ({ row }) => <span className="text-xs">{row.original.description}</span> },
    {
      accessorKey: "value",
      header: "Valor Actual",
      cell: ({ row }) => {
        const p = row.original
        if (p.type === "boolean") {
          return (
            <Badge className={`text-[10px] ${p.value === "true" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {p.value === "true" ? "Habilitado" : "Deshabilitado"}
            </Badge>
          )
        }
        if (p.type === "number") {
          return <span className="font-mono text-sm font-bold tabular-nums">{Number(p.value).toLocaleString()}</span>
        }
        return <span className="font-mono text-xs">{p.value}</span>
      },
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => <Badge variant="outline" className="text-[10px] font-mono">{row.original.type}</Badge>,
    },
    {
      accessorKey: "lastModified",
      header: "Modificado",
      cell: ({ row }) => (
        <div>
          <p className="text-xs text-muted-foreground">{row.original.lastModified}</p>
          <p className="text-[10px] text-muted-foreground">{row.original.modifiedBy}</p>
        </div>
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
      <div>
        <h1 className="text-xl font-bold">Parametros del Sistema</h1>
        <p className="text-sm text-muted-foreground">Configuración de umbrales, limites y opciones del sistema</p>
      </div>

      {/* Category Filter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <Card
          className={`cursor-pointer transition-all ${activeCategory === "all" ? "ring-2 ring-sayo-cafe bg-sayo-cream" : "hover:shadow-sm"}`}
          onClick={() => setActiveCategory("all")}
        >
          <CardContent className="pt-3 pb-3 text-center">
            <Settings className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs font-semibold">Todos</p>
            <p className="text-lg font-bold tabular-nums">{params.length}</p>
          </CardContent>
        </Card>
        {categoryCounts.map((cat) => (
          <Card
            key={cat.key}
            className={`cursor-pointer transition-all ${activeCategory === cat.key ? "ring-2 ring-sayo-cafe bg-sayo-cream" : "hover:shadow-sm"}`}
            onClick={() => setActiveCategory(cat.key)}
          >
            <CardContent className="pt-3 pb-3 text-center">
              <div className="mx-auto mb-1 flex justify-center">{cat.icon}</div>
              <p className="text-xs font-semibold">{cat.label}</p>
              <p className="text-lg font-bold tabular-nums">{cat.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Parameters Table */}
      <div>
        <h2 className="text-sm font-semibold mb-3">
          {activeCategory === "all" ? "Todos los Parametros" : `Parametros — ${categoryConfig[activeCategory]?.label}`}
        </h2>
        <DataTable
          columns={columns}
          data={filteredParams}
          searchKey="key"
          searchPlaceholder="Buscar parametro..."
          exportFilename="parametros_sistema"
          onRowClick={handleEdit}
        />
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Parametro</DialogTitle>
            <DialogDescription>{editParam?.description}</DialogDescription>
          </DialogHeader>
          {editParam && (
            <div className="space-y-4 py-2">
              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground uppercase">Clave</span>
                  <span className="font-mono text-sm font-semibold">{editParam.key}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground uppercase">Categoria</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${categoryConfig[editParam.category].color}`}>
                    {categoryConfig[editParam.category].label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground uppercase">Tipo</span>
                  <Badge variant="outline" className="text-[10px] font-mono">{editParam.type}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Valor</Label>
                {editParam.type === "boolean" ? (
                  <select
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="true">Habilitado (true)</option>
                    <option value="false">Deshabilitado (false)</option>
                  </select>
                ) : (
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    type={editParam.type === "number" ? "number" : "text"}
                    className="font-mono"
                  />
                )}
                <p className="text-[10px] text-muted-foreground">Último cambio: {editParam.lastModified} por {editParam.modifiedBy}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleSave} className="bg-sayo-cafe hover:bg-sayo-cafe-light">Guardar Cambio</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
