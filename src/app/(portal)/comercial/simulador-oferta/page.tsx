"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calculator, DollarSign, Percent, Calendar, TrendingUp, Download } from "lucide-react"
import { toast } from "sonner"

const fmt = (n: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n)

export default function SimuladorOfertaPage() {
  const [monto, setMonto] = React.useState(500000)
  const [plazo, setPlazo] = React.useState(12)
  const [tasa, setTasa] = React.useState(24)
  const [garantia, setGarantia] = React.useState("sin-garantia")

  const tasaMensual = tasa / 100 / 12
  const pago = monto * (tasaMensual * Math.pow(1 + tasaMensual, plazo)) / (Math.pow(1 + tasaMensual, plazo) - 1)
  const totalPagar = pago * plazo
  const totalIntereses = totalPagar - monto
  const cat = tasa + 8.5

  const amortizacion = React.useMemo(() => {
    const rows: { mes: number; pago: number; capital: number; interes: number; saldo: number }[] = []
    let saldo = monto
    for (let i = 1; i <= plazo; i++) {
      const interes = saldo * tasaMensual
      const capital = pago - interes
      saldo -= capital
      rows.push({ mes: i, pago, capital, interes, saldo: Math.max(0, saldo) })
    }
    return rows
  }, [monto, plazo, tasa])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Simulador de Oferta</h1>
        <p className="text-sm text-muted-foreground">Calcula monto, plazo, tasa y garantía para crédito revolvente</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center">
          <DollarSign className="size-5 mx-auto text-muted-foreground mb-1" />
          <p className="text-2xl font-bold">{fmt(monto)}</p>
          <p className="text-xs text-muted-foreground">Monto Solicitado</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Calendar className="size-5 mx-auto text-blue-500 mb-1" />
          <p className="text-2xl font-bold">{fmt(pago)}</p>
          <p className="text-xs text-muted-foreground">Pago Mensual</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Percent className="size-5 mx-auto text-sayo-orange mb-1" />
          <p className="text-2xl font-bold text-sayo-orange">{cat.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground">CAT Estimado</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <TrendingUp className="size-5 mx-auto text-sayo-green mb-1" />
          <p className="text-2xl font-bold text-sayo-green">{fmt(totalPagar)}</p>
          <p className="text-xs text-muted-foreground">Total a Pagar</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-4 space-y-4">
            <h2 className="text-sm font-semibold flex items-center gap-2"><Calculator className="size-4" /> Parámetros</h2>
            <div>
              <label className="text-xs text-muted-foreground">Monto ({fmt(monto)})</label>
              <input type="range" min={100000} max={5000000} step={50000} value={monto} onChange={(e) => setMonto(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Plazo ({plazo} meses)</label>
              <input type="range" min={3} max={36} step={3} value={plazo} onChange={(e) => setPlazo(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Tasa anual ({tasa}%)</label>
              <input type="range" min={12} max={48} step={0.5} value={tasa} onChange={(e) => setTasa(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Garantía</label>
              <select className="w-full mt-1 rounded border p-2 text-sm bg-background" value={garantia} onChange={(e) => setGarantia(e.target.value)}>
                <option value="sin-garantia">Sin garantía</option>
                <option value="hipotecaria">Hipotecaria</option>
                <option value="prendaria">Prendaria</option>
                <option value="fiduciaria">Fiduciaria</option>
              </select>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Intereses totales:</span><span className="font-semibold">{fmt(totalIntereses)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Garantía:</span><Badge variant="outline" className="text-[10px]">{garantia}</Badge></div>
            </div>
            <Button className="w-full" onClick={() => toast.success("Oferta generada", { description: `${fmt(monto)} a ${plazo} meses` })}>
              <Download className="size-3.5 mr-1" /> Generar Oferta PDF
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <h2 className="text-sm font-semibold mb-3">Tabla de Amortización</h2>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background"><tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-2">Mes</th><th className="pb-2">Pago</th><th className="pb-2">Capital</th><th className="pb-2">Interés</th><th className="pb-2">Saldo</th>
                </tr></thead>
                <tbody>
                  {amortizacion.map((r) => (
                    <tr key={r.mes} className="border-b last:border-0 text-xs">
                      <td className="py-1.5">{r.mes}</td>
                      <td className="py-1.5 tabular-nums">{fmt(r.pago)}</td>
                      <td className="py-1.5 tabular-nums">{fmt(r.capital)}</td>
                      <td className="py-1.5 tabular-nums text-sayo-orange">{fmt(r.interes)}</td>
                      <td className="py-1.5 tabular-nums font-medium">{fmt(r.saldo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
