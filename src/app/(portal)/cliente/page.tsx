"use client"

import * as React from "react"
import { StatCard } from "@/components/dashboard/stat-card"
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
import { clienteStats, clientMovements } from "@/hooks/use-accounts"
import type { ClientMovement } from "@/lib/types"
import { formatMoney } from "@/lib/utils"
import { ArrowUpRight, ArrowDownLeft, Copy, Send, QrCode, CreditCard, Eye, Clock, Check } from "lucide-react"
import { toast } from "sonner"

export default function ClienteDashboard() {
  const [selectedMov, setSelectedMov] = React.useState<ClientMovement | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [clabeCopied, setClabeCopied] = React.useState(false)

  const handleCopyClabe = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText("646180001234567890").then(() => {
      setClabeCopied(true)
      toast.success("CLABE copiada", { description: "646 180 0012 3456 7890" })
      setTimeout(() => setClabeCopied(false), 2000)
    }).catch(() => {
      toast.info("CLABE: 646180001234567890")
    })
  }

  const handleViewMov = (mov: ClientMovement) => {
    setSelectedMov(mov)
    setDetailOpen(true)
  }

  const handleQuickAction = (action: string) => {
    const routes: Record<string, string> = {
      transferir: "/cliente/transferencias",
      pagar_qr: "/cliente/pagos",
      pagar_servicio: "/cliente/pagos",
      recibir: "/cliente/transferencias",
    }
    if (routes[action]) {
      window.location.href = routes[action]
    }
  }

  const totalIngresos = clientMovements.filter((m) => m.type === "ingreso").reduce((s, m) => s + m.amount, 0)
  const totalEgresos = clientMovements.filter((m) => m.type === "egreso").reduce((s, m) => s + m.amount, 0)

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
            <Button variant="ghost" size="icon-xs" className="text-white hover:bg-white/20" onClick={handleCopyClabe}>
              {clabeCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            </Button>
          </div>
          <p className="text-xs text-white/70 mt-1">Banco SAYO • Cuenta Nivel 4</p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-1.5" onClick={() => handleQuickAction("transferir")}>
          <Send className="size-5" />
          <span className="text-xs">Transferir</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-1.5" onClick={() => handleQuickAction("pagar_qr")}>
          <QrCode className="size-5" />
          <span className="text-xs">Pagar QR</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-1.5" onClick={() => handleQuickAction("pagar_servicio")}>
          <CreditCard className="size-5" />
          <span className="text-xs">Pagar Servicio</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-1.5" onClick={() => handleQuickAction("recibir")}>
          <ArrowDownLeft className="size-5" />
          <span className="text-xs">Recibir</span>
        </Button>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-green-200">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Ingresos este mes</p>
            <p className="text-lg font-bold text-green-600">+{formatMoney(totalIngresos)}</p>
            <p className="text-[10px] text-muted-foreground">{clientMovements.filter((m) => m.type === "ingreso").length} movimientos</p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Egresos este mes</p>
            <p className="text-lg font-bold text-red-600">-{formatMoney(totalEgresos)}</p>
            <p className="text-[10px] text-muted-foreground">{clientMovements.filter((m) => m.type === "egreso").length} movimientos</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Movements */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <Clock className="size-4 text-muted-foreground" />
            Movimientos Recientes
          </h2>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => toast.info("Ver todos los movimientos", { description: "Sección completa próximamente" })}>
            Ver todos
          </Button>
        </div>
        <div className="space-y-1">
          {clientMovements.map((mov) => (
            <Card key={mov.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewMov(mov)}>
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
                <div className="text-right">
                  <p className={`text-sm font-semibold ${mov.type === "ingreso" ? "text-green-600" : "text-red-600"}`}>
                    {mov.type === "ingreso" ? "+" : "-"}{formatMoney(mov.amount)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Saldo: {formatMoney(mov.balance)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Movement Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de Movimiento</DialogTitle>
            <DialogDescription>{selectedMov?.id} — {selectedMov?.concept}</DialogDescription>
          </DialogHeader>
          {selectedMov && (
            <div className="space-y-4">
              <div className={`flex items-center justify-between p-3 rounded-lg ${selectedMov.type === "ingreso" ? "bg-green-50" : "bg-red-50"}`}>
                <div className="flex items-center gap-2">
                  <div className={`size-8 rounded-full flex items-center justify-center ${selectedMov.type === "ingreso" ? "bg-green-100" : "bg-red-100"}`}>
                    {selectedMov.type === "ingreso"
                      ? <ArrowDownLeft className="size-4 text-green-600" />
                      : <ArrowUpRight className="size-4 text-red-600" />
                    }
                  </div>
                  <span className={`text-sm font-semibold capitalize ${selectedMov.type === "ingreso" ? "text-green-700" : "text-red-700"}`}>
                    {selectedMov.type}
                  </span>
                </div>
                <p className={`text-xl font-bold ${selectedMov.type === "ingreso" ? "text-green-600" : "text-red-600"}`}>
                  {selectedMov.type === "ingreso" ? "+" : "-"}{formatMoney(selectedMov.amount)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Concepto</p>
                  <p className="font-medium">{selectedMov.concept}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Referencia</p>
                  <p className="font-mono text-xs">{selectedMov.reference}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fecha y Hora</p>
                  <p className="text-xs">{new Date(selectedMov.date).toLocaleString("es-MX")}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Saldo Posterior</p>
                  <p className="font-semibold">{formatMoney(selectedMov.balance)}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg border bg-muted/20">
                <p className="text-[10px] text-muted-foreground uppercase mb-1">Información Adicional</p>
                <div className="text-xs space-y-1 text-muted-foreground">
                  <p>Canal: Aplicación Móvil</p>
                  <p>Estado: <span className="text-green-600 font-medium">Liquidada</span></p>
                  <p>Tipo: SPEI {selectedMov.type === "ingreso" ? "Entrada" : "Salida"}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => {
              if (selectedMov) {
                const text = `Movimiento SAYO\n${selectedMov.concept}\n${selectedMov.type === "ingreso" ? "+" : "-"}${formatMoney(selectedMov.amount)}\nRef: ${selectedMov.reference}\nFecha: ${new Date(selectedMov.date).toLocaleString("es-MX")}`
                navigator.clipboard.writeText(text).then(() => toast.success("Detalles copiados")).catch(() => toast.info("No se pudo copiar"))
              }
            }}>
              <Copy className="size-3.5 mr-1" /> Copiar
            </Button>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
