"use client"

import * as React from "react"
import { StatCard } from "@/components/dashboard/stat-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import { BarChartComponent } from "@/components/charts/bar-chart"
import { DonutChartComponent } from "@/components/charts/donut-chart"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { cobranzaStats, useCreditAccounts } from "@/hooks/use-credits"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import { formatMoney } from "@/lib/utils"
import type { CreditAccount } from "@/lib/types"
import { Eye, Phone, Mail, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

const moraTrend = [
  { name: "Oct", value: 14200000 },
  { name: "Nov", value: 13800000 },
  { name: "Dic", value: 15100000 },
  { name: "Ene", value: 13500000 },
  { name: "Feb", value: 12900000 },
  { name: "Mar", value: 12450000 },
]

const moraDistribution = [
  { name: "0-30 días", value: 5200000 },
  { name: "31-60 días", value: 3100000 },
  { name: "61-90 días", value: 2050000 },
  { name: "90+ días", value: 2100000 },
]

export default function CobranzaDashboard() {
  const { data: creditAccounts, isLoading, error, refetch } = useCreditAccounts()
  const [selectedAccount, setSelectedAccount] = React.useState<CreditAccount | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error) return <ErrorCard message={error} onRetry={refetch} />
  if (!creditAccounts) return null

  const handleView = (account: CreditAccount) => {
    setSelectedAccount(account)
    setDetailOpen(true)
  }

  const handleCall = (account: CreditAccount) => {
    toast.success("Llamada iniciada", { description: `Contactando a ${account.clientName}` })
  }

  const handleEmail = (account: CreditAccount) => {
    toast.success("Email de cobranza enviado", { description: `Notificación enviada a ${account.clientName}` })
  }

  const topOverdue = creditAccounts.slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Cobranza</h1>
        <p className="text-sm text-muted-foreground">Gestión de cartera vencida y recuperación</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cobranzaStats.map((stat) => (
          <StatCard key={stat.title} data={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Cartera Vencida" description="Tendencia 6 meses" className="lg:col-span-2">
          <BarChartComponent data={moraTrend} color="var(--chart-4)" formatY="currency" />
        </ChartCard>
        <ChartCard title="Distribución por Mora" description="Días de atraso">
          <DonutChartComponent data={moraDistribution} />
        </ChartCard>
      </div>

      {/* Top Overdue Accounts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Cuentas con Mayor Atraso</h2>
          <Badge variant="outline">{creditAccounts.length} cuentas vencidas</Badge>
        </div>
        <div className="space-y-2">
          {topOverdue.map((account) => (
            <Card key={account.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleView(account)}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`size-4 ${account.daysPastDue > 90 ? "text-sayo-red" : account.daysPastDue > 60 ? "text-sayo-orange" : "text-sayo-blue"}`} />
                  <span className="font-mono text-xs">{account.id}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{account.clientName}</p>
                  <p className="text-xs text-muted-foreground">{account.productType} — Agente: {account.assignedAgent}</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="text-center">
                    <p className="text-muted-foreground">Vencido</p>
                    <p className="font-semibold tabular-nums text-sayo-red">{formatMoney(account.pastDueAmount)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">Días Mora</p>
                    <p className={`font-bold text-sm ${account.daysPastDue > 90 ? "text-sayo-red" : account.daysPastDue > 60 ? "text-sayo-orange" : "text-sayo-blue"}`}>
                      {account.daysPastDue}
                    </p>
                  </div>
                </div>
                <Badge className={`text-[10px] ${
                  account.moraCategory === "90+" ? "bg-red-100 text-red-700" :
                  account.moraCategory === "61-90" ? "bg-orange-100 text-orange-700" :
                  account.moraCategory === "31-60" ? "bg-yellow-100 text-yellow-700" :
                  "bg-blue-100 text-blue-700"
                }`}>{account.moraCategory}</Badge>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon-xs" onClick={() => handleCall(account)} title="Llamar">
                    <Phone className="size-3.5 text-sayo-green" />
                  </Button>
                  <Button variant="ghost" size="icon-xs" onClick={() => handleEmail(account)} title="Email">
                    <Mail className="size-3.5 text-sayo-blue" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de Cuenta</DialogTitle>
            <DialogDescription>{selectedAccount?.id} — {selectedAccount?.clientName}</DialogDescription>
          </DialogHeader>
          {selectedAccount && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <Badge className={`text-[10px] ${
                  selectedAccount.moraCategory === "90+" ? "bg-red-100 text-red-700" :
                  selectedAccount.moraCategory === "61-90" ? "bg-orange-100 text-orange-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>{selectedAccount.moraCategory} días</Badge>
                <div className="text-right">
                  <p className="text-xl font-bold tabular-nums text-sayo-red">{formatMoney(selectedAccount.pastDueAmount)}</p>
                  <p className="text-[10px] text-muted-foreground">Monto Vencido</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Cliente</p>
                  <p className="font-medium">{selectedAccount.clientName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Producto</p>
                  <p>{selectedAccount.productType}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Saldo Actual</p>
                  <p className="font-semibold">{formatMoney(selectedAccount.currentBalance)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Días de Mora</p>
                  <p className="font-bold text-lg">{selectedAccount.daysPastDue}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Estado</p>
                  <p>{selectedAccount.status}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Agente Asignado</p>
                  <p>{selectedAccount.assignedAgent}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => selectedAccount && handleCall(selectedAccount)}>
              <Phone className="size-3.5 mr-1" /> Llamar
            </Button>
            <Button variant="outline" size="sm" onClick={() => selectedAccount && handleEmail(selectedAccount)}>
              <Mail className="size-3.5 mr-1" /> Enviar Email
            </Button>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
