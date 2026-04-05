"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  CreditCard,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Plus,
  Copy,
  Check,
  RefreshCw,
  Shield,
  ShieldOff,
  Smartphone,
  Globe,
  Plane,
  Truck,
  AlertTriangle,
  Loader2,
  Trash2,
  DollarSign,
  Key,
  Wallet,
} from "lucide-react"
import { toast } from "sonner"
import { cardService } from "@/lib/card-service"
import type { Card as CardType, CardSensitiveData, CardToken, CardShipment, CardBlock } from "@/lib/types"

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n)

function statusColor(status: CardType["status"]) {
  switch (status) {
    case "active":
      return "bg-green-500/15 text-green-700 border-green-300"
    case "blocked":
      return "bg-red-500/15 text-red-700 border-red-300"
    case "pending_activation":
      return "bg-yellow-500/15 text-yellow-700 border-yellow-300"
    default:
      return "bg-gray-200 text-gray-600"
  }
}

function statusLabel(status: CardType["status"]) {
  switch (status) {
    case "active":
      return "Activa"
    case "blocked":
      return "Bloqueada"
    case "pending_activation":
      return "Pendiente Activación"
    case "expired":
      return "Expirada"
    case "cancelled":
      return "Cancelada"
  }
}

function tokenProviderLabel(p: CardToken["provider"]) {
  switch (p) {
    case "apple_pay":
      return "Apple Pay"
    case "google_pay":
      return "Google Pay"
    case "samsung_pay":
      return "Samsung Pay"
  }
}

function shipmentStatusLabel(s: CardShipment["status"]) {
  switch (s) {
    case "pending":
      return "Pendiente"
    case "in_transit":
      return "En tránsito"
    case "delivered":
      return "Entregada"
    case "failed":
      return "Fallida"
  }
}

// ────────────────────────────────────────────────────────────
// Visual Card Component
// ────────────────────────────────────────────────────────────

