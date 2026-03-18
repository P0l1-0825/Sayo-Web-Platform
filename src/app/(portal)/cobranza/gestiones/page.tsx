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
import { useCollectionActions } from "@/hooks/use-credits"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import type { CollectionAction } from "@/lib/types"
import { Phone, Mail, MessageSquare, Gavel, Eye, Plus, Clock } from "lucide-react"
import { toast } from "sonner"

const iconMap: Record<string, React.ReactNode> = {
  llamada: <Phone className="size-4 text-sayo-green" />,
  email: <Mail className="size-4 text-sayo-blue" />,
  sms: <MessageSquare className="size-4 text-purple-600" />,
  legal: <Gavel className="size-4 text-sayo-red" />,
  visita: <Eye className="size-4 text-sayo-orange" />,
}

const resultColor: Record<string, string> = {
  contactado: "bg-green-100 text-green-700",
  promesa_pago: "bg-blue-100 text-blue-700",
  no_contesta: "bg-yellow-100 text-yellow-700",
  negativa: "bg-red-100 text-red-700",
  buzon: "bg-gray-100 text-gray-500",
}

export default function GestionesPage() {
  const { data: fetchedGestiones, isLoading, error, refetch } = useCollectionActions()
  const [gestiones, setGestiones] = React.useState<CollectionAction[]>([])
  const [selectedGestion, setSelectedGestion] = React.useState<CollectionAction | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [newOpen, setNewOpen] = React.useState(false)
  const [newForm, setNewForm] = React.useState({
    creditId: "",
    type: "llamada",
    result: "contactado",
    notes: "",
    agent: "",
    nextAction: "",
  })

  React.useEffect(() => { if (fetchedGestiones) setGestiones(fetchedGestiones) }, [fetchedGestiones])

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error) return <ErrorCard message={error} onRetry={refetch} />

  const handleView = (gestion: CollectionAction) => {
    setSelectedGestion(gestion)
    setDetailOpen(true)
  }

  const handleNewGestion = () => {
    if (!newForm.creditId || !newForm.agent || !newForm.notes) {
      toast.error("Completa los campos requeridos")
      return
    }
    const now = new Date()
    const newG: CollectionAction = {
      id: `GES-${String(gestiones.length + 1).padStart(3, "0")}`,
      creditId: newForm.creditId,
      type: newForm.type as CollectionAction["type"],
      result: newForm.result as CollectionAction["result"],
      notes: newForm.notes,
      agent: newForm.agent,
      date: `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}`,
      nextAction: newForm.nextAction || undefined,
    }
    setGestiones([newG, ...gestiones])
    setNewOpen(false)
    setNewForm({ creditId: "", type: "llamada", result: "contactado", notes: "", agent: "", nextAction: "" })
    toast.success("Gestión registrada", { description: `${newG.id} — ${newG.type} para ${newG.creditId}` })
  }

  const totalGestiones = gestiones.length
  const contactados = gestiones.filter((g) => g.result === "contactado").length
  const promesas = gestiones.filter((g) => g.result === "promesa_pago").length
  const sinContacto = gestiones.filter((g) => g.result === "no_contesta" || g.result === "buzon").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Gestiones de Cobranza</h1>
          <p className="text-sm text-muted-foreground">Log de gestiones realizadas — llamadas, SMS, email y legal</p>
        </div>
        <Button onClick={() => setNewOpen(true)}>
          <Plus className="size-4 mr-1.5" /> Registrar Gestión
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{totalGestiones}</p><p className="text-xs text-muted-foreground">Total gestiones</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-sayo-green">{contactados}</p><p className="text-xs text-muted-foreground">Contactados</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-sayo-blue">{promesas}</p><p className="text-xs text-muted-foreground">Promesas pago</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-sayo-orange">{sinContacto}</p><p className="text-xs text-muted-foreground">Sin contacto</p></CardContent></Card>
      </div>

      {/* Gestiones List */}
      <div className="space-y-2">
        {gestiones.map((g) => (
          <Card key={g.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleView(g)}>
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                {iconMap[g.type] || <Phone className="size-4" />}
                <span className="font-mono text-xs">{g.id}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium capitalize">{g.type}</p>
                  <Badge variant="outline" className="text-[10px]">{g.creditId}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{g.notes}</p>
              </div>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${resultColor[g.result] || "bg-gray-100 text-gray-500"}`}>
                {g.result.replace("_", " ")}
              </span>
              <div className="text-xs text-muted-foreground text-right">
                <p>{g.agent}</p>
                <p>{g.date}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de Gestión</DialogTitle>
            <DialogDescription>{selectedGestion?.id} — {selectedGestion?.type}</DialogDescription>
          </DialogHeader>
          {selectedGestion && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  {iconMap[selectedGestion.type]}
                  <span className="capitalize font-medium">{selectedGestion.type}</span>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${resultColor[selectedGestion.result] || ""}`}>
                  {selectedGestion.result.replace("_", " ")}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Crédito</p>
                  <p className="font-mono text-xs">{selectedGestion.creditId}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Agente</p>
                  <p>{selectedGestion.agent}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-muted-foreground uppercase">Fecha y Hora</p>
                  <p>{selectedGestion.date}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-muted-foreground uppercase">Notas</p>
                  <p className="text-sm">{selectedGestion.notes}</p>
                </div>
                {selectedGestion.nextAction && (
                  <div className="col-span-2">
                    <p className="text-[10px] text-muted-foreground uppercase">Próxima Acción</p>
                    <p className="text-sm flex items-center gap-1"><Clock className="size-3" /> {selectedGestion.nextAction}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Gestión Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Gestión</DialogTitle>
            <DialogDescription>Registrar una nueva gestión de cobranza</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">ID Crédito *</label>
              <Input
                placeholder="Ej: CRED-001"
                value={newForm.creditId}
                onChange={(e) => setNewForm({ ...newForm, creditId: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Tipo de Gestión</label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {["llamada", "email", "sms", "visita", "legal"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewForm({ ...newForm, type: t })}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors capitalize ${
                      newForm.type === t ? "bg-sayo-cafe text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Resultado</label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {[
                  { value: "contactado", label: "Contactado" },
                  { value: "promesa_pago", label: "Promesa Pago" },
                  { value: "no_contesta", label: "No Contesta" },
                  { value: "negativa", label: "Negativa" },
                ].map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setNewForm({ ...newForm, result: r.value })}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                      newForm.result === r.value ? "bg-sayo-cafe text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Agente *</label>
              <Input
                placeholder="Ej: María López"
                value={newForm.agent}
                onChange={(e) => setNewForm({ ...newForm, agent: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Notas *</label>
              <Input
                placeholder="Descripción de la gestión..."
                value={newForm.notes}
                onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Próxima acción (opcional)</label>
              <Input
                placeholder="Ej: Llamar el viernes 10:00"
                value={newForm.nextAction}
                onChange={(e) => setNewForm({ ...newForm, nextAction: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleNewGestion}>
              <Plus className="size-3.5 mr-1" /> Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
