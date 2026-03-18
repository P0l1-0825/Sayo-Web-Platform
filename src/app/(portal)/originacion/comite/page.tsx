"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { useCreditApplications, useCommitteeDecisions } from "@/hooks/use-originacion"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import { formatMoney } from "@/lib/utils"
import type { CreditApplication, CommitteeDecision } from "@/lib/types"
import { Gavel, CheckCircle, XCircle, Users, ThumbsUp, ThumbsDown, MessageSquare, History } from "lucide-react"
import { toast } from "sonner"

export default function ComitePage() {
  const { data: fetchedApps, isLoading: loadingApps, error: errorApps, refetch: refetchApps } = useCreditApplications()
  const { data: committeeDecisions, isLoading: loadingDecisions, error: errorDecisions, refetch: refetchDecisions } = useCommitteeDecisions()
  const [apps, setApps] = React.useState<CreditApplication[]>([])
  const [voteDialogOpen, setVoteDialogOpen] = React.useState(false)
  const [historyOpen, setHistoryOpen] = React.useState(false)
  const [selectedApp, setSelectedApp] = React.useState<CreditApplication | null>(null)
  const [comments, setComments] = React.useState("")
  const [conditions, setConditions] = React.useState("")

  React.useEffect(() => {
    if (fetchedApps) setApps(fetchedApps.filter((a) => a.status === "en_comite"))
  }, [fetchedApps])

  if (loadingApps || loadingDecisions) return <DashboardSkeleton variant="stats-and-table" />
  if (errorApps) return <ErrorCard message={errorApps} onRetry={refetchApps} />
  if (errorDecisions) return <ErrorCard message={errorDecisions} onRetry={refetchDecisions} />

  const allDecisions = committeeDecisions ?? []

  const handleOpenVote = (app: CreditApplication) => {
    setSelectedApp(app)
    setComments("")
    setConditions("")
    setVoteDialogOpen(true)
  }

  const handleApprove = () => {
    if (!selectedApp) return
    setApps((prev) => prev.filter((a) => a.id !== selectedApp.id))
    setVoteDialogOpen(false)
    toast.success("Crédito aprobado por Comité", {
      description: `${selectedApp.folio} — ${selectedApp.clientName} — ${formatMoney(selectedApp.amount)}`,
    })
  }

  const handleReject = () => {
    if (!selectedApp) return
    setApps((prev) => prev.filter((a) => a.id !== selectedApp.id))
    setVoteDialogOpen(false)
    toast.error("Crédito rechazado por Comité", {
      description: `${selectedApp.folio} — ${selectedApp.clientName}`,
    })
  }

  const members = [
    { name: "Dir. General", role: "Presidente" },
    { name: "Dir. Riesgos", role: "Vocal" },
    { name: "Dir. Operaciones", role: "Vocal" },
    { name: "Oficial PLD", role: "Observador" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Comité de Crédito</h1>
          <p className="text-sm text-muted-foreground">Evaluación y aprobación de solicitudes de credito</p>
        </div>
        <Button variant="outline" onClick={() => setHistoryOpen(true)}>
          <History className="mr-2 h-4 w-4" />
          Historial
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Gavel className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-purple-700">{apps.length}</p>
              <p className="text-xs text-purple-600">Pendientes de Comité</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <ThumbsUp className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-700">{allDecisions.filter((d) => d.decision === "aprobada").length}</p>
              <p className="text-xs text-green-600">Aprobados (historico)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <ThumbsDown className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-red-700">{allDecisions.filter((d) => d.decision === "rechazada").length}</p>
              <p className="text-xs text-red-500">Rechazados (historico)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {apps.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Gavel className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No hay solicitudes pendientes de comite</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {apps.map((app) => (
            <Card key={app.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                      <Gavel className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{app.clientName}</CardTitle>
                      <p className="text-xs text-muted-foreground">{app.folio} — {app.clientType === "PFAE" ? "PFAE" : "PM"} — {app.product}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold tabular-nums">{formatMoney(app.amount)}</p>
                    <p className="text-xs text-muted-foreground">{app.term} meses — {app.rate}%</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Score Buro</p>
                    <p className="font-bold text-lg">{app.bureauScore || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Validaciones</p>
                    {app.validations ? (
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">{Object.values(app.validations).filter(Boolean).length}/{Object.values(app.validations).length}</span>
                        {Object.values(app.validations).every(Boolean) ? (
                          <CheckCircle className="size-4 text-green-600" />
                        ) : (
                          <XCircle className="size-4 text-orange-500" />
                        )}
                      </div>
                    ) : <span className="text-muted-foreground">Pendiente</span>}
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Asignado</p>
                    <p>{app.assignedTo}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Fecha Solicitud</p>
                    <p>{app.createdAt}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" className="text-red-600" onClick={() => { setSelectedApp(app); handleReject() }}>
                    <XCircle className="size-3.5 mr-1" /> Rechazar
                  </Button>
                  <Button size="sm" className="bg-accent-green hover:bg-accent-green/90 text-white" onClick={() => handleOpenVote(app)}>
                    <Gavel className="size-3.5 mr-1" /> Votar / Aprobar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Vote Dialog */}
      <Dialog open={voteDialogOpen} onOpenChange={setVoteDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Votación de Comité</DialogTitle>
            <DialogDescription>{selectedApp?.folio} — {selectedApp?.clientName} — {selectedApp && formatMoney(selectedApp.amount)}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg border">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">Miembros del Comité</p>
              <div className="space-y-2">
                {members.map((m) => (
                  <div key={m.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="size-3.5 text-muted-foreground" />
                      <span>{m.name}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{m.role}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Condiciones de Aprobación</label>
              <Textarea
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                placeholder="Ej: Reducir monto a $300K, solicitar aval adicional..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Comentarios</label>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Observaciones del comite..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-red-600" onClick={handleReject}>
              <ThumbsDown className="size-3.5 mr-1" /> Rechazar
            </Button>
            <Button size="sm" className="bg-accent-green hover:bg-accent-green/90 text-white" onClick={handleApprove}>
              <ThumbsUp className="size-3.5 mr-1" /> Aprobar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Historial de Decisiones</DialogTitle>
            <DialogDescription>Últimas decisiones del comite de credito</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {allDecisions.map((d) => (
              <Card key={d.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs">{d.applicationId}</span>
                    <Badge className={d.decision === "aprobada" ? "bg-green-100 text-green-700" : d.decision === "rechazada" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}>
                      {d.decision}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">{d.clientName}</p>
                  <p className="text-xs text-muted-foreground">{formatMoney(d.amount)} — {d.date}</p>
                  {d.conditions && <p className="text-xs mt-1 text-orange-600">Condiciones: {d.conditions}</p>}
                  <div className="flex gap-1 mt-2">
                    {d.members.map((v, i) => (
                      <Badge key={i} variant="outline" className={`text-[9px] ${v.vote === "aprobar" ? "text-green-600" : "text-red-500"}`}>
                        {v.name}: {v.vote}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
