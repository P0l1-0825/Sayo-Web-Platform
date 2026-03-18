"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreditCard, Lock, Unlock, DollarSign, ShieldCheck, Settings, Eye, EyeOff, Snowflake } from "lucide-react"
import { toast } from "sonner"

const fmt = (n: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n)

interface Tarjeta {
  id: string; tipo: string; ultimosDigitos: string; titular: string; limiteCredito: number; disponible: number; status: "activa" | "bloqueada" | "congelada"; vencimiento: string; cvvVisible: boolean; comprasInternet: boolean; comprasExtranjero: boolean; limiteCompra: number
}

const demoTarjetas: Tarjeta[] = [
  { id: "TRJ-001", tipo: "Empresarial Platinum", ultimosDigitos: "4582", titular: "Roberto Sánchez M.", limiteCredito: 250000, disponible: 182000, status: "activa", vencimiento: "12/28", cvvVisible: false, comprasInternet: true, comprasExtranjero: true, limiteCompra: 50000 },
  { id: "TRJ-002", tipo: "Adicional Empleado", ultimosDigitos: "7891", titular: "María García L.", limiteCredito: 50000, disponible: 35000, status: "activa", vencimiento: "06/27", cvvVisible: false, comprasInternet: true, comprasExtranjero: false, limiteCompra: 15000 },
  { id: "TRJ-003", tipo: "Adicional Empleado", ultimosDigitos: "2345", titular: "Carlos Hernández", limiteCredito: 50000, disponible: 0, status: "congelada", vencimiento: "09/27", cvvVisible: false, comprasInternet: false, comprasExtranjero: false, limiteCompra: 10000 },
]

export default function TarjetasPage() {
  const [tarjetas, setTarjetas] = React.useState(demoTarjetas)
  const [selectedIdx, setSelectedIdx] = React.useState(0)
  const selected = tarjetas[selectedIdx]

  const totalLimite = tarjetas.reduce((s, t) => s + t.limiteCredito, 0)
  const totalDisponible = tarjetas.reduce((s, t) => s + t.disponible, 0)

  const toggleStatus = () => {
    setTarjetas((prev) => prev.map((t, i) =>
      i === selectedIdx ? { ...t, status: t.status === "activa" ? "congelada" as const : "activa" as const } : t
    ))
    toast.success(selected.status === "activa" ? "Tarjeta congelada" : "Tarjeta desbloqueada")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Tarjetas</h1>
        <p className="text-sm text-muted-foreground">Gestión de tarjetas, controles y límites</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><CreditCard className="size-5 mx-auto text-muted-foreground mb-1" /><p className="text-2xl font-bold">{tarjetas.length}</p><p className="text-xs text-muted-foreground">Tarjetas Emitidas</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><DollarSign className="size-5 mx-auto text-blue-500 mb-1" /><p className="text-2xl font-bold">{fmt(totalLimite)}</p><p className="text-xs text-muted-foreground">Límite Total</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><ShieldCheck className="size-5 mx-auto text-sayo-green mb-1" /><p className="text-2xl font-bold text-sayo-green">{fmt(totalDisponible)}</p><p className="text-xs text-muted-foreground">Disponible</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Lock className="size-5 mx-auto text-sayo-orange mb-1" /><p className="text-2xl font-bold text-sayo-orange">{tarjetas.filter((t) => t.status !== "activa").length}</p><p className="text-xs text-muted-foreground">Bloqueadas</p></CardContent></Card>
      </div>

      {/* Card Carousel */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {tarjetas.map((t, i) => (
          <div key={t.id} className={`min-w-[300px] rounded-xl p-5 text-white cursor-pointer transition-transform ${i === selectedIdx ? "scale-105 ring-2 ring-sayo-green" : "opacity-80"} ${t.status === "congelada" ? "bg-gradient-to-br from-gray-400 to-gray-600" : "bg-gradient-to-br from-gray-800 to-gray-950"}`} onClick={() => setSelectedIdx(i)}>
            <div className="flex justify-between items-start mb-8">
              <p className="text-xs font-medium opacity-80">{t.tipo}</p>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-medium ${t.status === "activa" ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>{t.status}</span>
            </div>
            <p className="text-lg font-mono tracking-[0.25em] mb-4">**** **** **** {t.ultimosDigitos}</p>
            <div className="flex justify-between items-end">
              <div><p className="text-[10px] opacity-60">Titular</p><p className="text-sm">{t.titular}</p></div>
              <div><p className="text-[10px] opacity-60">Vence</p><p className="text-sm font-mono">{t.vencimiento}</p></div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><CardContent className="p-4 space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2"><Settings className="size-4" /> Controles — {selected.ultimosDigitos}</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <span className="text-sm">Compras por Internet</span>
              <Badge variant={selected.comprasInternet ? "default" : "outline"} className="text-[10px]">{selected.comprasInternet ? "Activado" : "Desactivado"}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <span className="text-sm">Compras en el Extranjero</span>
              <Badge variant={selected.comprasExtranjero ? "default" : "outline"} className="text-[10px]">{selected.comprasExtranjero ? "Activado" : "Desactivado"}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <span className="text-sm">Límite por Compra</span>
              <span className="text-sm font-semibold tabular-nums">{fmt(selected.limiteCompra)}</span>
            </div>
          </div>
          <Button variant="outline" className={`w-full ${selected.status === "activa" ? "text-blue-600" : "text-sayo-green"}`} onClick={toggleStatus}>
            {selected.status === "activa" ? <><Snowflake className="size-3.5 mr-1" /> Congelar Tarjeta</> : <><Unlock className="size-3.5 mr-1" /> Desbloquear Tarjeta</>}
          </Button>
        </CardContent></Card>

        <Card><CardContent className="p-4 space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2"><DollarSign className="size-4" /> Límites — {selected.ultimosDigitos}</h2>
          <div className="space-y-3">
            <div><p className="text-[10px] text-muted-foreground uppercase">Límite de Crédito</p><p className="text-2xl font-bold">{fmt(selected.limiteCredito)}</p></div>
            <div><p className="text-[10px] text-muted-foreground uppercase">Disponible</p><p className="text-2xl font-bold text-sayo-green">{fmt(selected.disponible)}</p></div>
            <div><p className="text-[10px] text-muted-foreground uppercase">Utilizado</p><p className="text-2xl font-bold text-sayo-orange">{fmt(selected.limiteCredito - selected.disponible)}</p></div>
            <div className="w-full bg-muted rounded-full h-3">
              <div className="bg-sayo-green h-3 rounded-full" style={{ width: `${(selected.disponible / selected.limiteCredito) * 100}%` }} />
            </div>
            <p className="text-xs text-muted-foreground text-center">{Math.round((selected.disponible / selected.limiteCredito) * 100)}% disponible</p>
          </div>
        </CardContent></Card>
      </div>
    </div>
  )
}
