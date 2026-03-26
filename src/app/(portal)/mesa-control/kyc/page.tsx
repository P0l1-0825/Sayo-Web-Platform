"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  UserCheck,
  AlertTriangle,
  ScanFace,
} from "lucide-react"
import { toast } from "sonner"
import { kycService } from "@/lib/kyc-service"
import type { KycVerification } from "@/lib/kyc-service"

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

type StatusFilter = "all" | KycVerification["status"]

function statusBadge(status: KycVerification["status"]) {
  switch (status) {
    case "verified":
      return (
        <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50 text-[10px]">
          <CheckCircle className="size-3 mr-0.5" /> Aprobado
        </Badge>
      )
    case "rejected":
      return (
        <Badge variant="outline" className="border-red-300 text-red-700 bg-red-50 text-[10px]">
          <XCircle className="size-3 mr-0.5" /> Rechazado
        </Badge>
      )
    case "pending":
      return (
        <Badge variant="outline" className="border-yellow-400 text-yellow-700 bg-yellow-50 text-[10px]">
          <Clock className="size-3 mr-0.5" /> Pendiente
        </Badge>
      )
    case "in_progress":
      return (
        <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50 text-[10px]">
          <Loader2 className="size-3 mr-0.5 animate-spin" /> En Proceso
        </Badge>
      )
    case "expired":
      return (
        <Badge variant="outline" className="text-muted-foreground text-[10px]">
          Expirado
        </Badge>
      )
    default:
      return <Badge variant="outline" className="text-[10px]">{status}</Badge>
  }
}

function jaakBadge(jaakStatus: KycVerification["jaak_status"]) {
  switch (jaakStatus) {
    case "approved":
      return <span className="text-[10px] text-green-700 font-medium">Aprobado</span>
    case "rejected":
      return <span className="text-[10px] text-red-700 font-medium">Rechazado</span>
    case "processing":
      return <span className="text-[10px] text-blue-700 font-medium">Procesando</span>
    case "manual_review":
      return <span className="text-[10px] text-purple-700 font-medium">Revisión Manual</span>
    default:
      return <span className="text-[10px] text-muted-foreground">Pendiente</span>
  }
}

function ScoreBar({ score, max = 100 }: { score: number | null; max?: number }) {
  if (score === null) return <span className="text-xs text-muted-foreground">—</span>
  const pct = Math.min(100, (score / max) * 100)
  const color = pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium tabular-nums w-7 text-right">{score}</span>
    </div>
  )
}

