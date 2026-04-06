"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  PlusCircle,
  FileText,
  ScrollText,
  ExternalLink,
  BarChart3,
  Activity,
  Shield,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { toast } from "sonner"
import { kycService } from "@/lib/kyc-service"
import { api, isDemoMode } from "@/lib/api-client"
import { formatDateTime, formatDate, timeAgo } from "@/lib/utils"
import type { KycVerification, KycDocument } from "@/lib/kyc-service"

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

interface KycStats {
  total: number
  pending: number
  in_progress: number
  approved: number
  rejected: number
  expired: number
  approval_rate: number
  avg_processing_hours: number
  avgBiometricScore: number
  // legacy compat
  verified?: number
}

interface AuditEntry {
  id: string
  action: string
  entity_id: string
  performed_by: string
  performed_by_email: string
  status_before: string | null
  status_after: string | null
  notes: string | null
  created_at: string
}

interface InitiateKycPayload {
  user_email: string
  level: number
  notes?: string
}

interface InitiateKycResult {
  session_id: string
  verification_id: string
  kyc_url: string
}

type StatusFilter = "all" | KycVerification["status"]
type LevelFilter = "all" | "1" | "2" | "3"
type ActiveTab = "verifications" | "audit"

// ────────────────────────────────────────────────────────────
// Demo Data
// ────────────────────────────────────────────────────────────

const demoAuditLog: AuditEntry[] = [
  { id: "aud-k-001", action: "KYC Aprobado", entity_id: "kyc-001", performed_by: "admin-001", performed_by_email: "carlos.mendoza@sayo.mx", status_before: "in_progress", status_after: "verified", notes: "Todo correcto, biometría 95/100", created_at: "2026-04-05T09:14:22Z" },
  { id: "aud-k-002", action: "KYC Rechazado", entity_id: "kyc-004", performed_by: "admin-001", performed_by_email: "carlos.mendoza@sayo.mx", status_before: "in_progress", status_after: "rejected", notes: "Liveness check fallido, posible suplantación", created_at: "2026-04-04T18:33:10Z" },
  { id: "aud-k-003", action: "KYC Iniciado (Admin)", entity_id: "kyc-005", performed_by: "admin-002", performed_by_email: "ana.torres@sayo.mx", status_before: null, status_after: "pending", notes: "Solicitud manual por soporte", created_at: "2026-04-04T14:05:00Z" },
  { id: "aud-k-004", action: "KYC Asignado", entity_id: "kyc-003", performed_by: "admin-001", performed_by_email: "carlos.mendoza@sayo.mx", status_before: "pending", status_after: "in_progress", notes: null, created_at: "2026-04-03T11:20:45Z" },
  { id: "aud-k-005", action: "Documento Revisado", entity_id: "kyc-002", performed_by: "admin-002", performed_by_email: "ana.torres@sayo.mx", status_before: null, status_after: null, notes: "INE frente aprobada", created_at: "2026-04-03T09:58:30Z" },
  { id: "aud-k-006", action: "KYC Expirado", entity_id: "kyc-006", performed_by: "system", performed_by_email: "system@sayo.mx", status_before: "pending", status_after: "expired", notes: "Expirado automáticamente a los 30 días sin completar", created_at: "2026-04-02T00:00:00Z" },
]

const demoStats: KycStats = {
  total: 42,
  pending: 8,
  in_progress: 5,
  approved: 25,
  rejected: 3,
  expired: 1,
  approval_rate: 80,
  avg_processing_hours: 18,
  avgBiometricScore: 87,
}

// ────────────────────────────────────────────────────────────
// Helpers — Status & Level Badges
// ────────────────────────────────────────────────────────────

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
          <Clock className="size-3 mr-0.5" /> Expirado
        </Badge>
      )
    default:
      return <Badge variant="outline" className="text-[10px]">{status}</Badge>
  }
}

function jaakBadge(jaakStatus: KycVerification["jaak_status"]) {
  switch (jaakStatus) {
    case "approved":
      return <span className="inline-flex items-center gap-1 text-[10px] text-green-700 font-medium"><CheckCircle className="size-3" />Aprobado</span>
    case "rejected":
      return <span className="inline-flex items-center gap-1 text-[10px] text-red-700 font-medium"><XCircle className="size-3" />Rechazado</span>
    case "processing":
      return <span className="inline-flex items-center gap-1 text-[10px] text-blue-700 font-medium"><Loader2 className="size-3 animate-spin" />Procesando</span>
    case "manual_review":
      return <span className="inline-flex items-center gap-1 text-[10px] text-purple-700 font-medium"><AlertTriangle className="size-3" />Rev. Manual</span>
    default:
      return <span className="text-[10px] text-muted-foreground">Pendiente</span>
  }
}