function CardVisual({
  card,
  selected,
  onClick,
}: {
  card: CardType
  selected: boolean
  onClick: () => void
}) {
  const gradient =
    card.status === "blocked"
      ? "from-gray-500 to-gray-700"
      : card.status === "pending_activation"
        ? "from-amber-600 to-amber-800"
        : card.is_virtual
          ? "from-[#472913] to-[#7a4522]"
          : "from-gray-800 to-gray-950"

  return (
    <div
      onClick={onClick}
      className={`min-w-[300px] max-w-[340px] rounded-2xl p-6 text-white cursor-pointer transition-all select-none
        bg-gradient-to-br ${gradient}
        ${selected ? "ring-2 ring-white/80 shadow-xl scale-[1.02]" : "opacity-80 hover:opacity-95"}`}
    >
      {/* Top row */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="text-[10px] text-white/60 uppercase tracking-wider">
            {card.is_virtual ? "Tarjeta Virtual" : "Tarjeta Física"}
          </p>
          <p className="text-xs font-medium text-white/80">{card.brand}</p>
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold ${statusColor(card.status)}`}
        >
          {statusLabel(card.status)}
        </span>
      </div>

      {/* Number */}
      <p className="text-xl font-mono tracking-[0.22em] mb-6">{card.card_number_masked}</p>

      {/* Bottom row */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[9px] text-white/50 uppercase tracking-wider mb-0.5">Titular</p>
          <p className="text-sm font-medium">{card.holder_name}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-white/50 uppercase tracking-wider mb-0.5">Vence</p>
          <p className="text-sm font-mono">{card.expiry_date}</p>
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────

export default function TarjetasPage() {
  // Card list state
  const [cards, setCards] = React.useState<CardType[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedIdx, setSelectedIdx] = React.useState(0)

  // Sensitive data
  const [sensitiveData, setSensitiveData] = React.useState<CardSensitiveData | null>(null)
  const [sensitiveVisible, setSensitiveVisible] = React.useState(false)
  const [cvvCountdown, setCvvCountdown] = React.useState(0)

  // Tokens & blocks
  const [tokens, setTokens] = React.useState<CardToken[]>([])
  const [blocks, setBlocks] = React.useState<CardBlock[]>([])
  const [shipment, setShipment] = React.useState<CardShipment | null>(null)

  // Action loading states
  const [actionLoading, setActionLoading] = React.useState(false)

  // Dialog states
  const [newCardOpen, setNewCardOpen] = React.useState(false)
  const [activateOpen, setActivateOpen] = React.useState(false)
  const [blockOpen, setBlockOpen] = React.useState(false)
  const [cvvOpen, setCvvOpen] = React.useState(false)
  const [panOpen, setPanOpen] = React.useState(false)
  const [chargebackOpen, setChargebackOpen] = React.useState(false)
  const [travelOpen, setTravelOpen] = React.useState(false)
  const [addBlockOpen, setAddBlockOpen] = React.useState(false)
  const [fondearOpen, setFondearOpen] = React.useState(false)
  const [sustituirOpen, setSustituirOpen] = React.useState(false)

  // Form state
  const [newCardType, setNewCardType] = React.useState<"virtual" | "physical">("virtual")
  const [newCardName, setNewCardName] = React.useState("")
  const [activatePin, setActivatePin] = React.useState("")
  const [activatePinConfirm, setActivatePinConfirm] = React.useState("")
  const [blockReason, setBlockReason] = React.useState("lost")
  const [cbTxId, setCbTxId] = React.useState("")
  const [cbReason, setCbReason] = React.useState("")
  const [cbAmount, setCbAmount] = React.useState("")
  const [travelCountries, setTravelCountries] = React.useState("")
  const [travelStart, setTravelStart] = React.useState("")
  const [travelEnd, setTravelEnd] = React.useState("")
  const [newBlockType, setNewBlockType] = React.useState<CardBlock["block_type"]>("country")
  const [newBlockValue, setNewBlockValue] = React.useState("")
  const [fondearAmount, setFondearAmount] = React.useState("")
  const [sustituirReason, setSustituirReason] = React.useState("lost")
  const [panCopied, setPanCopied] = React.useState(false)

  // ── Load cards on mount ──
  React.useEffect(() => {
    cardService
      .fetchCards()
      .then((data) => {
        setCards(data)
        setLoading(false)
      })
      .catch(() => {
        toast.error("No se pudieron cargar las tarjetas")
        setLoading(false)
      })
  }, [])

  // ── Load card details when selection changes ──
  const selected = cards[selectedIdx]

  React.useEffect(() => {
    if (!selected) return
    setSensitiveData(null)
    setSensitiveVisible(false)
    setCvvCountdown(0)

    // Load tokens
    cardService.getTokens(selected.id).then(setTokens).catch(() => setTokens([]))

    // Load blocks
    cardService.getBlocks(selected.id).then(setBlocks).catch(() => setBlocks([]))

    // Load shipment (physical only)
    if (!selected.is_virtual) {
      cardService.getShipment(selected.id).then(setShipment).catch(() => setShipment(null))
    } else {
      setShipment(null)
    }
  }, [selected?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── CVV countdown timer ──
  React.useEffect(() => {
    if (cvvCountdown <= 0) return
    const t = setTimeout(() => setCvvCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cvvCountdown])

  React.useEffect(() => {
    if (cvvCountdown === 0 && sensitiveVisible) {
      setSensitiveVisible(false)
      setSensitiveData(null)
      toast.info("CVV oculto por seguridad")
    }
  }, [cvvCountdown, sensitiveVisible])

  // ────────────────────────────────────────────────────────────
  // Actions
  // ────────────────────────────────────────────────────────────

  async function handleCreateCard() {
    if (!newCardName.trim()) {
      toast.error("Ingresa el nombre del titular")
      return
    }
    setActionLoading(true)
    try {
      const card = await cardService.createCard(newCardType, newCardName.trim())
      setCards((prev) => [...prev, card])
      setSelectedIdx(cards.length) // select the new card
      toast.success("Tarjeta creada exitosamente", {
        description: card.is_virtual ? "Tu tarjeta virtual ya está disponible" : "Tu tarjeta física será enviada en 5-7 días hábiles",
      })
      setNewCardOpen(false)
      setNewCardName("")
    } catch {
      toast.error("No se pudo crear la tarjeta")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleActivateCard() {
    if (activatePin.length < 4) {
      toast.error("El PIN debe tener al menos 4 dígitos")
      return
    }
    if (activatePin !== activatePinConfirm) {
      toast.error("Los PINs no coinciden")
      return
    }
    setActionLoading(true)
    try {
      await cardService.activateCard(selected.id, activatePin)
      setCards((prev) =>
        prev.map((c, i) => (i === selectedIdx ? { ...c, status: "active" } : c))
      )
      toast.success("Tarjeta activada correctamente")
      setActivateOpen(false)
      setActivatePin("")
      setActivatePinConfirm("")
    } catch {
      toast.error("No se pudo activar la tarjeta")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleToggleBlock() {
    if (selected.status === "active") {
      setBlockOpen(true)
    } else if (selected.status === "blocked") {
      setActionLoading(true)
      try {
        await cardService.unblockCard(selected.id)
        setCards((prev) =>
          prev.map((c, i) => (i === selectedIdx ? { ...c, status: "active" } : c))
        )
        toast.success("Tarjeta desbloqueada")
      } catch {
        toast.error("No se pudo desbloquear la tarjeta")
      } finally {
        setActionLoading(false)
      }
    }
  }

  async function handleBlock() {
    setActionLoading(true)
    try {
      await cardService.blockCard(selected.id, blockReason)
      setCards((prev) =>
        prev.map((c, i) => (i === selectedIdx ? { ...c, status: "blocked" } : c))
      )
      toast.success("Tarjeta bloqueada", { description: "Comunícate con soporte si necesitas ayuda" })
      setBlockOpen(false)
    } catch {
      toast.error("No se pudo bloquear la tarjeta")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleShowCvv() {
    setActionLoading(true)
    try {
      const data = await cardService.getSensitiveData(selected.id)
      setSensitiveData(data)
      setSensitiveVisible(true)
      setCvvCountdown(30)
      setCvvOpen(true)
    } catch {
      toast.error("No se pudo obtener el CVV")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleRefreshCvv() {
    setActionLoading(true)
    try {
      const data = await cardService.refreshCvv(selected.id)
      setSensitiveData(data)
      toast.success("CVV actualizado")
    } catch {
      toast.error("No se pudo refrescar el CVV")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleShowPan() {
    setActionLoading(true)
    try {
      const data = await cardService.getSensitiveData(selected.id)
      setSensitiveData(data)
      setPanOpen(true)
    } catch {
      toast.error("No se pudo obtener los datos")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCopyPan() {
    if (!sensitiveData) return
    try {
      await navigator.clipboard.writeText(sensitiveData.pan.replace(/\s/g, ""))
      setPanCopied(true)
      toast.success("PAN copiado al portapapeles")
      setTimeout(() => setPanCopied(false), 2000)
    } catch {
      toast.info("PAN: " + sensitiveData.pan)
    }
  }

  async function handleChargeback() {
    if (!cbTxId.trim() || !cbReason.trim() || !cbAmount) {
      toast.error("Completa todos los campos")
      return
    }
    setActionLoading(true)
    try {
      await cardService.createChargeback(selected.id, cbTxId, cbReason, Number(cbAmount))
      toast.success("Reporte de cargo enviado", { description: "Te contactaremos en 5-7 días hábiles" })
      setChargebackOpen(false)
      setCbTxId("")
      setCbReason("")
      setCbAmount("")
    } catch {
      toast.error("No se pudo enviar el reporte")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleTravelNotice() {
    if (!travelCountries.trim() || !travelStart || !travelEnd) {
      toast.error("Completa todos los campos")
      return
    }
    setActionLoading(true)
    try {
      const countries = travelCountries.split(",").map((c) => c.trim().toUpperCase()).filter(Boolean)
      await cardService.createTravelNotice("demo-user", countries, travelStart, travelEnd)
      toast.success("Aviso de viaje creado", { description: `Destinos: ${countries.join(", ")}` })
      setTravelOpen(false)
      setTravelCountries("")
      setTravelStart("")
      setTravelEnd("")
    } catch {
      toast.error("No se pudo crear el aviso de viaje")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleAddBlock() {
    if (!newBlockValue.trim()) {
      toast.error("Ingresa el valor del bloqueo")
      return
    }
    setActionLoading(true)
    try {
      const block = await cardService.createBlock(selected.id, newBlockType, newBlockValue.trim().toUpperCase())
      setBlocks((prev) => [...prev, block])
      toast.success("Bloqueo creado")
      setAddBlockOpen(false)
      setNewBlockValue("")
    } catch {
      toast.error("No se pudo crear el bloqueo")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDeleteBlock(blockId: string) {
    try {
      await cardService.deleteBlock(blockId)
      setBlocks((prev) => prev.filter((b) => b.id !== blockId))
      toast.success("Bloqueo eliminado")
    } catch {
      toast.error("No se pudo eliminar el bloqueo")
    }
  }

  async function handleTokenToggle(token: CardToken) {
    try {
      if (token.status === "active") {
        await cardService.suspendToken(token.id)
        setTokens((prev) =>
          prev.map((t) => (t.id === token.id ? { ...t, status: "suspended" } : t))
        )
        toast.success(`${tokenProviderLabel(token.provider)} suspendido`)
      } else {
        await cardService.reactivateToken(token.id)
        setTokens((prev) =>
          prev.map((t) => (t.id === token.id ? { ...t, status: "active" } : t))
        )
        toast.success(`${tokenProviderLabel(token.provider)} reactivado`)
      }
    } catch {
      toast.error("No se pudo actualizar el token")
    }
  }

  async function handleFondear() {
    const amount = Number(fondearAmount)
    if (!fondearAmount || amount <= 0) {
      toast.error("Ingresa un monto válido")
      return
    }
    setActionLoading(true)
    try {
      const result = await cardService.fundCard(selected.id, amount)
      // Update the local card balance so the UI reflects the new value
      setCards((prev) =>
        prev.map((c, i) =>
          i === selectedIdx ? { ...c, balance: result.card_balance } : c
        )
      )
      toast.success(`Tarjeta fondeada con ${fmt(result.funded)}`, {
        description: `Saldo en tarjeta: ${fmt(result.card_balance)}`,
      })
      setFondearOpen(false)
      setFondearAmount("")
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : String(err)
      if (msg.includes("INSUFFICIENT_FUNDS")) {
        toast.error("Saldo insuficiente", {
          description: "No tienes fondos suficientes en tu cuenta SAYO para realizar este fondeo.",
        })
      } else {
        toast.error("No se pudo fondear la tarjeta", {
          description: "Intenta de nuevo o contacta a soporte.",
        })
      }
    } finally {
      setActionLoading(false)
    }
  }

  function handleSustituir() {
    toast.success("Solicitud de sustitución enviada", {
      description: "Recibirás tu nueva tarjeta en 7-10 días hábiles",
    })
    setSustituirOpen(false)
  }

  // ────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <span className="text-sm">Cargando tarjetas...</span>
      </div>
    )
  }

  const activeCount = cards.filter((c) => c.status === "active").length
  const blockedCount = cards.filter((c) => c.status === "blocked").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Mis Tarjetas</h1>
          <p className="text-sm text-muted-foreground">Gestión de tarjetas, seguridad y controles</p>
        </div>
        <Button
          className="bg-[#472913] hover:bg-[#5c3418] text-white"
          onClick={() => setNewCardOpen(true)}
        >
          <Plus className="size-4 mr-1.5" />
          Nueva Tarjeta
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <CreditCard className="size-5 mx-auto text-[#472913] mb-1" />
            <p className="text-2xl font-bold">{cards.length}</p>
            <p className="text-xs text-muted-foreground">Total Tarjetas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Check className="size-5 mx-auto text-green-600 mb-1" />
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            <p className="text-xs text-muted-foreground">Activas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Lock className="size-5 mx-auto text-red-500 mb-1" />
            <p className="text-2xl font-bold text-red-500">{blockedCount}</p>
            <p className="text-xs text-muted-foreground">Bloqueadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="size-5 mx-auto text-blue-500 mb-1" />
            <p className="text-2xl font-bold">{tokens.length}</p>
            <p className="text-xs text-muted-foreground">Tokens Activos</p>
          </CardContent>
        </Card>
      </div>

      {/* Section A: Card Carousel */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
          <CreditCard className="size-4 text-muted-foreground" />
          Tus Tarjetas
        </h2>
        {cards.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
              <CreditCard className="size-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No tienes tarjetas aún</p>
              <p className="text-xs mt-1">Crea tu primera tarjeta virtual o física</p>
              <Button className="mt-4 bg-[#472913] hover:bg-[#5c3418] text-white" onClick={() => setNewCardOpen(true)}>
                <Plus className="size-4 mr-1.5" /> Nueva Tarjeta
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory">
            {cards.map((card, i) => (
              <div key={card.id} className="snap-start flex-shrink-0">
                <CardVisual
                  card={card}
                  selected={i === selectedIdx}
                  onClick={() => setSelectedIdx(i)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <>
          {/* Section B: Card Actions */}
          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Key className="size-4 text-muted-foreground" />
                Acciones — {selected.card_number_masked}
              </h2>
              <div className="flex flex-wrap gap-2">
                {/* Activar */}
                {selected.status === "pending_activation" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-yellow-400 text-yellow-700 hover:bg-yellow-50"
                    onClick={() => setActivateOpen(true)}
                  >
                    <Key className="size-3.5 mr-1.5" />
                    Activar
                  </Button>
                )}

                {/* Bloquear / Desbloquear */}
                {(selected.status === "active" || selected.status === "blocked") && (
                  <Button
                    variant="outline"
                    size="sm"
                    className={
                      selected.status === "active"
                        ? "border-red-300 text-red-600 hover:bg-red-50"
                        : "border-green-300 text-green-700 hover:bg-green-50"
                    }
                    onClick={handleToggleBlock}
                    disabled={actionLoading}
                  >
                    {selected.status === "active" ? (
                      <><Lock className="size-3.5 mr-1.5" /> Bloquear</>
                    ) : (
                      <><Unlock className="size-3.5 mr-1.5" /> Desbloquear</>
                    )}
                  </Button>
                )}

                {/* Ver CVV */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShowCvv}
                  disabled={actionLoading || selected.status !== "active"}
                >
                  <Eye className="size-3.5 mr-1.5" />
                  Ver CVV
                </Button>

                {/* Ver Datos */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShowPan}
                  disabled={actionLoading || selected.status !== "active"}
                >
                  <CreditCard className="size-3.5 mr-1.5" />
                  Ver Datos
                </Button>

                {/* Fondear */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFondearOpen(true)}
                  disabled={selected.status !== "active"}
                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                >
                  <Wallet className="size-3.5 mr-1.5" />
                  Fondear Tarjeta
                </Button>

                {/* Sustituir */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSustituirOpen(true)}
                >
                  <RefreshCw className="size-3.5 mr-1.5" />
                  Sustituir
                </Button>

                {/* Reportar Cargo */}
                <Button
                  variant="outline"
                  size="sm"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                  onClick={() => setChargebackOpen(true)}
                >
                  <AlertTriangle className="size-3.5 mr-1.5" />
                  Cargo no reconocido
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sections C, D, E in Tabs */}
          <Tabs defaultValue="security">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="security">
                <Shield className="size-3.5 mr-1" />
                Seguridad
              </TabsTrigger>
              <TabsTrigger value="wallet">
                <Smartphone className="size-3.5 mr-1" />
                Wallet
              </TabsTrigger>
              <TabsTrigger value="travel">
                <Plane className="size-3.5 mr-1" />
                Viaje
              </TabsTrigger>
              {!selected.is_virtual && (
                <TabsTrigger value="shipment">
                  <Truck className="size-3.5 mr-1" />
                  Envío
                </TabsTrigger>
              )}
            </TabsList>

            {/* Section C: Security — Blocks 3DS */}
            <TabsContent value="security" className="mt-4">
              <Card>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <ShieldOff className="size-4 text-muted-foreground" />
                      Bloqueos 3DS
                    </h3>
                    <Button size="sm" variant="outline" onClick={() => setAddBlockOpen(true)}>
                      <Plus className="size-3.5 mr-1" />
                      Agregar Bloqueo
                    </Button>
                  </div>

                  {blocks.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Sin bloqueos configurados. Tu tarjeta acepta todas las transacciones.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {blocks.map((block) => (
                        <div
                          key={block.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                        >
                          <div>
                            <Badge variant="outline" className="text-[10px] mr-2">
                              {block.block_type}
                            </Badge>
                            <span className="text-sm font-mono">{block.value}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-red-500 hover:bg-red-50"
                            onClick={() => handleDeleteBlock(block.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Section C: Wallet — Apple/Google Pay */}
            <TabsContent value="wallet" className="mt-4">
              <Card>
                <CardContent className="p-5 space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Smartphone className="size-4 text-muted-foreground" />
                    Tokens de Pago
                  </h3>

                  {tokens.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No tienes wallets digitales vinculadas a esta tarjeta.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {tokens.map((token) => (
                        <div
                          key={token.id}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <Smartphone className="size-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{tokenProviderLabel(token.provider)}</p>
                              <p className="text-xs text-muted-foreground">
                                **** {token.last_four}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={
                                token.status === "active"
                                  ? "border-green-300 text-green-700 bg-green-50"
                                  : "border-gray-300 text-gray-500"
                              }
                            >
                              {token.status === "active" ? "Activo" : "Suspendido"}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs"
                              onClick={() => handleTokenToggle(token)}
                            >
                              {token.status === "active" ? "Suspender" : "Reactivar"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Section C: Travel Notice */}
            <TabsContent value="travel" className="mt-4">
              <Card>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Globe className="size-4 text-muted-foreground" />
                      Aviso de Viaje
                    </h3>
                    <Button size="sm" variant="outline" onClick={() => setTravelOpen(true)}>
                      <Plus className="size-3.5 mr-1" />
                      Crear Aviso
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Notifica a SAYO sobre tus viajes para que tus transacciones en el extranjero no sean bloqueadas.
                    Ingresa los países destino con sus códigos ISO (ej: US, FR, DE).
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Section D: Shipment (physical cards) */}
            {!selected.is_virtual && (
              <TabsContent value="shipment" className="mt-4">
                <Card>
                  <CardContent className="p-5 space-y-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Truck className="size-4 text-muted-foreground" />
                      Estado de Envío
                    </h3>
                    {shipment ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={
                              shipment.status === "delivered"
                                ? "border-green-300 text-green-700 bg-green-50"
                                : shipment.status === "in_transit"
                                  ? "border-blue-300 text-blue-700 bg-blue-50"
                                  : "border-gray-300 text-gray-600"
                            }
                          >
                            {shipmentStatusLabel(shipment.status)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase">Transportista</p>
                            <p className="font-medium">{shipment.carrier}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase">Entrega estimada</p>
                            <p className="font-medium">
                              {new Date(shipment.estimated_delivery).toLocaleDateString("es-MX")}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-[10px] text-muted-foreground uppercase">Número de rastreo</p>
                            <p className="font-mono text-sm">{shipment.tracking_number}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        No hay información de envío disponible.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════
          DIALOGS
      ═══════════════════════════════════════════════════════ */}

      {/* Nueva Tarjeta */}
      <Dialog open={newCardOpen} onOpenChange={setNewCardOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nueva Tarjeta</DialogTitle>
            <DialogDescription>Solicita una tarjeta virtual o física SAYO.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">Tipo de tarjeta</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setNewCardType("virtual")}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    newCardType === "virtual"
                      ? "bg-[#472913] text-white border-[#472913]"
                      : "border-input hover:bg-muted/50"
                  }`}
                >
                  <Smartphone className="size-4 mx-auto mb-1" />
                  Virtual
                </button>
                <button
                  onClick={() => setNewCardType("physical")}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    newCardType === "physical"
                      ? "bg-[#472913] text-white border-[#472913]"
                      : "border-input hover:bg-muted/50"
                  }`}
                >
                  <CreditCard className="size-4 mx-auto mb-1" />
                  Física
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wide">Nombre del titular</p>
              <Input
                placeholder="Como aparecerá en la tarjeta"
                value={newCardName}
                onChange={(e) => setNewCardName(e.target.value)}
                className="uppercase"
              />
            </div>
            {newCardType === "physical" && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                Las tarjetas físicas se envían en 5-7 días hábiles a tu dirección registrada.
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button
              className="bg-[#472913] hover:bg-[#5c3418] text-white"
              onClick={handleCreateCard}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="size-3.5 mr-1.5 animate-spin" /> : <Plus className="size-3.5 mr-1.5" />}
              Solicitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activar Tarjeta */}
      <Dialog open={activateOpen} onOpenChange={setActivateOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Activar Tarjeta</DialogTitle>
            <DialogDescription>
              Establece tu PIN de 4 dígitos para activar la tarjeta {selected?.card_number_masked}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wide">PIN (4 dígitos)</p>
              <Input
                type="password"
                placeholder="••••"
                maxLength={6}
                value={activatePin}
                onChange={(e) => setActivatePin(e.target.value.replace(/\D/g, ""))}
                className="text-center text-xl tracking-[0.5em]"
              />
            </div>
            <div>
              <p className="text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wide">Confirmar PIN</p>
              <Input
                type="password"
                placeholder="••••"
                maxLength={6}
                value={activatePinConfirm}
                onChange={(e) => setActivatePinConfirm(e.target.value.replace(/\D/g, ""))}
                className="text-center text-xl tracking-[0.5em]"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
              onClick={handleActivateCard}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="size-3.5 mr-1.5 animate-spin" /> : <Key className="size-3.5 mr-1.5" />}
              Activar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bloquear Tarjeta */}
      <Dialog open={blockOpen} onOpenChange={setBlockOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Bloquear Tarjeta</DialogTitle>
            <DialogDescription>
              Bloquearás la tarjeta {selected?.card_number_masked}. Ninguna transacción podrá realizarse mientras esté bloqueada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Motivo</p>
            {[
              { value: "lost", label: "Tarjeta perdida" },
              { value: "stolen", label: "Tarjeta robada" },
              { value: "fraud", label: "Posible fraude" },
              { value: "precaution", label: "Precaución" },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="blockReason"
                  value={opt.value}
                  checked={blockReason === opt.value}
                  onChange={() => setBlockReason(opt.value)}
                  className="accent-[#472913]"
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button
              variant="destructive"
              onClick={handleBlock}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="size-3.5 mr-1.5 animate-spin" /> : <Lock className="size-3.5 mr-1.5" />}
              Bloquear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ver CVV */}
      <Dialog open={cvvOpen} onOpenChange={(o) => { if (!o) { setSensitiveVisible(false); setSensitiveData(null) } setCvvOpen(o) }}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Código de Seguridad</DialogTitle>
            <DialogDescription>
              El CVV se ocultará automáticamente en {cvvCountdown} segundos.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-4 space-y-3">
            {sensitiveData ? (
              <>
                <div className="text-5xl font-mono font-bold tracking-widest text-[#472913]">
                  {sensitiveData.cvv}
                </div>
                <p className="text-xs text-muted-foreground">
                  Válido {sensitiveData.expiry_month}/{sensitiveData.expiry_year}
                </p>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#472913] h-1.5 rounded-full transition-all duration-1000"
                    style={{ width: `${(cvvCountdown / 30) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{cvvCountdown}s restantes</p>
              </>
            ) : (
              <Loader2 className="size-6 animate-spin mx-auto" />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={handleRefreshCvv} disabled={actionLoading}>
              <RefreshCw className="size-3.5 mr-1.5" />
              Refrescar CVV
            </Button>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ver Datos Completos (PAN) */}
      <Dialog open={panOpen} onOpenChange={(o) => { if (!o) setSensitiveData(null); setPanOpen(o) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Datos de la Tarjeta</DialogTitle>
            <DialogDescription>
              Datos sensibles — no compartas esta información.
            </DialogDescription>
          </DialogHeader>
          {sensitiveData ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-[#472913] to-[#7a4522] rounded-xl p-5 text-white space-y-3">
                <p className="text-[10px] text-white/60 uppercase tracking-wider">Número de tarjeta</p>
                <p className="text-xl font-mono tracking-[0.2em]">{sensitiveData.pan}</p>
                <div className="flex justify-between">
                  <div>
                    <p className="text-[9px] text-white/50 uppercase">Vence</p>
                    <p className="text-sm font-mono">{sensitiveData.expiry_month}/{sensitiveData.expiry_year}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-white/50 uppercase">CVV</p>
                    <p className="text-sm font-mono">{sensitiveData.cvv}</p>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={handleCopyPan}>
                {panCopied ? (
                  <><Check className="size-3.5 mr-1.5 text-green-600" /> Copiado</>
                ) : (
                  <><Copy className="size-3.5 mr-1.5" /> Copiar número</>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex justify-center py-6">
              <Loader2 className="size-6 animate-spin" />
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fondear Tarjeta */}
      <Dialog open={fondearOpen} onOpenChange={(o) => { if (!o) setFondearAmount(""); setFondearOpen(o) }}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="size-4 text-emerald-600" />
              Fondear Tarjeta
            </DialogTitle>
            <DialogDescription>
              Transfiere fondos desde tu cuenta SAYO a{" "}
              <span className="font-medium text-foreground">
                {selected?.is_virtual ? "Tarjeta Virtual" : "Tarjeta Física"}
              </span>{" "}
              terminada en{" "}
              <span className="font-mono font-medium text-foreground">
                {selected?.card_number_masked?.slice(-4)}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Monto (MXN)</p>
            <Input
              type="number"
              placeholder="0.00"
              value={fondearAmount}
              onChange={(e) => setFondearAmount(e.target.value)}
              min="1"
              step="0.01"
              disabled={actionLoading}
            />
            <p className="text-[11px] text-muted-foreground">
              El saldo se reflejará en tu tarjeta de inmediato.
            </p>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={actionLoading} />}>Cancelar</DialogClose>
            <Button
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
              onClick={handleFondear}
              disabled={actionLoading || !fondearAmount || Number(fondearAmount) <= 0}
            >
              {actionLoading ? (
                <Loader2 className="size-3.5 mr-1.5 animate-spin" />
              ) : (
                <Wallet className="size-3.5 mr-1.5" />
              )}
              Fondear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sustituir Tarjeta */}
      <Dialog open={sustituirOpen} onOpenChange={setSustituirOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Solicitar Sustitución</DialogTitle>
            <DialogDescription>
              Se emitirá una nueva tarjeta y se cancelará la actual {selected?.card_number_masked}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Motivo</p>
            {[
              { value: "lost", label: "Tarjeta perdida" },
              { value: "stolen", label: "Tarjeta robada" },
              { value: "broken", label: "Tarjeta dañada" },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="sustituirReason"
                  value={opt.value}
                  checked={sustituirReason === opt.value}
                  onChange={() => setSustituirReason(opt.value)}
                  className="accent-[#472913]"
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button className="bg-[#472913] hover:bg-[#5c3418] text-white" onClick={handleSustituir}>
              <RefreshCw className="size-3.5 mr-1.5" />
              Solicitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chargeback */}
      <Dialog open={chargebackOpen} onOpenChange={setChargebackOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reportar Cargo No Reconocido</DialogTitle>
            <DialogDescription>
              Inicia un proceso de contracargo para la tarjeta {selected?.card_number_masked}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wide">ID de Transacción</p>
              <Input
                placeholder="Ej. TXN-20240301-001"
                value={cbTxId}
                onChange={(e) => setCbTxId(e.target.value)}
              />
            </div>
            <div>
              <p className="text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wide">Monto disputado (MXN)</p>
              <Input
                type="number"
                placeholder="0.00"
                value={cbAmount}
                onChange={(e) => setCbAmount(e.target.value)}
                min="0"
              />
            </div>
            <div>
              <p className="text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wide">Descripción del problema</p>
              <Input
                placeholder="Describe el cargo que no reconoces..."
                value={cbReason}
                onChange={(e) => setCbReason(e.target.value)}
              />
            </div>
            <div className="text-xs text-muted-foreground bg-orange-50 border border-orange-200 p-3 rounded-lg">
              El proceso de contracargo puede tomar de 5 a 45 días hábiles. Te mantendremos informado por correo.
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={handleChargeback}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="size-3.5 mr-1.5 animate-spin" /> : <AlertTriangle className="size-3.5 mr-1.5" />}
              Reportar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Aviso de Viaje */}
      <Dialog open={travelOpen} onOpenChange={setTravelOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Aviso de Viaje</DialogTitle>
            <DialogDescription>
              Notifica a SAYO sobre tu próximo viaje al extranjero.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wide">
                Países destino (código ISO, separados por coma)
              </p>
              <Input
                placeholder="Ej: US, FR, DE, JP"
                value={travelCountries}
                onChange={(e) => setTravelCountries(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wide">Fecha de salida</p>
                <Input
                  type="date"
                  value={travelStart}
                  onChange={(e) => setTravelStart(e.target.value)}
                />
              </div>
              <div>
                <p className="text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wide">Fecha de regreso</p>
                <Input
                  type="date"
                  value={travelEnd}
                  onChange={(e) => setTravelEnd(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button
              className="bg-[#472913] hover:bg-[#5c3418] text-white"
              onClick={handleTravelNotice}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="size-3.5 mr-1.5 animate-spin" /> : <Plane className="size-3.5 mr-1.5" />}
              Crear Aviso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Agregar Bloqueo 3DS */}
      <Dialog open={addBlockOpen} onOpenChange={setAddBlockOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Agregar Bloqueo 3DS</DialogTitle>
            <DialogDescription>
              Bloquea transacciones por país, comercio o tipo de negocio.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">Tipo de bloqueo</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "country" as const, label: "País" },
                  { value: "merchant" as const, label: "Comercio" },
                  { value: "mcc" as const, label: "MCC" },
                  { value: "amount" as const, label: "Monto máx" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setNewBlockType(opt.value)}
                    className={`p-2.5 rounded-lg border text-sm font-medium transition-colors ${
                      newBlockType === opt.value
                        ? "bg-[#472913] text-white border-[#472913]"
                        : "border-input hover:bg-muted/50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wide">
                Valor{" "}
                {newBlockType === "country"
                  ? "(Código ISO: US, MX...)"
                  : newBlockType === "merchant"
                    ? "(Nombre del comercio)"
                    : newBlockType === "mcc"
                      ? "(Código 4 dígitos)"
                      : "(Monto en MXN)"}
              </p>
              <Input
                placeholder={
                  newBlockType === "country"
                    ? "Ej: KP, IR"
                    : newBlockType === "merchant"
                      ? "Ej: CASINO"
                      : newBlockType === "mcc"
                        ? "Ej: 7995"
                        : "Ej: 5000"
                }
                value={newBlockValue}
                onChange={(e) => setNewBlockValue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button
              className="bg-[#472913] hover:bg-[#5c3418] text-white"
              onClick={handleAddBlock}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="size-3.5 mr-1.5 animate-spin" /> : <Plus className="size-3.5 mr-1.5" />}
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
