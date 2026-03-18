"use client"

import * as React from "react"
import { WizardSteps, type WizardStep } from "@/components/forms/wizard-steps"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatMoney } from "@/lib/utils"
import { useTreasuryPayments } from "@/hooks/use-tesoreria"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import type { TreasuryPayment } from "@/lib/types"
import { CheckCircle, Star, User, Building2 } from "lucide-react"
import { toast } from "sonner"

const favoritos = [
  { name: "Proveedores SA de CV", bank: "BBVA", clabe: "012345678901234567" },
  { name: "Servicios Integrales", bank: "Santander", clabe: "014345678901234567" },
  { name: "Nomina Solvendom", bank: "Banorte", clabe: "072345678901234567" },
]

export default function PagosIndividualesPage() {
  const { data: treasuryPayments, isLoading, error, refetch } = useTreasuryPayments()
  const [beneficiaryName, setBeneficiaryName] = React.useState("")
  const [beneficiaryBank, setBeneficiaryBank] = React.useState("")
  const [beneficiaryClabe, setBeneficiaryClabe] = React.useState("")
  const [amount, setAmount] = React.useState(0)
  const [concept, setConcept] = React.useState("")
  const [reference, setReference] = React.useState("")
  const [showWizard, setShowWizard] = React.useState(true)

  const selectFavorite = (fav: typeof favoritos[0]) => {
    setBeneficiaryName(fav.name)
    setBeneficiaryBank(fav.bank)
    setBeneficiaryClabe(fav.clabe)
    toast.info("Beneficiario seleccionado", { description: fav.name })
  }

  const wizardSteps: WizardStep[] = [
    {
      title: "Datos del Pago",
      description: "Beneficiario, monto y concepto",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">Beneficiarios Frecuentes</Label>
            <div className="flex gap-2 flex-wrap">
              {favoritos.map((fav) => (
                <button
                  key={fav.clabe}
                  onClick={() => selectFavorite(fav)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-sayo-cream hover:border-sayo-cafe text-sm transition-colors"
                >
                  <Star className="size-3 text-yellow-500" />
                  <span>{fav.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre del Beneficiario</Label>
              <Input value={beneficiaryName} onChange={(e) => setBeneficiaryName(e.target.value)} placeholder="Nombre completo o razon social" />
            </div>
            <div className="space-y-2">
              <Label>Banco Destino</Label>
              <select value={beneficiaryBank} onChange={(e) => setBeneficiaryBank(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Seleccionar banco...</option>
                <option value="BBVA">BBVA Mexico</option>
                <option value="Santander">Santander</option>
                <option value="Banorte">Banorte</option>
                <option value="HSBC">HSBC</option>
                <option value="Scotiabank">Scotiabank</option>
                <option value="Citibanamex">Citibanamex</option>
                <option value="Inbursa">Inbursa</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>CLABE Interbancaria</Label>
              <Input value={beneficiaryClabe} onChange={(e) => setBeneficiaryClabe(e.target.value)} placeholder="018 digits" maxLength={18} className="font-mono" />
            </div>
            <div className="space-y-2">
              <Label>Monto</Label>
              <Input type="number" value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} placeholder="0.00" step="0.01" />
            </div>
            <div className="space-y-2">
              <Label>Referencia</Label>
              <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Referencia numerica" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Concepto</Label>
              <Input value={concept} onChange={(e) => setConcept(e.target.value)} placeholder="Pago de factura, transferencia, etc." />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Verificar",
      description: "Revisa los datos antes de confirmar",
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-lg border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Beneficiario</span>
              <span className="text-sm font-medium">{beneficiaryName || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Banco</span>
              <span className="text-sm">{beneficiaryBank || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">CLABE</span>
              <span className="font-mono text-sm">{beneficiaryClabe || "—"}</span>
            </div>
            <hr />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Monto</span>
              <span className="text-xl font-bold text-sayo-cafe">{formatMoney(amount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Concepto</span>
              <span className="text-sm">{concept || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Referencia</span>
              <span className="font-mono text-sm">{reference || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cuenta Origen</span>
              <span className="font-mono text-sm">012180001234567890</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Comision</span>
              <span className="text-sm text-green-600">$0.00 (SPEI)</span>
            </div>
          </div>
          {beneficiaryClabe.length !== 18 && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-xs text-red-700">La CLABE debe tener 18 digitos</p>
            </div>
          )}
          {amount > 50000 && (
            <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <p className="text-xs text-yellow-700">Pagos mayores a $50,000 requieren autorización adicional</p>
            </div>
          )}
        </div>
      ),
    },
  ]

  const handleComplete = () => {
    const folio = `PAG-${Date.now().toString().slice(-6)}`
    toast.success("Pago procesado exitosamente", {
      description: `Folio: ${folio} — ${formatMoney(amount)} a ${beneficiaryName}`,
    })
    setBeneficiaryName("")
    setBeneficiaryBank("")
    setBeneficiaryClabe("")
    setAmount(0)
    setConcept("")
    setReference("")
  }

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error) return <ErrorCard message={error} onRetry={refetch} />

  const recentPayments = (treasuryPayments ?? []).filter((p) => p.type === "spei_out").slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Pagos Individuales</h1>
        <p className="text-sm text-muted-foreground">Transferencias SPEI individuales</p>
      </div>

      <WizardSteps
        steps={wizardSteps}
        onComplete={handleComplete}
        completedContent={
          <Card className="bg-green-50 border-green-200">
            <CardContent className="py-8 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-3" />
              <p className="font-semibold text-green-700">Pago procesado exitosamente</p>
              <p className="text-sm text-green-600 mt-1">Folio generado y enviado al beneficiario</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowWizard(true)}>
                Nuevo Pago
              </Button>
            </CardContent>
          </Card>
        }
      />

      <div>
        <h2 className="text-sm font-semibold mb-3">Pagos Recientes</h2>
        <div className="space-y-2">
          {recentPayments.map((p) => (
            <Card key={p.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <Building2 className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{p.beneficiaryName}</p>
                    <p className="text-xs text-muted-foreground">{p.folio} — {p.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums">{formatMoney(p.amount)}</p>
                  <Badge className={p.status === "completado" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"} >{p.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
