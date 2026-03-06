"use client"

import { StatCard } from "@/components/dashboard/stat-card"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { clienteStats, clientMovements } from "@/lib/mock-data"
import { formatMoney } from "@/lib/utils"
import { ArrowUpRight, ArrowDownLeft, Copy, Send, QrCode, CreditCard } from "lucide-react"

export default function ClienteDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Mi Cuenta SAYO</h1>
        <p className="text-sm text-muted-foreground">Bienvenido, Juan Pérez</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {clienteStats.map((stat) => (
          <StatCard key={stat.title} data={stat} />
        ))}
      </div>

      {/* CLABE Card */}
      <Card className="bg-gradient-to-r from-sayo-cafe to-sayo-cafe-light text-white">
        <CardContent className="p-5">
          <p className="text-xs text-white/70 mb-1">CLABE Interbancaria</p>
          <div className="flex items-center gap-2">
            <p className="text-lg font-mono font-bold tracking-wider">646 180 0012 3456 7890</p>
            <Button variant="ghost" size="icon-xs" className="text-white hover:bg-white/20"><Copy className="size-3.5" /></Button>
          </div>
          <p className="text-xs text-white/70 mt-1">Banco SAYO • Cuenta Nivel 4</p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-1.5">
          <Send className="size-5" />
          <span className="text-xs">Transferir</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-1.5">
          <QrCode className="size-5" />
          <span className="text-xs">Pagar QR</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-1.5">
          <CreditCard className="size-5" />
          <span className="text-xs">Pagar Servicio</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-1.5">
          <ArrowDownLeft className="size-5" />
          <span className="text-xs">Recibir</span>
        </Button>
      </div>

      {/* Recent Movements */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Movimientos Recientes</h2>
        <div className="space-y-1">
          {clientMovements.map((mov) => (
            <Card key={mov.id}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`size-8 rounded-full flex items-center justify-center ${mov.type === "ingreso" ? "bg-green-100" : "bg-red-100"}`}>
                  {mov.type === "ingreso"
                    ? <ArrowDownLeft className="size-4 text-green-600" />
                    : <ArrowUpRight className="size-4 text-red-600" />
                  }
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{mov.concept}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(mov.date).toLocaleDateString("es-MX")} • Ref: {mov.reference}
                  </p>
                </div>
                <p className={`text-sm font-semibold ${mov.type === "ingreso" ? "text-green-600" : "text-red-600"}`}>
                  {mov.type === "ingreso" ? "+" : "-"}{formatMoney(mov.amount)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
