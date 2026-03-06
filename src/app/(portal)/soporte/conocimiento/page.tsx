"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, BookOpen, FileText, Eye, Plus } from "lucide-react"

const categories = [
  { name: "Transferencias", articles: 12, icon: "💸" },
  { name: "Cuenta SAYO", articles: 8, icon: "🏦" },
  { name: "Tarjeta", articles: 6, icon: "💳" },
  { name: "Créditos", articles: 10, icon: "📊" },
  { name: "Seguridad", articles: 5, icon: "🔒" },
  { name: "App Móvil", articles: 7, icon: "📱" },
]

const articles = [
  { id: "ART-001", title: "¿Cómo realizar una transferencia SPEI?", category: "Transferencias", views: 2340, helpful: 92, updatedAt: "2024-03-01" },
  { id: "ART-002", title: "Límites de transferencia por tipo de cuenta", category: "Transferencias", views: 1890, helpful: 88, updatedAt: "2024-02-28" },
  { id: "ART-003", title: "¿Qué hacer si mi transferencia no llega?", category: "Transferencias", views: 3450, helpful: 85, updatedAt: "2024-03-05" },
  { id: "ART-004", title: "Cómo activar/desactivar mi tarjeta", category: "Tarjeta", views: 1200, helpful: 95, updatedAt: "2024-02-20" },
  { id: "ART-005", title: "Documentos para apertura de cuenta", category: "Cuenta SAYO", views: 980, helpful: 90, updatedAt: "2024-02-15" },
  { id: "ART-006", title: "Cambiar mi NIP de acceso", category: "Seguridad", views: 2100, helpful: 93, updatedAt: "2024-03-03" },
]

export default function ConocimientoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Base de Conocimiento</h1>
          <p className="text-sm text-muted-foreground">FAQs y artículos de ayuda para agentes y clientes</p>
        </div>
        <Button><Plus className="size-4 mr-1.5" /> Nuevo Artículo</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input placeholder="Buscar artículos..." className="pl-9" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((c) => (
          <Card key={c.name} className="cursor-pointer hover:border-primary transition-colors">
            <CardContent className="p-4 text-center">
              <p className="text-2xl mb-1">{c.icon}</p>
              <p className="text-xs font-semibold">{c.name}</p>
              <p className="text-[10px] text-muted-foreground">{c.articles} artículos</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-3">Artículos Populares</h2>
        <div className="space-y-2">
          {articles.map((a) => (
            <Card key={a.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <FileText className="size-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.category} • {a.views.toLocaleString()} vistas • {a.helpful}% útil • Act: {a.updatedAt}
                  </p>
                </div>
                <Button variant="ghost" size="icon-xs"><Eye className="size-3.5" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
