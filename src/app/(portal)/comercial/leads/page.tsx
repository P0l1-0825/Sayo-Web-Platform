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
import { useLeads } from "@/hooks/use-commercial"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import { formatMoney } from "@/lib/utils"
import type { Lead } from "@/lib/types"
import { Eye, Phone, Mail, Plus, User, ArrowRight } from "lucide-react"
import { toast } from "sonner"

const stageColor: Record<string, string> = {
  prospecto: "bg-gray-100 text-gray-700",
  contactado: "bg-blue-100 text-blue-700",
  evaluacion: "bg-yellow-100 text-yellow-700",
  aprobado: "bg-green-100 text-green-700",
  dispersado: "bg-emerald-100 text-emerald-700",
  rechazado: "bg-red-100 text-red-700",
}

const stageOrder = ["prospecto", "contactado", "evaluacion", "aprobado", "dispersado"]

export default function LeadsPage() {
  const { data: fetchedLeads, isLoading, error, refetch } = useLeads()
  const [leadsList, setLeadsList] = React.useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [newOpen, setNewOpen] = React.useState(false)
  const [newForm, setNewForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    product: "",
    amount: "",
    source: "web" as Lead["source"],
    assignedTo: "",
  })

  React.useEffect(() => { if (fetchedLeads) setLeadsList(fetchedLeads) }, [fetchedLeads])

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
    toast.success("Email enviado", { description: `Notificación enviada a ${lead.email}` })
  }

  const advanceStage = (lead: Lead) => {
    const currentIndex = stageOrder.indexOf(lead.stage)
    if (currentIndex >= stageOrder.length - 1) {
      toast.info("Ya está en la última etapa")
      return
    }
    const nextStage = stageOrder[currentIndex + 1] as Lead["stage"]
    setLeadsList((prev) =>
      prev.map((l) => (l.id === lead.id ? { ...l, stage: nextStage } : l))
    )
    if (selectedLead?.id === lead.id) {
      setSelectedLead({ ...lead, stage: nextStage })
    }
    toast.success("Lead avanzado", { description: `${lead.name}: ${lead.stage} → ${nextStage}` })
  }

  const handleNewLead = () => {
    if (!newForm.name || !newForm.product || !newForm.assignedTo) {
      toast.error("Completa los campos requeridos")
      return
    }
    const newLead: Lead = {
      id: `LED-${String(leadsList.length + 1).padStart(3, "0")}`,
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
    setLeadsList([newLead, ...leadsList])
    setNewOpen(false)
    setNewForm({ name: "", email: "", phone: "", product: "", amount: "", source: "web", assignedTo: "" })
    toast.success("Lead creado", { description: `${newLead.id} — ${newLead.name}` })
  }

  const statusTabs = [
    { label: "Prospecto", value: "prospecto", count: leadsList.filter((l) => l.stage === "prospecto").length },
    { label: "Contactado", value: "contactado", count: leadsList.filter((l) => l.stage === "contactado").length },
    { label: "Evaluación", value: "evaluacion", count: leadsList.filter((l) => l.stage === "evaluacion").length },
    { label: "Aprobado", value: "aprobado", count: leadsList.filter((l) => l.stage === "aprobado").length },
    { label: "Dispersado", value: "dispersado", count: leadsList.filter((l) => l.stage === "dispersado").length },
  ]

  const columns: ColumnDef<Lead>[] = [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
    { accessorKey: "name", header: "Nombre" },
    { accessorKey: "product", header: "Producto", cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.original.product}</Badge> },
    { accessorKey: "amount", header: "Monto", cell: ({ row }) => <span className="font-semibold tabular-nums">{row.original.amount > 0 ? formatMoney(row.original.amount) : "—"}</span> },
    { accessorKey: "source", header: "Fuente", cell: ({ row }) => <span className="text-xs capitalize">{row.original.source}</span> },
    { accessorKey: "stage", header: "Etapa", cell: ({ row }) => (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${stageColor[row.original.stage]}`}>{row.original.stage}</span>
    )},
    { accessorKey: "score", header: "Score", cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
          <div className={`h-full rounded-full ${row.original.score > 80 ? "bg-sayo-green" : row.original.score > 50 ? "bg-sayo-orange" : "bg-sayo-red"}`} style={{ width: `${row.original.score}%` }} />
        </div>
        <span className="text-xs font-semibold">{row.original.score}</span>
      </div>
    )},
    { accessorKey: "assignedTo", header: "Asignado", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.assignedTo}</span> },
    { accessorKey: "date", header: "Fecha", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.date}</span> },
    {
      id: "actions", header: "",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleView(row.original) }} title="Ver detalle">
            <Eye className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleCall(row.original) }} title="Llamar">
            <Phone className="size-3.5 text-sayo-green" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleEmail(row.original) }} title="Email">
            <Mail className="size-3.5 text-sayo-blue" />
          </Button>
          {row.original.stage !== "dispersado" && (
            <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); advanceStage(row.original) }} title="Avanzar etapa">
              <ArrowRight className="size-3.5 text-sayo-orange" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Leads</h1>
          <p className="text-sm text-muted-foreground">Prospectos comerciales — fuente, score y etapa</p>
        </div>
        <Button onClick={() => setNewOpen(true)}>
          <Plus className="size-4 mr-1.5" /> Nuevo Lead
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={leadsList}
        searchKey="name"
        searchPlaceholder="Buscar por nombre..."
        exportFilename="leads_comercial"
        statusTabs={statusTabs}
        statusKey="stage"
        onRowClick={handleView}
      />

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
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${stageColor[selectedLead.stage]}`}>
                  {selectedLead.stage}
                </span>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${selectedLead.score > 80 ? "bg-sayo-green" : selectedLead.score > 50 ? "bg-sayo-orange" : "bg-sayo-red"}`}
                        style={{ width: `${selectedLead.score}%` }}
                      />
                    </div>
                    <span className={`text-lg font-bold ${selectedLead.score > 80 ? "text-sayo-green" : selectedLead.score > 50 ? "text-sayo-orange" : "text-sayo-red"}`}>
                      {selectedLead.score}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Score</p>
                </div>
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
          <DialogFooter>
            {selectedLead && selectedLead.stage !== "dispersado" && (
              <Button variant="outline" size="sm" className="text-sayo-orange" onClick={() => advanceStage(selectedLead)}>
                Avanzar <ArrowRight className="size-3.5 ml-1" />
              </Button>
            )}
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

      {/* New Lead Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Lead</DialogTitle>
            <DialogDescription>Agregar prospecto comercial</DialogDescription>
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
