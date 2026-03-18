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
import { useLeads } from "@/hooks/use-commercial"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import { formatMoney } from "@/lib/utils"
import type { Lead, PipelineStage } from "@/lib/types"
import { User, Phone, Mail, ArrowRight, ArrowLeft, Plus, Eye, ChevronRight } from "lucide-react"
import { toast } from "sonner"

const stages: { id: PipelineStage; label: string; color: string }[] = [
  { id: "prospecto", label: "Prospecto", color: "bg-gray-100 border-gray-200" },
  { id: "contactado", label: "Contactado", color: "bg-blue-50 border-blue-200" },
  { id: "evaluacion", label: "Evaluación", color: "bg-yellow-50 border-yellow-200" },
  { id: "aprobado", label: "Aprobado", color: "bg-green-50 border-green-200" },
  { id: "dispersado", label: "Dispersado", color: "bg-emerald-50 border-emerald-200" },
]

const stageOrder: PipelineStage[] = ["prospecto", "contactado", "evaluacion", "aprobado", "dispersado"]

export default function PipelinePage() {
  const { data: fetchedLeads, isLoading, error, refetch } = useLeads()
  const [pipelineLeads, setPipelineLeads] = React.useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [newOpen, setNewOpen] = React.useState(false)
  const [moveOpen, setMoveOpen] = React.useState(false)
  const [newForm, setNewForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    product: "",
    amount: "",
    source: "web" as Lead["source"],
    assignedTo: "",
  })

  React.useEffect(() => { if (fetchedLeads) setPipelineLeads(fetchedLeads) }, [fetchedLeads])

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error) return <ErrorCard message={error} onRetry={refetch} />

  const handleView = (lead: Lead) => {
    setSelectedLead(lead)
    setDetailOpen(true)
  }

  const handleCall = (lead: Lead) => {
    toast.success("Llamada iniciada", { description: `Contactando a ${lead.name} — ${lead.phone}` })
  }

  const handleEmail = (lead: Lead) => {
    toast.success("Email enviado", { description: `Notificación comercial enviada a ${lead.email}` })
  }

  const advanceStage = (lead: Lead) => {
    const currentIndex = stageOrder.indexOf(lead.stage)
    if (currentIndex >= stageOrder.length - 1) {
      toast.info("Ya está en la última etapa", { description: `${lead.name} ya está en Dispersado` })
      return
    }
    const nextStage = stageOrder[currentIndex + 1]
    setPipelineLeads((prev) =>
      prev.map((l) => (l.id === lead.id ? { ...l, stage: nextStage } : l))
    )
    if (selectedLead?.id === lead.id) {
      setSelectedLead({ ...lead, stage: nextStage })
    }
    toast.success("Lead avanzado", { description: `${lead.name}: ${lead.stage} → ${nextStage}` })
  }

  const regressStage = (lead: Lead) => {
    const currentIndex = stageOrder.indexOf(lead.stage)
    if (currentIndex <= 0) {
      toast.info("Ya está en la primera etapa", { description: `${lead.name} ya está en Prospecto` })
      return
    }
    const prevStage = stageOrder[currentIndex - 1]
    setPipelineLeads((prev) =>
      prev.map((l) => (l.id === lead.id ? { ...l, stage: prevStage } : l))
    )
    if (selectedLead?.id === lead.id) {
      setSelectedLead({ ...lead, stage: prevStage })
    }
    toast.success("Lead retrocedido", { description: `${lead.name}: ${lead.stage} → ${prevStage}` })
  }

  const moveToStage = (lead: Lead, targetStage: PipelineStage) => {
    setPipelineLeads((prev) =>
      prev.map((l) => (l.id === lead.id ? { ...l, stage: targetStage } : l))
    )
    setSelectedLead({ ...lead, stage: targetStage })
    setMoveOpen(false)
    toast.success("Lead movido", { description: `${lead.name} → ${targetStage}` })
  }

  const handleNewLead = () => {
    if (!newForm.name || !newForm.product || !newForm.assignedTo) {
      toast.error("Completa los campos requeridos")
      return
    }
    const newLead: Lead = {
      id: `LED-${String(pipelineLeads.length + 1).padStart(3, "0")}`,
      name: newForm.name,
      email: newForm.email || `${newForm.name.toLowerCase().replace(/\s/g, ".")}@email.com`,
      phone: newForm.phone || "+52 55 0000 0000",
      source: newForm.source,
      product: newForm.product,
      amount: newForm.amount ? Number(newForm.amount) : 0,
      stage: "prospecto",
      score: Math.floor(Math.random() * 40) + 30,
      assignedTo: newForm.assignedTo,
      date: new Date().toISOString().slice(0, 10),
    }
    setPipelineLeads([newLead, ...pipelineLeads])
    setNewOpen(false)
    setNewForm({ name: "", email: "", phone: "", product: "", amount: "", source: "web", assignedTo: "" })
    toast.success("Lead creado", { description: `${newLead.id} — ${newLead.name} agregado como Prospecto` })
  }

  const totalValue = pipelineLeads.reduce((sum, l) => sum + l.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Pipeline Comercial</h1>
          <p className="text-sm text-muted-foreground">
            Kanban: Prospecto → Contactado → Evaluación → Aprobado → Dispersado
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{formatMoney(totalValue)} en pipeline</Badge>
          <Button onClick={() => setNewOpen(true)}>
            <Plus className="size-4 mr-1.5" /> Nuevo Lead
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {stages.map((stage) => {
          const stageLeads = pipelineLeads.filter((l) => l.stage === stage.id)
          const stageValue = stageLeads.reduce((s, l) => s + l.amount, 0)
          return (
            <div key={stage.id}>
              <div className={`rounded-lg border p-3 ${stage.color}`}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-semibold">{stage.label}</h3>
                  <Badge variant="outline" className="text-[10px]">{stageLeads.length}</Badge>
                </div>
                {stageValue > 0 && (
                  <p className="text-[10px] text-muted-foreground mb-3 tabular-nums">{formatMoney(stageValue)}</p>
                )}
                <div className="space-y-2">
                  {stageLeads.map((lead) => (
                    <Card
                      key={lead.id}
                      className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleView(lead)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2 mb-2">
                          <User className="size-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{lead.name}</p>
                            <p className="text-[10px] text-muted-foreground">{lead.product}</p>
                          </div>
                        </div>
                        {lead.amount > 0 && (
                          <p className="text-xs font-bold tabular-nums mb-2">{formatMoney(lead.amount)}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-[10px]">{lead.source}</Badge>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-muted-foreground">Score:</span>
                            <span className={`text-[10px] font-bold ${lead.score > 80 ? "text-sayo-green" : lead.score > 50 ? "text-sayo-orange" : "text-sayo-red"}`}>
                              {lead.score}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1 mt-2 pt-2 border-t" onClick={(e) => e.stopPropagation()}>
                          {stage.id !== "prospecto" && (
                            <Button variant="ghost" size="icon-xs" onClick={() => regressStage(lead)} title="Retroceder">
                              <ArrowLeft className="size-3" />
                            </Button>
                          )}
                          <div className="flex-1" />
                          {stage.id !== "dispersado" && (
                            <Button variant="ghost" size="icon-xs" onClick={() => advanceStage(lead)} title="Avanzar">
                              <ArrowRight className="size-3 text-sayo-green" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {stageLeads.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">Sin leads</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Lead Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle del Lead</DialogTitle>
            <DialogDescription>{selectedLead?.id} — {selectedLead?.name}</DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-xs text-muted-foreground">Etapa actual</p>
                  <p className="font-medium capitalize">{selectedLead.stage}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${selectedLead.score > 80 ? "bg-sayo-green" : selectedLead.score > 50 ? "bg-sayo-orange" : "bg-sayo-red"}`}
                        style={{ width: `${selectedLead.score}%` }}
                      />
                    </div>
                    <span className="text-lg font-bold">{selectedLead.score}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Score</p>
                </div>
              </div>

              {/* Stage Progress */}
              <div className="flex items-center gap-1 px-1">
                {stageOrder.map((s, i) => {
                  const currentIdx = stageOrder.indexOf(selectedLead.stage)
                  const isActive = i <= currentIdx
                  return (
                    <React.Fragment key={s}>
                      <div className={`flex-1 h-1.5 rounded-full ${isActive ? "bg-sayo-green" : "bg-muted"}`} />
                      {i < stageOrder.length - 1 && <ChevronRight className="size-3 text-muted-foreground" />}
                    </React.Fragment>
                  )
                })}
              </div>
              <div className="flex justify-between px-1">
                {stageOrder.map((s) => (
                  <span key={s} className="text-[8px] text-muted-foreground capitalize">{s.slice(0, 4)}</span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Nombre</p>
                  <p className="font-medium">{selectedLead.name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Producto</p>
                  <p>{selectedLead.product}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Email</p>
                  <p className="text-xs">{selectedLead.email}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Teléfono</p>
                  <p className="text-xs">{selectedLead.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Monto</p>
                  <p className="font-semibold">{selectedLead.amount > 0 ? formatMoney(selectedLead.amount) : "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fuente</p>
                  <Badge variant="outline" className="text-[10px]">{selectedLead.source}</Badge>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Ejecutivo</p>
                  <p>{selectedLead.assignedTo}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fecha</p>
                  <p>{selectedLead.date}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-wrap gap-1">
            {selectedLead && selectedLead.stage !== "prospecto" && (
              <Button variant="outline" size="sm" onClick={() => regressStage(selectedLead)}>
                <ArrowLeft className="size-3.5 mr-1" /> Retroceder
              </Button>
            )}
            {selectedLead && selectedLead.stage !== "dispersado" && (
              <Button variant="outline" size="sm" className="text-sayo-green" onClick={() => advanceStage(selectedLead)}>
                Avanzar <ArrowRight className="size-3.5 ml-1" />
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => { setDetailOpen(false); setMoveOpen(true) }}>
              Mover a...
            </Button>
            <Button variant="outline" size="sm" onClick={() => selectedLead && handleCall(selectedLead)}>
              <Phone className="size-3.5 mr-1" /> Llamar
            </Button>
            <Button variant="outline" size="sm" onClick={() => selectedLead && handleEmail(selectedLead)}>
              <Mail className="size-3.5 mr-1" /> Email
            </Button>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move to Stage Dialog */}
      <Dialog open={moveOpen} onOpenChange={setMoveOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Mover Lead</DialogTitle>
            <DialogDescription>Selecciona la etapa destino para {selectedLead?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {stages.map((stage) => (
              <button
                key={stage.id}
                disabled={selectedLead?.stage === stage.id}
                onClick={() => selectedLead && moveToStage(selectedLead, stage.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border text-sm transition-colors ${
                  selectedLead?.stage === stage.id
                    ? "bg-muted/50 text-muted-foreground cursor-not-allowed"
                    : "hover:bg-muted/50 cursor-pointer"
                }`}
              >
                <span className="font-medium">{stage.label}</span>
                {selectedLead?.stage === stage.id && (
                  <Badge variant="outline" className="text-[10px]">Actual</Badge>
                )}
              </button>
            ))}
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Lead Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Lead</DialogTitle>
            <DialogDescription>Agregar prospecto al pipeline como &quot;Prospecto&quot;</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nombre *</label>
              <Input placeholder="Ej: Empresa ABC" value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <Input placeholder="contacto@email.com" value={newForm.email} onChange={(e) => setNewForm({ ...newForm, email: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Teléfono</label>
                <Input placeholder="+52 55 1234 5678" value={newForm.phone} onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Producto *</label>
              <Input placeholder="Ej: Crédito Empresarial" value={newForm.product} onChange={(e) => setNewForm({ ...newForm, product: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Monto estimado</label>
              <Input type="number" placeholder="Ej: 1000000" value={newForm.amount} onChange={(e) => setNewForm({ ...newForm, amount: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Fuente</label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {(["web", "referido", "campaña", "orgánico", "alianza"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setNewForm({ ...newForm, source: s })}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors capitalize ${
                      newForm.source === s ? "bg-sayo-cafe text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Ejecutivo asignado *</label>
              <Input placeholder="Ej: María Fernández" value={newForm.assignedTo} onChange={(e) => setNewForm({ ...newForm, assignedTo: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleNewLead}>
              <Plus className="size-3.5 mr-1" /> Crear Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
