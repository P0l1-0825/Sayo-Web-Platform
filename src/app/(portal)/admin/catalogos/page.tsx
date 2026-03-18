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
import { Database, ChevronRight, Plus, Search, Eye, Pencil, Trash2, Download } from "lucide-react"
import { toast } from "sonner"

interface CatalogItem {
  id: string
  value: string
  description?: string
  active: boolean
}

interface Catalog {
  name: string
  description: string
  items: number
  lastUpdated: string
  data: CatalogItem[]
}

const initialCatalogs: Catalog[] = [
  { name: "Bancos", description: "Catálogo de instituciones bancarias", items: 62, lastUpdated: "2024-03-01", data: [
    { id: "BNK-001", value: "BBVA México", active: true },
    { id: "BNK-002", value: "Banorte", active: true },
    { id: "BNK-003", value: "Santander", active: true },
    { id: "BNK-004", value: "HSBC", active: true },
    { id: "BNK-005", value: "Citibanamex", active: true },
  ]},
  { name: "Monedas", description: "Monedas soportadas (MXN, USD, EUR)", items: 3, lastUpdated: "2024-01-15", data: [
    { id: "CUR-001", value: "MXN", description: "Peso Mexicano", active: true },
    { id: "CUR-002", value: "USD", description: "Dólar Estadounidense", active: true },
    { id: "CUR-003", value: "EUR", description: "Euro", active: true },
  ]},
  { name: "Estados", description: "Estados de la República Mexicana", items: 32, lastUpdated: "2023-12-01", data: [
    { id: "EDO-001", value: "Ciudad de México", active: true },
    { id: "EDO-002", value: "Jalisco", active: true },
    { id: "EDO-003", value: "Nuevo León", active: true },
    { id: "EDO-004", value: "Estado de México", active: true },
    { id: "EDO-005", value: "Puebla", active: true },
  ]},
  { name: "Motivos de Rechazo", description: "Razones de rechazo de operaciones", items: 18, lastUpdated: "2024-02-20", data: [
    { id: "REJ-001", value: "Fondos insuficientes", active: true },
    { id: "REJ-002", value: "CLABE inválida", active: true },
    { id: "REJ-003", value: "Cuenta bloqueada", active: true },
    { id: "REJ-004", value: "Límite excedido", active: true },
  ]},
  { name: "Tipos de Crédito", description: "Productos de crédito disponibles", items: 6, lastUpdated: "2024-02-15", data: [
    { id: "CRD-001", value: "Crédito Personal", description: "Hasta $500,000 MXN", active: true },
    { id: "CRD-002", value: "Crédito de Nómina", description: "Hasta $300,000 MXN", active: true },
    { id: "CRD-003", value: "Crédito Empresarial", description: "Hasta $5,000,000 MXN", active: true },
  ]},
  { name: "Canales de Soporte", description: "Canales de atención al cliente", items: 5, lastUpdated: "2024-01-10", data: [
    { id: "CAN-001", value: "Chat In-App", active: true },
    { id: "CAN-002", value: "Teléfono", active: true },
    { id: "CAN-003", value: "Email", active: true },
    { id: "CAN-004", value: "Redes Sociales", active: true },
    { id: "CAN-005", value: "Sucursal", active: false },
  ]},
  { name: "Categorías PLD", description: "Tipos de alertas de cumplimiento", items: 12, lastUpdated: "2024-03-05", data: [
    { id: "PLD-001", value: "Operación Inusual", active: true },
    { id: "PLD-002", value: "Operación Relevante", active: true },
    { id: "PLD-003", value: "Operación Preocupante", active: true },
  ]},
  { name: "Tarifas", description: "Comisiones y tarifas por producto", items: 15, lastUpdated: "2024-03-01", data: [
    { id: "TAR-001", value: "Transferencia SPEI", description: "$5.00 MXN", active: true },
    { id: "TAR-002", value: "Consulta saldo", description: "Gratis", active: true },
    { id: "TAR-003", value: "Estado de cuenta", description: "Gratis (digital)", active: true },
  ]},
]

