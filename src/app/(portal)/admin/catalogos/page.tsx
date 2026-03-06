"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Database, ChevronRight, Plus } from "lucide-react"

const catalogs = [
  { name: "Bancos", description: "Catálogo de instituciones bancarias", items: 62, lastUpdated: "2024-03-01" },
  { name: "Monedas", description: "Monedas soportadas (MXN, USD, EUR)", items: 3, lastUpdated: "2024-01-15" },
  { name: "Estados", description: "Estados de la República Mexicana", items: 32, lastUpdated: "2023-12-01" },
  { name: "Motivos de Rechazo", description: "Razones de rechazo de operaciones", items: 18, lastUpdated: "2024-02-20" },
  { name: "Tipos de Crédito", description: "Productos de crédito disponibles", items: 6, lastUpdated: "2024-02-15" },
  { name: "Canales de Soporte", description: "Canales de atención al cliente", items: 5, lastUpdated: "2024-01-10" },
  { name: "Categorías PLD", description: "Tipos de alertas de cumplimiento", items: 12, lastUpdated: "2024-03-05" },
  { name: "Roles y Permisos", description: "Perfiles de acceso al sistema", items: 5, lastUpdated: "2024-02-28" },
  { name: "Tarifas", description: "Comisiones y tarifas por producto", items: 15, lastUpdated: "2024-03-01" },
  { name: "Plantillas Email", description: "Templates transaccionales y marketing", items: 24, lastUpdated: "2024-03-06" },
  { name: "Parámetros Sistema", description: "Configuraciones generales del sistema", items: 45, lastUpdated: "2024-02-25" },
  { name: "SLA Soporte", description: "Niveles de servicio por prioridad", items: 4, lastUpdated: "2024-01-20" },
]

export default function CatalogosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Catálogos del Sistema</h1>
          <p className="text-sm text-muted-foreground">Configuración de catálogos — bancos, monedas, estados, tarifas</p>
        </div>
        <Button><Plus className="size-4 mr-1.5" /> Nuevo Catálogo</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {catalogs.map((cat) => (
          <Card key={cat.name} className="cursor-pointer hover:border-primary transition-colors">
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
      </div>
    </div>
  )
}
