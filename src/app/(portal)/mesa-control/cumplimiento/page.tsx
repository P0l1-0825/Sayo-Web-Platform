"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  ShieldCheck,
  AlertTriangle,
  Search,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Eye,
  ListChecks,
  ScrollText,
  Scale,
} from "lucide-react"
import { toast } from "sonner"
import { isDemoMode } from "@/lib/api-client"

// ────────────────────────────────────────────────────────────
// Demo Data
// ────────────────────────────────────────────────────────────

interface PepResult {
  id: string
  name: string
  user_id: string
  lists_checked: string[]
  match_found: boolean
  match_score: number | null
  checked_at: string
  status: "clean" | "flagged" | "under_review"
}

interface ComplianceAlert {
  id: string
  title: string
  description: string
  severity: "critica" | "alta" | "media" | "baja"
  status: "activa" | "investigando" | "resuelta"
  created_at: string
}

interface AuditEntry {
  id: string
  action: string
  entity: string
  entity_id: string
  user: string
  timestamp: string
  result: "success" | "failure"
}

const demoPepResults: PepResult[] = [
  { id: "pep-001", name: "Juan Pérez García", user_id: "user-001", lists_checked: ["OFAC/SDN", "PEP MX", "ONU"], match_found: false, match_score: null, checked_at: "2026-03-24", status: "clean" },
  { id: "pep-002", name: "María López Vega", user_id: "user-002", lists_checked: ["OFAC/SDN", "PEP MX"], match_found: true, match_score: 87, checked_at: "2026-03-23", status: "flagged" },
  { id: "pep-003", name: "Carlos Ruiz Mendoza", user_id: "user-003", lists_checked: ["OFAC/SDN", "PEP MX", "ONU", "INTERPOL"], match_found: false, match_score: null, checked_at: "2026-03-22", status: "clean" },
  { id: "pep-004", name: "Ana Torres Sánchez", user_id: "user-004", lists_checked: ["OFAC/SDN", "PEP MX"], match_found: true, match_score: 62, checked_at: "2026-03-21", status: "under_review" },
  { id: "pep-005", name: "Roberto Flores Díaz", user_id: "user-005", lists_checked: ["OFAC/SDN", "PEP MX", "ONU"], match_found: false, match_score: null, checked_at: "2026-03-20", status: "clean" },
]

const demoAlerts: ComplianceAlert[] = [
  { id: "ALRT-001", title: "Transferencia inusual >$500K", description: "Transferencia de $750,000 MXN hacia cuenta no registrada, cliente con perfil de riesgo bajo.", severity: "alta", status: "activa", created_at: "2026-03-25" },
  { id: "ALRT-002", title: "Múltiples intentos de login fallidos", description: "12 intentos fallidos en menos de 5 minutos desde IP extranjera.", severity: "media", status: "investigando", created_at: "2026-03-24" },
  { id: "ALRT-003", title: "Posible match en lista OFAC", description: "Coincidencia del 87% con nombre en lista SDN. En revisión manual.", severity: "critica", status: "activa", created_at: "2026-03-24" },
  { id: "ALRT-004", title: "Patrón de fraccionamiento detectado", description: "5 transacciones de $9,800 MXN en 3 días con distintos beneficiarios.", severity: "alta", status: "resuelta", created_at: "2026-03-22" },
]

const demoAuditLog: AuditEntry[] = [
  { id: "aud-001", action: "KYC Aprobado", entity: "KycVerification", entity_id: "kyc-001", user: "carlos.mendoza@sayo.mx", timestamp: "2026-03-25 09:14:22", result: "success" },
  { id: "aud-002", action: "Tarjeta Bloqueada", entity: "Card", entity_id: "card-007", user: "carlos.mendoza@sayo.mx", timestamp: "2026-03-25 09:02:11", result: "success" },
  { id: "aud-003", action: "Alerta Escalada", entity: "ComplianceAlert", entity_id: "ALRT-001", user: "carlos.mendoza@sayo.mx", timestamp: "2026-03-24 18:45:00", result: "success" },
  { id: "aud-004", action: "Exportación de Datos", entity: "Report", entity_id: "RPT-2026-03", user: "carlos.mendoza@sayo.mx", timestamp: "2026-03-24 17:30:00", result: "success" },
  { id: "aud-005", action: "Intento de Acceso No Autorizado", entity: "User", entity_id: "user-999", user: "unknown", timestamp: "2026-03-24 14:10:05", result: "failure" },
]

