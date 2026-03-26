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
import {
  CreditCard,
  Lock,
  Unlock,
  Search,
  Loader2,
  Eye,
  Filter,
  RefreshCw,
  Check,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"
import { cardService, demoAllCards } from "@/lib/card-service"
import type { Card as CardType } from "@/lib/types"

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n)

function statusBadge(status: CardType["status"]) {
  switch (status) {
    case "active":
      return (
        <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50 text-[10px]">
          <Check className="size-3 mr-0.5" /> Activa
        </Badge>
      )
    case "blocked":
      return (
        <Badge variant="outline" className="border-red-300 text-red-700 bg-red-50 text-[10px]">
          <Lock className="size-3 mr-0.5" /> Bloqueada
        </Badge>
      )
    case "pending_activation":
      return (
        <Badge variant="outline" className="border-yellow-400 text-yellow-700 bg-yellow-50 text-[10px]">
          <AlertTriangle className="size-3 mr-0.5" /> Pend. Activación
        </Badge>
      )
    case "expired":
      return (
        <Badge variant="outline" className="text-muted-foreground text-[10px]">
          Expirada
        </Badge>
      )
    case "cancelled":
      return (
        <Badge variant="outline" className="text-muted-foreground text-[10px]">
          Cancelada
        </Badge>
      )
    default:
      return <Badge variant="outline" className="text-[10px]">{status}</Badge>
  }
}

function typeBadge(card: CardType) {
  return card.is_virtual ? (
    <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50 text-[10px]">
      Virtual
    </Badge>
  ) : (
    <Badge variant="outline" className="border-gray-300 text-gray-700 text-[10px]">
      Física
    </Badge>
  )
}

// ────────────────────────────────────────────────────────────
// Detail Panel
// ────────────────────────────────────────────────────────────

