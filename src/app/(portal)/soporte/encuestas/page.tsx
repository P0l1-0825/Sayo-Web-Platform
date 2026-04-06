"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SmilePlus, BarChart3, Star, ThumbsUp, ThumbsDown } from "lucide-react"
import { api, isDemoMode } from "@/lib/api-client"

interface Encuesta {
  id: string; tipo: "CSAT" | "NPS"; cliente: string; puntuacion: number; comentario: string; fecha: string; canal: string; sentimiento: "positivo" | "neutral" | "negativo"
}

const demoEncuestas: Encuesta[] = [
  { id: "ENC-001", tipo: "CSAT", cliente: "María García", puntuacion: 5, comentario: "Excelente atención, resolvieron mi problema rápidamente", fecha: "2026-03-17", canal: "Chat", sentimiento: "positivo" },
  { id: "ENC-002", tipo: "NPS", cliente: "Roberto Sánchez", puntuacion: 9, comentario: "Muy buen servicio, lo recomendaría a otros empresarios", fecha: "2026-03-16", canal: "Email", sentimiento: "positivo" },
  { id: "ENC-003", tipo: "CSAT", cliente: "Luis Torres", puntuacion: 3, comentario: "Tardaron mucho en responder, esperé más de 20 minutos", fecha: "2026-03-15", canal: "Teléfono", sentimiento: "negativo" },
  { id: "ENC-004", tipo: "NPS", cliente: "Patricia Ruiz", puntuacion: 7, comentario: "Servicio aceptable, pero podrían mejorar los tiempos", fecha: "2026-03-14", canal: "Chat", sentimiento: "neutral" },
  { id: "ENC-005", tipo: "CSAT", cliente: "Fernando Vega", puntuacion: 4, comentario: "Buen trato pero no resolvieron todo en la primera llamada", fecha: "2026-03-13", canal: "Teléfono", sentimiento: "neutral" },
  { id: "ENC-006", tipo: "NPS", cliente: "Ana Martínez", puntuacion: 10, comentario: "Increíble plataforma, mejor que cualquier banco tradicional", fecha: "2026-03-12", canal: "Email", sentimiento: "positivo" },
  { id: "ENC-007", tipo: "CSAT", cliente: "Carlos Herrera", puntuacion: 2, comentario: "No pudieron resolver mi problema, tuve que llamar 3 veces", fecha: "2026-03-11", canal: "Teléfono", sentimiento: "negativo" },
  { id: "ENC-008", tipo: "NPS", cliente: "Diana Flores", puntuacion: 8, comentario: "Muy buena experiencia en general", fecha: "2026-03-10", canal: "Chat", sentimiento: "positivo" },
]

function EncuestaSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border animate-pulse">
      <div className="size-8 rounded-full bg-muted shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-3 w-24 bg-muted rounded" />
          <div className="h-3 w-12 bg-muted rounded" />
          <div className="h-3 w-12 bg-muted rounded" />
        </div>
        <div className="h-3 w-3/4 bg-muted rounded" />
      </div>
    </div>
  )
}

export default function EncuestasPage() {
  const [encuestas, setEncuestas] = React.useState<Encuesta[]>(demoEncuestas)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      if (isDemoMode) { setLoading(false); return }
      try {
        const result = await api.get<Encuesta[]>("/api/v1/support/surveys")
        if (Array.isArray(result)) setEncuestas(result)
      } catch { /* keep demo data */ }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const csatScores = encuestas.filter((e) => e.tipo === "CSAT").map((e) => e.puntuacion)
  const npsScores = encuestas.filter((e) => e.tipo === "NPS").map((e) => e.puntuacion)
  const avgCsat = csatScores.length > 0
    ? (csatScores.reduce((a, b) => a + b, 0) / csatScores.length).toFixed(1)
    : "0.0"
  const promoters = npsScores.filter((s) => s >= 9).length
  const detractors = npsScores.filter((s) => s <= 6).length
  const nps = npsScores.length > 0
    ? Math.round(((promoters - detractors) / npsScores.length) * 100)
    : 0
  const positivos = encuestas.filter((e) => e.sentimiento === "positivo").length
  const negativos = encuestas.filter((e) => e.sentimiento === "negativo").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Encuestas de Satisfacción</h1>
        <p className="text-sm text-muted-foreground">CSAT, NPS, sentimiento y tendencias</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><Star className="size-5 mx-auto text-sayo-orange mb-1" /><p className="text-2xl font-bold text-sayo-orange">{avgCsat}/5</p><p className="text-xs text-muted-foreground">CSAT Promedio</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><BarChart3 className="size-5 mx-auto text-blue-500 mb-1" /><p className="text-2xl font-bold text-blue-500">{nps > 0 ? "+" : ""}{nps}</p><p className="text-xs text-muted-foreground">NPS Score</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><ThumbsUp className="size-5 mx-auto text-sayo-green mb-1" /><p className="text-2xl font-bold text-sayo-green">{positivos}</p><p className="text-xs text-muted-foreground">Sentimiento Positivo</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><ThumbsDown className="size-5 mx-auto text-sayo-red mb-1" /><p className="text-2xl font-bold text-sayo-red">{negativos}</p><p className="text-xs text-muted-foreground">Sentimiento Negativo</p></CardContent></Card>
      </div>

      <Card><CardContent className="p-4">
        <h2 className="text-sm font-semibold mb-3">Respuestas Recientes</h2>
        <div className="space-y-3">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <EncuestaSkeleton key={i} />)
            : encuestas.map((e) => (
              <div key={e.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50">
                <div className={`flex items-center justify-center size-8 rounded-full text-sm font-bold ${e.sentimiento === "positivo" ? "bg-green-100 text-green-700" : e.sentimiento === "negativo" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>
                  {e.puntuacion}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">{e.cliente}</p>
                    <Badge variant="outline" className="text-[9px]">{e.tipo}</Badge>
                    <Badge variant="outline" className="text-[9px]">{e.canal}</Badge>
                    <span className="text-[10px] text-muted-foreground ml-auto">{e.fecha}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{e.comentario}</p>
                </div>
              </div>
            ))
          }
        </div>
      </CardContent></Card>
    </div>
  )
}
