"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCcw, DollarSign, Calendar, Calculator, CheckCircle, Clock, AlertTriangle } from "lucide-react"

const fmt = (n: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n)

interface Reestructura {
  id: string; cliente: string; creditoOriginal: string; saldoActual: number; diasMora: number; nuevoplazo: number; nuevaTasa: number; nuevoPago: number; status: "aprobada" | "en-revision" | "rechazada" | "pendiente"; fechaSolicitud: string
}

const demoReest: Reestructura[] = [
  { id: "REST-001", cliente: "Distribuidora del Norte SA", creditoOriginal: "CRV-2025-0345", saldoActual: 380000, diasMora: 45, nuevoplazo: 24, nuevaTasa: 26, nuevoPago: 20500, status: "aprobada", fechaSolicitud: "2026-03-05" },
  { id: "REST-002", cliente: "Comercial del Pacífico SA", creditoOriginal: "CS-2025-0456", saldoActual: 520000, diasMora: 90, nuevoplazo: 36, nuevaTasa: 28, nuevoPago: 19800, status: "en-revision", fechaSolicitud: "2026-03-12" },
  { id: "REST-003", cliente: "TechParts Manufacturing", creditoOriginal: "CRV-2025-0128", saldoActual: 250000, diasMora: 30, nuevoplazo: 18, nuevaTasa: 24, nuevoPago: 16200, status: "pendiente", fechaSolicitud: "2026-03-15" },
  { id: "REST-004", cliente: "Logística Azteca SA", creditoOriginal: "CS-2025-0789", saldoActual: 180000, diasMora: 120, nuevoplazo: 24, nuevaTasa: 30, nuevoPago: 10500, status: "rechazada", fechaSolicitud: "2026-02-28" },
]

export default function ReestructurasPage() {
  const [saldo, setSaldo] = React.useState(400000)
  const [plazo, setPlazo] = React.useState(24)
  const tasa = 26
  const tasaMen = tasa / 100 / 12
  const pagoSim = saldo * (tasaMen * Math.pow(1 + tasaMen, plazo)) / (Math.pow(1 + tasaMen, plazo) - 1)

  const totalSaldo = demoReest.reduce((s, r) => s + r.saldoActual, 0)
  const aprobadas = demoReest.filter((r) => r.status === "aprobada").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Reestructuras</h1>
        <p className="text-sm text-muted-foreground">Simulador, nueva tabla de amortización y seguimiento</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><RefreshCcw className="size-5 mx-auto text-muted-foreground mb-1" /><p className="text-2xl font-bold">{demoReest.length}</p><p className="text-xs text-muted-foreground">Solicitudes</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><DollarSign className="size-5 mx-auto text-blue-500 mb-1" /><p className="text-2xl font-bold">{fmt(totalSaldo)}</p><p className="text-xs text-muted-foreground">Saldo Total</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><CheckCircle className="size-5 mx-auto text-sayo-green mb-1" /><p className="text-2xl font-bold text-sayo-green">{aprobadas}</p><p className="text-xs text-muted-foreground">Aprobadas</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Clock className="size-5 mx-auto text-sayo-orange mb-1" /><p className="text-2xl font-bold text-sayo-orange">{demoReest.filter((r) => r.status === "en-revision" || r.status === "pendiente").length}</p><p className="text-xs text-muted-foreground">En Proceso</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2"><Calculator className="size-4" /> Simulador de Reestructura</h2>
          <div>
            <label className="text-xs text-muted-foreground">Saldo ({fmt(saldo)})</label>
            <input type="range" min={50000} max={2000000} step={10000} value={saldo} onChange={(e) => setSaldo(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Nuevo Plazo ({plazo} meses)</label>
            <input type="range" min={6} max={48} step={6} value={plazo} onChange={(e) => setPlazo(Number(e.target.value))} className="w-full" />
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-2">
            <div className="flex justify-between"><span className="text-muted-foreground">Tasa reestructura:</span><span className="font-semibold">{tasa}%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Nuevo pago mensual:</span><span className="font-bold text-sayo-green">{fmt(pagoSim)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Total a pagar:</span><span className="font-semibold">{fmt(pagoSim * plazo)}</span></div>
          </div>
        </CardContent></Card>

        <Card className="lg:col-span-2"><CardContent className="p-4">
          <h2 className="text-sm font-semibold mb-3">Solicitudes de Reestructura</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2">ID</th><th className="pb-2">Cliente</th><th className="pb-2">Saldo</th><th className="pb-2">Días Mora</th><th className="pb-2">Nuevo Plazo</th><th className="pb-2">Nuevo Pago</th><th className="pb-2">Estado</th>
              </tr></thead>
              <tbody>{demoReest.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="py-2 font-mono text-xs">{r.id}</td>
                  <td className="py-2 font-medium">{r.cliente}</td>
                  <td className="py-2 tabular-nums">{fmt(r.saldoActual)}</td>
                  <td className="py-2"><span className={`font-semibold ${r.diasMora > 90 ? "text-sayo-red" : r.diasMora > 60 ? "text-sayo-orange" : "text-yellow-600"}`}>{r.diasMora}d</span></td>
                  <td className="py-2">{r.nuevoplazo}m</td>
                  <td className="py-2 tabular-nums font-semibold text-sayo-green">{fmt(r.nuevoPago)}</td>
                  <td className="py-2"><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${r.status === "aprobada" ? "bg-green-100 text-green-700" : r.status === "rechazada" ? "bg-red-100 text-red-700" : r.status === "en-revision" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>{r.status}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </CardContent></Card>
      </div>
    </div>
  )
}
