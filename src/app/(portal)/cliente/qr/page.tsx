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
import { formatMoney, formatDate } from "@/lib/utils"
import {
  QrCode,
  Share2,
  Copy,
  Check,
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  RefreshCw,
  AlertCircle,
  Clock,
  ExternalLink,
} from "lucide-react"
import { toast } from "sonner"
import { qrService, type QrCode as QrCodeType, type QrValidation, type QrPaymentResult } from "@/lib/qr-service"
import { ApiError } from "@/lib/api-client"

// ── Inline SVG QR visual ───────────────────────────────────────
// Deterministic pixel grid derived from the qr_data string.
// Not a spec-compliant QR — it is a branded visual placeholder
// that renders consistently for the same input.
function QrVisual({ data, size = 160 }: { data: string; size?: number }) {
  const CELLS = 21
  const cell = size / CELLS

  // Derive a stable bit-grid from the string
  const bits = React.useMemo(() => {
    const grid: boolean[][] = Array.from({ length: CELLS }, () =>
      Array.from({ length: CELLS }, () => false)
    )
    // Seed with char codes of data
    let seed = 0
    for (let i = 0; i < data.length; i++) {
      seed = ((seed << 5) - seed + data.charCodeAt(i)) >>> 0
    }
    const rand = (s: number) => {
      s = ((s ^ 0xdeadbeef) * 0x41c64e6d + 0x6073) >>> 0
      return s
    }
    for (let r = 0; r < CELLS; r++) {
      for (let c = 0; c < CELLS; c++) {
        seed = rand(seed + r * CELLS + c)
        grid[r][c] = seed % 2 === 0
      }
    }
    // Stamp the three finder patterns (top-left, top-right, bottom-left)
    const stampFinder = (row: number, col: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const border = r === 0 || r === 6 || c === 0 || c === 6
          const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4
          grid[row + r][col + c] = border || inner
        }
      }
    }
    stampFinder(0, 0)
    stampFinder(0, CELLS - 7)
    stampFinder(CELLS - 7, 0)
    return grid
  }, [data])

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Código QR SAYO"
      className="rounded-lg"
    >
      {/* White background */}
      <rect width={size} height={size} fill="white" rx="8" />
      {/* Quiet zone border */}
      <rect
        x={cell}
        y={cell}
        width={size - cell * 2}
        height={size - cell * 2}
        fill="none"
        stroke="#E1DBD6"
        strokeWidth="0.5"
        rx="4"
      />
      {/* Data modules */}
      {bits.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={c * cell}
              y={r * cell}
              width={cell}
              height={cell}
              fill="#472913"
            />
          ) : null
        )
      )}
      {/* SAYO brand dot in center */}
      <circle cx={size / 2} cy={size / 2} r={cell * 1.5} fill="white" />
      <circle cx={size / 2} cy={size / 2} r={cell} fill="#C4842D" />
    </svg>
  )
}

// ── Status badge helpers ──────────────────────────────────────

function qrStatusLabel(status: QrCodeType["status"]): string {
  const map: Record<QrCodeType["status"], string> = {
    active: "Activo",
    used: "Usado",
    expired: "Expirado",
    cancelled: "Cancelado",
  }
  return map[status]
}

function qrStatusClass(status: QrCodeType["status"]): string {
  const map: Record<QrCodeType["status"], string> = {
    active: "bg-green-50 text-green-700",
    used: "bg-gray-100 text-gray-600",
    expired: "bg-red-50 text-red-700",
    cancelled: "bg-orange-50 text-orange-700",
  }
  return map[status]
}

function qrTypeLabel(type: QrCodeType["type"]): string {
  if (type === "cobro") return "Cobro fijo"
  if (type === "cobro_abierto") return "Cobro abierto"
  return "Pago"
}

// ── Main page ─────────────────────────────────────────────────

type ActiveTab = "cobrar" | "pagar"

