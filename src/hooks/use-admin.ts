// ============================================================
// SAYO — Admin Hooks
// ============================================================
// Wraps adminService with useServiceData.
// Maps snake_case SystemUser/RoleDefinition → camelCase UI types.
// Exports expanded admin static data (catalogs, params, templates).
// ============================================================

"use client"

import { useServiceData } from "./use-service-data"
import { adminService } from "@/lib/executive-service"
import type {
  SystemUser,
  RolePermission,
  StatCardData,
  CatalogItem,
  ParameterConfig,
  NotificationTemplate,
} from "@/lib/types"

// --- Mappers ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSystemUser(u: any): SystemUser {
  return {
    id: u.id,
    name: u.name ?? u.full_name ?? "",
    email: u.email,
    role: u.role,
    department: u.department ?? "",
    status: u.status,
    lastLogin: u.last_login ?? u.lastLogin ?? "",
    createdAt: u.created_at ?? u.createdAt ?? "",
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRole(r: any): RolePermission {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? "",
    permissions: r.permissions ?? {},
    userCount: r.user_count ?? r.userCount ?? 0,
  }
}

// --- Hooks ---

export function useSystemUsers() {
  return useServiceData(
    async () => {
      const raw = await adminService.getUsers()
      return raw.map(mapSystemUser)
    },
    []
  )
}

export function useRolePermissions() {
  return useServiceData(
    async () => {
      const raw = await adminService.getRoles()
      return raw.map(mapRole)
    },
    []
  )
}

export function useCatalogs(catalogType?: string) {
  return useServiceData(
    () => adminService.getCatalogs(catalogType),
    [catalogType]
  )
}

export function useCatalogTypes() {
  return useServiceData(() => adminService.getCatalogTypes(), [])
}

// --- Static Data ---

export const adminStats: StatCardData[] = [
  { title: "Usuarios Totales", value: 48500, change: 22.1, icon: "Users", trend: "up" },
  { title: "Usuarios Internos", value: 45, icon: "UserCog", trend: "neutral" },
  { title: "Productos Activos", value: 6, icon: "Package", trend: "neutral" },
  { title: "Integraciones", value: 12, icon: "Plug", trend: "neutral" },
]

// --- Admin Expanded Static Data ---

export const expandedCatalogs: Record<string, CatalogItem[]> = {
  bancos: [
    { id: "BK-001", catalogType: "bancos", key: "002", name: "BBVA México", active: true, order: 1 },
    { id: "BK-002", catalogType: "bancos", key: "012", name: "BBVA Bancomer", active: true, order: 2 },
    { id: "BK-003", catalogType: "bancos", key: "014", name: "Santander", active: true, order: 3 },
    { id: "BK-004", catalogType: "bancos", key: "021", name: "HSBC", active: true, order: 4 },
    { id: "BK-005", catalogType: "bancos", key: "072", name: "Banorte", active: true, order: 5 },
    { id: "BK-006", catalogType: "bancos", key: "036", name: "Inbursa", active: true, order: 6 },
  ],
  monedas: [
    { id: "CUR-001", catalogType: "monedas", key: "MXN", name: "Peso Mexicano", active: true, order: 1 },
    { id: "CUR-002", catalogType: "monedas", key: "USD", name: "Dólar Americano", active: true, order: 2 },
    { id: "CUR-003", catalogType: "monedas", key: "EUR", name: "Euro", active: false, order: 3 },
  ],
  estados: [
    { id: "ST-001", catalogType: "estados", key: "AGS", name: "Aguascalientes", active: true, order: 1 },
    { id: "ST-002", catalogType: "estados", key: "CDMX", name: "Ciudad de México", active: true, order: 2 },
    { id: "ST-003", catalogType: "estados", key: "JAL", name: "Jalisco", active: true, order: 3 },
    { id: "ST-004", catalogType: "estados", key: "NL", name: "Nuevo León", active: true, order: 4 },
    { id: "ST-005", catalogType: "estados", key: "EDM", name: "Estado de México", active: true, order: 5 },
  ],
  productos: [
    { id: "PRD-001", catalogType: "productos", key: "CCC", name: "Crédito Cuenta Corriente", description: "Línea revolvente para PFAE", active: true, order: 1 },
    { id: "PRD-002", catalogType: "productos", key: "CE", name: "Crédito Empresarial", description: "Crédito a plazo fijo para PM", active: true, order: 2 },
    { id: "PRD-003", catalogType: "productos", key: "LC", name: "Línea de Crédito", description: "Línea revolvente empresarial", active: true, order: 3 },
  ],
  motivosRechazo: [
    { id: "MR-001", catalogType: "motivosRechazo", key: "BURO", name: "Score de buró insuficiente", active: true, order: 1 },
    { id: "MR-002", catalogType: "motivosRechazo", key: "ING", name: "Ingresos insuficientes", active: true, order: 2 },
    { id: "MR-003", catalogType: "motivosRechazo", key: "DOC", name: "Documentación incompleta", active: true, order: 3 },
    { id: "MR-004", catalogType: "motivosRechazo", key: "PLD", name: "Alerta PLD/FT", active: true, order: 4 },
    { id: "MR-005", catalogType: "motivosRechazo", key: "GAR", name: "Garantías insuficientes", active: true, order: 5 },
  ],
}