function levelBadge(level: number) {
  const colors: Record<number, string> = {
    1: "border-slate-300 text-slate-700",
    2: "border-blue-300 text-blue-700",
    3: "border-purple-300 text-purple-700",
  }
  return (
    <Badge variant="outline" className={`text-[10px] ${colors[level] ?? ""}`}>
      L{level}
    </Badge>
  )
}

function ScoreBar({ score, max = 100 }: { score: number | null; max?: number }) {
  if (score === null) return <span className="text-xs text-muted-foreground">—</span>
  const pct = Math.min(100, (score / max) * 100)
  const color = pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"
  return (
    <div className="flex items-center gap-2 min-w-[6rem]">
      <div className="flex-1 h-1.5 bg-muted rounded-full">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium tabular-nums w-7 text-right">{score}</span>
    </div>
  )
}

function CheckRow({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm py-1">
      <span className="text-muted-foreground">{label}</span>
      {value ? (
        <CheckCircle className="size-4 text-green-600 shrink-0" />
      ) : (
        <XCircle className="size-4 text-red-400 shrink-0" />
      )}
    </div>
  )
}

function DocItem({ doc }: { doc: KycDocument }) {
  const isPdf = doc.mime_type === "application/pdf"
  const sizeKb = doc.file_size ? `${Math.round(doc.file_size / 1024)} KB` : null

  return (
    <div className="flex items-center justify-between p-2 rounded-lg border text-sm">
      <div className="flex items-center gap-2 min-w-0">
        <FileText className="size-4 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <p className="font-medium truncate">{doc.document_type}</p>
          <p className="text-[10px] text-muted-foreground">
            {doc.file_name ?? "archivo"}{sizeKb ? ` · ${sizeKb}` : ""}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {doc.status === "approved" && (
          <Badge variant="outline" className="border-green-300 text-green-700 text-[9px]">OK</Badge>
        )}
        {doc.status === "rejected" && (
          <Badge variant="outline" className="border-red-300 text-red-700 text-[9px]">Rechazado</Badge>
        )}
        {doc.status === "pending" && (
          <Badge variant="outline" className="border-yellow-400 text-yellow-700 text-[9px]">Pendiente</Badge>
        )}
        {!isPdf && (
          <a
            href={doc.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Abrir documento"
          >
            <ExternalLink className="size-3.5" />
          </a>
        )}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────

export default function MesaControlKycPage() {
  // ── Data state ──────────────────────────────────────────
  const [verifications, setVerifications] = React.useState<KycVerification[]>([])
  const [stats, setStats] = React.useState<KycStats>(demoStats)
  const [auditLog, setAuditLog] = React.useState<AuditEntry[]>(demoAuditLog)
  const [documents, setDocuments] = React.useState<KycDocument[]>([])
  const [loadingDocs, setLoadingDocs] = React.useState(false)

  // ── UI state ────────────────────────────────────────────
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<ActiveTab>("verifications")

  // ── Filters ─────────────────────────────────────────────
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")
  const [levelFilter, setLevelFilter] = React.useState<LevelFilter>("all")
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")
  const [filtersExpanded, setFiltersExpanded] = React.useState(false)

  // ── Detail dialog ────────────────────────────────────────
  const [selected, setSelected] = React.useState<KycVerification | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  // ── Reject dialog ────────────────────────────────────────
  const [rejectOpen, setRejectOpen] = React.useState(false)
  const [rejectReason, setRejectReason] = React.useState("")
  const [actionLoading, setActionLoading] = React.useState<string | null>(null)

  // ── Initiate KYC dialog ──────────────────────────────────
  const [initiateOpen, setInitiateOpen] = React.useState(false)
  const [initiateEmail, setInitiateEmail] = React.useState("")
  const [initiateLevel, setInitiateLevel] = React.useState<"1" | "2" | "3">("1")
  const [initiateNotes, setInitiateNotes] = React.useState("")
  const [initiateLoading, setInitiateLoading] = React.useState(false)
  const [initiateResult, setInitiateResult] = React.useState<InitiateKycResult | null>(null)

  // ── Confirm approve dialog ───────────────────────────────
  const [approveOpen, setApproveOpen] = React.useState(false)
  const [pendingApprove, setPendingApprove] = React.useState<KycVerification | null>(null)

  // ────────────────────────────────────────────────────────
  // Data loading
  // ────────────────────────────────────────────────────────

  async function loadAll(isRefresh = false) {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const [data, s] = await Promise.all([
        kycService.getVerifications(),
        kycService.getStats(),
      ])
      setVerifications(data)

      // Normalize stats — backend returns `approved`, legacy returns `verified`
      const rawStats = s as KycStats & { verified?: number }
      setStats({
        total: rawStats.total ?? 0,
        pending: rawStats.pending ?? 0,
        in_progress: rawStats.in_progress ?? 0,
        approved: rawStats.approved ?? rawStats.verified ?? 0,
        rejected: rawStats.rejected ?? 0,
        expired: rawStats.expired ?? 0,
        approval_rate: rawStats.approval_rate ?? (rawStats.total ? Math.round(((rawStats.approved ?? rawStats.verified ?? 0) / rawStats.total) * 100) : 0),
        avg_processing_hours: rawStats.avg_processing_hours ?? 0,
        avgBiometricScore: rawStats.avgBiometricScore ?? 0,
      })

      // Load audit trail
      if (!isDemoMode) {
        try {
          const audit = await api.get<AuditEntry[]>("/api/v1/kyc/audit")
          setAuditLog(audit)
        } catch {
          // Non-critical — keep demo data
        }
      }
    } catch {
      toast.error("Error al cargar verificaciones KYC")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  React.useEffect(() => {
    loadAll()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadDocuments(v: KycVerification) {
    setDocuments([])
    setLoadingDocs(true)
    try {
      const docs = await kycService.getDocuments(v.user_id)
      setDocuments(docs.filter((d) => d.kyc_id === v.id || d.user_id === v.user_id))
    } catch {
      // Documents are non-critical
    } finally {
      setLoadingDocs(false)
    }
  }

  function openDetail(v: KycVerification) {
    setSelected(v)
    setDetailOpen(true)
    loadDocuments(v)
  }

  // ────────────────────────────────────────────────────────
  // Filtering
  // ────────────────────────────────────────────────────────

  const filtered = React.useMemo(() => {
    return verifications.filter((v) => {
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        v.id.toLowerCase().includes(q) ||
        v.user_id.toLowerCase().includes(q) ||
        (v.rfc?.toLowerCase().includes(q) ?? false)
      const matchStatus = statusFilter === "all" || v.status === statusFilter
      const matchLevel = levelFilter === "all" || v.level === Number(levelFilter)
      const matchFrom = !dateFrom || v.created_at >= dateFrom
      const matchTo = !dateTo || v.created_at <= dateTo + "T23:59:59"
      return matchSearch && matchStatus && matchLevel && matchFrom && matchTo
    })
  }, [verifications, search, statusFilter, levelFilter, dateFrom, dateTo])

  const hasActiveFilters = search || statusFilter !== "all" || levelFilter !== "all" || dateFrom || dateTo

  function clearFilters() {
    setSearch("")
    setStatusFilter("all")
    setLevelFilter("all")
    setDateFrom("")
    setDateTo("")
  }

  // ────────────────────────────────────────────────────────
  // Actions
  // ────────────────────────────────────────────────────────

  async function handleApproveConfirm() {
    if (!pendingApprove) return
    const v = pendingApprove
    setActionLoading(v.id + "-approve")
    try {
      await kycService.updateVerificationStatus(v.id, "verified")
      setVerifications((prev) =>
        prev.map((item) => (item.id === v.id ? { ...item, status: "verified" } : item))
      )
      if (selected?.id === v.id) setSelected({ ...v, status: "verified" })
      setApproveOpen(false)
      setDetailOpen(false)
      toast.success("KYC aprobado", { description: `Verificación ${v.id} marcada como aprobada` })
    } catch {
      toast.error("No se pudo aprobar la verificación")
    } finally {
      setActionLoading(null)
      setPendingApprove(null)
    }
  }

  function openApproveConfirm(v: KycVerification) {
    setPendingApprove(v)
    setApproveOpen(true)
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
      toast.success("KYC rechazado", { description: `Verificación ${selected.id} rechazada` })
    } catch {
      toast.error("No se pudo rechazar la verificación")
    } finally {
      setActionLoading(null)
    }
  }

  async function handleInitiateKyc() {
    if (!initiateEmail.trim()) {
      toast.error("Ingresa el email del usuario")
      return
    }
    if (!initiateEmail.includes("@")) {
      toast.error("Ingresa un email válido")
      return
    }
    setInitiateLoading(true)
    setInitiateResult(null)
    try {
      if (isDemoMode) {
        // Demo mode — simulate response
        await new Promise((r) => setTimeout(r, 800))
        setInitiateResult({
          session_id: `sess-${Date.now().toString().slice(-6)}`,
          verification_id: `kyc-demo-${Date.now().toString().slice(-5)}`,
          kyc_url: "https://verify.jaak.ai/session/demo-session",
        })
        toast.success("KYC iniciado (demo)", { description: `Nivel L${initiateLevel} para ${initiateEmail}` })
        return
      }
      const result = await api.post<InitiateKycResult>("/api/v1/kyc/verifications/initiate", {
        user_email: initiateEmail,
        level: Number(initiateLevel),
        notes: initiateNotes.trim() || undefined,
      } satisfies InitiateKycPayload)
      setInitiateResult(result)
      toast.success("KYC iniciado", { description: `Session ID: ${result.session_id}` })
      // Reload verifications list
      loadAll(true)
    } catch {
      toast.error("No se pudo iniciar el KYC")
    } finally {
      setInitiateLoading(false)
    }
  }

  function resetInitiateDialog() {
    setInitiateEmail("")
    setInitiateLevel("1")
    setInitiateNotes("")
    setInitiateResult(null)
    setInitiateLoading(false)
  }

  // ────────────────────────────────────────────────────────
  // Loading screen
  // ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <span className="text-sm">Cargando KYC...</span>
      </div>
    )
  }

  // ────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: "verifications", label: "Verificaciones", icon: <ShieldCheck className="size-3.5" /> },
    { id: "audit", label: "Auditoría", icon: <ScrollText className="size-3.5" /> },
  ]

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Shield className="size-5 text-[#472913]" />
            Administración KYC
          </h1>
          <p className="text-sm text-muted-foreground">
            Verificación de identidad — OCR, liveness y biometría vía Jaak
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            disabled={refreshing}
            onClick={() => loadAll(true)}
          >
            <RefreshCw className={`size-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button
            size="sm"
            className="bg-[#472913] hover:bg-[#472913]/90 text-white"
            onClick={() => { resetInitiateDialog(); setInitiateOpen(true) }}
          >
            <PlusCircle className="size-3.5 mr-1.5" />
            Solicitar KYC
          </Button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <ShieldCheck className="size-5 text-[#472913]" />
              <Badge variant="outline" className="text-[9px]">Total</Badge>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Verificaciones</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="size-5 text-green-600" />
              <span className="text-[10px] text-green-700 bg-green-50 border border-green-200 rounded-full px-1.5 py-0.5 font-medium">
                {stats.approval_rate}%
              </span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            <p className="text-xs text-muted-foreground">Aprobados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="size-5 text-yellow-500" />
              <span className="text-[10px] text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-full px-1.5 py-0.5 font-medium">
                {stats.pending + stats.in_progress} activos
              </span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="size-5 text-blue-500" />
              <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-1.5 py-0.5 font-medium">
                Score bio
              </span>
            </div>
            <p className="text-2xl font-bold">{stats.avgBiometricScore}</p>
            <p className="text-xs text-muted-foreground">Score Promedio</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Secondary stats strip ── */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <Activity className="size-4 text-blue-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold">{stats.in_progress}</p>
              <p className="text-[10px] text-muted-foreground">En Proceso</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <XCircle className="size-4 text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold">{stats.rejected}</p>
              <p className="text-[10px] text-muted-foreground">Rechazados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <ScanFace className="size-4 text-purple-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold">
                {stats.avg_processing_hours > 0 ? `${stats.avg_processing_hours}h` : "—"}
              </p>
              <p className="text-[10px] text-muted-foreground">Tiempo Promedio</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Tab bar ── */}
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
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════
          TAB: VERIFICATIONS
      ════════════════════════════════════════════════════ */}
      {activeTab === "verifications" && (
        <>
          {/* ── Filters ── */}
          <Card>
            <CardContent className="p-4 space-y-3">
              {/* Always-visible row */}
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
                        {s === "all" ? "Todos"
                          : s === "pending" ? "Pendiente"
                          : s === "in_progress" ? "En Proceso"
                          : s === "verified" ? "Aprobado"
                          : s === "rejected" ? "Rechazado"
                          : "Expirado"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFiltersExpanded((v) => !v)}
                    className="gap-1"
                  >
                    <Filter className="size-3.5" />
                    Más filtros
                    {filtersExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                  </Button>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <RefreshCw className="size-3.5 mr-1" />
                      Limpiar
                    </Button>
                  )}
                </div>
              </div>

              {/* Expanded filters */}
              {filtersExpanded && (
                <div className="flex flex-wrap gap-3 items-end pt-2 border-t">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Nivel KYC</p>
                    <div className="flex gap-1">
                      {(["all", "1", "2", "3"] as const).map((l) => (
                        <button
                          key={l}
                          onClick={() => setLevelFilter(l)}
                          className={`px-2 py-1 rounded-md text-xs font-medium border transition-colors ${
                            levelFilter === l
                              ? "bg-[#472913] text-white border-[#472913]"
                              : "border-input hover:bg-muted/50"
                          }`}
                        >
                          {l === "all" ? "Todos" : `L${l}`}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
                      <Calendar className="size-3 inline mr-1" />Desde
                    </p>
                    <Input
                      type="date"
                      className="w-36 text-xs h-8"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
                      <Calendar className="size-3 inline mr-1" />Hasta
                    </p>
                    <Input
                      type="date"
                      className="w-36 text-xs h-8"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            {filtered.length} de {verifications.length} verificaciones
            {hasActiveFilters && <span className="ml-1 text-[#472913] font-medium">(filtros activos)</span>}
          </p>

          {/* ── Verifications table ── */}
          <Card>
            <CardContent className="p-0">
              {filtered.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                  <UserCheck className="size-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">Sin resultados</p>
                  <p className="text-xs mt-1">No hay verificaciones con los filtros aplicados</p>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" className="mt-3" onClick={clearFilters}>
                      Limpiar filtros
                    </Button>
                  )}
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
                        <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Jaak</th>
                        <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide w-40">Score Bio.</th>
                        <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Liveness</th>
                        <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Fecha</th>
                        <th className="px-4 py-3 w-24"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filtered.map((v) => (
                        <tr
                          key={v.id}
                          className="hover:bg-muted/20 cursor-pointer transition-colors"
                          onClick={() => openDetail(v)}
                        >
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{v.id}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <User className="size-3.5 text-muted-foreground shrink-0" />
                              <span className="font-mono text-xs">{v.user_id}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">{levelBadge(v.level)}</td>
                          <td className="px-4 py-3">{statusBadge(v.status)}</td>
                          <td className="px-4 py-3">{jaakBadge(v.jaak_status)}</td>
                          <td className="px-4 py-3 w-40">
                            <ScoreBar score={v.biometric_score} />
                          </td>
                          <td className="px-4 py-3">
                            {v.liveness_check ? (
                              <CheckCircle className="size-4 text-green-600" />
                            ) : (
                              <XCircle className="size-4 text-red-400" />
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(v.created_at)}
                          </td>
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex gap-1 justify-end">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => openDetail(v)}
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
                                    onClick={() => openApproveConfirm(v)}
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
                                    onClick={() => { setSelected(v); setRejectOpen(true) }}
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
        </>
      )}

      {/* ════════════════════════════════════════════════════
          TAB: AUDIT TRAIL
      ════════════════════════════════════════════════════ */}
      {activeTab === "audit" && (
        <Card>
          <CardContent className="p-0">
            {auditLog.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <ScrollText className="size-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Sin entradas de auditoría</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">ID</th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Acción</th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Verificación</th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Cambio de Estado</th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Ejecutado por</th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Notas</th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {auditLog.map((entry) => (
                      <tr key={entry.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{entry.id}</td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-sm">{entry.action}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{entry.entity_id}</td>
                        <td className="px-4 py-3">
                          {entry.status_before || entry.status_after ? (
                            <div className="flex items-center gap-1.5 text-xs">
                              {entry.status_before && (
                                <span className="text-muted-foreground">{entry.status_before}</span>
                              )}
                              {entry.status_before && entry.status_after && (
                                <span className="text-muted-foreground">→</span>
                              )}
                              {entry.status_after && (
                                <span className="font-medium">{entry.status_after}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {entry.performed_by_email}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">
                          {entry.notes ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          <span title={formatDateTime(entry.created_at)}>{timeAgo(entry.created_at)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ════════════════════════════════════════════════════
          DIALOG: DETAIL / VER DETALLE
      ════════════════════════════════════════════════════ */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-[#472913]" />
              Detalle KYC
            </DialogTitle>
            <DialogDescription>
              {selected?.id} — Usuario: {selected?.user_id}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
              {/* Status bar */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 flex-wrap">
                  {statusBadge(selected.status)}
                  {levelBadge(selected.level)}
                  {jaakBadge(selected.jaak_status)}
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase">Score Biométrico</p>
                  <p className="text-xl font-bold">{selected.biometric_score ?? "—"}</p>
                </div>
              </div>

              {/* Rejection reason */}
              {selected.rejection_reason && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="size-4 text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold text-red-700 uppercase mb-0.5">Motivo de Rechazo</p>
                      <p className="text-sm text-red-700">{selected.rejection_reason}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Jaak / Provider data */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Proveedor — Jaak</p>
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border text-sm">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Session ID Jaak</p>
                    <p className="font-mono text-xs mt-0.5">{selected.jaak_verification_id ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Estado Jaak</p>
                    <div className="mt-0.5">{jaakBadge(selected.jaak_status)}</div>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">RFC</p>
                    <p className="font-mono text-xs mt-0.5">{selected.rfc ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Verificado el</p>
                    <p className="text-xs mt-0.5">
                      {selected.verified_at ? formatDate(selected.verified_at) : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Expira el</p>
                    <p className="text-xs mt-0.5">
                      {selected.expires_at ? formatDate(selected.expires_at) : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Iniciado</p>
                    <p className="text-xs mt-0.5">{formatDate(selected.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* OCR / Checklist */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Verificaciones OCR y Biométricas</p>
                <div className="rounded-lg border p-3 divide-y">
                  <CheckRow label="Nombre completo" value={selected.full_name_verified} />
                  <CheckRow label="Email" value={selected.email_verified} />
                  <CheckRow label="Teléfono" value={selected.phone_verified} />
                  <CheckRow label="CURP" value={selected.curp_verified} />
                  <CheckRow label="RFC" value={selected.rfc_verified} />
                  <CheckRow label="Domicilio" value={selected.address_verified} />
                  <CheckRow label="Liveness check" value={selected.liveness_check} />
                </div>
              </div>

              {/* Face / liveness score bar */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Score de Comparación Facial</p>
                <div className="p-3 rounded-lg border">
                  <ScoreBar score={selected.biometric_score} />
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Umbral mínimo de aprobación: <strong>80 / 100</strong>
                  </p>
                </div>
              </div>

              {/* Documents */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Documentos Cargados</p>
                {loadingDocs ? (
                  <div className="flex items-center gap-2 text-muted-foreground text-xs p-3">
                    <Loader2 className="size-3.5 animate-spin" /> Cargando documentos...
                  </div>
                ) : documents.length === 0 ? (
                  <p className="text-xs text-muted-foreground p-3 rounded-lg border">Sin documentos registrados</p>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => <DocItem key={doc.id} doc={doc} />)}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            {selected && (selected.status === "pending" || selected.status === "in_progress") && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                  disabled={actionLoading !== null}
                  onClick={() => { setDetailOpen(false); openApproveConfirm(selected) }}
                >
                  <CheckCircle className="size-3.5 mr-1.5" />
                  Aprobar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => { setDetailOpen(false); setRejectOpen(true) }}
                >
                  <XCircle className="size-3.5 mr-1.5" />
                  Rechazar
                </Button>
              </>
            )}
            <DialogClose render={<Button variant="outline" size="sm" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ════════════════════════════════════════════════════
          DIALOG: CONFIRM APPROVE
      ════════════════════════════════════════════════════ */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="size-5 text-green-600" />
              Confirmar Aprobación
            </DialogTitle>
            <DialogDescription>
              Esta acción marcará la verificación como aprobada y notificará al usuario.
            </DialogDescription>
          </DialogHeader>
          {pendingApprove && (
            <div className="p-3 rounded-lg bg-muted/50 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">Verificación</span>
                <span className="font-mono text-xs">{pendingApprove.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">Usuario</span>
                <span className="font-mono text-xs">{pendingApprove.user_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">Nivel</span>
                {levelBadge(pendingApprove.level)}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">Score Bio.</span>
                <span className="font-medium">{pendingApprove.biometric_score ?? "—"}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" size="sm" />}>Cancelar</DialogClose>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={actionLoading !== null}
              onClick={handleApproveConfirm}
            >
              {actionLoading !== null ? (
                <Loader2 className="size-3.5 mr-1.5 animate-spin" />
              ) : (
                <CheckCircle className="size-3.5 mr-1.5" />
              )}
              Confirmar Aprobación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ════════════════════════════════════════════════════
          DIALOG: REJECT
      ════════════════════════════════════════════════════ */}
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
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Motivo de Rechazo <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Ej: Liveness check fallido, documentos ilegibles, información inconsistente..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="min-h-[80px]"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Este motivo será visible para el usuario y quedará registrado en el audit trail.
              </p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" size="sm" />}>Cancelar</DialogClose>
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={actionLoading !== null || !rejectReason.trim()}
              onClick={handleRejectConfirm}
            >
              {actionLoading !== null ? (
                <Loader2 className="size-3.5 mr-1.5 animate-spin" />
              ) : (
                <XCircle className="size-3.5 mr-1.5" />
              )}
              Confirmar Rechazo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ════════════════════════════════════════════════════
          DIALOG: SOLICITAR KYC (INITIATE)
      ════════════════════════════════════════════════════ */}
      <Dialog
        open={initiateOpen}
        onOpenChange={(open) => {
          setInitiateOpen(open)
          if (!open) resetInitiateDialog()
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlusCircle className="size-5 text-[#472913]" />
              Solicitar KYC
            </DialogTitle>
            <DialogDescription>
              Inicia una verificación de identidad para un usuario. Se enviará un link de Jaak al email ingresado.
            </DialogDescription>
          </DialogHeader>

          {initiateResult ? (
            /* ── Success state ── */
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="size-5 text-green-600" />
                  <p className="font-semibold text-green-800">KYC Iniciado Exitosamente</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Session ID</p>
                    <p className="font-mono text-xs font-medium">{initiateResult.session_id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Verification ID</p>
                    <p className="font-mono text-xs font-medium">{initiateResult.verification_id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Link de Verificación</p>
                    <a
                      href={initiateResult.kyc_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <ExternalLink className="size-3" />
                      Abrir en Jaak
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ── Form state ── */
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Email del Usuario <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    className="pl-8"
                    value={initiateEmail}
                    onChange={(e) => setInitiateEmail(e.target.value)}
                    disabled={initiateLoading}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Nivel de KYC <span className="text-red-500">*</span>
                </label>
                <Select
                  value={initiateLevel}
                  onValueChange={(v) => setInitiateLevel(v as "1" | "2" | "3")}
                  disabled={initiateLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar nivel..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">
                      L1 — Básico (email + teléfono)
                    </SelectItem>
                    <SelectItem value="2">
                      L2 — Estándar (INE + selfie + liveness)
                    </SelectItem>
                    <SelectItem value="3">
                      L3 — Completo (INE + CURP + RFC + domicilio)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {initiateLevel === "1" && "Requiere validación de email y número de teléfono."}
                  {initiateLevel === "2" && "Incluye OCR de INE frente/reverso, selfie y liveness check biométrico."}
                  {initiateLevel === "3" && "KYC completo: INE, CURP, RFC, comprobante de domicilio y biometría avanzada."}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Notas Internas (opcional)
                </label>
                <Textarea
                  placeholder="Motivo de la solicitud, observaciones para el equipo de operaciones..."
                  value={initiateNotes}
                  onChange={(e) => setInitiateNotes(e.target.value)}
                  disabled={initiateLoading}
                  className="min-h-[60px]"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose
              render={<Button variant="outline" size="sm" />}
              onClick={resetInitiateDialog}
            >
              {initiateResult ? "Cerrar" : "Cancelar"}
            </DialogClose>
            {!initiateResult && (
              <Button
                size="sm"
                className="bg-[#472913] hover:bg-[#472913]/90 text-white"
                disabled={initiateLoading || !initiateEmail.trim()}
                onClick={handleInitiateKyc}
              >
                {initiateLoading ? (
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                ) : (
                  <PlusCircle className="size-3.5 mr-1.5" />
                )}
                {initiateLoading ? "Iniciando..." : "Solicitar KYC"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
