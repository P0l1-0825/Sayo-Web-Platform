"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatMoney } from "@/lib/utils"
import { Send, Star, Clock, ArrowUpRight, ArrowDownLeft } from "lucide-react"

const favorites = [
  { name: "Carlos Ruiz", bank: "Banorte", clabe: "072180005678901234" },
  { name: "María López", bank: "BBVA", clabe: "012180001234567891" },
  { name: "CFE", bank: "Banamex", clabe: "002180007890123456" },
]

const history = [
  { id: "H1", type: "egreso", name: "Carlos Ruiz", amount: 5000, date: "2024-03-02", status: "completada" },
  { id: "H2", type: "ingreso", name: "Empresa ABC S.A.", amount: 125000, date: "2024-03-01", status: "completada" },
  { id: "H3", type: "egreso", name: "GNP Seguros", amount: 43000, date: "2024-02-28", status: "completada" },
  { id: "H4", type: "egreso", name: "CFE", amount: 1200, date: "2024-02-25", status: "completada" },
]

export default function TransferenciasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Transferencias</h1>
        <p className="text-sm text-muted-foreground">Enviar y recibir dinero vía SPEI</p>
      </div>

      {/* Transfer Form */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-sm font-semibold">Nueva Transferencia SPEI</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">CLABE Destino</label>
              <Input placeholder="18 dígitos..." maxLength={18} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Banco</label>
              <Input placeholder="Se detecta automáticamente" disabled />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Beneficiario</label>
              <Input placeholder="Nombre del beneficiario" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Monto</label>
              <Input placeholder="$0.00" type="number" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Concepto</label>
            <Input placeholder="Concepto del pago" />
          </div>
          <div className="flex justify-end">
            <Button><Send className="size-4 mr-1.5" /> Transferir</Button>
          </div>
        </CardContent>
      </Card>

      {/* Favorites */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-1.5"><Star className="size-4 text-sayo-orange" /> Favoritos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {favorites.map((fav) => (
            <Card key={fav.clabe} className="cursor-pointer hover:border-primary transition-colors">
              <CardContent className="p-3">
                <p className="text-sm font-medium">{fav.name}</p>
                <p className="text-xs text-muted-foreground">{fav.bank} • {fav.clabe.slice(-4)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* History */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-1.5"><Clock className="size-4 text-muted-foreground" /> Historial</h2>
        <div className="space-y-1">
          {history.map((h) => (
            <Card key={h.id}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`size-8 rounded-full flex items-center justify-center ${h.type === "ingreso" ? "bg-green-100" : "bg-red-100"}`}>
                  {h.type === "ingreso" ? <ArrowDownLeft className="size-4 text-green-600" /> : <ArrowUpRight className="size-4 text-red-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{h.name}</p>
                  <p className="text-xs text-muted-foreground">{h.date}</p>
                </div>
                <p className={`text-sm font-semibold ${h.type === "ingreso" ? "text-green-600" : "text-red-600"}`}>
                  {h.type === "ingreso" ? "+" : "-"}{formatMoney(h.amount)}
                </p>
                <Badge variant="outline" className="text-[10px]">{h.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