const cnbvChecklist = [
  { item: "Política PLD/FT actualizada", status: true, dueDate: "2026-06-30" },
  { item: "Manual de Procedimientos Aprobado", status: true, dueDate: "2026-06-30" },
  { item: "Oficial de Cumplimiento Designado", status: true, dueDate: "Permanente" },
  { item: "Capacitación Semestral al Personal", status: false, dueDate: "2026-04-15" },
  { item: "Reporte ROI enviado a UIF", status: true, dueDate: "2026-03-31" },
  { item: "Evaluación de Riesgo Institucional", status: false, dueDate: "2026-05-01" },
  { item: "Auditoría Interna PLD completada", status: true, dueDate: "2026-02-28" },
  { item: "Reporte de operaciones a CNBV", status: true, dueDate: "2026-03-31" },
]

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function severityBadge(severity: ComplianceAlert["severity"]) {
  switch (severity) {
    case "critica":
      return <Badge variant="outline" className="border-red-400 text-red-700 bg-red-50 text-[10px]">Critica</Badge>
    case "alta":
      return <Badge variant="outline" className="border-orange-400 text-orange-700 bg-orange-50 text-[10px]">Alta</Badge>
    case "media":
      return <Badge variant="outline" className="border-yellow-400 text-yellow-700 bg-yellow-50 text-[10px]">Media</Badge>
    case "baja":
      return <Badge variant="outline" className="text-muted-foreground text-[10px]">Baja</Badge>
  }
}

function alertStatusBadge(status: ComplianceAlert["status"]) {
  switch (status) {
    case "activa":
      return <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] bg-red-100 text-red-700"><AlertTriangle className="size-3" /> Activa</span>
    case "investigando":
      return <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] bg-blue-100 text-blue-700"><Clock className="size-3" /> Investigando</span>
    case "resuelta":
      return <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] bg-green-100 text-green-700"><CheckCircle className="size-3" /> Resuelta</span>
  }
}

// ────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────

type ActiveTab = "alertas" | "pep" | "checklist" | "auditoria" | "uif"

