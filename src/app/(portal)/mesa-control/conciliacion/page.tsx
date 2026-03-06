"use client"

import { StatCard } from "@/components/dashboard/stat-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import { BarChartComponent } from "@/components/charts/bar-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatMoney } from "@/lib/utils"
import { CheckCircle, AlertTriangle, XCircle, RefreshCw } from "lucide-react"

const conciliacionStats = [
  { title: "Conciliadas", value: 2780, change: 98.5, icon: "CheckCircle", trend: "up" as const },
  { title: "Discrepancias", value: 12, change: -5, icon: "AlertTriangle", trend: "down" as const },
  { title: "Sin Match", value: 5, icon: "XCircle", trend: "neutral" as const },
  { title: "Monto Discrepancia", value: 45000, icon: "DollarSign", format: "currency" as const, trend: "neutral" as const },
]

const conciliacionTrend = [
  { name: "Lun", value: 2340, discrepancias: 8 },
  { name: "Mar", value: 2780, discrepancias: 5 },
  { name: "Mié", value: 2450, discrepancias: 12 },
  { name: "Jue", value: 3100, discrepancias: 3 },
  { name: "Vie", value: 2847, discrepancias: 7 },
]

const discrepancias = [
  { id: "DISC-001", txnId: "TXN-034", type: "Monto diferente", montoSayo: 50000, montoBanxico: 55000, diferencia: 5000, status: "pendiente", date: "2024-03-06" },
  { id: "DISC-002", txnId: "TXN-087", type: "No encontrada en SPEI", montoSayo: 15000, montoBanxico: 0, diferencia: 15000, status: "pendiente", date: "2024-03-06" },
  { id: "DISC-003", txnId: "TXN-112", type: "Duplicada", montoSayo: 25000, montoBanxico: 25000, diferencia: 0, status: "investigando", date: "2024-03-05" },
  { id: "DISC-004", txnId: "N/A", type: "Sin match interno", montoSayo: 0, montoBanxico: 8500, diferencia: 8500, status: "pendiente", date: "2024-03-06" },
]

const statusIcon: Record<string, React.ReactNode> = {
  pendiente: <AlertTriangle className="size-3.5 text-sayo-orange" />,
  investigando: <RefreshCw className="size-3.5 text-sayo-blue" />,
  resuelta: <CheckCircle className="size-3.5 text-sayo-green" />,
}

export default function ConciliacionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Conciliación</h1>
          <p className="text-sm text-muted-foreground">Comparativa SPEI (Banxico) vs registros internos SAYO</p>
        </div>
        <Button>
          <RefreshCw className="size-4 mr-1.5" />
          Ejecutar Conciliación
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {conciliacionStats.map((stat) => (
          <StatCard key={stat.title} data={stat} />
        ))}
      </div>

      {/* Chart */}
      <ChartCard title="Conciliación Semanal" description="Transacciones conciliadas vs discrepancias">
        <BarChartComponent
          data={conciliacionTrend}
          dataKey="value"
          secondaryDataKey="discrepancias"
          color="var(--chart-2)"
          secondaryColor="var(--chart-4)"
        />
      </ChartCard>

      {/* Discrepancies */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Discrepancias Pendientes</h2>
        <div className="space-y-2">
          {discrepancias.map((d) => (
            <Card key={d.id}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  {statusIcon[d.status]}
                  <span className="font-mono text-xs">{d.id}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{d.type}</p>
                  <p className="text-xs text-muted-foreground">TXN: {d.txnId} — {d.date}</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="text-center">
                    <p className="text-muted-foreground">SAYO</p>
                    <p className="font-semibold tabular-nums">{formatMoney(d.montoSayo)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">Banxico</p>
                    <p className="font-semibold tabular-nums">{formatMoney(d.montoBanxico)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">Δ</p>
                    <p className="font-semibold tabular-nums text-sayo-red">{formatMoney(d.diferencia)}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Conciliar</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
