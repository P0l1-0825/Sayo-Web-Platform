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
  Ticket,
  Plus,
  Eye,
  MessageSquare,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  AlertTriangle,
  UserCheck,
  Headphones,
} from "lucide-react"
import { toast } from "sonner"

// ────────────────────────────────────────────────────────────
// Types & Demo Data
// ────────────────────────────────────────────────────────────

type TicketPriority = "critica" | "alta" | "media" | "baja"
type TicketStatus = "abierto" | "en_progreso" | "resuelto" | "cerrado"

interface MesaTicket {
  id: string
  subject: string
  description: string
  priority: TicketPriority
  status: TicketStatus
  clientName: string
  clientId: string
  assignedTo: string
  category: string
  channel: "spei" | "tarjeta" | "cuenta" | "credito" | "otro"
  createdAt: string
  updatedAt: string
  slaDeadline: string
}

const demoTickets: MesaTicket[] = [
  {
    id: "MC-001", subject: "SPEI enviado no acreditado", description: "Cliente reporta que envió $25,000 MXN hace 3 horas y no se refleja en cuenta destino.", priority: "alta", status: "abierto", clientName: "Juan Pérez García", clientId: "CLI-0012", assignedTo: "Sin asignar", category: "SPEI", channel: "spei", createdAt: "2026-03-25T08:14:00Z", updatedAt: "2026-03-25T08:14:00Z", slaDeadline: "2026-03-25T20:14:00Z",
  },
  {
    id: "MC-002", subject: "Tarjeta bloqueada sin motivo aparente", description: "Cliente indica que su tarjeta VISA fue bloqueada sin haber realizado ninguna transacción sospechosa.", priority: "media", status: "en_progreso", clientName: "María López Fernández", clientId: "CLI-0045", assignedTo: "Carlos Mendoza", category: "Tarjetas", channel: "tarjeta", createdAt: "2026-03-24T15:30:00Z", updatedAt: "2026-03-25T09:00:00Z", slaDeadline: "2026-03-25T15:30:00Z",
  },
  {
    id: "MC-003", subject: "Error al intentar acceder a cuenta", description: "El sistema muestra 'cuenta suspendida' al intentar hacer login. Cliente nunca fue notificado.", priority: "alta", status: "en_progreso", clientName: "Empresa ABC S.A.", clientId: "EMP-0008", assignedTo: "Carlos Mendoza", category: "Cuentas", channel: "cuenta", createdAt: "2026-03-24T10:00:00Z", updatedAt: "2026-03-25T08:45:00Z", slaDeadline: "2026-03-24T22:00:00Z",
  },
  {
    id: "MC-004", subject: "Dispersión de nómina incompleta", description: "Se dispersó nómina pero 3 empleados no recibieron su pago. Referencia D-2026-0321.", priority: "critica", status: "abierto", clientName: "Tech Solutions MX", clientId: "EMP-0015", assignedTo: "Sin asignar", category: "Dispersiones", channel: "cuenta", createdAt: "2026-03-25T07:55:00Z", updatedAt: "2026-03-25T07:55:00Z", slaDeadline: "2026-03-25T11:55:00Z",
  },
  {
    id: "MC-005", subject: "Cargo no reconocido en tarjeta", description: "Aparece cargo de $3,200 MXN en comercio 'AMAZON MX' que el cliente no reconoce.", priority: "alta", status: "abierto", clientName: "Ana Torres Vega", clientId: "CLI-0089", assignedTo: "Sin asignar", category: "Tarjetas", channel: "tarjeta", createdAt: "2026-03-24T22:10:00Z", updatedAt: "2026-03-24T22:10:00Z", slaDeadline: "2026-03-25T10:10:00Z",
  },
  {
    id: "MC-006", subject: "Límite de crédito no actualizado", description: "Se aprobó ampliación de crédito hace 5 días pero el límite sigue igual en la app.", priority: "baja", status: "resuelto", clientName: "Roberto Flores Díaz", clientId: "CLI-0033", assignedTo: "Carmen Juárez", category: "Créditos", channel: "credito", createdAt: "2026-03-22T14:00:00Z", updatedAt: "2026-03-24T16:30:00Z", slaDeadline: "2026-03-24T14:00:00Z",
  },
  {
    id: "MC-007", subject: "SPEI recibido con datos incorrectos", description: "SPEI recibido tiene nombre del ordenante incorrecto. Cliente solicita aclaración.", priority: "baja", status: "cerrado", clientName: "Carlos Ruiz Méndez", clientId: "CLI-0027", assignedTo: "Carmen Juárez", category: "SPEI", channel: "spei", createdAt: "2026-03-21T09:00:00Z", updatedAt: "2026-03-23T11:00:00Z", slaDeadline: "2026-03-22T09:00:00Z",
  },
]

