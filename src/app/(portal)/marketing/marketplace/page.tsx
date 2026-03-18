"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Store, Package, Users, DollarSign, Eye, Star } from "lucide-react"

const fmt = (n: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n)

interface Beneficio {
  id: string; nombre: string; partner: string; categoria: string; descuento: string; redenciones: number; inventario: number; status: "activo" | "agotado" | "pausado"; rating: number
}

const demoBeneficios: Beneficio[] = [
  { id: "MKT-001", nombre: "Contpaqi Nóminas — 30% desc.", partner: "Contpaqi", categoria: "Software", descuento: "30%", redenciones: 145, inventario: 500, status: "activo", rating: 4.5 },
  { id: "MKT-002", nombre: "Amazon Web Services — $5,000 créditos", partner: "AWS", categoria: "Cloud", descuento: "$5,000 MXN", redenciones: 89, inventario: 200, status: "activo", rating: 4.8 },
  { id: "MKT-003", nombre: "Seguro PyME Básico — 20% desc.", partner: "GNP Seguros", categoria: "Seguros", descuento: "20%", redenciones: 210, inventario: 0, status: "agotado", rating: 4.2 },
  { id: "MKT-004", nombre: "Google Workspace — 3 meses gratis", partner: "Google", categoria: "Productividad", descuento: "3 meses", redenciones: 320, inventario: 150, status: "activo", rating: 4.7 },
  { id: "MKT-005", nombre: "Envíos Fedex — 25% desc.", partner: "FedEx", categoria: "Logística", descuento: "25%", redenciones: 180, inventario: 1000, status: "activo", rating: 4.0 },
  { id: "MKT-006", nombre: "Aspel COI — Licencia anual 40% desc.", partner: "Aspel", categoria: "Software", descuento: "40%", redenciones: 65, inventario: 100, status: "pausado", rating: 3.8 },
]

export default function MarketplacePage() {
  const totalRedenciones = demoBeneficios.reduce((s, b) => s + b.redenciones, 0)
  const activos = demoBeneficios.filter((b) => b.status === "activo").length
  const partners = new Set(demoBeneficios.map((b) => b.partner)).size

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Marketplace</h1>
        <p className="text-sm text-muted-foreground">Beneficios, partners e inventario</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><Package className="size-5 mx-auto text-muted-foreground mb-1" /><p className="text-2xl font-bold">{demoBeneficios.length}</p><p className="text-xs text-muted-foreground">Beneficios</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Store className="size-5 mx-auto text-blue-500 mb-1" /><p className="text-2xl font-bold">{partners}</p><p className="text-xs text-muted-foreground">Partners</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Users className="size-5 mx-auto text-sayo-green mb-1" /><p className="text-2xl font-bold text-sayo-green">{totalRedenciones.toLocaleString()}</p><p className="text-xs text-muted-foreground">Redenciones</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Star className="size-5 mx-auto text-sayo-orange mb-1" /><p className="text-2xl font-bold text-sayo-orange">{activos}</p><p className="text-xs text-muted-foreground">Activos</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {demoBeneficios.map((b) => (
          <Card key={b.id} className={b.status === "agotado" ? "opacity-60" : ""}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <Badge variant="outline" className="text-[10px]">{b.categoria}</Badge>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${b.status === "activo" ? "bg-green-100 text-green-700" : b.status === "agotado" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{b.status}</span>
              </div>
              <h3 className="text-sm font-semibold mb-1">{b.nombre}</h3>
              <p className="text-xs text-muted-foreground mb-3">Partner: {b.partner}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{b.redenciones} redenciones</span>
                <span className="text-muted-foreground">Stock: {b.inventario}</span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <Star className="size-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-medium">{b.rating}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