export const systemParameters: ParameterConfig[] = [
  { id: "PAR-001", category: "credito", key: "max_amount_pfae", value: "5000000", type: "number", description: "Monto máximo crédito PFAE", lastModified: "2025-01-15", modifiedBy: "Jorge Ramírez" },
  { id: "PAR-002", category: "credito", key: "max_amount_pm", value: "50000000", type: "number", description: "Monto máximo crédito PM", lastModified: "2025-01-15", modifiedBy: "Jorge Ramírez" },
  { id: "PAR-003", category: "credito", key: "min_bureau_score", value: "600", type: "number", description: "Score mínimo de buró para aprobación", lastModified: "2025-02-01", modifiedBy: "Jorge Ramírez" },
  { id: "PAR-004", category: "pld", key: "cash_threshold", value: "50000", type: "number", description: "Umbral efectivo para alerta PLD", lastModified: "2025-01-01", modifiedBy: "Ana García" },
  { id: "PAR-005", category: "tesoreria", key: "auth_threshold_l3", value: "50000", type: "number", description: "Monto mínimo para autorización L3", lastModified: "2025-01-15", modifiedBy: "Jorge Ramírez" },
  { id: "PAR-006", category: "tesoreria", key: "auth_threshold_l4", value: "500000", type: "number", description: "Monto mínimo para autorización L4", lastModified: "2025-01-15", modifiedBy: "Jorge Ramírez" },
  { id: "PAR-007", category: "general", key: "session_timeout", value: "30", type: "number", description: "Timeout de sesión en minutos", lastModified: "2025-02-10", modifiedBy: "Diana Ruiz" },
  { id: "PAR-008", category: "notificaciones", key: "email_enabled", value: "true", type: "boolean", description: "Notificaciones por email habilitadas", lastModified: "2025-03-01", modifiedBy: "Pedro Sánchez" },
]

export const notificationTemplates: NotificationTemplate[] = [
  { id: "TPL-001", event: "bienvenida", channel: "email", subject: "¡Bienvenido a SAYO!", body: "Hola {nombre}, tu cuenta SAYO ha sido activada...", variables: ["nombre", "clabe", "fecha"], active: true, lastEdited: "2025-01-15" },
  { id: "TPL-002", event: "pago_recibido", channel: "push", subject: "Pago recibido", body: "Recibiste {monto} de {remitente}", variables: ["monto", "remitente", "referencia"], active: true, lastEdited: "2025-02-01" },
  { id: "TPL-003", event: "vencimiento_credito", channel: "sms", subject: "Recordatorio de pago", body: "Tu pago de {monto} vence el {fecha}. Evita cargos moratorios.", variables: ["monto", "fecha", "credito"], active: true, lastEdited: "2025-02-15" },
  { id: "TPL-004", event: "aprobación_credito", channel: "email", subject: "¡Tu crédito fue aprobado!", body: "Hola {nombre}, tu solicitud {folio} por {monto} ha sido aprobada...", variables: ["nombre", "folio", "monto", "plazo"], active: true, lastEdited: "2025-03-01" },
  { id: "TPL-005", event: "rechazo_credito", channel: "email", subject: "Resultado de tu solicitud", body: "Hola {nombre}, lamentamos informar que tu solicitud {folio} no fue aprobada...", variables: ["nombre", "folio", "motivo"], active: true, lastEdited: "2025-03-01" },
]
