"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
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
import { useSupportTickets } from "@/hooks/use-support"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import type { SupportTicket } from "@/lib/types"
import { Eye, MessageSquare, ArrowUpRight, CheckCircle, Clock, Plus, XCircle } from "lucide-react"
import { toast } from "sonner"

const priorityColor: Record<string, string> = {
  urgente: "bg-red-100 text-red-700",
  alta: "bg-orange-100 text-orange-700",
  media: "bg-yellow-100 text-yellow-700",
  baja: "bg-gray-100 text-gray-500",
}

const statusColor: Record<string, string> = {
  abierto: "bg-red-100 text-red-700",
  en_progreso: "bg-blue-100 text-blue-700",
  esperando: "bg-yellow-100 text-yellow-700",
  resuelto: "bg-green-100 text-green-700",
  cerrado: "bg-gray-100 text-gray-500",
}

export default function TicketsPage() {
  const { data: fetchedTickets, isLoading, error, refetch } = useSupportTickets()
  const [tickets, setTickets] = React.useState<SupportTicket[]>([])
  const [selectedTicket, setSelectedTicket] = React.useState<SupportTicket | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [respondOpen, setRespondOpen] = React.useState(false)
  const [resolveOpen, setResolveOpen] = React.useState(false)
  const [newOpen, setNewOpen] = React.useState(false)
  const [responseText, setResponseText] = React.useState("")
  const [newForm, setNewForm] = React.useState({
    subject: "",
    description: "",
    clientName: "",
    clientId: "",
    priority: "media" as SupportTicket["priority"],
    channel: "chat" as SupportTicket["channel"],
    category: "",
    assignedTo: "",
  })

  React.useEffect(() => { if (fetchedTickets) setTickets(fetchedTickets) }, [fetchedTickets])

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error) return <ErrorCard message={error} onRetry={refetch} />

  const handleView = (ticket: SupportTicket) => {
    setSelectedTicket(ticket)
    setDetailOpen(true)
  }

  const handleRespond = (ticket: SupportTicket) => {
    setSelectedTicket(ticket)
    setResponseText("")
    setRespondOpen(true)
  }

  const sendResponse = () => {
    if (!selectedTicket || !responseText.trim()) {
      toast.error("Escribe una respuesta")
      return
    }
    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicket.id
          ? { ...t, status: "en_progreso" as const, updatedAt: new Date().toISOString() }
          : t
      )
    )
    setRespondOpen(false)
    setDetailOpen(false)
    toast.success("Respuesta enviada", { description: `${selectedTicket.id} — respuesta al cliente registrada` })
  }

  const handleEscalate = (ticket: SupportTicket) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticket.id ? { ...t, status: "esperando" as const, updatedAt: new Date().toISOString() } : t
      )
    )
    if (selectedTicket?.id === ticket.id) {
      setSelectedTicket({ ...ticket, status: "esperando" })
    }
    toast.info("Ticket escalado", { description: `${ticket.id} escalado al supervisor` })
  }

  const handleResolve = (ticket: SupportTicket) => {
    setSelectedTicket(ticket)
    setResolveOpen(true)
  }

  const confirmResolve = () => {
    if (!selectedTicket) return
    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicket.id
          ? { ...t, status: "resuelto" as const, updatedAt: new Date().toISOString() }
          : t
      )
    )
    setResolveOpen(false)
    setDetailOpen(false)
    toast.success("Ticket resuelto", { description: `${selectedTicket.id} — ${selectedTicket.subject}` })
  }

  const handleNewTicket = () => {
    if (!newForm.subject || !newForm.clientName || !newForm.description) {
      toast.error("Completa los campos requeridos")
      return
    }
    const now = new Date()
    const sla = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const newTicket: SupportTicket = {
      id: `TKT-${String(tickets.length + 1).padStart(3, "0")}`,
      subject: newForm.subject,
      description: newForm.description,
      priority: newForm.priority,
      status: "abierto",
      channel: newForm.channel,
      clientName: newForm.clientName,
      clientId: newForm.clientId || `CLI-${Math.floor(Math.random() * 9000) + 1000}`,
      assignedTo: newForm.assignedTo || "Sin asignar",
      slaDeadline: sla.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      category: newForm.category || "General",
    }
    setTickets([newTicket, ...tickets])
    setNewOpen(false)
    setNewForm({ subject: "", description: "", clientName: "", clientId: "", priority: "media", channel: "chat", category: "", assignedTo: "" })
    toast.success("Ticket creado", { description: `${newTicket.id} — ${newTicket.subject}` })
  }

  const statusTabs = [
    { label: "Abierto", value: "abierto", count: tickets.filter((t) => t.status === "abierto").length },
    { label: "En progreso", value: "en_progreso", count: tickets.filter((t) => t.status === "en_progreso").length },
    { label: "Esperando", value: "esperando", count: tickets.filter((t) => t.status === "esperando").length },
    { label: "Resuelto", value: "resuelto", count: tickets.filter((t) => t.status === "resuelto").length },
  ]

  const columns: ColumnDef<SupportTicket>[] = [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
    { accessorKey: "subject", header: "Asunto" },
    { accessorKey: "clientName", header: "Cliente" },
    { accessorKey: "priority", header: "Prioridad", cell: ({ row }) => (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${priorityColor[row.original.priority]}`}>{row.original.priority}</span>
    )},
    { accessorKey: "status", header: "Estado", cell: ({ row }) => (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor[row.original.status]}`}>{row.original.status.replace("_", " ")}</span>
    )},
    { accessorKey: "channel", header: "Canal", cell: ({ row }) => <Badge variant="outline" className="text-[10px] capitalize">{row.original.channel}</Badge> },
    { accessorKey: "category", header: "Categoría", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.category}</span> },
    { accessorKey: "assignedTo", header: "Asignado", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.assignedTo}</span> },
    {
      id: "actions", header: "",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleView(row.original) }} title="Ver">
            <Eye className="size-3.5" />
          </Button>
          {row.original.status !== "resuelto" && row.original.status !== "cerrado" && (
            <>
              <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleRespond(row.original) }} title="Responder">
                <MessageSquare className="size-3.5 text-sayo-blue" />
              </Button>
              <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleResolve(row.original) }} title="Resolver">
                <CheckCircle className="size-3.5 text-sayo-green" />
              </Button>
              <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleEscalate(row.original) }} title="Escalar">
                <ArrowUpRight className="size-3.5 text-sayo-red" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Tickets</h1>
          <p className="text-sm text-muted-foreground">Gestión de tickets de soporte — prioridad, SLA y resolución</p>
        </div>
        <Button onClick={() => setNewOpen(true)}>
          <Plus className="size-4 mr-1.5" /> Nuevo Ticket
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={tickets}
        searchKey="subject"
        searchPlaceholder="Buscar por asunto..."
        exportFilename="tickets_soporte"
        statusTabs={statusTabs}
        statusKey="status"
        onRowClick={handleView}
      />

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle del Ticket</DialogTitle>
            <DialogDescription>{selectedTicket?.id} — {selectedTicket?.subject}</DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${priorityColor[selectedTicket.priority]}`}>
                    {selectedTicket.priority}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusColor[selectedTicket.status]}`}>
                    {selectedTicket.status.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Clock className="size-3 text-muted-foreground" />
                  <span className="text-muted-foreground">SLA: {new Date(selectedTicket.slaDeadline).toLocaleString("es-MX")}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Cliente</p>
                  <p className="font-medium">{selectedTicket.clientName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">ID Cliente</p>
                  <p className="font-mono text-xs">{selectedTicket.clientId}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Canal</p>
                  <Badge variant="outline" className="text-[10px] capitalize">{selectedTicket.channel}</Badge>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Categoría</p>
                  <p>{selectedTicket.category}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Asignado a</p>
                  <p>{selectedTicket.assignedTo}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Creado</p>
                  <p className="text-xs">{new Date(selectedTicket.createdAt).toLocaleString("es-MX")}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-muted-foreground uppercase">Descripción</p>
                  <p className="text-sm">{selectedTicket.description}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedTicket && selectedTicket.status !== "resuelto" && selectedTicket.status !== "cerrado" && (
              <>
                <Button variant="outline" size="sm" onClick={() => { setDetailOpen(false); handleRespond(selectedTicket) }}>
                  <MessageSquare className="size-3.5 mr-1" /> Responder
                </Button>
                <Button variant="outline" size="sm" className="text-sayo-green" onClick={() => { setDetailOpen(false); handleResolve(selectedTicket) }}>
                  <CheckCircle className="size-3.5 mr-1" /> Resolver
                </Button>
                <Button variant="outline" size="sm" className="text-sayo-red" onClick={() => handleEscalate(selectedTicket)}>
                  <ArrowUpRight className="size-3.5 mr-1" /> Escalar
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
              <MessageSquare className="size-5 text-sayo-blue" />
              Responder Ticket
            </DialogTitle>
            <DialogDescription>{selectedTicket?.id} — {selectedTicket?.clientName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <p className="text-[10px] text-muted-foreground uppercase mb-1">Asunto</p>
              <p className="font-medium">{selectedTicket?.subject}</p>
              <p className="text-[10px] text-muted-foreground uppercase mt-2 mb-1">Descripción del cliente</p>
              <p className="text-xs text-muted-foreground">{selectedTicket?.description}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Tu Respuesta *</label>
              <Input
                placeholder="Escribe tu respuesta al cliente..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
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

      {/* Resolve Confirmation Dialog */}
      <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="size-5 text-sayo-green" />
              Resolver Ticket
            </DialogTitle>
            <DialogDescription>
              ¿Marcar este ticket como resuelto?
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="p-3 rounded-lg bg-muted/50 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ticket:</span>
                <span className="font-mono text-xs">{selectedTicket.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Asunto:</span>
                <span className="font-medium text-xs">{selectedTicket.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cliente:</span>
                <span>{selectedTicket.clientName}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={confirmResolve} className="bg-sayo-green hover:bg-sayo-green/90">
              <CheckCircle className="size-3.5 mr-1" /> Confirmar Resolución
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Ticket Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Ticket</DialogTitle>
            <DialogDescription>Crear un ticket de soporte</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Asunto *</label>
              <Input placeholder="Ej: Error en transferencia" value={newForm.subject} onChange={(e) => setNewForm({ ...newForm, subject: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Descripción *</label>
              <Input placeholder="Descripción detallada..." value={newForm.description} onChange={(e) => setNewForm({ ...newForm, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Cliente *</label>
                <Input placeholder="Nombre del cliente" value={newForm.clientName} onChange={(e) => setNewForm({ ...newForm, clientName: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">ID Cliente</label>
                <Input placeholder="CLI-XXXX" value={newForm.clientId} onChange={(e) => setNewForm({ ...newForm, clientId: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Prioridad</label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {(["baja", "media", "alta", "urgente"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setNewForm({ ...newForm, priority: p })}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors capitalize ${
                      newForm.priority === p ? "bg-sayo-cafe text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Canal</label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {(["chat", "telefono", "email", "app", "sucursal"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewForm({ ...newForm, channel: c })}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors capitalize ${
                      newForm.channel === c ? "bg-sayo-cafe text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Categoría</label>
                <Input placeholder="Ej: Transferencias" value={newForm.category} onChange={(e) => setNewForm({ ...newForm, category: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Asignar a</label>
                <Input placeholder="Ej: Luis Torres" value={newForm.assignedTo} onChange={(e) => setNewForm({ ...newForm, assignedTo: e.target.value })} />
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