export default function QrPage() {
  // ── Tab state ─────────────────────────────────────────────────
  const [activeTab, setActiveTab] = React.useState<ActiveTab>("cobrar")

  // ── Cobrar state ──────────────────────────────────────────────
  const [cobroForm, setCobroForm] = React.useState({ amount: "", description: "" })
  const [generating, setGenerating] = React.useState(false)
  const [generatedQr, setGeneratedQr] = React.useState<QrCodeType | null>(null)
  const [linkCopied, setLinkCopied] = React.useState(false)
  const [myQrCodes, setMyQrCodes] = React.useState<QrCodeType[]>([])
  const [loadingQrs, setLoadingQrs] = React.useState(true)

  // ── Pagar state ───────────────────────────────────────────────
  const [qrInput, setQrInput] = React.useState("")
  const [validating, setValidating] = React.useState(false)
  const [validation, setValidation] = React.useState<QrValidation | null>(null)
  const [openAmount, setOpenAmount] = React.useState("")
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [paying, setPaying] = React.useState(false)
  const [payResult, setPayResult] = React.useState<QrPaymentResult | null>(null)
  const [successOpen, setSuccessOpen] = React.useState(false)

  // ── Load QR list ──────────────────────────────────────────────
  const loadMyQrCodes = React.useCallback(async () => {
    setLoadingQrs(true)
    try {
      const codes = await qrService.getMyQrCodes()
      setMyQrCodes(codes)
    } catch {
      // non-fatal
    } finally {
      setLoadingQrs(false)
    }
  }, [])

  React.useEffect(() => {
    loadMyQrCodes()
  }, [loadMyQrCodes])

  // ── Cobrar handlers ───────────────────────────────────────────

  const handleGenerateQr = async () => {
    setGenerating(true)
    try {
      const amount = cobroForm.amount ? parseFloat(cobroForm.amount) : undefined
      if (cobroForm.amount && (!amount || amount <= 0)) {
        toast.error("Ingresa un monto válido")
        return
      }
      const qr = await qrService.generate({
        amount,
        description: cobroForm.description || undefined,
        type: "cobro",
      })
      setGeneratedQr(qr)
      setMyQrCodes((prev) => [qr, ...prev])
      toast.success("QR generado", {
        description: qr.amount ? `Cobro por ${formatMoney(qr.amount)}` : "Cobro abierto",
      })
      setCobroForm({ amount: "", description: "" })
    } catch (err) {
      toast.error("Error al generar QR", {
        description: err instanceof Error ? err.message : "Error desconocido",
      })
    } finally {
      setGenerating(false)
    }
  }

  const handleCopyLink = async () => {
    if (!generatedQr) return
    try {
      await navigator.clipboard.writeText(generatedQr.qr_data)
      setLinkCopied(true)
      toast.success("Enlace copiado")
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      toast.info(`Enlace: ${generatedQr.qr_data}`)
    }
  }

  const handleShare = async () => {
    if (!generatedQr) return
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: "Cobro SAYO",
          text: generatedQr.description ?? "Paga con SAYO",
          url: generatedQr.qr_data,
        })
      } catch {
        // User cancelled share or not supported — fall through to copy
        handleCopyLink()
      }
    } else {
      handleCopyLink()
    }
  }

  // ── Pagar handlers ────────────────────────────────────────────

  const handleValidate = async () => {
    if (!qrInput.trim()) {
      toast.error("Ingresa el código o enlace QR")
      return
    }
    setValidating(true)
    setValidation(null)
    try {
      const result = await qrService.validate(qrInput.trim())
      if (!result.valid) {
        toast.error("QR inválido", {
          description: result.reason ?? "El código QR no es válido o ya fue utilizado",
        })
        return
      }
      setValidation(result)
      toast.success("QR validado", {
        description: `Beneficiario: ${result.beneficiary_name ?? "Desconocido"}`,
      })
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error("Error al validar QR", { description: err.message })
      } else {
        toast.error("Error de conexión", {
          description: "No se pudo validar el QR. Intenta nuevamente.",
        })
      }
    } finally {
      setValidating(false)
    }
  }

  const handleOpenConfirm = () => {
    if (!validation) return
    const isOpen = !validation.amount
    if (isOpen && (!openAmount || parseFloat(openAmount) <= 0)) {
      toast.error("Ingresa el monto a pagar")
      return
    }
    setConfirmOpen(true)
  }

  const handleConfirmPay = async () => {
    if (!validation?.qr_id) return
    setPaying(true)
    try {
      const amount = validation.amount ?? parseFloat(openAmount)
      const result = await qrService.pay({ qr_id: validation.qr_id, amount })
      setPayResult(result)
      setConfirmOpen(false)
      setSuccessOpen(true)
      setValidation(null)
      setQrInput("")
      setOpenAmount("")
    } catch (err) {
      setConfirmOpen(false)
      if (err instanceof ApiError) {
        if (err.code === "INSUFFICIENT_FUNDS" || err.status === 402) {
          toast.error("Fondos insuficientes", {
            description: "Tu saldo no es suficiente para completar este pago.",
          })
        } else {
          toast.error("Error al procesar pago", { description: err.message })
        }
      } else {
        toast.error("Error de conexión", {
          description: "No se pudo procesar el pago. Intenta nuevamente.",
        })
      }
    } finally {
      setPaying(false)
    }
  }

  const payAmount = validation?.amount ?? (openAmount ? parseFloat(openAmount) : 0)

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">QR Cobrar / Pagar</h1>
        <p className="text-sm text-muted-foreground">
          Genera QR para cobrar o escanea un QR para pagar
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("cobrar")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            activeTab === "cobrar"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ArrowDownLeft className="size-4" />
          Cobrar
        </button>
        <button
          onClick={() => setActiveTab("pagar")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            activeTab === "pagar"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ArrowUpRight className="size-4" />
          Pagar
        </button>
      </div>

      {/* ── COBRAR TAB ─────────────────────────────────────────── */}
      {activeTab === "cobrar" && (
        <div className="space-y-6">
          {/* Generate form */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-sayo-orange/10 flex items-center justify-center">
                  <QrCode className="size-4 text-sayo-orange" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Generar QR de Cobro</h2>
                  <p className="text-xs text-muted-foreground">
                    Sin monto = cobro abierto (el pagador elige el monto)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Monto (opcional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-6"
                      value={cobroForm.amount}
                      onChange={(e) =>
                        setCobroForm({ ...cobroForm, amount: e.target.value })
                      }
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Deja vacío para cobro abierto
                  </p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Descripción (opcional)
                  </label>
                  <Input
                    placeholder="ej. Factura #1234, Producto, Servicio..."
                    value={cobroForm.description}
                    onChange={(e) =>
                      setCobroForm({ ...cobroForm, description: e.target.value })
                    }
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleGenerateQr} disabled={generating}>
                  {generating ? (
                    <Loader2 className="size-4 mr-1.5 animate-spin" />
                  ) : (
                    <QrCode className="size-4 mr-1.5" />
                  )}
                  {generating ? "Generando..." : "Generar QR"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generated QR display */}
          {generatedQr && (
            <Card className="border-sayo-orange/30 bg-gradient-to-br from-white to-sayo-beige/30">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                  {/* QR visual */}
                  <div className="shrink-0">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-sayo-beige">
                      <QrVisual data={generatedQr.qr_data} size={160} />
                    </div>
                    <p className="text-[10px] text-center text-muted-foreground mt-2">
                      QR SAYO
                    </p>
                  </div>

                  {/* QR info */}
                  <div className="flex-1 min-w-0 space-y-3 w-full">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 text-[10px]"
                      >
                        Activo
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {qrTypeLabel(generatedQr.type)}
                      </Badge>
                    </div>

                    <div className="space-y-1.5 text-sm">
                      {generatedQr.amount !== null && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Monto</span>
                          <span className="font-bold text-sayo-cafe tabular-nums">
                            {formatMoney(generatedQr.amount)}
                          </span>
                        </div>
                      )}
                      {generatedQr.type === "cobro_abierto" && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Monto</span>
                          <span className="font-medium text-sayo-orange">
                            Abierto
                          </span>
                        </div>
                      )}
                      {generatedQr.description && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Descripción
                          </span>
                          <span className="truncate max-w-[160px]">
                            {generatedQr.description}
                          </span>
                        </div>
                      )}
                      {generatedQr.expires_at && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Vence</span>
                          <span className="text-xs">
                            {formatDate(generatedQr.expires_at)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* QR link */}
                    <div className="p-2 rounded-lg bg-muted/50 border">
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Enlace de pago
                      </p>
                      <p className="text-xs font-mono truncate text-sayo-cafe">
                        {generatedQr.qr_data}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={handleCopyLink}
                      >
                        {linkCopied ? (
                          <Check className="size-3.5 mr-1" />
                        ) : (
                          <Copy className="size-3.5 mr-1" />
                        )}
                        {linkCopied ? "Copiado" : "Copiar"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={handleShare}
                      >
                        <Share2 className="size-3.5 mr-1" />
                        Compartir
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0"
                        onClick={() =>
                          window.open(generatedQr.qr_data, "_blank")
                        }
                        title="Abrir enlace"
                      >
                        <ExternalLink className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* My QR codes list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold flex items-center gap-1.5">
                <Clock className="size-4 text-muted-foreground" />
                Mis QRs
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadMyQrCodes}
                disabled={loadingQrs}
              >
                <RefreshCw
                  className={`size-3.5 ${loadingQrs ? "animate-spin" : ""}`}
                />
              </Button>
            </div>

            {loadingQrs ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 rounded-lg bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : myQrCodes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="size-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No tienes QRs generados</p>
              </div>
            ) : (
              <div className="space-y-2">
                {myQrCodes.map((qr) => (
                  <Card key={qr.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-3 flex items-center gap-3">
                      {/* Mini QR thumb */}
                      <div className="size-10 rounded-lg bg-white border border-sayo-beige flex items-center justify-center shrink-0 overflow-hidden">
                        <QrVisual data={qr.qr_data} size={36} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-medium truncate">
                            {qr.description ?? qrTypeLabel(qr.type)}
                          </p>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${qrStatusClass(qr.status)}`}
                          >
                            {qrStatusLabel(qr.status)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {qrTypeLabel(qr.type)}
                          {qr.expires_at
                            ? ` • Vence ${formatDate(qr.expires_at)}`
                            : " • Sin vencimiento"}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        {qr.amount !== null ? (
                          <p className="text-sm font-bold text-sayo-cafe tabular-nums">
                            {formatMoney(qr.amount)}
                          </p>
                        ) : (
                          <p className="text-sm font-medium text-sayo-orange">
                            Abierto
                          </p>
                        )}
                        <button
                          className="text-[10px] text-muted-foreground hover:text-sayo-cafe transition-colors"
                          onClick={async () => {
                            await navigator.clipboard
                              .writeText(qr.qr_data)
                              .catch(() => null)
                            toast.success("Enlace copiado")
                          }}
                        >
                          Copiar enlace
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PAGAR TAB ──────────────────────────────────────────── */}
      {activeTab === "pagar" && (
        <div className="space-y-6">
          {/* QR input + validate */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-sayo-cafe/10 flex items-center justify-center">
                  <QrCode className="size-4 text-sayo-cafe" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Pagar con QR</h2>
                  <p className="text-xs text-muted-foreground">
                    Ingresa el enlace o código del QR que deseas pagar
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Enlace o ID del QR *
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://sayo.mx/qr/... o ID del QR"
                    value={qrInput}
                    onChange={(e) => {
                      setQrInput(e.target.value)
                      if (validation) setValidation(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleValidate()
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleValidate}
                    disabled={validating || !qrInput.trim()}
                    className="shrink-0"
                  >
                    {validating ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Validar"
                    )}
                  </Button>
                </div>
              </div>

              {/* Validation result */}
              {validation && validation.valid && (
                <div className="space-y-4">
                  {/* Beneficiary card */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-sayo-cafe to-sayo-cafe-light text-white">
                    <p className="text-xs text-white/70 mb-1">Beneficiario</p>
                    <p className="text-base font-bold">
                      {validation.beneficiary_name ?? "Desconocido"}
                    </p>
                    {validation.beneficiary_clabe && (
                      <p className="text-xs text-white/70 font-mono mt-0.5">
                        CLABE: {validation.beneficiary_clabe}
                      </p>
                    )}
                  </div>

                  {/* Payment details */}
                  <div className="p-3 rounded-lg border bg-muted/30 space-y-2 text-sm">
                    {validation.description && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Concepto</span>
                        <span>{validation.description}</span>
                      </div>
                    )}
                    {validation.type && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tipo</span>
                        <span>
                          {validation.type === "cobro_abierto"
                            ? "Cobro abierto"
                            : "Cobro fijo"}
                        </span>
                      </div>
                    )}
                    {validation.expires_at && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vence</span>
                        <span>{formatDate(validation.expires_at)}</span>
                      </div>
                    )}
                    {validation.amount ? (
                      <div className="border-t pt-2 flex justify-between items-center">
                        <span className="font-medium">Monto a pagar</span>
                        <span className="text-xl font-bold text-sayo-cafe tabular-nums">
                          {formatMoney(validation.amount)}
                        </span>
                      </div>
                    ) : (
                      <div className="border-t pt-2 space-y-2">
                        <span className="text-muted-foreground text-xs">
                          QR de monto abierto — ingresa el monto
                        </span>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            $
                          </span>
                          <Input
                            type="number"
                            min="1"
                            step="0.01"
                            placeholder="0.00"
                            className="pl-6"
                            value={openAmount}
                            onChange={(e) => setOpenAmount(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleOpenConfirm}
                    disabled={
                      !validation.amount &&
                      (!openAmount || parseFloat(openAmount) <= 0)
                    }
                  >
                    <ArrowUpRight className="size-4 mr-1.5" />
                    Pagar{" "}
                    {payAmount > 0 ? formatMoney(payAmount) : ""}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* How it works hint */}
          {!validation && (
            <Card className="bg-muted/40 border-dashed">
              <CardContent className="p-5 text-center space-y-2">
                <QrCode className="size-10 text-muted-foreground/40 mx-auto" />
                <p className="text-sm font-medium text-muted-foreground">
                  Como funciona
                </p>
                <ol className="text-xs text-muted-foreground space-y-1 text-left max-w-xs mx-auto list-decimal list-inside">
                  <li>Pide al cobrador su enlace QR de SAYO</li>
                  <li>Pégalo en el campo de arriba</li>
                  <li>Valida y confirma el pago</li>
                </ol>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── CONFIRM PAYMENT DIALOG ─────────────────────────────── */}
      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!paying) setConfirmOpen(open)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Pago QR</DialogTitle>
            <DialogDescription>
              Revisa los detalles antes de proceder
            </DialogDescription>
          </DialogHeader>

          {validation && (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Beneficiario</span>
                  <span className="font-medium">
                    {validation.beneficiary_name ?? "—"}
                  </span>
                </div>
                {validation.description && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Concepto</span>
                    <span>{validation.description}</span>
                  </div>
                )}
                {validation.beneficiary_clabe && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">CLABE</span>
                    <span className="font-mono text-xs">
                      {validation.beneficiary_clabe}
                    </span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2 flex justify-between items-center">
                  <span className="text-sm font-medium">Total a debitar</span>
                  <span className="text-xl font-bold text-sayo-cafe tabular-nums">
                    {formatMoney(payAmount)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Este cargo se realizará desde tu saldo disponible SAYO.
              </p>
            </div>
          )}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={paying} />}>
              Cancelar
            </DialogClose>
            <Button onClick={handleConfirmPay} disabled={paying}>
              {paying ? (
                <Loader2 className="size-3.5 mr-1 animate-spin" />
              ) : (
                <Check className="size-3.5 mr-1" />
              )}
              {paying ? "Procesando..." : "Confirmar Pago"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── SUCCESS DIALOG ─────────────────────────────────────── */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pago Exitoso</DialogTitle>
            <DialogDescription>
              Tu pago QR fue procesado correctamente
            </DialogDescription>
          </DialogHeader>

          {payResult && (
            <div className="space-y-4">
              {/* Success checkmark */}
              <div className="text-center p-4">
                <div className="size-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Check className="size-8 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600 tabular-nums">
                  {formatMoney(payResult.amount)}
                </p>
                {payResult.beneficiary_name && (
                  <p className="text-sm text-muted-foreground mt-1">
                    a {payResult.beneficiary_name}
                  </p>
                )}
              </div>

              {/* Receipt details */}
              <div className="p-3 rounded-lg border text-sm space-y-1.5">
                {payResult.confirmation_number && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Confirmación</span>
                    <span className="font-mono text-xs">
                      {payResult.confirmation_number}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID Transacción</span>
                  <span className="font-mono text-xs">
                    {payResult.transaction_id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha</span>
                  <span>
                    {new Date(payResult.paid_at).toLocaleString("es-MX", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estado</span>
                  <span className="text-green-600 font-medium capitalize">
                    {payResult.status === "completed" ? "Completado" : payResult.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (payResult) {
                  const lines = [
                    "Pago QR SAYO",
                    `Monto: ${formatMoney(payResult.amount)}`,
                    payResult.beneficiary_name
                      ? `A: ${payResult.beneficiary_name}`
                      : "",
                    payResult.confirmation_number
                      ? `Confirmación: ${payResult.confirmation_number}`
                      : "",
                    `Transacción: ${payResult.transaction_id}`,
                    `Fecha: ${new Date(payResult.paid_at).toLocaleString("es-MX")}`,
                    `Estado: ${payResult.status}`,
                  ]
                    .filter(Boolean)
                    .join("\n")
                  navigator.clipboard
                    .writeText(lines)
                    .then(() => toast.success("Comprobante copiado"))
                    .catch(() => toast.info("No se pudo copiar"))
                }
              }}
            >
              <Copy className="size-3.5 mr-1" /> Copiar comprobante
            </Button>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
