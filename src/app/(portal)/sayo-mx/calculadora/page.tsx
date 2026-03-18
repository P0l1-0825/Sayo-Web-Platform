"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calculator, DollarSign, Calendar, Percent, TrendingUp, ArrowRight } from "lucide-react"

const fmt = (n: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n)

export default function CalculadoraPage() {
  const [monto, setMonto] = React.useState(300000)
  const [plazo, setPlazo] = React.useState(12)

  const tasa = monto >= 1000000 ? 18 : monto >= 500000 ? 20 : 24
  const tasaMensual = tasa / 100 / 12
  const pago = monto * (tasaMensual * Math.pow(1 + tasaMensual, plazo)) / (Math.pow(1 + tasaMensual, plazo) - 1)
  const totalPagar = pago * plazo
  const totalIntereses = totalPagar - monto
  const cat = tasa + 8.5

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Calculadora de Crédito</h1>
        <p className="text-sm text-muted-foreground">Simula tu crédito revolvente en segundos</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium flex items-center gap-2"><DollarSign className="size-4" /> ¿Cuánto necesitas?</label>
                <span className="text-lg font-bold text-sayo-green">{fmt(monto)}</span>
              </div>
              <input type="range" min={50000} max={5000000} step={50000} value={monto} onChange={(e) => setMonto(Number(e.target.value))} className="w-full" />
              <div className="flex justify-between text-[10px] text-muted-foreground"><span>{fmt(50000)}</span><span>{fmt(5000000)}</span></div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium flex items-center gap-2"><Calendar className="size-4" /> ¿En cuánto tiempo pagas?</label>
                <span className="text-lg font-bold">{plazo} meses</span>
              </div>
              <input type="range" min={3} max={36} step={3} value={plazo} onChange={(e) => setPlazo(Number(e.target.value))} className="w-full" />
              <div className="flex justify-between text-[10px] text-muted-foreground"><span>3 meses</span><span>36 meses</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">Pago Mensual</p>
                <p className="text-2xl font-bold text-sayo-green">{fmt(pago)}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">Tasa Anual</p>
                <p className="text-2xl font-bold">{tasa}%</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">Total a Pagar</p>
                <p className="text-xl font-bold">{fmt(totalPagar)}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">CAT Estimado</p>
                <p className="text-xl font-bold">{cat.toFixed(1)}%</p>
              </div>
            </div>

            <div className="p-3 rounded-lg border text-xs text-muted-foreground">
              <p>* Tasa sujeta a aprobación crediticia. CAT informativo. Simulación con fines ilustrativos. Consulta términos y condiciones en sayo.mx</p>
            </div>

            <Button className="w-full" size="lg">Solicitar Crédito <ArrowRight className="size-4 ml-1" /></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
