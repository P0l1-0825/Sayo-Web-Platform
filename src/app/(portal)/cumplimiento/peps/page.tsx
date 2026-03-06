"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ShieldCheck, AlertTriangle, XCircle, User } from "lucide-react"

const searchResults = [
  { name: "Alberto Nájera López", list: "PEPs Nacional", match: 92, riskLevel: "alto", details: "Ex-funcionario público federal. Coincidencia con lista SHCP 2023." },
  { name: "A. Nájera Investments", list: "OFAC SDN", match: 45, riskLevel: "bajo", details: "Coincidencia parcial por nombre. Probablemente falso positivo." },
  { name: "Alejandra Nájera Ruiz", list: "PEPs Estatal", match: 38, riskLevel: "bajo", details: "Coincidencia parcial. Diferente persona." },
]

const lists = [
  { name: "OFAC SDN", count: "12,450", lastUpdate: "2024-03-05", status: "actualizada" },
  { name: "PEPs Nacional (SHCP)", count: "8,200", lastUpdate: "2024-03-01", status: "actualizada" },
  { name: "PEPs Estatal", count: "3,100", lastUpdate: "2024-02-28", status: "actualizada" },
  { name: "Interpol Red Notices", count: "7,890", lastUpdate: "2024-03-04", status: "actualizada" },
  { name: "UE Sanciones", count: "5,600", lastUpdate: "2024-03-03", status: "actualizada" },
  { name: "Listas Internas SAYO", count: "145", lastUpdate: "2024-03-06", status: "actualizada" },
]

export default function PEPsPage() {
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
              <Input placeholder="Buscar persona o empresa..." className="pl-9" defaultValue="Alberto Nájera" />
            </div>
            <Button>Buscar en listas</Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Resultados de Búsqueda</h2>
        <div className="space-y-2">
          {searchResults.map((r, i) => (
            <Card key={i}>
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
                    <div className={`h-full rounded-full ${r.match > 80 ? "bg-sayo-red" : r.match > 50 ? "bg-sayo-orange" : "bg-sayo-green"}`} style={{ width: `${r.match}%` }} />
                  </div>
                  <span className="text-xs font-semibold tabular-nums">{r.match}%</span>
                </div>
                <Button variant="outline" size="sm">Investigar</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Lists */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Listas Disponibles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {lists.map((l) => (
            <Card key={l.name}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">{l.name}</p>
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-green-100 text-green-700">
                    {l.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{l.count} registros</span>
                  <span>Act: {l.lastUpdate}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
