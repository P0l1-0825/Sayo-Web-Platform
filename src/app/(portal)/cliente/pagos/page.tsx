"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatMoney } from "@/lib/utils"
import { Zap, Droplets, Wifi, Phone, Tv, CreditCard, Search, Clock } from "lucide-react"

const services = [
  { name: "CFE", icon: Zap, color: "text-yellow-600 bg-yellow-100" },
  { name: "Agua", icon: Droplets, color: "text-blue-600 bg-blue-100" },
  { name: "Internet", icon: Wifi, color: "text-purple-600 bg-purple-100" },
  { name: "Teléfono", icon: Phone, color: "text-green-600 bg-green-100" },
  { name: "TV Cable", icon: Tv, color: "text-red-600 bg-red-100" },
  { name: "Tarjeta Crédito", icon: CreditCard, color: "text-orange-600 bg-orange-100" },
]

const paymentHistory = [
  { id: "PAG-001", service: "CFE", amount: 1200, date: "2024-03-03", reference: "PAG-CFE-001", status: "pagado" },
  { id: "PAG-002", service: "Telcel", amount: 399, date: "2024-02-28", reference: "PAG-TEL-001", status: "pagado" },
  { id: "PAG-003", service: "Telmex", amount: 649, date: "2024-02-25", reference: "PAG-TMX-001", status: "pagado" },
  { id: "PAG-004", service: "SIAPA Agua", amount: 320, date: "2024-02-20", reference: "PAG-AGU-001", status: "pagado" },
]

export default function PagosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Pago de Servicios</h1>
        <p className="text-sm text-muted-foreground">Paga luz, agua, internet, teléfono y más</p>
      </div>

      {/* Service Categories */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {services.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.name} className="cursor-pointer hover:border-primary transition-colors">
              <CardContent className="p-4 text-center">
                <div className={`size-10 rounded-full flex items-center justify-center mx-auto mb-2 ${s.color}`}>
                  <Icon className="size-5" />
                </div>
                <p className="text-xs font-medium">{s.name}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Payment Form */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-sm font-semibold">Realizar Pago</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Servicio</label>
              <Input placeholder="Buscar servicio..." />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Referencia / No. Contrato</label>
              <Input placeholder="Número de referencia" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Monto</label>
              <Input placeholder="$0.00" type="number" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button><Search className="size-4 mr-1.5" /> Consultar y Pagar</Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-1.5"><Clock className="size-4 text-muted-foreground" /> Historial de Pagos</h2>
        <div className="space-y-1">
          {paymentHistory.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-3 flex items-center gap-3">
                <Zap className="size-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{p.service}</p>
                  <p className="text-xs text-muted-foreground">{p.date} • Ref: {p.reference}</p>
                </div>
                <p className="text-sm font-semibold text-red-600">-{formatMoney(p.amount)}</p>
                <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700">{p.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