const AGENTS = ["Carlos Mendoza", "Carmen Juárez", "Luis Torres", "Patricia Vega", "Roberto Soto"]

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

const priorityStyles: Record<TicketPriority, string> = {
  critica: "bg-red-100 text-red-800 border-red-200",
  alta: "bg-orange-100 text-orange-800 border-orange-200",
  media: "bg-yellow-100 text-yellow-800 border-yellow-200",
  baja: "bg-gray-100 text-gray-600 border-gray-200",
}

const priorityIcons: Record<TicketPriority, React.ReactNode> = {
  critica: <AlertTriangle className="size-3" />,
  alta: <AlertTriangle className="size-3" />,
  media: <Clock className="size-3" />,
  baja: <Ticket className="size-3" />,
}

const statusStyles: Record<TicketStatus, string> = {
  abierto: "bg-red-100 text-red-700",
  en_progreso: "bg-blue-100 text-blue-700",
  resuelto: "bg-green-100 text-green-700",
  cerrado: "bg-gray-100 text-gray-500",
}

function priorityBadge(p: TicketPriority) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${priorityStyles[p]}`}>
      {priorityIcons[p]}
      {p === "critica" ? "Crítica" : p.charAt(0).toUpperCase() + p.slice(1)}
    </span>
  )
}

function statusBadge(s: TicketStatus) {
  const label = s === "abierto" ? "Abierto" : s === "en_progreso" ? "En Progreso" : s === "resuelto" ? "Resuelto" : "Cerrado"
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusStyles[s]}`}>
      {label}
    </span>
  )
}

function isSlaBreached(ticket: MesaTicket) {
  return ticket.status === "abierto" && new Date() > new Date(ticket.slaDeadline)
}

// ────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────

type StatusFilter = "all" | TicketStatus
type PriorityFilter = "all" | TicketPriority

