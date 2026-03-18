import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- Currency Formatters ---
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatMoneyCompact(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`
  return formatMoney(amount)
}

// --- Number Formatters ---
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("es-MX").format(num)
}

export function formatPercent(num: number): string {
  return `${num >= 0 ? "+" : ""}${num.toFixed(1)}%`
}

// --- Date Formatters ---
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "hace un momento"
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} min`
  if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)}h`
  if (seconds < 604800) return `hace ${Math.floor(seconds / 86400)}d`
  return formatDate(dateStr)
}

// --- CLABE Formatter ---
export function formatClabe(clabe: string): string {
  return clabe.replace(/(\d{3})(\d{3})(\d{11})(\d{1})/, "$1 $2 $3 $4")
}

// --- Status Helpers ---
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    completada: "bg-green-100 text-green-700",
    pendiente: "bg-yellow-100 text-yellow-700",
    rechazada: "bg-red-100 text-red-700",
    en_proceso: "bg-blue-100 text-blue-700",
    cancelada: "bg-gray-100 text-gray-700",
    conciliada: "bg-emerald-100 text-emerald-700",
    activa: "bg-green-100 text-green-700",
    activo: "bg-green-100 text-green-700",
    inactivo: "bg-gray-100 text-gray-600",
    bloqueado: "bg-red-100 text-red-700",
    suspendido: "bg-orange-100 text-orange-700",
    abierto: "bg-blue-100 text-blue-700",
    en_progreso: "bg-indigo-100 text-indigo-700",
    resuelto: "bg-green-100 text-green-700",
    cerrado: "bg-gray-100 text-gray-600",
    alta: "bg-red-100 text-red-700",
    media: "bg-yellow-100 text-yellow-700",
    baja: "bg-green-100 text-green-700",
    urgente: "bg-red-200 text-red-800",
    enviado: "bg-blue-100 text-blue-700",
    borrador: "bg-gray-100 text-gray-600",
    aceptado: "bg-green-100 text-green-700",
    pagada: "bg-green-100 text-green-700",
    pausada: "bg-yellow-100 text-yellow-700",
    finalizada: "bg-gray-100 text-gray-600",
    programada: "bg-purple-100 text-purple-700",
    verde: "bg-green-100 text-green-700",
    amarillo: "bg-yellow-100 text-yellow-700",
    rojo: "bg-red-100 text-red-700",
    vigente: "bg-green-100 text-green-700",
    vencido: "bg-red-100 text-red-700",
    reestructurado: "bg-blue-100 text-blue-700",
    castigado: "bg-gray-100 text-gray-600",
  }
  return colors[status] || "bg-gray-100 text-gray-600"
}

export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    critica: "bg-red-500 text-white",
    alta: "bg-red-100 text-red-700",
    media: "bg-yellow-100 text-yellow-700",
    baja: "bg-green-100 text-green-700",
  }
  return colors[severity] || "bg-gray-100 text-gray-600"
}

// --- CSV Export ---
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: { key: string; label: string }[]
) {
  if (data.length === 0) return
  const keys = columns ? columns.map((c) => c.key) : Object.keys(data[0])
  const headers = columns ? columns.map((c) => c.label) : keys
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      keys
        .map((key) => {
          const val = row[key]
          const str = val === null || val === undefined ? "" : String(val)
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str
        })
        .join(",")
    ),
  ].join("\n")
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

// --- Copy to clipboard ---
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

// --- Generate ID ---
export function generateId(prefix: string): string {
  return `${prefix}-${String(Date.now()).slice(-6)}`
}
