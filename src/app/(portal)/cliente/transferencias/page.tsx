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
import { Send, Star, Clock, ArrowUpRight, ArrowDownLeft, Eye, Check, X, Copy, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Favorite {
  id: string
  name: string
  bank: string
  clabe: string
}

interface Transfer {
  id: string
  type: "egreso" | "ingreso"
  name: string
  amount: number
  date: string
  status: "completada" | "pendiente" | "rechazada"
  clabe?: string
  concept?: string
  reference?: string
}

const initialFavorites: Favorite[] = [
  { id: "FAV-1", name: "Carlos Ruiz", bank: "Banorte", clabe: "072180005678901234" },
  { id: "FAV-2", name: "María López", bank: "BBVA", clabe: "012180001234567891" },
  { id: "FAV-3", name: "CFE", bank: "Banamex", clabe: "002180007890123456" },
]

const initialHistory: Transfer[] = [
  { id: "TRX-001", type: "egreso", name: "Carlos Ruiz", amount: 5000, date: "2024-03-02", status: "completada", clabe: "072180005678901234", concept: "Pago renta marzo", reference: "SPEI-2024-001" },
  { id: "TRX-002", type: "ingreso", name: "Empresa ABC S.A.", amount: 125000, date: "2024-03-01", status: "completada", clabe: "646180009876543210", concept: "Nómina quincenal", reference: "NOM-2024-005" },
  { id: "TRX-003", type: "egreso", name: "GNP Seguros", amount: 43000, date: "2024-02-28", status: "completada", clabe: "036180001122334455", concept: "Póliza auto anual", reference: "SPEI-2024-002" },
  { id: "TRX-004", type: "egreso", name: "CFE", amount: 1200, date: "2024-02-25", status: "completada", clabe: "002180007890123456", concept: "Servicio eléctrico feb", reference: "PAG-CFE-001" },
  { id: "TRX-005", type: "egreso", name: "Telmex", amount: 649, date: "2024-02-20", status: "completada", clabe: "002180006543210987", concept: "Internet fibra feb", reference: "SPEI-2024-003" },
]

const bankMap: Record<string, string> = {
  "002": "Banamex", "012": "BBVA", "014": "Santander", "021": "HSBC",
  "030": "Bajío", "036": "Inbursa", "044": "Scotiabank", "058": "Banregio",
  "072": "Banorte", "127": "Azteca", "646": "SAYO",
}

export default function TransferenciasPage() {
  const [favorites, setFavorites] = React.useState<Favorite[]>(initialFavorites)
  const [history, setHistory] = React.useState<Transfer[]>(initialHistory)
  const [form, setForm] = React.useState({ clabe: "", bank: "", beneficiary: "", amount: "", concept: "" })
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [successOpen, setSuccessOpen] = React.useState(false)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [selectedTrx, setSelectedTrx] = React.useState<Transfer | null>(null)
  const [newFavOpen, setNewFavOpen] = React.useState(false)
  const [newFavForm, setNewFavForm] = React.useState({ name: "", clabe: "" })
  const [lastTrx, setLastTrx] = React.useState<Transfer | null>(null)

  const detectBank = (clabe: string) => {
    if (clabe.length >= 3) {
      const code = clabe.substring(0, 3)
      return bankMap[code] || "Institución desconocida"
    }
    return ""
  }

  const handleClabeChange = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 18)
    setForm({ ...form, clabe: clean, bank: detectBank(clean) })
  }

  const handleSelectFavorite = (fav: Favorite) => {
    setForm({ ...form, clabe: fav.clabe, bank: fav.bank, beneficiary: fav.name })
    toast.info(`Favorito seleccionado: ${fav.name}`)
  }

  const handleTransfer = () => {
    if (!form.clabe || form.clabe.length !== 18) {
      toast.error("Ingresa una CLABE válida de 18 dígitos")
      return
    }
    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast.error("Ingresa un monto válido")
      return
    }
    if (!form.beneficiary) {
      toast.error("Ingresa el nombre del beneficiario")
      return
    }
    setConfirmOpen(true)
  }

  const handleConfirmTransfer = () => {
    const newTrx: Transfer = {
      id: `TRX-${String(history.length + 1).padStart(3, "0")}`,
      type: "egreso",
      name: form.beneficiary,
      amount: parseFloat(form.amount),
      date: new Date().toISOString().slice(0, 10),
      status: "completada",
      clabe: form.clabe,
      concept: form.concept || "Transferencia SPEI",
      reference: `SPEI-${Date.now().toString().slice(-6)}`,
    }
    setHistory([newTrx, ...history])
    setLastTrx(newTrx)
    setConfirmOpen(false)
    setSuccessOpen(true)
    setForm({ clabe: "", bank: "", beneficiary: "", amount: "", concept: "" })
  }

  const handleViewDetail = (trx: Transfer) => {
    setSelectedTrx(trx)
    setDetailOpen(true)
  }

  const handleAddFavorite = () => {
    if (!newFavForm.name || !newFavForm.clabe || newFavForm.clabe.length !== 18) {
      toast.error("Completa nombre y CLABE válida")
      return
    }
    const newFav: Favorite = {
      id: `FAV-${favorites.length + 1}`,
      name: newFavForm.name,
      bank: detectBank(newFavForm.clabe),
      clabe: newFavForm.clabe,
    }
    setFavorites([...favorites, newFav])
    setNewFavOpen(false)
    setNewFavForm({ name: "", clabe: "" })
    toast.success("Favorito agregado", { description: newFav.name })
  }

  const handleDeleteFavorite = (fav: Favorite, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites((prev) => prev.filter((f) => f.id !== fav.id))
    toast.success("Favorito eliminado", { description: fav.name })
  }

  const handleSaveAsFavorite = () => {
    if (!lastTrx) return
    const newFav: Favorite = {
      id: `FAV-${favorites.length + 1}`,
      name: lastTrx.name,
      bank: detectBank(lastTrx.clabe || ""),
      clabe: lastTrx.clabe || "",
    }
    setFavorites([...favorites, newFav])
    toast.success("Guardado como favorito", { description: lastTrx.name })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Transferencias</h1>
        <p className="text-sm text-muted-foreground">Enviar y recibir dinero vía SPEI</p>
      </div>

      {/* Transfer Form */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-sm font-semibold">Nueva Transferencia SPEI</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">CLABE Destino *</label>
              <Input placeholder="18 dígitos..." maxLength={18} value={form.clabe} onChange={(e) => handleClabeChange(e.target.value)} />
              {form.clabe.length > 0 && form.clabe.length < 18 && (
                <p className="text-[10px] text-muted-foreground mt-0.5">{form.clabe.length}/18 dígitos</p>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Banco</label>
              <Input placeholder="Se detecta automáticamente" disabled value={form.bank} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Beneficiario *</label>
              <Input placeholder="Nombre del beneficiario" value={form.beneficiary} onChange={(e) => setForm({ ...form, beneficiary: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Monto *</label>
              <Input placeholder="$0.00" type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Concepto</label>
            <Input placeholder="Concepto del pago (opcional)" value={form.concept} onChange={(e) => setForm({ ...form, concept: e.target.value })} />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleTransfer}><Send className="size-4 mr-1.5" /> Transferir</Button>
          </div>
        </CardContent>
      </Card>

      {/* Favorites */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-1.5"><Star className="size-4 text-sayo-orange" /> Favoritos</h2>
          <Button variant="outline" size="sm" onClick={() => setNewFavOpen(true)}>
            <Plus className="size-3 mr-1" /> Agregar
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {favorites.map((fav) => (
            <Card key={fav.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleSelectFavorite(fav)}>
              <CardContent className="p-3 flex items-center gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium">{fav.name}</p>
                  <p className="text-xs text-muted-foreground">{fav.bank} • ****{fav.clabe.slice(-4)}</p>
                </div>
                <Button variant="ghost" size="icon-xs" onClick={(e) => handleDeleteFavorite(fav, e)} title="Eliminar">
                  <Trash2 className="size-3 text-muted-foreground" />
                </Button>
              </CardContent>
            </Card>
          ))}
          {favorites.length === 0 && (
            <p className="text-xs text-muted-foreground col-span-full text-center py-4">No tienes favoritos guardados</p>
          )}
        </div>
      </div>

      {/* History */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-1.5"><Clock className="size-4 text-muted-foreground" /> Historial</h2>
        <div className="space-y-1">
          {history.map((h) => (
            <Card key={h.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewDetail(h)}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`size-8 rounded-full flex items-center justify-center ${h.type === "ingreso" ? "bg-green-100" : "bg-red-100"}`}>
                  {h.type === "ingreso" ? <ArrowDownLeft className="size-4 text-green-600" /> : <ArrowUpRight className="size-4 text-red-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{h.name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(h.date).toLocaleDateString("es-MX")} {h.concept && `• ${h.concept}`}</p>
                </div>
                <p className={`text-sm font-semibold ${h.type === "ingreso" ? "text-green-600" : "text-red-600"}`}>
                  {h.type === "ingreso" ? "+" : "-"}{formatMoney(h.amount)}
                </p>
                <Badge variant="outline" className={`text-[10px] ${h.status === "completada" ? "bg-green-50 text-green-700" : h.status === "pendiente" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"}`}>{h.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Confirm Transfer Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Transferencia</DialogTitle>
            <DialogDescription>Revisa los datos antes de enviar</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Beneficiario</span>
                <span className="font-medium">{form.beneficiary}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">CLABE</span>
                <span className="font-mono text-xs">{form.clabe}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Banco</span>
                <span>{form.bank}</span>
              </div>
              {form.concept && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Concepto</span>
                  <span>{form.concept}</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2 flex justify-between">
                <span className="text-sm font-medium">Monto</span>
                <span className="text-xl font-bold text-sayo-cafe">{formatMoney(parseFloat(form.amount) || 0)}</span>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              La transferencia se procesará vía SPEI y se reflejará en minutos
            </p>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleConfirmTransfer}>
              <Check className="size-3.5 mr-1" /> Confirmar Envío
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¡Transferencia Exitosa!</DialogTitle>
            <DialogDescription>Tu pago se ha procesado correctamente</DialogDescription>
          </DialogHeader>
          {lastTrx && (
            <div className="space-y-4">
              <div className="text-center p-4">
                <div className="size-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Check className="size-8 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">{formatMoney(lastTrx.amount)}</p>
                <p className="text-sm text-muted-foreground mt-1">enviado a {lastTrx.name}</p>
              </div>
              <div className="p-3 rounded-lg border text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Referencia</span>
                  <span className="font-mono text-xs">{lastTrx.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha</span>
                  <span>{new Date(lastTrx.date).toLocaleDateString("es-MX")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estado</span>
                  <span className="text-green-600 font-medium">Completada</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={handleSaveAsFavorite}>
              <Star className="size-3.5 mr-1" /> Guardar como Favorito
            </Button>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de Transferencia</DialogTitle>
            <DialogDescription>{selectedTrx?.id}</DialogDescription>
          </DialogHeader>
          {selectedTrx && (
            <div className="space-y-4">
              <div className={`flex items-center justify-between p-3 rounded-lg ${selectedTrx.type === "ingreso" ? "bg-green-50" : "bg-red-50"}`}>
                <div className="flex items-center gap-2">
                  {selectedTrx.type === "ingreso" ? <ArrowDownLeft className="size-4 text-green-600" /> : <ArrowUpRight className="size-4 text-red-600" />}
                  <span className={`text-sm font-medium capitalize ${selectedTrx.type === "ingreso" ? "text-green-700" : "text-red-700"}`}>{selectedTrx.type}</span>
                </div>
                <p className={`text-xl font-bold ${selectedTrx.type === "ingreso" ? "text-green-600" : "text-red-600"}`}>
                  {selectedTrx.type === "ingreso" ? "+" : "-"}{formatMoney(selectedTrx.amount)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Beneficiario</p>
                  <p className="font-medium">{selectedTrx.name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fecha</p>
                  <p>{new Date(selectedTrx.date).toLocaleDateString("es-MX")}</p>
                </div>
                {selectedTrx.clabe && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">CLABE</p>
                    <p className="font-mono text-xs">{selectedTrx.clabe}</p>
                  </div>
                )}
                {selectedTrx.reference && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Referencia</p>
                    <p className="font-mono text-xs">{selectedTrx.reference}</p>
                  </div>
                )}
                {selectedTrx.concept && (
                  <div className="col-span-2">
                    <p className="text-[10px] text-muted-foreground uppercase">Concepto</p>
                    <p>{selectedTrx.concept}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <span className="text-xs text-muted-foreground">Estado</span>
                <Badge variant="outline" className={`text-[10px] ${selectedTrx.status === "completada" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>{selectedTrx.status}</Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => {
              if (selectedTrx) {
                const text = `Transferencia SAYO\n${selectedTrx.name}\n${formatMoney(selectedTrx.amount)}\nRef: ${selectedTrx.reference}\nFecha: ${selectedTrx.date}`
                navigator.clipboard.writeText(text).then(() => toast.success("Detalles copiados")).catch(() => toast.info("No se pudo copiar"))
              }
            }}>
              <Copy className="size-3.5 mr-1" /> Copiar
            </Button>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Favorite Dialog */}
      <Dialog open={newFavOpen} onOpenChange={setNewFavOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Favorito</DialogTitle>
            <DialogDescription>Guarda una cuenta para transferencias rápidas</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nombre / Alias *</label>
              <Input placeholder="Ej: Carlos Ruiz" value={newFavForm.name} onChange={(e) => setNewFavForm({ ...newFavForm, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">CLABE *</label>
              <Input placeholder="18 dígitos" maxLength={18} value={newFavForm.clabe} onChange={(e) => setNewFavForm({ ...newFavForm, clabe: e.target.value.replace(/\D/g, "").slice(0, 18) })} />
              {newFavForm.clabe.length >= 3 && (
                <p className="text-[10px] text-muted-foreground mt-0.5">Banco: {detectBank(newFavForm.clabe)}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleAddFavorite}>
              <Star className="size-3.5 mr-1" /> Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