export default function MesaControlSoportePage() {
  const [tickets, setTickets] = React.useState<MesaTicket[]>(demoTickets)
  const [loading] = React.useState(false)

  // Filters
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")
  const [priorityFilter, setPriorityFilter] = React.useState<PriorityFilter>("all")

  // Dialogs
  const [selected, setSelected] = React.useState<MesaTicket | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [newOpen, setNewOpen] = React.useState(false)
  const [respondOpen, setRespondOpen] = React.useState(false)
  const [assignOpen, setAssignOpen] = React.useState(false)

  const [responseText, setResponseText] = React.useState("")
  const [assignAgent, setAssignAgent] = React.useState("")
  const [newForm, setNewForm] = React.useState({
    subject: "",
    description: "",
    clientName: "",
    clientId: "",
    priority: "media" as TicketPriority,
    channel: "otro" as MesaTicket["channel"],
    category: "",
    assignedTo: "",
  })

  const filtered = React.useMemo(() => {
    return tickets.filter((t) => {
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.clientName.toLowerCase().includes(q) ||
        t.clientId.toLowerCase().includes(q)
      const matchStatus = statusFilter === "all" || t.status === statusFilter
      const matchPriority = priorityFilter === "all" || t.priority === priorityFilter
      return matchSearch && matchStatus && matchPriority
    })
  }, [tickets, search, statusFilter, priorityFilter])

  // Stats
  const countOpen = tickets.filter((t) => t.status === "abierto").length
  const countInProgress = tickets.filter((t) => t.status === "en_progreso").length
  const countResolved = tickets.filter((t) => t.status === "resuelto").length
  const countCritical = tickets.filter((t) => t.priority === "critica" && t.status !== "cerrado" && t.status !== "resuelto").length

  function handleView(t: MesaTicket) {
    setSelected(t)
    setDetailOpen(true)
  }

  function handleRespond(t: MesaTicket) {
    setSelected(t)
    setResponseText("")
    setRespondOpen(true)
  }

  function sendResponse() {
    if (!selected || !responseText.trim()) {
      toast.error("Escribe una respuesta")
      return
    }
    setTickets((prev) =>
      prev.map((t) =>
        t.id === selected.id
          ? { ...t, status: "en_progreso" as const, updatedAt: new Date().toISOString() }
          : t
      )
    )
    setRespondOpen(false)
    setDetailOpen(false)
    toast.success("Respuesta registrada", { description: `${selected.id} — ${selected.clientName}` })
  }

  function handleResolve(t: MesaTicket) {
    setTickets((prev) =>
      prev.map((item) =>
        item.id === t.id
          ? { ...item, status: "resuelto" as const, updatedAt: new Date().toISOString() }
          : item
      )
    )
    if (selected?.id === t.id) setSelected({ ...t, status: "resuelto" })
    setDetailOpen(false)
    toast.success("Ticket resuelto", { description: `${t.id} — ${t.subject}` })
  }

  function handleEscalate(t: MesaTicket) {
    setTickets((prev) =>
      prev.map((item) =>
        item.id === t.id ? { ...item, priority: "critica" as const, updatedAt: new Date().toISOString() } : item
      )
    )
    toast.warning("Ticket escalado a prioridad crítica", { description: t.id })
  }

  function openAssign(t: MesaTicket) {
    setSelected(t)
    setAssignAgent(t.assignedTo !== "Sin asignar" ? t.assignedTo : "")
    setAssignOpen(true)
  }

  function confirmAssign() {
    if (!selected || !assignAgent) {
      toast.error("Selecciona un agente")
      return
    }
    setTickets((prev) =>
      prev.map((t) =>
        t.id === selected.id
          ? { ...t, assignedTo: assignAgent, status: t.status === "abierto" ? "en_progreso" as const : t.status, updatedAt: new Date().toISOString() }
          : t
      )
    )
    setAssignOpen(false)
    toast.success("Ticket asignado", { description: `${selected.id} → ${assignAgent}` })
  }

  function handleNewTicket() {
    if (!newForm.subject || !newForm.clientName || !newForm.description) {
      toast.error("Completa los campos requeridos")
      return
    }
    const now = new Date()
    const hoursMap: Record<TicketPriority, number> = { critica: 2, alta: 8, media: 24, baja: 72 }
    const sla = new Date(now.getTime() + hoursMap[newForm.priority] * 3_600_000)
    const t: MesaTicket = {
      id: `MC-${String(tickets.length + 1).padStart(3, "0")}`,
      subject: newForm.subject,
      description: newForm.description,
      priority: newForm.priority,
      status: "abierto",
      clientName: newForm.clientName,
      clientId: newForm.clientId || `CLI-${Math.floor(Math.random() * 9000) + 1000}`,
      assignedTo: newForm.assignedTo || "Sin asignar",
      category: newForm.category || "General",
      channel: newForm.channel,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      slaDeadline: sla.toISOString(),
    }
    setTickets([t, ...tickets])
    setNewOpen(false)
    setNewForm({ subject: "", description: "", clientName: "", clientId: "", priority: "media", channel: "otro", category: "", assignedTo: "" })
    toast.success("Ticket creado", { description: `${t.id} — ${t.subject}` })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <span className="text-sm">Cargando tickets...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Soporte Operativo</h1>
          <p className="text-sm text-muted-foreground">
            Tickets de incidencias SPEI, tarjetas, cuentas y créditos — Mesa de Control
          </p>
        </div>
        <Button onClick={() => setNewOpen(true)}>
          <Plus className="size-4 mr-1.5" /> Nuevo Ticket
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Ticket className="size-5 mx-auto text-red-500 mb-1" />
            <p className="text-2xl font-bold text-red-600">{countOpen}</p>
            <p className="text-xs text-muted-foreground">Abiertos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="size-5 mx-auto text-blue-500 mb-1" />
            <p className="text-2xl font-bold text-blue-600">{countInProgress}</p>
            <p className="text-xs text-muted-foreground">En Progreso</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="size-5 mx-auto text-green-500 mb-1" />
            <p className="text-2xl font-bold text-green-600">{countResolved}</p>
            <p className="text-xs text-muted-foreground">Resueltos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="size-5 mx-auto text-orange-500 mb-1" />
            <p className="text-2xl font-bold text-orange-600">{countCritical}</p>
            <p className="text-xs text-muted-foreground">Críticos Activos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Buscar</p>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="ID, asunto, cliente..."
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
                {(["all", "abierto", "en_progreso", "resuelto", "cerrado"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2 py-1 rounded-md text-xs font-medium border transition-colors ${
                      statusFilter === s ? "bg-[#472913] text-white border-[#472913]" : "border-input hover:bg-muted/50"
                    }`}
                  >
                    {s === "all" ? "Todos" : s === "abierto" ? "Abierto" : s === "en_progreso" ? "En Progreso" : s === "resuelto" ? "Resuelto" : "Cerrado"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Prioridad</p>
              <div className="flex flex-wrap gap-1">
                {(["all", "critica", "alta", "media", "baja"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriorityFilter(p)}
                    className={`px-2 py-1 rounded-md text-xs font-medium border transition-colors ${
                      priorityFilter === p ? "bg-[#472913] text-white border-[#472913]" : "border-input hover:bg-muted/50"
                    }`}
                  >
                    {p === "all" ? "Todas" : p === "critica" ? "Crítica" : p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSearch(""); setStatusFilter("all"); setPriorityFilter("all") }}
            >
              <RefreshCw className="size-3.5 mr-1" /> Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        {filtered.length} de {tickets.length} tickets
      </p>

      {/* Tickets Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Headphones className="size-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Sin tickets para los filtros aplicados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">ID</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Asunto</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Cliente</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Prioridad</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Estado</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Asignado</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">SLA</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((t) => {
                    const breached = isSlaBreached(t)
                    return (
                      <tr
                        key={t.id}
                        className="hover:bg-muted/20 cursor-pointer transition-colors"
                        onClick={() => handleView(t)}
                      >
                        <td className="px-4 py-3 font-mono text-xs">{t.id}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-sm line-clamp-1">{t.subject}</p>
                          <p className="text-[10px] text-muted-foreground capitalize">{t.category}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm">{t.clientName}</p>
                          <p className="font-mono text-[10px] text-muted-foreground">{t.clientId}</p>
                        </td>
                        <td className="px-4 py-3">{priorityBadge(t.priority)}</td>
                        <td className="px-4 py-3">{statusBadge(t.status)}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-muted-foreground">{t.assignedTo}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-mono ${breached ? "text-red-600 font-bold" : "text-muted-foreground"}`}>
                            {breached ? "VENCIDO" : new Date(t.slaDeadline).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={(e) => { e.stopPropagation(); handleView(t) }}
                              title="Ver"
                            >
                              <Eye className="size-3.5" />
                            </Button>
                            {t.status !== "resuelto" && t.status !== "cerrado" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="text-blue-600 hover:bg-blue-50"
                                  onClick={(e) => { e.stopPropagation(); handleRespond(t) }}
                                  title="Responder"
                                >
                                  <MessageSquare className="size-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="text-[#472913] hover:bg-[#472913]/10"
                                  onClick={(e) => { e.stopPropagation(); openAssign(t) }}
                                  title="Asignar"
                                >
                                  <UserCheck className="size-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="text-green-600 hover:bg-green-50"
                                  onClick={(e) => { e.stopPropagation(); handleResolve(t) }}
                                  title="Resolver"
                                >
                                  <CheckCircle className="size-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
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
            <DialogTitle>Detalle del Ticket</DialogTitle>
            <DialogDescription>{selected?.id} — {selected?.subject}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  {priorityBadge(selected.priority)}
                  {statusBadge(selected.status)}
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <Clock className="size-3 text-muted-foreground" />
                  <span className={isSlaBreached(selected) ? "text-red-600 font-bold" : "text-muted-foreground"}>
                    SLA: {new Date(selected.slaDeadline).toLocaleString("es-MX")}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Cliente</p>
                  <p className="font-medium">{selected.clientName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">ID Cliente</p>
                  <p className="font-mono text-xs">{selected.clientId}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Categoría</p>
                  <p>{selected.category}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Canal</p>
                  <Badge variant="outline" className="text-[10px] capitalize">{selected.channel}</Badge>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Asignado a</p>
                  <p>{selected.assignedTo}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Creado</p>
                  <p className="text-xs">{new Date(selected.createdAt).toLocaleString("es-MX")}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-muted-foreground uppercase">Descripción</p>
                  <p className="text-sm">{selected.description}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {selected && selected.status !== "resuelto" && selected.status !== "cerrado" && (
              <>
                <Button variant="outline" size="sm" onClick={() => { setDetailOpen(false); handleRespond(selected) }}>
                  <MessageSquare className="size-3.5 mr-1" /> Responder
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setDetailOpen(false); openAssign(selected) }}>
                  <UserCheck className="size-3.5 mr-1" /> Asignar
                </Button>
                <Button variant="outline" size="sm" className="text-orange-600 border-orange-300" onClick={() => handleEscalate(selected)}>
                  <ArrowUpRight className="size-3.5 mr-1" /> Escalar
                </Button>
                <Button variant="outline" size="sm" className="text-green-700 border-green-300" onClick={() => handleResolve(selected)}>
                  <CheckCircle className="size-3.5 mr-1" /> Resolver
                </Button>
              </>
            )}
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Respond Dialog */}
      <Dialog open={respondOpen} onOpenChange={setRespondOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="size-5 text-blue-500" />
              Responder Ticket
            </DialogTitle>
            <DialogDescription>{selected?.id} — {selected?.clientName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <p className="text-[10px] text-muted-foreground uppercase mb-1">Asunto</p>
              <p className="font-medium">{selected?.subject}</p>
              <p className="text-[10px] text-muted-foreground uppercase mt-2 mb-1">Descripción</p>
              <p className="text-xs text-muted-foreground">{selected?.description}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Respuesta / Nota Interna *</label>
              <Input
                placeholder="Escribe la respuesta o nota de seguimiento..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={sendResponse}>
              <MessageSquare className="size-3.5 mr-1" /> Enviar Respuesta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="size-5 text-[#472913]" />
              Asignar Ticket
            </DialogTitle>
            <DialogDescription>{selected?.id} — {selected?.subject}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Selecciona el agente responsable:</p>
            <div className="flex flex-col gap-1.5">
              {AGENTS.map((agent) => (
                <button
                  key={agent}
                  onClick={() => setAssignAgent(agent)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left transition-colors ${
                    assignAgent === agent
                      ? "border-[#472913] bg-[#472913]/5 text-[#472913] font-medium"
                      : "border-input hover:bg-muted/50"
                  }`}
                >
                  <UserCheck className="size-4 shrink-0" />
                  {agent}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={confirmAssign}>
              <UserCheck className="size-3.5 mr-1" /> Confirmar Asignación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Ticket Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Ticket de Soporte</DialogTitle>
            <DialogDescription>Crear incidencia operativa en Mesa de Control</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Asunto *</label>
              <Input
                placeholder="Ej: SPEI no acreditado"
                value={newForm.subject}
                onChange={(e) => setNewForm({ ...newForm, subject: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Descripción *</label>
              <Input
                placeholder="Descripción detallada del problema..."
                value={newForm.description}
                onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Cliente *</label>
                <Input
                  placeholder="Nombre del cliente"
                  value={newForm.clientName}
                  onChange={(e) => setNewForm({ ...newForm, clientName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">ID Cliente</label>
                <Input
                  placeholder="CLI-XXXX"
                  value={newForm.clientId}
                  onChange={(e) => setNewForm({ ...newForm, clientId: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Prioridad</label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {(["baja", "media", "alta", "critica"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setNewForm({ ...newForm, priority: p })}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors capitalize ${
                      newForm.priority === p
                        ? "bg-[#472913] text-white border-[#472913]"
                        : "border-input hover:bg-muted/50"
                    }`}
                  >
                    {p === "critica" ? "Crítica" : p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Canal</label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {(["spei", "tarjeta", "cuenta", "credito", "otro"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewForm({ ...newForm, channel: c })}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors capitalize ${
                      newForm.channel === c
                        ? "bg-[#472913] text-white border-[#472913]"
                        : "border-input hover:bg-muted/50"
                    }`}
                  >
                    {c === "credito" ? "Crédito" : c.charAt(0).toUpperCase() + c.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Categoría</label>
                <Input
                  placeholder="Ej: SPEI, Tarjetas..."
                  value={newForm.category}
                  onChange={(e) => setNewForm({ ...newForm, category: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Asignar a</label>
                <Input
                  placeholder="Nombre del agente"
                  value={newForm.assignedTo}
                  onChange={(e) => setNewForm({ ...newForm, assignedTo: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleNewTicket}>
              <Plus className="size-3.5 mr-1" /> Crear Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
