"use client"

import { CreditSimulator } from "@/components/dashboard/credit-simulator"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function CotizadorPage() {
  const router = useRouter()

  const handleCreateApplication = (simulation: { amount: number; rate: number; term: number }) => {
    toast.success("Simulación guardada", {
      description: `Monto: $${simulation.amount.toLocaleString()} — Plazo: ${simulation.term} meses — Tasa: ${simulation.rate}%`,
    })
    // Navigate to presolicitud
    router.push("/originacion/presolicitud")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Cotizador de Crédito</h1>
        <p className="text-sm text-muted-foreground">Simula las condiciones del credito y genera tabla de amortizacion</p>
      </div>

      <CreditSimulator
        product="Crédito Cuenta Corriente"
        minAmount={50000}
        maxAmount={5000000}
        minRate={18}
        maxRate={36}
        minTerm={6}
        maxTerm={60}
        onCreateApplication={handleCreateApplication}
      />
    </div>
  )
}
