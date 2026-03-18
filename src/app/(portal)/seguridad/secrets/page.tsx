"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Key, ShieldAlert, RotateCcw, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface Secret {
  id: string; nombre: string; tipo: "API Key" | "OAuth" | "DB Credential" | "JWT Secret" | "Webhook"; servicio: string; entorno: "produccion" | "staging" | "desarrollo"; ultimaRotacion: string; expira: string; status: "activo" | "por-rotar" | "expirado" | "revocado"
}

const demoSecrets: Secret[] = [
  { id: "SEC-001", nombre: "STRIPE_SECRET_KEY", tipo: "API Key", servicio: "Stripe Payments", entorno: "produccion", ultimaRotacion: "2026-02-15", expira: "2026-08-15", status: "activo" },
  { id: "SEC-002", nombre: "BURODECREDITO_TOKEN", tipo: "API Key", servicio: "Buró de Crédito", entorno: "produccion", ultimaRotacion: "2025-12-01", expira: "2026-03-25", status: "por-rotar" },
  { id: "SEC-003", nombre: "DB_MASTER_PASSWORD", tipo: "DB Credential", servicio: "Cloud SQL", entorno: "produccion", ultimaRotacion: "2026-01-10", expira: "2026-04-10", status: "activo" },
  { id: "SEC-004", nombre: "JWT_SIGNING_KEY", tipo: "JWT Secret", servicio: "Auth Service", entorno: "produccion", ultimaRotacion: "2026-03-01", expira: "2026-09-01", status: "activo" },
  { id: "SEC-005", nombre: "TWILIO_AUTH_TOKEN", tipo: "API Key", servicio: "Twilio SMS", entorno: "produccion", ultimaRotacion: "2025-10-15", expira: "2026-03-15", status: "expirado" },
  { id: "SEC-006", nombre: "OAUTH_CLIENT_SECRET", tipo: "OAuth", servicio: "Google OAuth", entorno: "produccion", ultimaRotacion: "2026-01-20", expira: "2027-01-20", status: "activo" },
  { id: "SEC-007", nombre: "WEBHOOK_SIGNING_KEY", tipo: "Webhook", servicio: "STP", entorno: "produccion", ultimaRotacion: "2026-02-28", expira: "2026-08-28", status: "activo" },
  { id: "SEC-008", nombre: "STRIPE_TEST_KEY", tipo: "API Key", servicio: "Stripe Payments", entorno: "staging", ultimaRotacion: "2025-09-01", expira: "2026-03-01", status: "expirado" },
]

export default function SecretsPage() {
  const [secrets] = React.useState(demoSecrets)
  const activos = secrets.filter((s) => s.status === "activo").length
  const porRotar = secrets.filter((s) => s.status === "por-rotar").length
  const expirados = secrets.filter((s) => s.status === "expirado").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">API Keys y Secrets</h1>
        <p className="text-sm text-muted-foreground">Inventario, rotación y alertas de expiración</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><Key className="size-5 mx-auto text-muted-foreground mb-1" /><p className="text-2xl font-bold">{secrets.length}</p><p className="text-xs text-muted-foreground">Total Secrets</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><CheckCircle className="size-5 mx-auto text-sayo-green mb-1" /><p className="text-2xl font-bold text-sayo-green">{activos}</p><p className="text-xs text-muted-foreground">Activos</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><AlertTriangle className="size-5 mx-auto text-sayo-orange mb-1" /><p className="text-2xl font-bold text-sayo-orange">{porRotar}</p><p className="text-xs text-muted-foreground">Por Rotar</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><ShieldAlert className="size-5 mx-auto text-sayo-red mb-1" /><p className="text-2xl font-bold text-sayo-red">{expirados}</p><p className="text-xs text-muted-foreground">Expirados</p></CardContent></Card>
      </div>

      <Card><CardContent className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-muted-foreground">
              <th className="pb-2">Nombre</th><th className="pb-2">Tipo</th><th className="pb-2">Servicio</th><th className="pb-2">Entorno</th><th className="pb-2">Última Rotación</th><th className="pb-2">Expira</th><th className="pb-2">Estado</th><th className="pb-2"></th>
            </tr></thead>
            <tbody>{secrets.map((s) => (
              <tr key={s.id} className="border-b last:border-0 hover:bg-muted/50">
                <td className="py-2 font-mono text-xs">{s.nombre}</td>
                <td className="py-2"><Badge variant="outline" className="text-[10px]">{s.tipo}</Badge></td>
                <td className="py-2 text-xs">{s.servicio}</td>
                <td className="py-2"><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${s.entorno === "produccion" ? "bg-red-50 text-red-700" : s.entorno === "staging" ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-700"}`}>{s.entorno}</span></td>
                <td className="py-2 text-xs tabular-nums">{s.ultimaRotacion}</td>
                <td className="py-2 text-xs tabular-nums">{s.expira}</td>
                <td className="py-2"><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${s.status === "activo" ? "bg-green-100 text-green-700" : s.status === "por-rotar" ? "bg-yellow-100 text-yellow-700" : s.status === "expirado" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>{s.status}</span></td>
                <td className="py-2"><Button variant="ghost" size="icon-xs" onClick={() => toast.success(`Rotación iniciada para ${s.nombre}`)} title="Rotar"><RotateCcw className="size-3.5" /></Button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </CardContent></Card>
    </div>
  )
}
