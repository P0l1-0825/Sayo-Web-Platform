"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { notificationTemplates } from "@/hooks/use-admin"
import type { NotificationTemplate } from "@/lib/types"
import { Bell, Mail, Smartphone, MessageSquare, Eye, ToggleRight, ToggleLeft, Pencil } from "lucide-react"
import { toast } from "sonner"

const channelConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  email: { label: "Email", icon: <Mail className="size-3.5" />, color: "bg-blue-100 text-blue-700" },
  sms: { label: "SMS", icon: <Smartphone className="size-3.5" />, color: "bg-green-100 text-green-700" },
  push: { label: "Push", icon: <MessageSquare className="size-3.5" />, color: "bg-purple-100 text-purple-700" },
}

const eventLabels: Record<string, string> = {
  bienvenida: "Bienvenida",
  pago_recibido: "Pago Recibido",
  vencimiento_credito: "Vencimiento Crédito",
  aprobación_credito: "Aprobación Crédito",
  rechazo_credito: "Rechazo Crédito",
}

export default function PlantillasNotificacionPage() {
  const [templates, setTemplates] = React.useState(notificationTemplates)
  const [selectedTemplate, setSelectedTemplate] = React.useState<NotificationTemplate | null>(null)
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [editSubject, setEditSubject] = React.useState("")
  const [editBody, setEditBody] = React.useState("")

  const handleView = (template: NotificationTemplate) => {
    setSelectedTemplate(template)
    setPreviewOpen(true)
  }

  const handleEdit = (template: NotificationTemplate) => {
    setSelectedTemplate(template)
    setEditSubject(template.subject)
    setEditBody(template.body)
    setEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!selectedTemplate) return
    setTemplates((prev) => prev.map((t) => t.id === selectedTemplate.id ? {
      ...t,
      subject: editSubject,
      body: editBody,
      lastEdited: new Date().toISOString().split("T")[0],
    } : t))
    setEditOpen(false)
    toast.success("Plantilla actualizada", { description: selectedTemplate.event })
  }

  const handleToggleActive = (template: NotificationTemplate) => {
    setTemplates((prev) => prev.map((t) => t.id === template.id ? { ...t, active: !t.active } : t))
    toast.info(`Plantilla ${template.active ? "desactivada" : "activada"}`)
  }

  const emailCount = templates.filter((t) => t.channel === "email").length
  const smsCount = templates.filter((t) => t.channel === "sms").length
  const pushCount = templates.filter((t) => t.channel === "push").length
  const activeCount = templates.filter((t) => t.active).length

  const columns: ColumnDef<NotificationTemplate>[] = [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
    {
      accessorKey: "event",
      header: "Evento",
      cell: ({ row }) => <span className="text-sm font-medium">{eventLabels[row.original.event] || row.original.event}</span>,
    },
    {
      accessorKey: "channel",
      header: "Canal",
      cell: ({ row }) => {
        const ch = channelConfig[row.original.channel]
        return (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${ch.color}`}>
            {ch.icon}
            {ch.label}
          </span>
        )
      },
    },
    { accessorKey: "subject", header: "Asunto", cell: ({ row }) => <span className="text-xs">{row.original.subject}</span> },
    {
      accessorKey: "variables",
      header: "Variables",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.variables.slice(0, 3).map((v) => (
            <Badge key={v} variant="outline" className="text-[9px] font-mono">{`{${v}}`}</Badge>
          ))}
          {row.original.variables.length > 3 && <Badge variant="outline" className="text-[9px]">+{row.original.variables.length - 3}</Badge>}
        </div>
      ),
    },
    {
      accessorKey: "active",
      header: "Estado",
      cell: ({ row }) => (
        <button onClick={(e) => { e.stopPropagation(); handleToggleActive(row.original) }} className="flex items-center gap-1">
          {row.original.active ? (
            <ToggleRight className="size-5 text-green-600" />
          ) : (
            <ToggleLeft className="size-5 text-gray-400" />
          )}
          <span className={`text-[10px] font-medium ${row.original.active ? "text-green-600" : "text-gray-400"}`}>
            {row.original.active ? "Activa" : "Inactiva"}
          </span>
        </button>
      ),
    },
    { accessorKey: "lastEdited", header: "Editado", cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.lastEdited}</span> },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleView(row.original) }}>
            <Eye className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleEdit(row.original) }}>
            <Pencil className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Plantillas de Notificación</h1>
        <p className="text-sm text-muted-foreground">Templates por evento — email, SMS y push notifications</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Mail className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-700">{emailCount}</p>
              <p className="text-xs text-blue-600">Email</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Smartphone className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-700">{smsCount}</p>
              <p className="text-xs text-green-600">SMS</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-purple-700">{pushCount}</p>
              <p className="text-xs text-purple-600">Push</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Bell className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold text-orange-700">{activeCount}/{templates.length}</p>
              <p className="text-xs text-orange-600">Activas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-3">Todas las Plantillas</h2>
        <DataTable
          columns={columns}
          data={templates}
          searchKey="event"
          searchPlaceholder="Buscar por evento..."
          exportFilename="plantillas_notificación"
        />
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Preview de Plantilla</DialogTitle>
            <DialogDescription>{eventLabels[selectedTemplate?.event || ""] || selectedTemplate?.event}</DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${channelConfig[selectedTemplate.channel].color}`}>
                  {channelConfig[selectedTemplate.channel].icon}
                  {channelConfig[selectedTemplate.channel].label}
                </span>
                <Badge className={`text-[10px] ${selectedTemplate.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {selectedTemplate.active ? "Activa" : "Inactiva"}
                </Badge>
              </div>

              {/* Preview Card */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted p-3 border-b">
                  <p className="text-[10px] text-muted-foreground uppercase">Asunto</p>
                  <p className="text-sm font-semibold">{selectedTemplate.subject}</p>
                </div>
                <div className="p-3">
                  <p className="text-[10px] text-muted-foreground uppercase mb-1">Cuerpo</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedTemplate.body}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-muted-foreground uppercase mb-1">Variables Disponibles</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTemplate.variables.map((v) => (
                    <Badge key={v} variant="outline" className="text-xs font-mono">{`{${v}}`}</Badge>
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground">Última edicion: {selectedTemplate.lastEdited}</p>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
            <Button onClick={() => { setPreviewOpen(false); if (selectedTemplate) handleEdit(selectedTemplate) }} className="bg-sayo-cafe hover:bg-sayo-cafe-light">
              <Pencil className="mr-1 h-3.5 w-3.5" /> Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Plantilla</DialogTitle>
            <DialogDescription>{eventLabels[selectedTemplate?.event || ""] || selectedTemplate?.event} — {channelConfig[selectedTemplate?.channel || "email"]?.label}</DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Asunto</Label>
                <Input value={editSubject} onChange={(e) => setEditSubject(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Cuerpo del mensaje</Label>
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase mb-1">Variables disponibles — click para insertar</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTemplate.variables.map((v) => (
                    <button
                      key={v}
                      onClick={() => setEditBody((prev) => prev + `{${v}}`)}
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-mono border hover:bg-muted transition-colors cursor-pointer"
                    >
                      {`{${v}}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleSaveEdit} className="bg-sayo-cafe hover:bg-sayo-cafe-light">Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