export default function MesaControlCumplimientoPage() {
  const [activeTab, setActiveTab] = React.useState<ActiveTab>("alertas")
  const [alerts, setAlerts] = React.useState<ComplianceAlert[]>(demoAlerts)
  const [selectedAlert, setSelectedAlert] = React.useState<ComplianceAlert | null>(null)
  const [alertDetailOpen, setAlertDetailOpen] = React.useState(false)
  const [selectedPep, setSelectedPep] = React.useState<PepResult | null>(null)
  const [pepDetailOpen, setPepDetailOpen] = React.useState(false)
  const [uifOpen, setUifOpen] = React.useState(false)
  const [loading] = React.useState(false)

  const _ = isDemoMode // ensure demo mode flag is read

  const activeAlerts = alerts.filter((a) => a.status === "activa").length
  const criticalAlerts = alerts.filter((a) => a.severity === "critica").length
  const pepFlagged = demoPepResults.filter((p) => p.match_found).length
  const checklistPct = Math.round((cnbvChecklist.filter((c) => c.status).length / cnbvChecklist.length) * 100)

  function handleInvestigar(alert: ComplianceAlert) {
    setAlerts((prev) => prev.map((a) => a.id === alert.id ? { ...a, status: "investigando" as const } : a))
    toast.info("Alerta en investigación", { description: alert.id })
  }

  function handleResolve(alert: ComplianceAlert) {
    setAlerts((prev) => prev.map((a) => a.id === alert.id ? { ...a, status: "resuelta" as const } : a))
    setAlertDetailOpen(false)
    toast.success("Alerta resuelta", { description: alert.id })
  }

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: "alertas", label: "Alertas", icon: <AlertTriangle className="size-3.5" /> },
    { id: "pep", label: "PEP / Sanciones", icon: <Search className="size-3.5" /> },
    { id: "checklist", label: "Checklist CNBV", icon: <ListChecks className="size-3.5" /> },
    { id: "auditoria", label: "Auditoría", icon: <ScrollText className="size-3.5" /> },
    { id: "uif", label: "Reportes UIF", icon: <FileText className="size-3.5" /> },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <span className="text-sm">Cargando cumplimiento...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Cumplimiento Regulatorio</h1>
        <p className="text-sm text-muted-foreground">PEP/Sanciones, alertas, UIF y checklist CNBV — Mesa de Control</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="size-5 mx-auto text-red-500 mb-1" />
            <p className="text-2xl font-bold text-red-600">{activeAlerts}</p>
            <p className="text-xs text-muted-foreground">Alertas Activas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <ShieldCheck className="size-5 mx-auto text-orange-500 mb-1" />
            <p className="text-2xl font-bold text-orange-600">{criticalAlerts}</p>
            <p className="text-xs text-muted-foreground">Alertas Críticas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Search className="size-5 mx-auto text-purple-500 mb-1" />
            <p className="text-2xl font-bold text-purple-600">{pepFlagged}</p>
            <p className="text-xs text-muted-foreground">PEP Flaggeados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Scale className="size-5 mx-auto text-[#472913] mb-1" />
            <p className="text-2xl font-bold">{checklistPct}%</p>
            <p className="text-xs text-muted-foreground">CNBV Cumplimiento</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 flex-wrap border-b pb-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-md border-b-2 transition-colors ${
              activeTab === t.id
                ? "border-[#472913] text-[#472913] bg-muted/30"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20"
            }`}
          >
            {t.icon} {t.label}
            {t.id === "alertas" && activeAlerts > 0 && (
              <span className="ml-1 bg-red-500 text-white text-[9px] rounded-full px-1.5 py-0.5 font-bold">{activeAlerts}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Alertas */}
      {activeTab === "alertas" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">ID</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Alerta</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Severidad</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Estado</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Fecha</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {alerts.map((a) => (
                    <tr
                      key={a.id}
                      className="hover:bg-muted/20 cursor-pointer transition-colors"
                      onClick={() => { setSelectedAlert(a); setAlertDetailOpen(true) }}
                    >
                      <td className="px-4 py-3 font-mono text-xs">{a.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-sm">{a.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{a.description}</p>
                      </td>
                      <td className="px-4 py-3">{severityBadge(a.severity)}</td>
                      <td className="px-4 py-3">{alertStatusBadge(a.status)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{a.created_at}</td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); setSelectedAlert(a); setAlertDetailOpen(true) }}>
                            <Eye className="size-3.5" />
                          </Button>
                          {a.status === "activa" && (
                            <Button variant="ghost" size="icon-sm" className="text-blue-600 hover:bg-blue-50" onClick={(e) => { e.stopPropagation(); handleInvestigar(a) }}>
                              <Clock className="size-3.5" />
                            </Button>
                          )}
                          {a.status !== "resuelta" && (
                            <Button variant="ghost" size="icon-sm" className="text-green-600 hover:bg-green-50" onClick={(e) => { e.stopPropagation(); handleResolve(a) }}>
                              <CheckCircle className="size-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab: PEP */}
      {activeTab === "pep" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">ID Check</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Nombre</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Usuario</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Listas</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Match</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Score</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Estado</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {demoPepResults.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-muted/20 cursor-pointer transition-colors"
                      onClick={() => { setSelectedPep(p); setPepDetailOpen(true) }}
                    >
                      <td className="px-4 py-3 font-mono text-xs">{p.id}</td>
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.user_id}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {p.lists_checked.map((l) => (
                            <Badge key={l} variant="outline" className="text-[9px] py-0">{l}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {p.match_found ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-red-700 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
                            <AlertTriangle className="size-3" /> Match
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                            <CheckCircle className="size-3" /> Limpio
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-sm font-medium">
                        {p.match_score !== null ? (
                          <span className={p.match_score >= 80 ? "text-red-700" : "text-yellow-700"}>
                            {p.match_score}%
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {p.status === "clean" && <Badge variant="outline" className="border-green-300 text-green-700 text-[10px]">Limpio</Badge>}
                        {p.status === "flagged" && <Badge variant="outline" className="border-red-300 text-red-700 text-[10px]">Flaggeado</Badge>}
                        {p.status === "under_review" && <Badge variant="outline" className="border-yellow-400 text-yellow-700 text-[10px]">En Revisión</Badge>}
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); setSelectedPep(p); setPepDetailOpen(true) }}>
                          <Eye className="size-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab: Checklist CNBV */}
      {activeTab === "checklist" && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <ListChecks className="size-4" /> Checklist de Cumplimiento CNBV
              </h2>
              <Badge variant="outline" className={`text-[10px] ${checklistPct >= 80 ? "border-green-300 text-green-700" : "border-yellow-400 text-yellow-700"}`}>
                {cnbvChecklist.filter((c) => c.status).length}/{cnbvChecklist.length} completados
              </Badge>
            </div>
            <div className="w-full h-2 bg-muted rounded-full mb-4">
              <div
                className={`h-2 rounded-full transition-all ${checklistPct >= 80 ? "bg-green-500" : "bg-yellow-500"}`}
                style={{ width: `${checklistPct}%` }}
              />
            </div>
            <div className="space-y-2">
              {cnbvChecklist.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {item.status ? (
                      <CheckCircle className="size-5 text-green-600 shrink-0" />
                    ) : (
                      <XCircle className="size-5 text-red-400 shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{item.item}</p>
                      <p className="text-[10px] text-muted-foreground">Vence: {item.dueDate}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${item.status ? "border-green-300 text-green-700" : "border-red-300 text-red-700"}`}
                  >
                    {item.status ? "Completado" : "Pendiente"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab: Auditoría */}
      {activeTab === "auditoria" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">ID</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Acción</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Entidad</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">ID Entidad</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Usuario</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Timestamp</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {demoAuditLog.map((entry) => (
                    <tr key={entry.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{entry.id}</td>
                      <td className="px-4 py-3 font-medium">{entry.action}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-[10px]">{entry.entity}</Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{entry.entity_id}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{entry.user}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{entry.timestamp}</td>
                      <td className="px-4 py-3">
                        {entry.result === "success" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-green-700 bg-green-50 rounded-full px-2 py-0.5">
                            <CheckCircle className="size-3" /> OK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-red-700 bg-red-50 rounded-full px-2 py-0.5">
                            <XCircle className="size-3" /> Error
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab: Reportes UIF */}
      {activeTab === "uif" && (
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#472913]/10 flex items-center justify-center mx-auto">
              <FileText className="size-8 text-[#472913]" />
            </div>
            <h2 className="text-lg font-semibold">Generación de Reportes UIF</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Los reportes de Operaciones Inusuales (ROI) y de 24 horas se generan desde el módulo de Cumplimiento PLD/FT.
              Aquí puedes iniciar un nuevo reporte de alerta relacionada a Mesa de Control.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left">
              {[
                { type: "ROI", desc: "Reporte de Operaciones Inusuales", color: "border-red-200 bg-red-50" },
                { type: "ROP", desc: "Reporte de Operaciones Preocupantes", color: "border-orange-200 bg-orange-50" },
                { type: "RO24H", desc: "Reporte de 24 horas (urgente)", color: "border-yellow-200 bg-yellow-50" },
              ].map((r) => (
                <div key={r.type} className={`p-3 rounded-lg border ${r.color}`}>
                  <p className="text-sm font-bold">{r.type}</p>
                  <p className="text-[11px] text-muted-foreground">{r.desc}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 h-7 text-xs w-full"
                    onClick={() => setUifOpen(true)}
                  >
                    Generar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert Detail Dialog */}
      <Dialog open={alertDetailOpen} onOpenChange={setAlertDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de Alerta</DialogTitle>
            <DialogDescription>{selectedAlert?.id}</DialogDescription>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {severityBadge(selectedAlert.severity)}
                {alertStatusBadge(selectedAlert.status)}
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Título</p>
                <p className="font-medium">{selectedAlert.title}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Descripción</p>
                <p className="text-sm">{selectedAlert.description}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Fecha</p>
                <p className="text-sm">{selectedAlert.created_at}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedAlert && selectedAlert.status === "activa" && (
              <Button variant="outline" size="sm" onClick={() => handleInvestigar(selectedAlert)}>
                <Clock className="size-3.5 mr-1" /> Investigar
              </Button>
            )}
            {selectedAlert && selectedAlert.status !== "resuelta" && (
              <Button variant="outline" size="sm" className="text-green-700 border-green-300" onClick={() => handleResolve(selectedAlert)}>
                <CheckCircle className="size-3.5 mr-1" /> Resolver
              </Button>
            )}
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PEP Detail Dialog */}
      <Dialog open={pepDetailOpen} onOpenChange={setPepDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle Screening PEP/Sanciones</DialogTitle>
            <DialogDescription>{selectedPep?.id}</DialogDescription>
          </DialogHeader>
          {selectedPep && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-bold">{selectedPep.name}</p>
                <p className="font-mono text-xs text-muted-foreground">{selectedPep.user_id}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Match Encontrado</p>
                  {selectedPep.match_found ? (
                    <span className="text-red-700 font-medium flex items-center gap-1"><AlertTriangle className="size-4" /> Sí</span>
                  ) : (
                    <span className="text-green-700 font-medium flex items-center gap-1"><CheckCircle className="size-4" /> No</span>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Score de Match</p>
                  <p className="font-bold">{selectedPep.match_score !== null ? `${selectedPep.match_score}%` : "—"}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase mb-1.5">Listas Verificadas</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPep.lists_checked.map((l) => (
                    <Badge key={l} variant="outline" className="text-xs">{l}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Fecha de Verificación</p>
                <p className="text-sm">{selectedPep.checked_at}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* UIF Placeholder Dialog */}
      <Dialog open={uifOpen} onOpenChange={setUifOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Generación de Reporte UIF</DialogTitle>
            <DialogDescription>Esta funcionalidad requiere acceso al módulo de Cumplimiento PLD/FT.</DialogDescription>
          </DialogHeader>
          <div className="p-4 rounded-lg bg-muted/50 text-sm text-center text-muted-foreground">
            Los reportes UIF (ROI, ROP, RO24H) se generan únicamente desde el portal de Cumplimiento PLD/FT con rol L3_PLD o superior.
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Entendido</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
