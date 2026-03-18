"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, DollarSign, TrendingUp, Users, Clock, CheckCircle, AlertTriangle } from "lucide-react"

const fmt = (n: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n)

interface AgingBucket { rango: string; cuentas: number; monto: number; porcentaje: number; color: string }
interface EjecutivoCobranza { nombre: string; gestionesHoy: number; contactosEfectivos: number; promesasObtenidas: number; recuperado: number; efectividad: number }

const agingData: AgingBucket[] = [
  { rango: "1-30 días", cuentas: 145, monto: 12500000, porcentaje: 35, color: "bg-yellow-100 text-yellow-700" },
  { rango: "31-60 días", cuentas: 89, monto: 8200000, porcentaje: 23, color: "bg-orange-100 text-orange-700" },
  { rango: "61-90 días", cuentas: 52, monto: 5800000, porcentaje: 16, color: "bg-red-100 text-red-700" },
  { rango: "91-120 días", cuentas: 38, monto: 4500000, porcentaje: 13, color: "bg-red-200 text-red-800" },
  { rango: "120+ días", cuentas: 35, monto: 4700000, porcentaje: 13, color: "bg-red-300 text-red-900" },
]

const ejecutivos: EjecutivoCobranza[] = [
  { nombre: "Ana López Martínez", gestionesHoy: 45, contactosEfectivos: 28, promesasObtenidas: 12, recuperado: 380000, efectividad: 62 },
  { nombre: "Carlos Ruiz Hernández", gestionesHoy: 38, contactosEfectivos: 22, promesasObtenidas: 9, recuperado: 295000, efectividad: 58 },
  { nombre: "Diana Flores Ortiz", gestionesHoy: 52, contactosEfectivos: 35, promesasObtenidas: 15, recuperado: 420000, efectividad: 67 },
  { nombre: "Eduardo Ramírez Silva", gestionesHoy: 30, contactosEfectivos: 18, promesasObtenidas: 7, recuperado: 210000, efectividad: 60 },
]

export default function ReportesCobranzaPage() {
  const totalMoroso = agingData.reduce((s, a) => s + a.monto, 0)
  const totalCuentas = agingData.reduce((s, a) => s + a.cuentas, 0)
  const recuperadoMes = ejecutivos.reduce((s, e) => s + e.recuperado, 0)
  const efectividadPromedio = Math.round(ejecutivos.reduce((s, e) => s + e.efectividad, 0) / ejecutivos.length)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Reportes de Cobranza</h1>
        <p className="text-sm text-muted-foreground">Efectividad, recuperación, aging y desempeño por ejecutivo</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><DollarSign className="size-5 mx-auto text-sayo-red mb-1" /><p className="text-2xl font-bold text-sayo-red">{fmt(totalMoroso)}</p><p className="text-xs text-muted-foreground">Cartera Vencida</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><AlertTriangle className="size-5 mx-auto text-sayo-orange mb-1" /><p className="text-2xl font-bold text-sayo-orange">{totalCuentas}</p><p className="text-xs text-muted-foreground">Cuentas en Mora</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><TrendingUp className="size-5 mx-auto text-sayo-green mb-1" /><p className="text-2xl font-bold text-sayo-green">{fmt(recuperadoMes)}</p><p className="text-xs text-muted-foreground">Recuperado (Mes)</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><CheckCircle className="size-5 mx-auto text-blue-500 mb-1" /><p className="text-2xl font-bold">{efectividadPromedio}%</p><p className="text-xs text-muted-foreground">Efectividad Prom.</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><CardContent className="p-4">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><BarChart3 className="size-4" /> Aging de Cartera</h2>
          <div className="space-y-3">
            {agingData.map((a) => (
              <div key={a.rango} className="flex items-center gap-3">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium whitespace-nowrap min-w-[90px] justify-center ${a.color}`}>{a.rango}</span>
                <div className="flex-1">
                  <div className="w-full bg-muted rounded-full h-3">
                    <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${a.porcentaje}%` }} />
                  </div>
                </div>
                <div className="text-right min-w-[120px]">
                  <p className="text-xs font-semibold tabular-nums">{fmt(a.monto)}</p>
                  <p className="text-[10px] text-muted-foreground">{a.cuentas} cuentas ({a.porcentaje}%)</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-4">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><Users className="size-4" /> Desempeño por Ejecutivo (Hoy)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2">Ejecutivo</th><th className="pb-2">Gestiones</th><th className="pb-2">Contactos</th><th className="pb-2">Promesas</th><th className="pb-2">Recuperado</th><th className="pb-2">Efect.</th>
              </tr></thead>
              <tbody>{ejecutivos.map((e) => (
                <tr key={e.nombre} className="border-b last:border-0">
                  <td className="py-2 font-medium">{e.nombre}</td>
                  <td className="py-2 tabular-nums">{e.gestionesHoy}</td>
                  <td className="py-2 tabular-nums">{e.contactosEfectivos}</td>
                  <td className="py-2 tabular-nums">{e.promesasObtenidas}</td>
                  <td className="py-2 tabular-nums font-semibold text-sayo-green">{fmt(e.recuperado)}</td>
                  <td className="py-2"><span className={`font-semibold ${e.efectividad >= 65 ? "text-sayo-green" : e.efectividad >= 55 ? "text-sayo-orange" : "text-sayo-red"}`}>{e.efectividad}%</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </CardContent></Card>
      </div>
    </div>
  )
}
