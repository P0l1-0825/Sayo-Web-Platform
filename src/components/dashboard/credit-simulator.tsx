"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AmortizationTable } from "./amortization-table"
import type { AmortizationRow } from "@/lib/types"
import { formatMoney } from "@/lib/utils"
import { Calculator, FileSignature } from "lucide-react"

interface CreditSimulatorProps {
  product?: string
  minAmount?: number
  maxAmount?: number
  minRate?: number
  maxRate?: number
  minTerm?: number
  maxTerm?: number
  onCreateApplication?: (simulation: { amount: number; rate: number; term: number }) => void
}

export function CreditSimulator({
  product = "Crédito Cuenta Corriente",
  minAmount = 50000,
  maxAmount = 5000000,
  minRate = 18,
  maxRate = 36,
  minTerm = 6,
  maxTerm = 60,
  onCreateApplication,
}: CreditSimulatorProps) {
  const [amount, setAmount] = useState(500000)
  const [rate, setRate] = useState(24)
  const [term, setTerm] = useState(24)
  const [showAmortization, setShowAmortization] = useState(false)

  const simulation = useMemo(() => {
    const monthlyRate = rate / 100 / 12
    const monthlyPayment =
      (amount * monthlyRate * Math.pow(1 + monthlyRate, term)) /
      (Math.pow(1 + monthlyRate, term) - 1)
    const totalPayment = monthlyPayment * term
    const totalInterest = totalPayment - amount
    const ivaOnInterest = totalInterest * 0.16
    const cat = ((Math.pow(1 + monthlyRate, 12) - 1) * 100)

    // Generate amortization table
    const amortization: AmortizationRow[] = []
    let balance = amount
    for (let i = 1; i <= term; i++) {
      const interest = balance * monthlyRate
      const iva = interest * 0.16
      const capital = monthlyPayment - interest
      const payment = capital + interest + iva
      balance -= capital

      amortization.push({
        period: i,
        initialBalance: balance + capital,
        capital: Math.round(capital * 100) / 100,
        interest: Math.round(interest * 100) / 100,
        iva: Math.round(iva * 100) / 100,
        totalPayment: Math.round(payment * 100) / 100,
        finalBalance: Math.max(0, Math.round(balance * 100) / 100),
      })
    }

    return {
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      ivaOnInterest: Math.round(ivaOnInterest * 100) / 100,
      totalPayment: Math.round((totalPayment + ivaOnInterest) * 100) / 100,
      cat: Math.round(cat * 100) / 100,
      amortization,
    }
  }, [amount, rate, term])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
                <Calculator className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Cotizador de Crédito</CardTitle>
                <p className="text-sm text-muted-foreground">{product}</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Inputs */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Monto del crédito</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Math.min(maxAmount, Math.max(minAmount, Number(e.target.value))))}
                  min={minAmount}
                  max={maxAmount}
                  step={10000}
                />
                <input
                  type="range"
                  min={minAmount}
                  max={maxAmount}
                  step={10000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full accent-sayo-cafe"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatMoney(minAmount)}</span>
                  <span>{formatMoney(maxAmount)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rate">Tasa anual (%)</Label>
                <Input
                  id="rate"
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(Math.min(maxRate, Math.max(minRate, Number(e.target.value))))}
                  min={minRate}
                  max={maxRate}
                  step={0.5}
                />
                <input
                  type="range"
                  min={minRate}
                  max={maxRate}
                  step={0.5}
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full accent-sayo-cafe"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{minRate}%</span>
                  <span>{maxRate}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="term">Plazo (meses)</Label>
                <Input
                  id="term"
                  type="number"
                  value={term}
                  onChange={(e) => setTerm(Math.min(maxTerm, Math.max(minTerm, Number(e.target.value))))}
                  min={minTerm}
                  max={maxTerm}
                />
                <input
                  type="range"
                  min={minTerm}
                  max={maxTerm}
                  step={1}
                  value={term}
                  onChange={(e) => setTerm(Number(e.target.value))}
                  className="w-full accent-sayo-cafe"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{minTerm} meses</span>
                  <span>{maxTerm} meses</span>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-sayo-cream border-0">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-sm text-muted-foreground">Pago Mensual</p>
                    <p className="text-2xl font-bold text-sayo-cafe">{formatMoney(simulation.monthlyPayment)}</p>
                  </CardContent>
                </Card>
                <Card className="bg-sayo-cream border-0">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-sm text-muted-foreground">CAT</p>
                    <p className="text-2xl font-bold text-sayo-cafe">{simulation.cat}%</p>
                    <Badge variant="secondary" className="mt-1">Sin IVA</Badge>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-sm text-muted-foreground">Total Intereses</p>
                    <p className="text-lg font-semibold">{formatMoney(simulation.totalInterest)}</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-sm text-muted-foreground">Total a Pagar</p>
                    <p className="text-lg font-semibold">{formatMoney(simulation.totalPayment)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Incluye IVA sobre intereses</p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAmortization(!showAmortization)}
                  className="flex-1"
                >
                  {showAmortization ? "Ocultar" : "Ver"} Tabla de Amortización
                </Button>
                {onCreateApplication && (
                  <Button
                    onClick={() => onCreateApplication({ amount, rate, term })}
                    className="flex-1 bg-accent-green hover:bg-accent-green/90 text-white"
                  >
                    <FileSignature className="mr-2 h-4 w-4" />
                    Iniciar Solicitud
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showAmortization && (
        <AmortizationTable rows={simulation.amortization} showTotals />
      )}
    </div>
  )
}
