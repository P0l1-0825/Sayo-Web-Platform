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
import { sanctionListEntries } from "@/hooks/use-compliance"
import type { SanctionListEntry } from "@/lib/types"
import { Upload, Search, ShieldCheck, ShieldAlert, CheckCircle, Clock, XCircle, Eye, ListChecks } from "lucide-react"
import { toast } from "sonner"

const listInfo = [
  { id: "OFAC_SDN", name: "OFAC / SDN", records: 12450, lastUpdate: "2025-03-01", color: "bg-red-50 border-red-200 text-red-700" },
  { id: "UE", name: "Union Europea", records: 8320, lastUpdate: "2025-02-28", color: "bg-blue-50 border-blue-200 text-blue-700" },
  { id: "ONU", name: "ONU", records: 6180, lastUpdate: "2025-02-15", color: "bg-purple-50 border-purple-200 text-purple-700" },
  { id: "PEP_NAC", name: "PEPs Nacionales", records: 3240, lastUpdate: "2025-03-05", color: "bg-orange-50 border-orange-200 text-orange-700" },
  { id: "INTERPOL", name: "INTERPOL", records: 4890, lastUpdate: "2025-01-20", color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
]

const statusColor = (status: string) => {
  switch (status) {
    case "confirmado": return "bg-red-100 text-red-700"
    case "pendiente": return "bg-yellow-100 text-yellow-700"
    case "descartado": return "bg-green-100 text-green-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

export default function ListasPage() {
  const [searchName, setSearchName] = React.useState("")
  const [searchResults, setSearchResults] = React.useState<SanctionListEntry[]>([])
  const [hasSearched, setHasSearched] = React.useState(false)
  const [selectedEntry, setSelectedEntry] = React.useState<SanctionListEntry | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [uploadOpen, setUploadOpen] = React.useState(false)
  const [selectedList, setSelectedList] = React.useState("")

  const handleSearch = () => {
    if (!searchName.trim()) {
      toast.error("Ingresa un nombre para buscar")
      return
    }
    const results = sanctionListEntries.filter((e) => e.name.toLowerCase().includes(searchName.toLowerCase()) || e.matchedWith.toLowerCase().includes(searchName.toLowerCase()))
    setSearchResults(results)
    setHasSearched(true)
    if (results.length > 0) {
      toast.warning(`${results.length} coincidencias encontradas`, { description: "Revisa los resultados cuidadosamente" })
    } else {
      toast.success("Sin coincidencias", { description: "No se encontraron resultados en las listas de sanciones" })
    }
  }

  const handleView = (entry: SanctionListEntry) => {
    setSelectedEntry(entry)
    setDetailOpen(true)
  }

  const handleUpload = () => {
    toast.success(`Lista ${selectedList} actualizada`, { description: "Registros importados exitosamente" })
    setUploadOpen(false)
    setSelectedList("")
  }

  const columns: ColumnDef<SanctionListEntry>[] = [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
    {
      accessorKey: "listType",
      header: "Lista",
      cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.original.listType.replace("_", " ")}</Badge>,
    },
    { accessorKey: "name", header: "Nombre Buscado" },
    { accessorKey: "matchedWith", header: "Coincide Con" },
    {
      accessorKey: "matchPercentage",
      header: "Match %",
      cell: ({ row }) => {
        const pct = row.original.matchPercentage
        return (
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-10 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full ${pct >= 80 ? "bg-red-500" : pct >= 60 ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${pct}%` }} />
            </div>
            <span className={`text-xs font-semibold ${pct >= 80 ? "text-red-600" : pct >= 60 ? "text-yellow-600" : "text-green-600"}`}>{pct}%</span>
          </div>
        )
      },
    },
    { accessorKey: "country", header: "Pais" },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor(row.original.status)}`}>
          {row.original.status === "confirmado" && <XCircle className="size-3" />}
          {row.original.status === "pendiente" && <Clock className="size-3" />}
          {row.original.status === "descartado" && <CheckCircle className="size-3" />}
          {row.original.status}
        </span>
      ),
    },
    { accessorKey: "date", header: "Fecha", cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.date}</span> },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleView(row.original) }}>
          <Eye className="size-3.5" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Listas de Sanciones</h1>
          <p className="text-sm text-muted-foreground">Importación y consulta OFAC/SDN, UE, ONU, PEPs, INTERPOL</p>
        </div>
        <Button onClick={() => setUploadOpen(true)} className="bg-accent-green hover:bg-accent-green/90 text-white">
          <Upload className="mr-2 h-4 w-4" />
          Actualizar Listas
        </Button>
      </div>

      {/* Lists Status */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {listInfo.map((list) => (
          <Card key={list.id} className={list.color}>
            <CardContent className="pt-3 pb-3">
              <p className="text-sm font-semibold">{list.name}</p>
              <p className="text-lg font-bold tabular-nums">{list.records.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">Actualizado: {list.lastUpdate}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Manual Search */}
      <Card>
        <CardContent className="pt-4 pb-4 space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Busqueda Manual contra Listas</span>
          </div>
          <div className="flex gap-3">
            <Input value={searchName} onChange={(e) => setSearchName(e.target.value)} placeholder="Nombre o razon social a buscar..." className="max-w-md" onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
            <Button onClick={handleSearch} className="bg-sayo-cafe hover:bg-sayo-cafe-light">
              <Search className="mr-2 h-4 w-4" /> Buscar
            </Button>
          </div>
          {hasSearched && searchResults.length === 0 && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-700 font-medium">Sin coincidencias encontradas en ninguna lista</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results or All Entries */}
      <div>
        <h2 className="text-sm font-semibold mb-3">{hasSearched && searchResults.length > 0 ? `Resultados de Busqueda (${searchResults.length})` : "Coincidencias Registradas"}</h2>
        <DataTable
          columns={columns}
          data={hasSearched && searchResults.length > 0 ? searchResults : sanctionListEntries}
          searchKey="name"
          searchPlaceholder="Filtrar por nombre..."
          exportFilename="listas_sanciones"
          onRowClick={handleView}
        />
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Actualizar Lista de Sanciones</DialogTitle>
            <DialogDescription>Selecciona la lista e importa el archivo actualizado</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">Tipo de Lista</Label>
              <div className="grid grid-cols-2 gap-2">
                {listInfo.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => setSelectedList(list.id)}
                    className={`p-3 rounded-lg border text-left transition-colors ${selectedList === list.id ? "bg-sayo-cream border-sayo-cafe" : "hover:bg-muted/50"}`}
                  >
                    <p className="text-xs font-semibold">{list.name}</p>
                    <p className="text-[10px] text-muted-foreground">{list.records.toLocaleString()} registros</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Arrastra el archivo actualizado</p>
              <p className="text-xs text-muted-foreground mt-1">CSV, XML, JSON — Max 50MB</p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleUpload} className="bg-sayo-cafe hover:bg-sayo-cafe-light" disabled={!selectedList}>Importar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de Coincidencia</DialogTitle>
            <DialogDescription>{selectedEntry?.id}</DialogDescription>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <Badge variant="outline">{selectedEntry.listType.replace("_", " ")}</Badge>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(selectedEntry.status)}`}>
                  {selectedEntry.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Nombre Buscado</p>
                  <p className="font-medium">{selectedEntry.name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Coincide Con</p>
                  <p className="font-medium">{selectedEntry.matchedWith}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Match</p>
                  <p className={`text-lg font-bold ${selectedEntry.matchPercentage >= 80 ? "text-red-600" : "text-yellow-600"}`}>{selectedEntry.matchPercentage}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Pais</p>
                  <p>{selectedEntry.country}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fecha Deteccion</p>
                  <p>{selectedEntry.date}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
