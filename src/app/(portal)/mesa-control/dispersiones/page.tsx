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
import { formatMoney } from "@/lib/utils"
import { Send, Users, Clock, CheckCircle, Eye, Download, Plus, FileText } from "lucide-react"
import { toast } from "sonner"

interface Dispersion {
  id: string
  name: string
  type: string
  beneficiarios: number
  total: number
  procesados: number
  pendientes: number
  status: string
  date: string
  hora: string
}

const initialDispersiones: Dispersion[] = [
  { id: "DISP-045", name: "Nómina Quincenal Mar-1", type: "Nómina", beneficiarios: 35, total: 890000, procesados: 33, pendientes: 2, status: "en_proceso", date: "2024-03-06", hora: "10:15" },
  { id: "DISP-044", name: "Nómina Quincenal Feb-2", type: "Nómina", beneficiarios: 34, total: 865000, procesados: 34, pendientes: 0, status: "completada", date: "2024-02-29", hora: "10:00" },
  { id: "DISP-043", name: "Dispersión Créditos Feb", type: "Créditos", beneficiarios: 12, total: 3200000, procesados: 12, pendientes: 0, status: "completada", date: "2024-02-28", hora: "14:30" },
  { id: "DISP-042", name: "Comisiones Comercial Feb", type: "Comisiones", beneficiarios: 8, total: 145000, procesados: 8, pendientes: 0, status: "completada", date: "2024-02-27", hora: "16:00" },
  { id: "DISP-041", name: "Nómina Quincenal Feb-1", type: "Nómina", beneficiarios: 34, total: 862000, procesados: 34, pendientes: 0, status: "completada", date: "2024-02-15", hora: "10:00" },
]

const statusMap: Record<string, { label: string; color: string }> = {
  en_proceso: { label: "En Proceso", color: "bg-blue-100 text-blue-700" },
  completada: { label: "Completada", color: "bg-green-100 text-green-700" },
  pendiente: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700" },
  error: { label: "Error", color: "bg-red-100 text-red-700" },
}

