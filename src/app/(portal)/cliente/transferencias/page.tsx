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
import { Send, Star, Clock, ArrowUpRight, ArrowDownLeft, Check, Copy, Plus, Trash2, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { accountsService, type Account, type TransactionRecord } from "@/lib/accounts-service"
import { ApiError } from "@/lib/api-client"

// ── Types ──────────────────────────────────────────────────────

interface Favorite {
  id: string
  name: string
  bank: string
  clabe: string
}

interface TransferForm {
  clabe: string
  bank: string
  beneficiary: string
  amount: string
  concept: string
}

// ── Bank code map ──────────────────────────────────────────────

const bankMap: Record<string, string> = {
  "002": "Banamex", "006": "Bancomext", "009": "Banobras", "012": "BBVA",
  "014": "Santander", "021": "HSBC", "030": "Bajío", "036": "Inbursa",
  "042": "Mifel", "044": "Scotiabank", "058": "Banregio", "059": "Invex",
  "060": "Bansi", "062": "Afirme", "072": "Banorte", "102": "ABN AMRO",
  "103": "American Express", "106": "BAMSA", "108": "Tokyo", "110": "JP Morgan",
  "112": "Bansí", "113": "Banco del Ejército", "116": "IXE", "124": "Deutsche",
  "126": "Credit Suisse", "127": "Azteca", "128": "Autofin", "132": "Multiva",
  "133": "Actinver", "136": "HDFC", "137": "Bancrea", "138": "CIBANCO",
  "145": "BBASE", "147": "Bankaool", "148": "PagaTodo", "149": "Inmobiliario Mexicano",
  "155": "ICBC", "156": "Sabadell", "166": "BaBien", "168": "HIPOTECARIA FEDERAL",
  "600": "Monexcb", "601": "GBM", "602": "Bamsa", "605": "Valuta",
  "606": "Fondvesta", "607": "Base", "608": "Fincomún", "610": "BANAMEX2",
  "611": "BBVA2", "613": "Multiva Cbolsa", "616": "FINAMEX", "617": "VALMEX",
  "618": "ÚNICA", "619": "MAPFRE", "620": "PROFUTURO", "621": "CB ACTINVER",
  "622": "Oactin", "623": "VALORE", "626": "CBDEUTSCHE", "627": "ZURICHVI",
  "628": "ZUSHERVI", "629": "SU CASITA", "630": "CBINTER", "631": "CI BOLSA",
  "632": "BULLTICK CB", "633": "VALUE", "634": "FONDIVISA", "636": "HDI SEGUROS",
  "637": "ORDER", "638": "AKALA", "640": "CB JP MORGAN", "642": "REFORMA",
  "646": "SAYO", "648": "EVERCORE", "649": "SKANDIA", "651": "SEGMENTA",
  "652": "ASEA", "653": "KUSPIT", "655": "SOFIEXPRESS", "656": "UNAGRA",
  "659": "ASP INTEGRA OPC", "670": "LIBERTAD", "674": "AXA", "679": "FND",
  "684": "TRANSFER", "685": "FONDO (FIRA)", "686": "INVERCAP", "689": "FDEAM",
  "699": "CoDi Valida", "706": "ARCUS", "710": "TELECOMUNICACIONES", "722": "Mercado Pago",
  "723": "CUENCA", "728": "SPIN BY OXXO", "730": "NVIO", "901": "CoDi",
}

function detectBank(clabe: string): string {
  if (clabe.length >= 3) {
    const code = clabe.substring(0, 3)
    return bankMap[code] || "Institución desconocida"
  }
  return ""
}

// ── Helpers to map API records to local Transfer display format ─

function mapTransactionToDisplay(txn: TransactionRecord) {
  const isIngreso = txn.direction === "IN"
  return {
    id: txn.id,
    type: (isIngreso ? "ingreso" : "egreso") as "ingreso" | "egreso",
    name: isIngreso ? (txn.sender_name ?? "Desconocido") : (txn.receiver_name ?? "Desconocido"),
    amount: txn.amount,
    date: txn.initiated_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    status: mapStatus(txn.status),
    clabe: isIngreso ? (txn.sender_clabe ?? undefined) : (txn.receiver_clabe ?? undefined),
    concept: txn.concepto ?? undefined,
    reference: txn.clave_rastreo ?? undefined,
  }
}

function mapStatus(s: string): "completada" | "pendiente" | "rechazada" {
  if (s === "completada" || s === "completed") return "completada"
  if (s === "rechazada" || s === "rejected" || s === "failed") return "rechazada"
  return "pendiente"
}

// ── Component ─────────────────────────────────────────────────

export default function TransferenciasPage() {
  const { user } = useAuth()

  // ── Primary account state ────────────────────────────────────
  const [primaryAccount, setPrimaryAccount] = React.useState<Account | null>(null)
  const [loadingAccount, setLoadingAccount] = React.useState(true)

  // ── History state ────────────────────────────────────────────
  const [history, setHistory] = React.useState<ReturnType<typeof mapTransactionToDisplay>[]>([])
  const [loadingHistory, setLoadingHistory] = React.useState(true)

  // ── Favorites (beneficiaries) state ─────────────────────────
  const [favorites, setFavorites] = React.useState<Favorite[]>([])
  const [loadingFavorites, setLoadingFavorites] = React.useState(true)

  // ── Form state ───────────────────────────────────────────────
  const [form, setForm] = React.useState<TransferForm>({ clabe: "", bank: "", beneficiary: "", amount: "", concept: "" })

  // ── Dialog state ─────────────────────────────────────────────
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [successOpen, setSuccessOpen] = React.useState(false)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [newFavOpen, setNewFavOpen] = React.useState(false)

  // ── Submission state ─────────────────────────────────────────
  const [submitting, setSubmitting] = React.useState(false)
  const [lastTrx, setLastTrx] = React.useState<ReturnType<typeof mapTransactionToDisplay> | null>(null)
  const [selectedTrx, setSelectedTrx] = React.useState<ReturnType<typeof mapTransactionToDisplay> | null>(null)
  const [newFavForm, setNewFavForm] = React.useState({ name: "", clabe: "" })

  // ── Load primary account ──────────────────────────────────────

  const loadPrimaryAccount = React.useCallback(async () => {
    if (!user) return
    setLoadingAccount(true)
    try {
      const accounts = await accountsService.getAccounts(user.id)
      const primary = accounts.find((a) => a.account_type === "debito" && a.status === "active")
        ?? accounts.find((a) => a.status === "active")
        ?? accounts[0]
        ?? null
      setPrimaryAccount(primary)
    } catch (err) {
      toast.error("Error al cargar cuenta", {
        description: err instanceof Error ? err.message : "Error desconocido",
      })
    } finally {
      setLoadingAccount(false)
    }
  }, [user])

  // ── Load transaction history ──────────────────────────────────

  const loadHistory = React.useCallback(async () => {
    if (!user) return
    setLoadingHistory(true)
    try {
      const txns = await accountsService.getUserTransactions(user.id, 50)
      setHistory(txns.map(mapTransactionToDisplay))
    } catch (err) {
      toast.error("Error al cargar historial", {
        description: err instanceof Error ? err.message : "Error desconocido",
      })
    } finally {
      setLoadingHistory(false)
    }
  }, [user])

  // ── Load beneficiaries (favorites) ───────────────────────────

  const loadBeneficiaries = React.useCallback(async () => {
    if (!user) return
    setLoadingFavorites(true)
    try {
      const bens = await accountsService.getBeneficiaries(user.id)
      setFavorites(
        bens.map((b) => ({
          id: b.id,
          name: b.alias ?? b.name,
          bank: b.bank_name,
          clabe: b.clabe,
        }))
      )
    } catch (err) {
      // Non-critical: favorites can fail silently
      console.error("Error loading beneficiaries:", err)
    } finally {
      setLoadingFavorites(false)
    }
  }, [user])

  React.useEffect(() => {
    loadPrimaryAccount()
    loadHistory()
    loadBeneficiaries()
  }, [loadPrimaryAccount, loadHistory, loadBeneficiaries])

  // ── Form handlers ─────────────────────────────────────────────

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
    if (!primaryAccount) {
      toast.error("No se encontró una cuenta de origen")
      return
    }
    setConfirmOpen(true)
  }

  // ── Core transfer call ─────────────────────────────────────────

  const handleConfirmTransfer = async () => {
    if (!primaryAccount || !user) return
    setSubmitting(true)
    try {
      const txn = await accountsService.createTransfer({
        accountId: primaryAccount.id,
        userId: user.id,
        receiverName: form.beneficiary,
        receiverBank: form.bank || detectBank(form.clabe),
        receiverClabe: form.clabe,
        amount: parseFloat(form.amount),
        concepto: form.concept || "Transferencia SPEI",
      })

      const displayTrx = mapTransactionToDisplay(txn)
      setHistory((prev) => [displayTrx, ...prev])
      setLastTrx(displayTrx)
      setConfirmOpen(false)
      setSuccessOpen(true)
      setForm({ clabe: "", bank: "", beneficiary: "", amount: "", concept: "" })

      // Refresh history to get server-confirmed state
      setTimeout(() => loadHistory(), 2000)
    } catch (err) {
      setConfirmOpen(false)
      if (err instanceof ApiError) {
        if (err.code === "INSUFFICIENT_FUNDS" || err.status === 402) {
          toast.error("Fondos insuficientes", {
            description: "Tu saldo disponible no es suficiente para esta transferencia.",
          })
        } else if (err.code === "INVALID_CLABE" || err.status === 422) {
          toast.error("CLABE inválida", {
            description: "Verifica que la CLABE destino sea correcta.",
          })
        } else {
          toast.error(`Error al procesar transferencia (${err.code})`, {
            description: err.message,
          })
        }
      } else {
        toast.error("Error de red", {
          description: "No se pudo conectar con el servidor. Intenta nuevamente.",
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleViewDetail = (trx: ReturnType<typeof mapTransactionToDisplay>) => {
    setSelectedTrx(trx)
    setDetailOpen(true)
  }

  // ── Favorites handlers ────────────────────────────────────────

  const handleAddFavorite = async () => {
    if (!newFavForm.name || !newFavForm.clabe || newFavForm.clabe.length !== 18) {
      toast.error("Completa nombre y CLABE válida")
      return
    }
    if (!user) return

    const bank = detectBank(newFavForm.clabe)
    try {
      await accountsService.addBeneficiary({
        user_id: user.id,
        name: newFavForm.name,
        bank_name: bank,
        bank_code: newFavForm.clabe.substring(0, 3),
        clabe: newFavForm.clabe,
        alias: null,
        email: null,
        phone: null,
        is_favorite: true,
      })
      const newFav: Favorite = {
        id: `fav-${Date.now()}`,
        name: newFavForm.name,
        bank,
        clabe: newFavForm.clabe,
      }
      setFavorites((prev) => [...prev, newFav])
      setNewFavOpen(false)
      setNewFavForm({ name: "", clabe: "" })
      toast.success("Favorito agregado", { description: newFavForm.name })
    } catch {
      // Fallback to local only if API fails
      const newFav: Favorite = {
        id: `fav-${Date.now()}`,
        name: newFavForm.name,
        bank,
        clabe: newFavForm.clabe,
      }
      setFavorites((prev) => [...prev, newFav])
      setNewFavOpen(false)
      setNewFavForm({ name: "", clabe: "" })
      toast.success("Favorito guardado localmente", { description: newFavForm.name })
    }
  }

  const handleDeleteFavorite = (fav: Favorite, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites((prev) => prev.filter((f) => f.id !== fav.id))
    toast.success("Favorito eliminado", { description: fav.name })
  }

  const handleSaveAsFavorite = async () => {
    if (!lastTrx || !user) return
    const bank = detectBank(lastTrx.clabe ?? "")
    try {
      await accountsService.addBeneficiary({
        user_id: user.id,
        name: lastTrx.name,
        bank_name: bank,
        bank_code: (lastTrx.clabe ?? "").substring(0, 3),
        clabe: lastTrx.clabe ?? "",
        alias: null,
        email: null,
        phone: null,
        is_favorite: true,
      })
      setFavorites((prev) => [
        ...prev,
        { id: `fav-${Date.now()}`, name: lastTrx.name, bank, clabe: lastTrx.clabe ?? "" },
      ])
      toast.success("Guardado como favorito", { description: lastTrx.name })
    } catch {
      setFavorites((prev) => [
        ...prev,
        { id: `fav-${Date.now()}`, name: lastTrx.name, bank, clabe: lastTrx.clabe ?? "" },
      ])
      toast.success("Guardado como favorito", { description: lastTrx.name })
    }
  }

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Transferencias</h1>
          <p className="text-sm text-muted-foreground">Enviar y recibir dinero vía SPEI</p>
        </div>
        {primaryAccount && (
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground">Cuenta origen</p>
            <p className="text-sm font-semibold">{formatMoney(primaryAccount.available_balance)}</p>
            <p className="text-[10px] text-muted-foreground font-mono">****{primaryAccount.clabe.slice(-4)}</p>
          </div>
        )}
      </div>

      {/* Transfer Form */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Nueva Transferencia SPEI</h2>
            {loadingAccount && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="size-3 animate-spin" /> Cargando cuenta...
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">CLABE Destino *</label>
              <Input
                placeholder="18 dígitos..."
                maxLength={18}
                value={form.clabe}
                onChange={(e) => handleClabeChange(e.target.value)}
              />
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
              <Input
                placeholder="Nombre del beneficiario"
                value={form.beneficiary}
                onChange={(e) => setForm({ ...form, beneficiary: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Monto *</label>
              <Input
                placeholder="$0.00"
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Concepto</label>
            <Input
              placeholder="Concepto del pago (opcional)"
              value={form.concept}
              onChange={(e) => setForm({ ...form, concept: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between">
            {primaryAccount && (
              <p className="text-xs text-muted-foreground">
                Disponible: <span className="font-semibold">{formatMoney(primaryAccount.available_balance)}</span>
              </p>
            )}
            <Button onClick={handleTransfer} disabled={loadingAccount || !primaryAccount} className="ml-auto">
              <Send className="size-4 mr-1.5" /> Transferir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Favorites */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <Star className="size-4 text-sayo-orange" /> Favoritos
          </h2>
          <Button variant="outline" size="sm" onClick={() => setNewFavOpen(true)}>
            <Plus className="size-3 mr-1" /> Agregar
          </Button>
        </div>
        {loadingFavorites ? (
          <div className="flex gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex-1 h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {favorites.map((fav) => (
              <Card
                key={fav.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleSelectFavorite(fav)}
              >
                <CardContent className="p-3 flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{fav.name}</p>
                    <p className="text-xs text-muted-foreground">{fav.bank} • ****{fav.clabe.slice(-4)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => handleDeleteFavorite(fav, e)}
                    title="Eliminar"
                  >
                    <Trash2 className="size-3 text-muted-foreground" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            {favorites.length === 0 && (
              <p className="text-xs text-muted-foreground col-span-full text-center py-4">
                No tienes favoritos guardados
              </p>
            )}
          </div>
        )}
      </div>

      {/* History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <Clock className="size-4 text-muted-foreground" /> Historial
          </h2>
          <Button variant="ghost" size="sm" onClick={loadHistory} disabled={loadingHistory}>
            <RefreshCw className={`size-3.5 ${loadingHistory ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {loadingHistory ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="size-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No hay transferencias en el historial</p>
          </div>
        ) : (
          <div className="space-y-1">
            {history.map((h) => (
              <Card
                key={h.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleViewDetail(h)}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <div
                    className={`size-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      h.type === "ingreso" ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    {h.type === "ingreso" ? (
                      <ArrowDownLeft className="size-4 text-green-600" />
                    ) : (
                      <ArrowUpRight className="size-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{h.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(h.date).toLocaleDateString("es-MX")}
                      {h.concept ? ` • ${h.concept}` : ""}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-semibold tabular-nums flex-shrink-0 ${
                      h.type === "ingreso" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {h.type === "ingreso" ? "+" : "-"}{formatMoney(h.amount)}
                  </p>
                  <Badge
                    variant="outline"
                    className={`text-[10px] flex-shrink-0 ${
                      h.status === "completada"
                        ? "bg-green-50 text-green-700"
                        : h.status === "pendiente"
                        ? "bg-yellow-50 text-yellow-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {h.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Transfer Dialog */}
      <Dialog open={confirmOpen} onOpenChange={(open) => { if (!submitting) setConfirmOpen(open) }}>
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
              {primaryAccount && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cuenta origen</span>
                  <span className="font-mono text-xs">****{primaryAccount.clabe.slice(-4)}</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2 flex justify-between">
                <span className="text-sm font-medium">Monto</span>
                <span className="text-xl font-bold text-sayo-cafe">
                  {formatMoney(parseFloat(form.amount) || 0)}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              La transferencia se procesará vía SPEI y se reflejará en minutos
            </p>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={submitting} />}>Cancelar</DialogClose>
            <Button onClick={handleConfirmTransfer} disabled={submitting}>
              {submitting ? (
                <Loader2 className="size-3.5 mr-1 animate-spin" />
              ) : (
                <Check className="size-3.5 mr-1" />
              )}
              {submitting ? "Procesando..." : "Confirmar Envío"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transferencia Enviada</DialogTitle>
            <DialogDescription>Tu pago se ha procesado correctamente</DialogDescription>
          </DialogHeader>
          {lastTrx && (
            <div className="space-y-4">
              <div className="text-center p-4">
                <div className="size-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Check className="size-8 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600 tabular-nums">
                  {formatMoney(lastTrx.amount)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">enviado a {lastTrx.name}</p>
              </div>
              <div className="p-3 rounded-lg border text-sm space-y-1">
                {lastTrx.reference && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Referencia</span>
                    <span className="font-mono text-xs">{lastTrx.reference}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha</span>
                  <span>{new Date(lastTrx.date).toLocaleDateString("es-MX")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estado</span>
                  <span className={lastTrx.status === "completada" ? "text-green-600 font-medium" : "text-yellow-600 font-medium capitalize"}>
                    {lastTrx.status}
                  </span>
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
              <div
                className={`flex items-center justify-between p-3 rounded-lg ${
                  selectedTrx.type === "ingreso" ? "bg-green-50" : "bg-red-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  {selectedTrx.type === "ingreso" ? (
                    <ArrowDownLeft className="size-4 text-green-600" />
                  ) : (
                    <ArrowUpRight className="size-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm font-medium capitalize ${
                      selectedTrx.type === "ingreso" ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {selectedTrx.type}
                  </span>
                </div>
                <p
                  className={`text-xl font-bold tabular-nums ${
                    selectedTrx.type === "ingreso" ? "text-green-600" : "text-red-600"
                  }`}
                >
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
                <Badge
                  variant="outline"
                  className={`text-[10px] ${
                    selectedTrx.status === "completada"
                      ? "bg-green-50 text-green-700"
                      : selectedTrx.status === "pendiente"
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {selectedTrx.status}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (selectedTrx) {
                  const text = `Transferencia SAYO\n${selectedTrx.name}\n${formatMoney(selectedTrx.amount)}\nRef: ${selectedTrx.reference ?? "N/A"}\nFecha: ${selectedTrx.date}`
                  navigator.clipboard
                    .writeText(text)
                    .then(() => toast.success("Detalles copiados"))
                    .catch(() => toast.info("No se pudo copiar"))
                }
              }}
            >
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
              <Input
                placeholder="Ej: Carlos Ruiz"
                value={newFavForm.name}
                onChange={(e) => setNewFavForm({ ...newFavForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">CLABE *</label>
              <Input
                placeholder="18 dígitos"
                maxLength={18}
                value={newFavForm.clabe}
                onChange={(e) =>
                  setNewFavForm({ ...newFavForm, clabe: e.target.value.replace(/\D/g, "").slice(0, 18) })
                }
              />
              {newFavForm.clabe.length >= 3 && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Banco: {detectBank(newFavForm.clabe)}
                </p>
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