export default function CatalogosPage() {
  const [catalogs, setCatalogs] = React.useState<Catalog[]>(initialCatalogs)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedCatalog, setSelectedCatalog] = React.useState<Catalog | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [addItemOpen, setAddItemOpen] = React.useState(false)
  const [newItemValue, setNewItemValue] = React.useState("")
  const [newItemDesc, setNewItemDesc] = React.useState("")
  const [newCatalogOpen, setNewCatalogOpen] = React.useState(false)
  const [newCatalogName, setNewCatalogName] = React.useState("")
  const [newCatalogDesc, setNewCatalogDesc] = React.useState("")

  const filteredCatalogs = catalogs.filter((c) =>
    searchTerm === "" ||
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleViewCatalog = (catalog: Catalog) => {
    setSelectedCatalog(catalog)
    setDetailOpen(true)
  }

  const handleToggleItem = (catalogName: string, itemId: string) => {
    setCatalogs((prev) => prev.map((c) => {
      if (c.name !== catalogName) return c
      return { ...c, data: c.data.map((item) => (item.id === itemId ? { ...item, active: !item.active } : item)) }
    }))
    if (selectedCatalog?.name === catalogName) {
      setSelectedCatalog((prev) => prev ? { ...prev, data: prev.data.map((item) => (item.id === itemId ? { ...item, active: !item.active } : item)) } : null)
    }
    toast.success("Item actualizado")
  }

  const handleAddItem = () => {
    if (!selectedCatalog || !newItemValue) {
      toast.error("Ingresa el valor del item")
      return
    }
    const newItem: CatalogItem = {
      id: `${selectedCatalog.name.slice(0, 3).toUpperCase()}-${String(selectedCatalog.data.length + 1).padStart(3, "0")}`,
      value: newItemValue,
      description: newItemDesc || undefined,
      active: true,
    }
    setCatalogs((prev) => prev.map((c) => {
      if (c.name !== selectedCatalog.name) return c
      return { ...c, items: c.items + 1, data: [...c.data, newItem], lastUpdated: new Date().toISOString().slice(0, 10) }
    }))
    setSelectedCatalog((prev) => prev ? { ...prev, items: prev.items + 1, data: [...prev.data, newItem] } : null)
    setAddItemOpen(false)
    setNewItemValue("")
    setNewItemDesc("")
    toast.success("Item agregado", { description: `${newItem.id} — ${newItem.value}` })
  }

  const handleNewCatalog = () => {
    if (!newCatalogName) {
      toast.error("Ingresa el nombre del catálogo")
      return
    }
    const newCat: Catalog = {
      name: newCatalogName,
      description: newCatalogDesc || "Nuevo catálogo",
      items: 0,
      lastUpdated: new Date().toISOString().slice(0, 10),
      data: [],
    }
    setCatalogs([...catalogs, newCat])
    setNewCatalogOpen(false)
    setNewCatalogName("")
    setNewCatalogDesc("")
    toast.success("Catálogo creado", { description: newCat.name })
  }

  const handleExportCatalog = (catalog: Catalog) => {
    const headers = ["ID", "Valor", "Descripción", "Activo"]
    const rows = catalog.data.map((i) => [i.id, i.value, i.description || "", i.active ? "Sí" : "No"])
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `catalogo_${catalog.name.toLowerCase().replace(/\s/g, "_")}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Catálogo exportado", { description: `${catalog.name}.csv` })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Catálogos del Sistema</h1>
          <p className="text-sm text-muted-foreground">Configuración de catálogos — bancos, monedas, estados, tarifas</p>
        </div>
        <Button onClick={() => setNewCatalogOpen(true)}>
          <Plus className="size-4 mr-1.5" /> Nuevo Catálogo
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar catálogos..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Database className="size-5 mx-auto text-sayo-blue mb-1" />
            <p className="text-2xl font-bold">{catalogs.length}</p>
            <p className="text-xs text-muted-foreground">Catálogos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{catalogs.reduce((s, c) => s + c.items, 0)}</p>
            <p className="text-xs text-muted-foreground">Items Totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{catalogs.reduce((s, c) => s + c.data.filter((i) => i.active).length, 0)}</p>
            <p className="text-xs text-muted-foreground">Items Activos</p>
          </CardContent>
        </Card>
      </div>

      {/* Catalogs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCatalogs.map((cat) => (
          <Card key={cat.name} className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleViewCatalog(cat)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Database className="size-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <h3 className="text-sm font-semibold">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{cat.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{cat.items} items</Badge>
                      <span className="text-[10px] text-muted-foreground">Act: {cat.lastUpdated}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredCatalogs.length === 0 && (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            <Database className="size-8 mx-auto mb-2" />
            <p className="text-sm">No se encontraron catálogos</p>
          </div>
        )}
      </div>

      {/* Catalog Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedCatalog?.name}</DialogTitle>
            <DialogDescription>{selectedCatalog?.description} — {selectedCatalog?.items} items</DialogDescription>
          </DialogHeader>
          {selectedCatalog && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">Última act: {selectedCatalog.lastUpdated}</Badge>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => handleExportCatalog(selectedCatalog)}>
                    <Download className="size-3 mr-1" /> CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setAddItemOpen(true)}>
                    <Plus className="size-3 mr-1" /> Agregar
                  </Button>
                </div>
              </div>
              <div className="space-y-1 max-h-[40vh] overflow-y-auto">
                {selectedCatalog.data.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-muted-foreground">{item.id}</span>
                      <div>
                        <p className="text-xs font-medium">{item.value}</p>
                        {item.description && <p className="text-[10px] text-muted-foreground">{item.description}</p>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleItem(selectedCatalog.name, item.id)}
                      className={`px-2 py-0.5 text-[10px] rounded-full transition-colors ${
                        item.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.active ? "Activo" : "Inactivo"}
                    </button>
                  </div>
                ))}
                {selectedCatalog.data.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">Sin items — Agrega el primero</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Agregar Item</DialogTitle>
            <DialogDescription>Nuevo item en {selectedCatalog?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Valor *</label>
              <Input placeholder="Ej: Nuevo banco" value={newItemValue} onChange={(e) => setNewItemValue(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Descripción</label>
              <Input placeholder="Opcional" value={newItemDesc} onChange={(e) => setNewItemDesc(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleAddItem}>
              <Plus className="size-3.5 mr-1" /> Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Catalog Dialog */}
      <Dialog open={newCatalogOpen} onOpenChange={setNewCatalogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nuevo Catálogo</DialogTitle>
            <DialogDescription>Crear catálogo del sistema</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nombre *</label>
              <Input placeholder="Ej: Tipos de Documento" value={newCatalogName} onChange={(e) => setNewCatalogName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Descripción</label>
              <Input placeholder="Descripción del catálogo" value={newCatalogDesc} onChange={(e) => setNewCatalogDesc(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleNewCatalog}>
              <Plus className="size-3.5 mr-1" /> Crear Catálogo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
