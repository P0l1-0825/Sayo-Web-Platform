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
import { FileSearch, Clock, CheckCircle, AlertTriangle, Eye, Plus, XCircle, Send, FileText, MessageSquare } from "lucide-react"
import { toast } from "sonner"

interface Investigation {
  id: string
  alertId: string
  title: string
  status: string
  priority: string
  openDate: string
  assignedTo: string
  daysOpen: number
  actions: number
  documents: number
  timeline: TimelineItem[]
}

interface TimelineItem {
  date: string
  action: string
  user: string
  type: string
}

const initialInvestigations: Investigation[] = [
  {
    id: "INV-001", alertId: "ALE-002", title: "Structuring — Empresa Fantasma SA", status: "en_curso", priority: "alta",
    openDate: "2024-03-05", assignedTo: "Ana García", daysOpen: 1, actions: 3, documents: 5,
    timeline: [
      { date: "2024-03-06 14:30", action: "Solicitud de documentación enviada al cliente", user: "Ana García", type: "accion" },
      { date: "2024-03-06 10:00", action: "Análisis de patrones de transacción completado", user: "Ana García", type: "analisis" },
      { date: "2024-03-05 16:00", action: "Caso abierto desde alerta ALE-002", user: "Sistema", type: "apertura" },
    ],
  },
  {
    id: "INV-002", alertId: "ALE-004", title: "Transferencia país GAFI — Int. Trading LLC", status: "en_curso", priority: "critica",
    openDate: "2024-03-04", assignedTo: "Ana García", daysOpen: 2, actions: 5, documents: 8,
    timeline: [
      { date: "2024-03-06 11:00", action: "Reporte preliminar enviado al Oficial PLD", user: "Ana García", type: "reporte" },
      { date: "2024-03-05 15:00", action: "Verificación contra listas OFAC completada", user: "Ana García", type: "verificación" },
      { date: "2024-03-05 09:00", action: "Documentación del cliente recibida", user: "Miguel Ángeles", type: "documento" },
      { date: "2024-03-04 16:30", action: "Solicitud de bloqueo preventivo", user: "Ana García", type: "accion" },
      { date: "2024-03-04 14:00", action: "Caso abierto desde alerta ALE-004", user: "Sistema", type: "apertura" },
    ],
  },
  {
    id: "INV-003", alertId: "ALE-010", title: "Operación inusual — Jorge Méndez", status: "cerrada", priority: "media",
    openDate: "2024-02-15", assignedTo: "Miguel Ángeles", daysOpen: 15, actions: 8, documents: 12,
    timeline: [
      { date: "2024-03-01 10:00", action: "Caso cerrado — falso positivo confirmado", user: "Miguel Ángeles", type: "cierre" },
      { date: "2024-02-28 14:00", action: "Revisión final completada", user: "Ana García", type: "analisis" },
      { date: "2024-02-15 09:00", action: "Caso abierto desde alerta ALE-010", user: "Sistema", type: "apertura" },
    ],
  },
  {
    id: "INV-004", alertId: "ALE-008", title: "PEP Identificado — Funcionario estatal", status: "cerrada", priority: "alta",
    openDate: "2024-02-01", assignedTo: "Ana García", daysOpen: 20, actions: 12, documents: 18,
    timeline: [
      { date: "2024-02-21 16:00", action: "ROI enviado a CNBV", user: "Ana García", type: "reporte" },
      { date: "2024-02-20 10:00", action: "Caso cerrado — ROI generado", user: "Ana García", type: "cierre" },
      { date: "2024-02-01 09:00", action: "Caso abierto desde alerta ALE-008", user: "Sistema", type: "apertura" },
    ],
  },
]

const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  en_curso: { label: "En Curso", color: "bg-blue-100 text-blue-700", icon: <Clock className="size-3.5 text-sayo-blue" /> },
  cerrada: { label: "Cerrada", color: "bg-green-100 text-green-700", icon: <CheckCircle className="size-3.5 text-sayo-green" /> },
  escalada: { label: "Escalada", color: "bg-purple-100 text-purple-700", icon: <AlertTriangle className="size-3.5 text-purple-600" /> },
}

