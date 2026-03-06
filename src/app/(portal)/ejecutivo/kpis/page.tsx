"use client"

import { Card, CardContent } from "@/components/ui/card"
import { kpis } from "@/lib/mock-data"
import { TrendingUp, TrendingDown, Minus, Target } from "lucide-react"

const statusColors: Record<string, { bg: string; ring: string; text: string }> = {
  verde: { bg: "bg-green-100", ring: "ring-green-300", text: "text-green-700" },
  amarillo: { bg: "bg-yellow-100", ring: "ring-yellow-300", text: "text-yellow-700" },
  rojo: { bg: "bg-red-100", ring: "ring-red-300", text: "text-red-700" },
}

const categories = [...new Set(kpis.map((k) => k.category))]

export default function KPIsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">KPIs</h1>
        <p className="text-sm text-muted-foreground">Indicadores clave — meta vs actual, tendencia y semáforo</p>
      </div>

      {categories.map((cat) => (
        <div key={cat}>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Target className="size-4 text-muted-foreground" />
            {cat}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.filter((k) => k.category === cat).map((kpi) => {
              const sc = statusColors[kpi.status]
              const progress = Math.min((kpi.actual / kpi.target) * 100, 100)
              return (
                <Card key={kpi.id} className={`ring-1 ${sc.ring}`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold">{kpi.name}</p>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${sc.bg} ${sc.text}`}>
                        {kpi.status}
                      </span>
                    </div>
                    <div className="flex items-end gap-1">
                      <p className="text-2xl font-bold">{kpi.actual}</p>
                      <p className="text-xs text-muted-foreground mb-1">{kpi.unit}</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${
                        kpi.status === "verde" ? "bg-green-500" :
                        kpi.status === "amarillo" ? "bg-yellow-500" :
                        "bg-red-500"
                      }`} style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Meta: {kpi.target} {kpi.unit}</span>
                      <span className="flex items-center gap-0.5">
                        {kpi.trend === "up" ? <TrendingUp className="size-3 text-green-600" /> :
                         kpi.trend === "down" ? <TrendingDown className="size-3 text-red-600" /> :
                         <Minus className="size-3" />}
                        {kpi.trend}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