function CardDetailPanel({ card, onClose }: { card: CardType; onClose: () => void }) {
  return (
    <div className="space-y-4">
      {/* Card visual mini */}
      <div
        className={`rounded-xl p-4 text-white text-sm
          ${card.is_virtual ? "bg-gradient-to-br from-[#472913] to-[#7a4522]" : "bg-gradient-to-br from-gray-700 to-gray-900"}`}
      >
        <div className="flex justify-between mb-3">
          <span className="text-white/60 text-[10px]">{card.is_virtual ? "Virtual" : "Física"} • {card.brand}</span>
          <span className="text-white/80 text-[10px]">{card.expiry_date}</span>
        </div>
        <p className="font-mono tracking-widest mb-3">{card.card_number_masked}</p>
        <p className="text-white/70 text-xs">{card.holder_name}</p>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase">ID Tarjeta</p>
          <p className="font-mono text-xs">{card.id}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase">Usuario</p>
          <p className="font-mono text-xs">{card.user_id}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase">Estado</p>
          {statusBadge(card.status)}
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase">Tipo</p>
          {typeBadge(card)}
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase">Límite</p>
          <p className="font-medium">{fmt(card.credit_limit)}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase">Creada</p>
          <p className="text-xs">{new Date(card.created_at).toLocaleDateString("es-MX")}</p>
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// Main Admin Page
// ────────────────────────────────────────────────────────────

type StatusFilter = "all" | CardType["status"]
type TypeFilter = "all" | "virtual" | "physical"
type BrandFilter = "all" | "VISA" | "MASTERCARD" | "AMEX"

export default function MesaControlTarjetasPage() {
  const [cards, setCards] = React.useState<CardType[]>([])
  const [loading, setLoading] = React.useState(true)

  // Filters
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>("all")
  const [brandFilter, setBrandFilter] = React.useState<BrandFilter>("all")

  // Dialog
  const [detailCard, setDetailCard] = React.useState<CardType | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [actionLoading, setActionLoading] = React.useState<string | null>(null)

  // Load
  React.useEffect(() => {
    // In demo mode the service returns demoAllCards
    cardService
      .fetchAllCards()
      .then((data) => {
        setCards(data)
        setLoading(false)
      })
      .catch(() => {
        // Fallback to imported demo data
        setCards(demoAllCards)
        setLoading(false)
      })
  }, [])

  // Filtered cards
  const filtered = React.useMemo(() => {
    return cards.filter((c) => {
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        c.card_number_masked.toLowerCase().includes(q) ||
        c.holder_name.toLowerCase().includes(q) ||
        c.user_id.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      const matchStatus = statusFilter === "all" || c.status === statusFilter
      const matchType =
        typeFilter === "all" ||
        (typeFilter === "virtual" && c.is_virtual) ||
        (typeFilter === "physical" && !c.is_virtual)
      const matchBrand = brandFilter === "all" || c.brand === brandFilter
      return matchSearch && matchStatus && matchType && matchBrand
    })
  }, [cards, search, statusFilter, typeFilter, brandFilter])

  // Stats
  const totalActive = cards.filter((c) => c.status === "active").length
  const totalBlocked = cards.filter((c) => c.status === "blocked").length
  const totalPending = cards.filter((c) => c.status === "pending_activation").length
  const totalLimit = cards.reduce((s, c) => s + c.credit_limit, 0)

  async function handleBlock(card: CardType) {
    setActionLoading(card.id + "-block")
    try {
      await cardService.blockCard(card.id, "admin_action")
      setCards((prev) => prev.map((c) => (c.id === card.id ? { ...c, status: "blocked" } : c)))
      if (detailCard?.id === card.id) setDetailCard({ ...card, status: "blocked" })
      toast.success(`Tarjeta ${card.card_number_masked} bloqueada`)
    } catch {
      toast.error("No se pudo bloquear la tarjeta")
    } finally {
      setActionLoading(null)
    }
  }

  async function handleUnblock(card: CardType) {
    setActionLoading(card.id + "-unblock")
    try {
      await cardService.unblockCard(card.id)
      setCards((prev) => prev.map((c) => (c.id === card.id ? { ...c, status: "active" } : c)))
      if (detailCard?.id === card.id) setDetailCard({ ...card, status: "active" })
      toast.success(`Tarjeta ${card.card_number_masked} desbloqueada`)
    } catch {
      toast.error("No se pudo desbloquear la tarjeta")
    } finally {
      setActionLoading(null)
    }
  }

  function handleViewDetail(card: CardType) {
    setDetailCard(card)
    setDetailOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <span className="text-sm">Cargando tarjetas...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Administración de Tarjetas</h1>
        <p className="text-sm text-muted-foreground">Vista global de todas las tarjetas — Mesa de Control</p>
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
            <p className="text-2xl font-bold text-green-600">{totalActive}</p>
            <p className="text-xs text-muted-foreground">Activas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Lock className="size-5 mx-auto text-red-500 mb-1" />
            <p className="text-2xl font-bold text-red-500">{totalBlocked}</p>
            <p className="text-xs text-muted-foreground">Bloqueadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="size-5 mx-auto text-yellow-500 mb-1" />
            <p className="text-2xl font-bold text-yellow-600">{totalPending}</p>
            <p className="text-xs text-muted-foreground">Pend. Activación</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            {/* Search */}
            <div className="flex-1 min-w-[220px]">
              <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Buscar</p>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Número, titular, usuario..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Status filter */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide flex items-center gap-1">
                <Filter className="size-3" /> Estado
              </p>
              <div className="flex flex-wrap gap-1">
                {(["all", "active", "blocked", "pending_activation", "expired"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2 py-1 rounded-md text-xs font-medium border transition-colors ${
                      statusFilter === s
                        ? "bg-[#472913] text-white border-[#472913]"
                        : "border-input hover:bg-muted/50"
                    }`}
                  >
                    {s === "all"
                      ? "Todos"
                      : s === "active"
                        ? "Activas"
                        : s === "blocked"
                          ? "Bloqueadas"
                          : s === "pending_activation"
                            ? "Pend."
                            : "Expiradas"}
                  </button>
                ))}
              </div>
            </div>

            {/* Type filter */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Tipo</p>
              <div className="flex gap-1">
                {(["all", "virtual", "physical"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-2 py-1 rounded-md text-xs font-medium border transition-colors ${
                      typeFilter === t
                        ? "bg-[#472913] text-white border-[#472913]"
                        : "border-input hover:bg-muted/50"
                    }`}
                  >
                    {t === "all" ? "Todos" : t === "virtual" ? "Virtual" : "Física"}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand filter */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Marca</p>
              <div className="flex gap-1">
                {(["all", "VISA", "MASTERCARD", "AMEX"] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => setBrandFilter(b)}
                    className={`px-2 py-1 rounded-md text-xs font-medium border transition-colors ${
                      brandFilter === b
                        ? "bg-[#472913] text-white border-[#472913]"
                        : "border-input hover:bg-muted/50"
                    }`}
                  >
                    {b === "all" ? "Todas" : b}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("")
                setStatusFilter("all")
                setTypeFilter("all")
                setBrandFilter("all")
              }}
            >
              <RefreshCw className="size-3.5 mr-1" />
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {filtered.length} de {cards.length} tarjetas — Límite total: <strong>{fmt(totalLimit)}</strong>
        </p>
      </div>

      {/* Cards table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <CreditCard className="size-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Sin resultados para los filtros aplicados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Tarjeta</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Titular</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Usuario</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Tipo</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Estado</th>
                    <th className="text-right px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Límite</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Vence</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((card) => (
                    <tr
                      key={card.id}
                      className="hover:bg-muted/20 cursor-pointer transition-colors"
                      onClick={() => handleViewDetail(card)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`size-7 rounded-md flex items-center justify-center text-white text-[10px] font-bold
                              ${card.is_virtual ? "bg-[#472913]" : "bg-gray-700"}`}
                          >
                            {card.brand.slice(0, 1)}
                          </div>
                          <span className="font-mono text-xs">{card.card_number_masked}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{card.holder_name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{card.user_id}</td>
                      <td className="px-4 py-3">{typeBadge(card)}</td>
                      <td className="px-4 py-3">{statusBadge(card.status)}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">{fmt(card.credit_limit)}</td>
                      <td className="px-4 py-3 font-mono text-xs">{card.expiry_date}</td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e) => { e.stopPropagation(); handleViewDetail(card) }}
                            title="Ver detalles"
                          >
                            <Eye className="size-3.5" />
                          </Button>
                          {card.status === "active" ? (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-red-500 hover:bg-red-50"
                              disabled={actionLoading === card.id + "-block"}
                              onClick={(e) => { e.stopPropagation(); handleBlock(card) }}
                              title="Bloquear"
                            >
                              {actionLoading === card.id + "-block" ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <Lock className="size-3.5" />
                              )}
                            </Button>
                          ) : card.status === "blocked" ? (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-green-600 hover:bg-green-50"
                              disabled={actionLoading === card.id + "-unblock"}
                              onClick={(e) => { e.stopPropagation(); handleUnblock(card) }}
                              title="Desbloquear"
                            >
                              {actionLoading === card.id + "-unblock" ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <Unlock className="size-3.5" />
                              )}
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de Tarjeta</DialogTitle>
            <DialogDescription>
              {detailCard?.card_number_masked} — {detailCard?.holder_name}
            </DialogDescription>
          </DialogHeader>

          {detailCard && <CardDetailPanel card={detailCard} onClose={() => setDetailOpen(false)} />}

          <DialogFooter>
            {detailCard?.status === "active" && (
              <Button
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => {
                  if (detailCard) handleBlock(detailCard)
                  setDetailOpen(false)
                }}
              >
                <Lock className="size-3.5 mr-1.5" />
                Bloquear
              </Button>
            )}
            {detailCard?.status === "blocked" && (
              <Button
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-50"
                onClick={() => {
                  if (detailCard) handleUnblock(detailCard)
                  setDetailOpen(false)
                }}
              >
                <Unlock className="size-3.5 mr-1.5" />
                Desbloquear
              </Button>
            )}
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