const priorityColor = (priority: string) => {
  switch (priority) {
    case "critica": return "bg-red-100 text-red-700"
    case "alta": return "bg-orange-100 text-orange-700"
    case "media": return "bg-yellow-100 text-yellow-700"
    case "baja": return "bg-green-100 text-green-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

const timelineIcon = (type: string) => {
  switch (type) {
    case "apertura": return <FileSearch className="size-3.5 text-sayo-blue" />
    case "accion": return <Send className="size-3.5 text-sayo-orange" />
    case "analisis": return <FileText className="size-3.5 text-sayo-cafe" />
    case "documento": return <FileText className="size-3.5 text-muted-foreground" />
    case "verificación": return <CheckCircle className="size-3.5 text-sayo-green" />
    case "reporte": return <Send className="size-3.5 text-sayo-blue" />
    case "cierre": return <CheckCircle className="size-3.5 text-sayo-green" />
    default: return <Clock className="size-3.5 text-muted-foreground" />
  }
}

export default function InvestigacionesPage() {
  const [investigations, setInvestigations] = React.useState(initialInvestigations)
  const [selectedInv, setSelectedInv] = React.useState<Investigation | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [newOpen, setNewOpen] = React.useState(false)
  const [closeOpen, setCloseOpen] = React.useState(false)
  const [addActionOpen, setAddActionOpen] = React.useState(false)
  const [newForm, setNewForm] = React.useState({ title: "", alertId: "", priority: "media", assignedTo: "" })
  const [newAction, setNewAction] = React.useState("")

  const handleView = (inv: Investigation) => {
    setSelectedInv(inv)
    setDetailOpen(true)
  }

  const handleNewInvestigation = () => {
    if (!newForm.title || !newForm.assignedTo) {
      toast.error("Completa título y asignado")
      return
    }
    const newInv: Investigation = {
      id: `INV-${String(investigations.length + 1).padStart(3, "0")}`,
      alertId: newForm.alertId || "N/A",
      title: newForm.title,
      status: "en_curso",
      priority: newForm.priority,
      openDate: new Date().toISOString().slice(0, 10),
      assignedTo: newForm.assignedTo,
      daysOpen: 0,
      actions: 1,
      documents: 0,
      timeline: [
        { date: `${new Date().toISOString().slice(0, 10)} ${new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}`, action: "Caso abierto manualmente", user: newForm.assignedTo, type: "apertura" },
      ],
    }
    setInvestigations([newInv, ...investigations])
    setNewOpen(false)
    setNewForm({ title: "", alertId: "", priority: "media", assignedTo: "" })
    toast.success("Investigación creada", { description: `${newInv.id} — ${newInv.title}` })
  }

  const handleCloseConfirm = (inv: Investigation) => {
    setSelectedInv(inv)
    setCloseOpen(true)
  }

  const confirmClose = () => {
    if (!selectedInv) return
    const now = new Date()
    const closeTimeline: TimelineItem = {
      date: `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}`,
      action: "Caso cerrado — investigación concluida",
      user: selectedInv.assignedTo,
      type: "cierre",
    }
    setInvestigations((prev) =>
      prev.map((inv) =>
        inv.id === selectedInv.id
          ? { ...inv, status: "cerrada", timeline: [closeTimeline, ...inv.timeline], actions: inv.actions + 1 }
          : inv
      )
    )
    setCloseOpen(false)
    setDetailOpen(false)
    toast.success("Investigación cerrada", { description: `${selectedInv.id} — ${selectedInv.title}` })
  }

  const handleAddAction = () => {
    if (!newAction.trim() || !selectedInv) {
      toast.error("Ingresa una descripción de la acción")
      return
    }
    const now = new Date()
    const actionItem: TimelineItem = {
      date: `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}`,
      action: newAction,
      user: selectedInv.assignedTo,
      type: "accion",
    }
    setInvestigations((prev) =>
      prev.map((inv) =>
        inv.id === selectedInv.id
          ? { ...inv, timeline: [actionItem, ...inv.timeline], actions: inv.actions + 1 }
          : inv
      )
    )
    // Update local selected inv
    setSelectedInv((prev) =>
      prev ? { ...prev, timeline: [actionItem, ...prev.timeline], actions: prev.actions + 1 } : prev
    )
    setAddActionOpen(false)
    setNewAction("")
    toast.success("Acción registrada", { description: newAction })
  }

  const enCurso = investigations.filter((i) => i.status === "en_curso").length
  const cerradas = investigations.filter((i) => i.status === "cerrada").length
  const avgDays = investigations.length > 0
    ? (investigations.reduce((sum, i) => sum + i.daysOpen, 0) / investigations.length).toFixed(1)
    : "0"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Investigaciones</h1>
          <p className="text-sm text-muted-foreground">Casos de investigación PLD/FT — timeline, documentos y resolución</p>
        </div>
        <Button onClick={() => setNewOpen(true)}>
          <Plus className="size-4 mr-1.5" /> Nueva Investigación
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-sayo-blue">{enCurso}</p>
            <p className="text-xs text-muted-foreground">En Curso</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-sayo-green">{cerradas}</p>
            <p className="text-xs text-muted-foreground">Cerradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{avgDays} días</p>
            <p className="text-xs text-muted-foreground">Tiempo promedio resolución</p>
          </CardContent>
        </Card>
      </div>

      {/* Investigation Cards */}
      <div className="space-y-3">
        {investigations.map((inv) => {
          const status = statusMap[inv.status] || statusMap.en_curso
          return (
            <Card key={inv.id} className={`hover:shadow-md transition-shadow cursor-pointer ${inv.status === "cerrada" ? "opacity-70" : ""}`} onClick={() => handleView(inv)}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    {status.icon}
                    <span className="font-mono text-xs">{inv.id}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold">{inv.title}</h3>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${status.color}`}>
                        {status.label}
                      </span>
                      <Badge className={`text-[10px] ${priorityColor(inv.priority)}`}>{inv.priority}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Alerta: {inv.alertId} • Abierta: {inv.openDate} • {inv.daysOpen} días • Asignado: {inv.assignedTo}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-center">
                    <div>
                      <p className="text-muted-foreground">Acciones</p>
                      <p className="font-bold">{inv.actions}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Docs</p>
                      <p className="font-bold">{inv.documents}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleView(inv) }}>
                    <Eye className="size-3.5 mr-1" /> Ver
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detail Dialog with Timeline */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Investigación {selectedInv?.id}</DialogTitle>
            <DialogDescription>{selectedInv?.title}</DialogDescription>
          </DialogHeader>
          {selectedInv && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusMap[selectedInv.status]?.color}`}>
                    {statusMap[selectedInv.status]?.icon}
                    {statusMap[selectedInv.status]?.label}
                  </span>
                  <Badge className={`text-[10px] ${priorityColor(selectedInv.priority)}`}>{selectedInv.priority}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{selectedInv.daysOpen} días abierto</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Alerta Origen</p>
                  <p className="font-mono text-xs">{selectedInv.alertId}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Asignado a</p>
                  <p>{selectedInv.assignedTo}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fecha Apertura</p>
                  <p>{selectedInv.openDate}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Acciones / Docs</p>
                  <p>{selectedInv.actions} acciones • {selectedInv.documents} docs</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="p-3 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">Timeline</p>
                  {selectedInv.status === "en_curso" && (
                    <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => setAddActionOpen(true)}>
                      <Plus className="size-3 mr-1" /> Agregar Acción
                    </Button>
                  )}
                </div>
                <div className="space-y-3">
                  {selectedInv.timeline.map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        {timelineIcon(item.type)}
                        {i < selectedInv.timeline.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                      </div>
                      <div className="flex-1 pb-3">
                        <p className="text-sm">{item.action}</p>
                        <p className="text-[10px] text-muted-foreground">{item.date} — {item.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedInv?.status === "en_curso" && (
              <Button variant="outline" size="sm" className="text-sayo-green" onClick={() => handleCloseConfirm(selectedInv)}>
                <CheckCircle className="size-3.5 mr-1" /> Cerrar Caso
              </Button>
            )}
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Investigation Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Investigación</DialogTitle>
            <DialogDescription>Crear un caso de investigación PLD/FT</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Título del caso</label>
              <Input
                placeholder="Ej: Operación inusual — Cliente XYZ"
                value={newForm.title}
                onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">ID Alerta (opcional)</label>
              <Input
                placeholder="Ej: ALE-015"
                value={newForm.alertId}
                onChange={(e) => setNewForm({ ...newForm, alertId: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Prioridad</label>
              <div className="flex gap-2 mt-1">
                {["baja", "media", "alta", "critica"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setNewForm({ ...newForm, priority: p })}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                      newForm.priority === p ? "bg-sayo-cafe text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Asignado a</label>
              <Input
                placeholder="Ej: Ana García"
                value={newForm.assignedTo}
                onChange={(e) => setNewForm({ ...newForm, assignedTo: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleNewInvestigation}>
              <FileSearch className="size-3.5 mr-1" /> Crear Investigación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Investigation Confirmation */}
      <Dialog open={closeOpen} onOpenChange={setCloseOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="size-5 text-sayo-green" />
              Cerrar Investigación
            </DialogTitle>
            <DialogDescription>
              ¿Confirmar el cierre de esta investigación? El caso será marcado como resuelto.
            </DialogDescription>
          </DialogHeader>
          {selectedInv && (
            <div className="p-3 rounded-lg bg-muted/50 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Caso:</span>
                <span className="font-mono text-xs">{selectedInv.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Título:</span>
                <span className="font-medium text-xs">{selectedInv.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Días abierto:</span>
                <span>{selectedInv.daysOpen}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={confirmClose}>
              <CheckCircle className="size-3.5 mr-1" /> Confirmar Cierre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Action Dialog */}
      <Dialog open={addActionOpen} onOpenChange={setAddActionOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Agregar Acción</DialogTitle>
            <DialogDescription>Registrar una nueva acción en la investigación {selectedInv?.id}</DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Descripción de la acción</label>
            <Input
              placeholder="Ej: Solicitud de documentación adicional..."
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleAddAction}>
              <MessageSquare className="size-3.5 mr-1" /> Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
