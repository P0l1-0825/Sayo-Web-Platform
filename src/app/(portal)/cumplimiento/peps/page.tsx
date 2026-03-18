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
import { Search, ShieldCheck, AlertTriangle, User, Loader2, FileSearch, Clock } from "lucide-react"
import { toast } from "sonner"

interface SearchResult {
  name: string
  list: string
  match: number
  riskLevel: string
  details: string
}

const allResults: SearchResult[] = [
  { name: "Alberto Nájera López", list: "PEPs Nacional", match: 92, riskLevel: "alto", details: "Ex-funcionario público federal. Coincidencia con lista SHCP 2023." },
  { name: "A. Nájera Investments", list: "OFAC SDN", match: 45, riskLevel: "bajo", details: "Coincidencia parcial por nombre. Probablemente falso positivo." },
  { name: "Alejandra Nájera Ruiz", list: "PEPs Estatal", match: 38, riskLevel: "bajo", details: "Coincidencia parcial. Diferente persona." },
  { name: "Carlos Rodríguez Sánchez", list: "Interpol Red Notice", match: 87, riskLevel: "alto", details: "Coincidencia por nombre completo. Verificar RFC y CURP." },
  { name: "C. Rodríguez & Asociados", list: "Listas Internas SAYO", match: 72, riskLevel: "medio", details: "Empresa con alerta previa. Requiere revisión de documentación." },
  { name: "María del Carmen Torres", list: "PEPs Nacional", match: 55, riskLevel: "medio", details: "Funcionaria estatal activa. Nivel de riesgo medio." },
]

interface ListInfo {
  name: string
  count: string
  lastUpdate: string
  status: string
}

const lists: ListInfo[] = [
  { name: "OFAC SDN", count: "12,450", lastUpdate: "2024-03-05", status: "actualizada" },
  { name: "PEPs Nacional (SHCP)", count: "8,200", lastUpdate: "2024-03-01", status: "actualizada" },
  { name: "PEPs Estatal", count: "3,100", lastUpdate: "2024-02-28", status: "actualizada" },
  { name: "Interpol Red Notices", count: "7,890", lastUpdate: "2024-03-04", status: "actualizada" },
  { name: "UE Sanciones", count: "5,600", lastUpdate: "2024-03-03", status: "actualizada" },
  { name: "Listas Internas SAYO", count: "145", lastUpdate: "2024-03-06", status: "actualizada" },
]

export default function PEPsPage() {
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [searching, setSearching] = React.useState(false)
  const [hasSearched, setHasSearched] = React.useState(false)
  const [selectedResult, setSelectedResult] = React.useState<SearchResult | null>(null)
  const [investigateOpen, setInvestigateOpen] = React.useState(false)

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("Ingresa un nombre o empresa para buscar")
      return
    }
    setSearching(true)
    setHasSearched(true)
    toast.loading("Buscando en listas restrictivas...", { id: "pep-search" })

    await new Promise((r) => setTimeout(r, 1500))

    // Simulate search — filter from allResults based on query
    const queryLower = query.toLowerCase()
    const filtered = allResults.filter(
      (r) =>
        r.name.toLowerCase().includes(queryLower) ||
        r.list.toLowerCase().includes(queryLower)
    )
    // If no exact match, return first 2 as "similar"
    const finalResults = filtered.length > 0 ? filtered : allResults.slice(0, 2)
    setResults(finalResults)
    setSearching(false)

    const highRisk = finalResults.filter((r) => r.match > 80).length
    toast.success(`Búsqueda completada`, {
      id: "pep-search",
      description: `${finalResults.length} coincidencias encontradas${highRisk > 0 ? ` — ${highRisk} alto riesgo` : ""}`,
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch()
  }

  const handleInvestigar = (result: SearchResult) => {
    setSelectedResult(result)
    setInvestigateOpen(true)
  }

  const confirmInvestigar = () => {
    if (!selectedResult) return
    setInvestigateOpen(false)
    toast.success("Investigación iniciada", {
      description: `Se creó caso de investigación para ${selectedResult.name}`,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">PEPs / Listas Restrictivas</h1>
        <p className="text-sm text-muted-foreground">Búsqueda contra OFAC, PEPs, Interpol y listas internas</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar persona o empresa..."
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <FileSearch className="size-4 mr-1.5" />}
              {searching ? "Buscando..." : "Buscar en listas"}
            </Button>
          </div>
          <div className="flex gap-2 mt-2">
            <p className="text-[10px] text-muted-foreground">Búsquedas rápidas:</p>
            {["Nájera", "Rodríguez", "Torres"].map((q) => (
              <button
                key={q}
                onClick={() => { setQuery(q); }}
                className="text-[10px] text-sayo-cafe hover:underline"
              >
                {q}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {hasSearched && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Resultados de Búsqueda</h2>
            <Badge variant="outline">{results.length} coincidencias</Badge>
          </div>
          {results.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ShieldCheck className="size-8 text-sayo-green mx-auto mb-2" />
                <p className="text-sm font-medium">Sin coincidencias</p>
                <p className="text-xs text-muted-foreground">No se encontraron resultados en ninguna lista para &quot;{query}&quot;</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {results.map((r, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                      {r.match > 80 ? (
                        <AlertTriangle className="size-4 text-sayo-red" />
                      ) : r.match > 50 ? (
                        <AlertTriangle className="size-4 text-sayo-orange" />
                      ) : (
                        <ShieldCheck className="size-4 text-sayo-green" />
                      )}
                      <User className="size-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.details}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{r.list}</Badge>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${r.match > 80 ? "bg-sayo-red" : r.match > 50 ? "bg-sayo-orange" : "bg-sayo-green"}`}
                          style={{ width: `${r.match}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold tabular-nums">{r.match}%</span>
                    </div>
                    <Badge
                      className={`text-[10px] ${
                        r.riskLevel === "alto" ? "bg-red-100 text-red-700" :
                        r.riskLevel === "medio" ? "bg-yellow-100 text-yellow-700" :
                        "bg-green-100 text-green-700"
                      }`}
                    >
                      {r.riskLevel}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => handleInvestigar(r)}>
                      Investigar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lists */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Listas Disponibles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {lists.map((l) => (
            <Card key={l.name}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">{l.name}</p>
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-green-100 text-green-700">
                    <ShieldCheck className="size-3" />
                    {l.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{l.count} registros</span>
                  <span className="flex items-center gap-1"><Clock className="size-3" /> {l.lastUpdate}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Investigate Confirmation Dialog */}
      <Dialog open={investigateOpen} onOpenChange={setInvestigateOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Iniciar Investigación</DialogTitle>
            <DialogDescription>
              ¿Crear un caso de investigación para esta coincidencia?
            </DialogDescription>
          </DialogHeader>
          {selectedResult && (
            <div className="p-3 rounded-lg bg-muted/50 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nombre:</span>
                <span className="font-medium">{selectedResult.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lista:</span>
                <span>{selectedResult.list}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coincidencia:</span>
                <span className={`font-semibold ${selectedResult.match > 80 ? "text-sayo-red" : selectedResult.match > 50 ? "text-sayo-orange" : "text-sayo-green"}`}>
                  {selectedResult.match}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Riesgo:</span>
                <span className="font-medium">{selectedResult.riskLevel}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={confirmInvestigar}>
              <FileSearch className="size-3.5 mr-1" /> Crear Investigación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