function CheckRow({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      {value ? (
        <CheckCircle className="size-4 text-green-600" />
      ) : (
        <XCircle className="size-4 text-red-400" />
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────

export default function MesaControlKycPage() {
  const [verifications, setVerifications] = React.useState<KycVerification[]>([])
  const [loading, setLoading] = React.useState(true)
  const [stats, setStats] = React.useState({ total: 0, verified: 0, pending: 0, rejected: 0, avgBiometricScore: 0 })

  // Filters
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")

  // Detail / action dialogs
  const [selected, setSelected] = React.useState<KycVerification | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [rejectOpen, setRejectOpen] = React.useState(false)
  const [rejectReason, setRejectReason] = React.useState("")
  const [actionLoading, setActionLoading] = React.useState<string | null>(null)

  React.useEffect(() => {
    Promise.all([kycService.getVerifications(), kycService.getStats()])
      .then(([data, s]) => {
        setVerifications(data)
        setStats(s)
      })
      .catch(() => {
        toast.error("Error al cargar verificaciones KYC")
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = React.useMemo(() => {
    return verifications.filter((v) => {
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        v.id.toLowerCase().includes(q) ||
        v.user_id.toLowerCase().includes(q) ||
        (v.rfc?.toLowerCase().includes(q) ?? false)
      const matchStatus = statusFilter === "all" || v.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [verifications, search, statusFilter])

  async function handleApprove(v: KycVerification) {
    setActionLoading(v.id + "-approve")
    try {
      await kycService.updateVerificationStatus(v.id, "verified")
      setVerifications((prev) =>
        prev.map((item) => (item.id === v.id ? { ...item, status: "verified" } : item))
      )
      if (selected?.id === v.id) setSelected({ ...v, status: "verified" })
      setDetailOpen(false)
      toast.success(`KYC ${v.id} aprobado`)
    } catch {
      toast.error("No se pudo aprobar la verificación")
    } finally {
      setActionLoading(null)
    }
  }

  async function handleRejectConfirm() {
    if (!selected) return
    if (!rejectReason.trim()) {
      toast.error("Ingresa el motivo de rechazo")
      return
    }
    setActionLoading(selected.id + "-reject")
    try {
      await kycService.updateVerificationStatus(selected.id, "rejected", rejectReason)
      setVerifications((prev) =>
        prev.map((item) =>
          item.id === selected.id
            ? { ...item, status: "rejected", rejection_reason: rejectReason }
            : item
        )
      )
      setRejectOpen(false)
      setDetailOpen(false)
      setRejectReason("")
      toast.success(`KYC ${selected.id} rechazado`)
    } catch {
      toast.error("No se pudo rechazar la verificación")
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <span className="text-sm">Cargando verificaciones KYC...</span>
      </div>
    )
  }

  const approvalRate = stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Administración KYC</h1>
        <p className="text-sm text-muted-foreground">
          Verificación de identidad — OCR, liveness y biometría
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <ShieldCheck className="size-5 mx-auto text-[#472913] mb-1" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="size-5 mx-auto text-green-600 mb-1" />
            <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
            <p className="text-xs text-muted-foreground">Aprobados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="size-5 mx-auto text-yellow-500 mb-1" />
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <ScanFace className="size-5 mx-auto text-blue-500 mb-1" />
            <p className="text-2xl font-bold">{approvalRate}%</p>
            <p className="text-xs text-muted-foreground">Tasa Aprobación</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[220px]">
              <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Buscar</p>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="ID, usuario, RFC..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide flex items-center gap-1">
                <Filter className="size-3" /> Estado
              </p>
              <div className="flex flex-wrap gap-1">
                {(["all", "pending", "in_progress", "verified", "rejected", "expired"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2 py-1 rounded-md text-xs font-medium border transition-colors ${
                      statusFilter === s
                        ? "bg-[#472913] text-white border-[#472913]"
                        : "border-input hover:bg-muted/50"
                    }`}
                  >
                    {s === "all"
                      ? "Todos"
                      : s === "pending"
                        ? "Pendiente"
                        : s === "in_progress"
                          ? "En Proceso"
                          : s === "verified"
                            ? "Aprobado"
                            : s === "rejected"
                              ? "Rechazado"
                              : "Expirado"}
                  </button>
                ))}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSearch(""); setStatusFilter("all") }}
            >
              <RefreshCw className="size-3.5 mr-1" />
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        {filtered.length} de {verifications.length} verificaciones
      </p>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <UserCheck className="size-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Sin resultados para los filtros aplicados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">ID</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Usuario</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Nivel</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Estado</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">JAAK</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide w-36">Score Bio.</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Liveness</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Creado</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((v) => (
                    <tr
                      key={v.id}
                      className="hover:bg-muted/20 cursor-pointer transition-colors"
                      onClick={() => { setSelected(v); setDetailOpen(true) }}
                    >
                      <td className="px-4 py-3 font-mono text-xs">{v.id}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{v.user_id}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-[10px]">Nivel {v.level}</Badge>
                      </td>
                      <td className="px-4 py-3">{statusBadge(v.status)}</td>
                      <td className="px-4 py-3">{jaakBadge(v.jaak_status)}</td>
                      <td className="px-4 py-3 w-36">
                        <ScoreBar score={v.biometric_score} />
                      </td>
                      <td className="px-4 py-3">
                        {v.liveness_check ? (
                          <CheckCircle className="size-4 text-green-600" />
                        ) : (
                          <XCircle className="size-4 text-red-400" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(v.created_at).toLocaleDateString("es-MX")}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e) => { e.stopPropagation(); setSelected(v); setDetailOpen(true) }}
                            title="Ver detalles"
                          >
                            <Eye className="size-3.5" />
                          </Button>
                          {(v.status === "pending" || v.status === "in_progress") && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-green-600 hover:bg-green-50"
                                disabled={actionLoading === v.id + "-approve"}
                                onClick={(e) => { e.stopPropagation(); handleApprove(v) }}
                                title="Aprobar"
                              >
                                {actionLoading === v.id + "-approve" ? (
                                  <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle className="size-3.5" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-red-500 hover:bg-red-50"
                                onClick={(e) => { e.stopPropagation(); setSelected(v); setRejectOpen(true) }}
                                title="Rechazar"
                              >
                                <XCircle className="size-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle KYC</DialogTitle>
            <DialogDescription>
              {selected?.id} — Usuario: {selected?.user_id}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  {statusBadge(selected.status)}
                  <Badge variant="outline" className="text-[10px]">Nivel {selected.level}</Badge>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase">Score Biométrico</p>
                  <p className="text-lg font-bold">{selected.biometric_score ?? "—"}</p>
                </div>
              </div>

              {/* OCR / Checklist */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Verificaciones OCR</p>
                <div className="space-y-1.5 rounded-lg border p-3">
                  <CheckRow label="Nombre completo" value={selected.full_name_verified} />
                  <CheckRow label="Email" value={selected.email_verified} />
                  <CheckRow label="Teléfono" value={selected.phone_verified} />
                  <CheckRow label="CURP" value={selected.curp_verified} />
                  <CheckRow label="RFC" value={selected.rfc_verified} />
                  <CheckRow label="Domicilio" value={selected.address_verified} />
                  <CheckRow label="Liveness check" value={selected.liveness_check} />
                </div>
              </div>

              {/* JAAK data */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">ID JAAK</p>
                  <p className="font-mono text-xs">{selected.jaak_verification_id ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Estado JAAK</p>
                  {jaakBadge(selected.jaak_status)}
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">RFC</p>
                  <p className="font-mono text-xs">{selected.rfc ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Verificado el</p>
                  <p className="text-xs">{selected.verified_at ? new Date(selected.verified_at).toLocaleDateString("es-MX") : "—"}</p>
                </div>
              </div>

              {selected.rejection_reason && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="size-4 text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold text-red-700 uppercase">Motivo de Rechazo</p>
                      <p className="text-sm text-red-700">{selected.rejection_reason}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selected && (selected.status === "pending" || selected.status === "in_progress") && (
              <>
                <Button
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                  disabled={actionLoading === selected.id + "-approve"}
                  onClick={() => handleApprove(selected)}
                >
                  {actionLoading === selected.id + "-approve" ? (
                    <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <CheckCircle className="size-3.5 mr-1.5" />
                  )}
                  Aprobar
                </Button>
                <Button
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => { setDetailOpen(false); setRejectOpen(true) }}
                >
                  <XCircle className="size-3.5 mr-1.5" />
                  Rechazar
                </Button>
              </>
            )}
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="size-5 text-red-500" />
              Rechazar Verificación
            </DialogTitle>
            <DialogDescription>
              {selected?.id} — Usuario: {selected?.user_id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Motivo de Rechazo *</label>
              <Input
                placeholder="Ej: Liveness check fallido, documentos ilegibles..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={actionLoading !== null}
              onClick={handleRejectConfirm}
            >
              {actionLoading !== null ? <Loader2 className="size-3.5 mr-1.5 animate-spin" /> : <XCircle className="size-3.5 mr-1.5" />}
              Confirmar Rechazo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