export default function DispersionesPage() {
  const [dispersiones, setDispersiones] = React.useState(initialDispersiones)
  const [selectedDisp, setSelectedDisp] = React.useState<Dispersion | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [newOpen, setNewOpen] = React.useState(false)
  const [newForm, setNewForm] = React.useState({ name: "", type: "Nómina", beneficiarios: "", total: "" })

  const handleView = (d: Dispersion) => {
    setSelectedDisp(d)
    setDetailOpen(true)
  }

  const handleDownload = (d: Dispersion) => {
    toast.success("Descargando reporte", { description: `${d.id} — ${d.name}.csv` })
  }

  const handleNewDispersion = () => {
    if (!newForm.name || !newForm.beneficiarios || !newForm.total) {
      toast.error("Completa todos los campos")
      return
    }
    const newDisp: Dispersion = {
      id: `DISP-${String(dispersiones.length + 40).padStart(3, "0")}`,
      name: newForm.name,
      type: newForm.type,
      beneficiarios: parseInt(newForm.beneficiarios),
      total: parseFloat(newForm.total),
      procesados: 0,
      pendientes: parseInt(newForm.beneficiarios),
      status: "pendiente",
      date: new Date().toISOString().slice(0, 10),
      hora: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
    }
    setDispersiones([newDisp, ...dispersiones])
    setNewOpen(false)
    setNewForm({ name: "", type: "Nómina", beneficiarios: "", total: "" })
    toast.success("Dispersión creada", { description: `${newDisp.id} — ${newDisp.name}` })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Dispersiones</h1>
          <p className="text-sm text-muted-foreground">Lotes de dispersión: nómina, créditos y comisiones</p>
        </div>
        <Button onClick={() => setNewOpen(true)}>
          <Plus className="size-4 mr-1.5" />
          Nueva Dispersión
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50">
              <Send className="size-5 text-sayo-blue" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Dispersado</p>
              <p className="text-lg font-bold">{formatMoney(dispersiones.reduce((s, d) => s + d.total, 0))}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-green-50">
              <CheckCircle className="size-5 text-sayo-green" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Completadas</p>
              <p className="text-lg font-bold">{dispersiones.filter((d) => d.status === "completada").length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-yellow-50">
              <Clock className="size-5 text-sayo-orange" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">En Proceso</p>
              <p className="text-lg font-bold">{dispersiones.filter((d) => d.status === "en_proceso" || d.status === "pendiente").length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dispersión Cards */}
      <div className="space-y-3">
        {dispersiones.map((d) => {
          const status = statusMap[d.status] || statusMap.pendiente
          const progress = d.beneficiarios > 0 ? Math.round((d.procesados / d.beneficiarios) * 100) : 0

          return (
            <Card key={d.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Info */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold">{d.name}</h3>
                      <Badge variant="outline" className="text-[10px]">{d.type}</Badge>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {d.id} — {d.date} {d.hora}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Beneficiarios</p>
                      <div className="flex items-center gap-1 justify-center">
                        <Users className="size-3.5 text-muted-foreground" />
                        <p className="text-sm font-bold">{d.beneficiarios}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-sm font-bold">{formatMoney(d.total)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Progreso</p>
                      <div className="flex items-center gap-1 justify-center">
                        {progress === 100 ? (
                          <CheckCircle className="size-3.5 text-sayo-green" />
                        ) : (
                          <Clock className="size-3.5 text-sayo-blue" />
                        )}
                        <p className="text-sm font-bold">{progress}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => handleView(d)} title="Ver detalle">
                      <Eye className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDownload(d)} title="Descargar">
                      <Download className="size-4" />
                    </Button>
                  </div>
                </div>

                {/* Progress bar */}
                {(d.status === "en_proceso" || d.status === "pendiente") && (
                  <div className="mt-3">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-sayo-blue transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {d.procesados} de {d.beneficiarios} procesados — {d.pendientes} pendientes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de Dispersión</DialogTitle>
            <DialogDescription>{selectedDisp?.id} — {selectedDisp?.name}</DialogDescription>
          </DialogHeader>
          {selectedDisp && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusMap[selectedDisp.status]?.color}`}>
                  {statusMap[selectedDisp.status]?.label}
                </span>
                <p className="text-xl font-bold tabular-nums">{formatMoney(selectedDisp.total)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Tipo</p>
                  <p>{selectedDisp.type}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fecha / Hora</p>
                  <p>{selectedDisp.date} {selectedDisp.hora}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Beneficiarios</p>
                  <p className="font-semibold">{selectedDisp.beneficiarios}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Progreso</p>
                  <p className="font-semibold">{selectedDisp.procesados}/{selectedDisp.beneficiarios} ({Math.round((selectedDisp.procesados / selectedDisp.beneficiarios) * 100)}%)</p>
                </div>
              </div>
              {/* Mock beneficiaries list */}
              <div className="p-3 rounded-lg border space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Beneficiarios (muestra)</p>
                {["Juan Pérez — $25,400", "María López — $32,100", "Carlos Ruiz — $28,500"].map((b, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                    <span>{b.split("—")[0]}</span>
                    <span className="font-semibold tabular-nums text-xs">{b.split("—")[1]}</span>
                  </div>
                ))}
                <p className="text-[10px] text-muted-foreground">...y {selectedDisp.beneficiarios - 3} más</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => selectedDisp && handleDownload(selectedDisp)}>
              <FileText className="size-3.5 mr-1" /> Descargar Reporte
            </Button>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Dispersión Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Dispersión</DialogTitle>
            <DialogDescription>Crear un nuevo lote de dispersión</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nombre del lote</label>
              <Input
                placeholder="Ej: Nómina Quincenal Mar-2"
                value={newForm.name}
                onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Tipo</label>
              <div className="flex gap-2 mt-1">
                {["Nómina", "Créditos", "Comisiones", "Otro"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewForm({ ...newForm, type: t })}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                      newForm.type === t ? "bg-sayo-cafe text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Beneficiarios</label>
                <Input
                  type="number"
                  placeholder="35"
                  value={newForm.beneficiarios}
                  onChange={(e) => setNewForm({ ...newForm, beneficiarios: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Monto Total</label>
                <Input
                  type="number"
                  placeholder="890000"
                  value={newForm.total}
                  onChange={(e) => setNewForm({ ...newForm, total: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleNewDispersion}>
              <Send className="size-3.5 mr-1" /> Crear Dispersión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
