import { api, isDemoMode } from "./api-client"

// ============================================================
// SAYO — Executive (P&L, KPIs, Board) +
//         Admin (Users, Roles, Catalogs) Service
// Now calls backend API (sayo-platform) instead of Supabase directly.
// When isDemoMode is true, returns inline demo data without network calls.
// ============================================================

// --- Types ---

export interface PnLItem {
  category: string
  subcategory: string
  current_month: number
  previous_month: number
  ytd: number
  budget: number
  variance: number
}

export interface KPIRecord {
  id: string
  name: string
  category: string
  actual: number
  target: number
  unit: string
  trend: "up" | "down" | "stable"
  status: "verde" | "amarillo" | "rojo"
  period: string
}

export interface SystemUser {
  id: string
  name: string
  email: string
  role: string
  department: string
  status: "activo" | "inactivo" | "suspendido"
  last_login: string
  created_at: string
}

export interface RoleDefinition {
  id: string
  name: string
  description: string
  user_count: number
  permissions: Record<string, boolean>
}

export interface CatalogEntry {
  id: string
  catalog_type: string
  code: string
  name: string
  description: string | null
  is_active: boolean
  sort_order: number
}

// --- Helpers ---

function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined)
  if (entries.length === 0) return ""
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&")
}

// --- Demo Data ---

const demoPnL: PnLItem[] = [
  { category: "Ingresos", subcategory: "Intereses por créditos", current_month: 6200000, previous_month: 5800000, ytd: 18200000, budget: 6000000, variance: 3.3 },
  { category: "Ingresos", subcategory: "Comisiones SPEI", current_month: 3100000, previous_month: 2900000, ytd: 8800000, budget: 3000000, variance: 3.3 },
  { category: "Ingresos", subcategory: "Comisiones tarjeta", current_month: 1800000, previous_month: 1650000, ytd: 5100000, budget: 1700000, variance: 5.9 },
  { category: "Ingresos", subcategory: "Otros ingresos", current_month: 1350000, previous_month: 1200000, ytd: 3800000, budget: 1300000, variance: 3.8 },
  { category: "Gastos", subcategory: "Nómina", current_month: 4200000, previous_month: 4200000, ytd: 12600000, budget: 4200000, variance: 0 },
  { category: "Gastos", subcategory: "Tecnología", current_month: 1500000, previous_month: 1400000, ytd: 4200000, budget: 1600000, variance: -6.3 },
  { category: "Gastos", subcategory: "Regulatorio", current_month: 800000, previous_month: 750000, ytd: 2300000, budget: 850000, variance: -5.9 },
  { category: "Gastos", subcategory: "Marketing", current_month: 600000, previous_month: 550000, ytd: 1700000, budget: 700000, variance: -14.3 },
  { category: "Gastos", subcategory: "Operaciones", current_month: 1000000, previous_month: 980000, ytd: 2900000, budget: 1050000, variance: -4.8 },
]

const demoKPIs: KPIRecord[] = [
  { id: "kpi-001", name: "Crecimiento de usuarios", category: "Crecimiento", actual: 22.1, target: 20, unit: "%", trend: "up", status: "verde", period: "Mar 2024" },
  { id: "kpi-002", name: "Retención 30 días", category: "Crecimiento", actual: 85.3, target: 90, unit: "%", trend: "stable", status: "amarillo", period: "Mar 2024" },
  { id: "kpi-003", name: "CAC", category: "Financiero", actual: 450, target: 500, unit: "MXN", trend: "down", status: "verde", period: "Mar 2024" },
  { id: "kpi-004", name: "ARPU", category: "Financiero", actual: 285, target: 300, unit: "MXN", trend: "up", status: "amarillo", period: "Mar 2024" },
  { id: "kpi-005", name: "Índice de mora", category: "Riesgo", actual: 6.7, target: 5, unit: "%", trend: "down", status: "rojo", period: "Mar 2024" },
  { id: "kpi-006", name: "Uptime plataforma", category: "Operaciones", actual: 99.97, target: 99.9, unit: "%", trend: "stable", status: "verde", period: "Mar 2024" },
  { id: "kpi-007", name: "NPS", category: "Satisfacción", actual: 72, target: 70, unit: "pts", trend: "up", status: "verde", period: "Mar 2024" },
  { id: "kpi-008", name: "Tiempo resolución tickets", category: "Satisfacción", actual: 4.2, target: 4, unit: "hrs", trend: "down", status: "amarillo", period: "Mar 2024" },
]

const demoSystemUsers: SystemUser[] = [
  { id: "usr-001", name: "Carlos Mendoza", email: "carlos.mendoza@sayo.mx", role: "L2 Operador", department: "Operaciones", status: "activo", last_login: "2024-03-06T09:00:00", created_at: "2023-06-15" },
  { id: "usr-002", name: "Ana García", email: "ana.garcia@sayo.mx", role: "L3 Oficial PLD", department: "Cumplimiento", status: "activo", last_login: "2024-03-06T08:45:00", created_at: "2023-04-01" },
  { id: "usr-003", name: "Roberto López", email: "roberto.lopez@sayo.mx", role: "L2 Gestor Cobranza", department: "Cobranza", status: "activo", last_login: "2024-03-05T17:30:00", created_at: "2023-07-20" },
  { id: "usr-004", name: "María Fernández", email: "maria.fernandez@sayo.mx", role: "L2 Ejecutivo Comercial", department: "Comercial", status: "activo", last_login: "2024-03-06T10:15:00", created_at: "2023-05-10" },
  { id: "usr-005", name: "Diana Ruiz", email: "diana.ruiz@sayo.mx", role: "L4 Seguridad IT", department: "TI", status: "activo", last_login: "2024-03-06T07:30:00", created_at: "2023-03-01" },
  { id: "usr-006", name: "Ex Empleado", email: "ex.empleado@sayo.mx", role: "L2 Soporte", department: "Soporte", status: "suspendido", last_login: "2024-01-15T16:00:00", created_at: "2023-08-01" },
]

const demoRoles: RoleDefinition[] = [
  { id: "rol-001", name: "L2 Operador", description: "Operaciones SPEI y conciliación", user_count: 8, permissions: { dashboard: true, spei: true, dispersiones: true, conciliacion: true, cuentas: false, reportes: false } },
  { id: "rol-002", name: "L3 Back-Office", description: "Supervisión operativa completa", user_count: 3, permissions: { dashboard: true, spei: true, dispersiones: true, conciliacion: true, cuentas: true, reportes: true } },
  { id: "rol-003", name: "L3 Oficial PLD", description: "Cumplimiento y reportes regulatorios", user_count: 2, permissions: { dashboard: true, alertas: true, reportes_cnbv: true, peps: true, investigaciones: true } },
  { id: "rol-004", name: "L4 Admin", description: "Administración completa del sistema", user_count: 2, permissions: { dashboard: true, usuarios: true, roles: true, catalogos: true, config: true } },
  { id: "rol-005", name: "L5 Ejecutivo", description: "Acceso ejecutivo: P&L, KPIs, board", user_count: 3, permissions: { dashboard: true, pnl: true, kpis: true, board: true } },
]

const demoCatalogs: CatalogEntry[] = [
  { id: "cat-001", catalog_type: "tipo_credito", code: "PERSONAL", name: "Crédito Personal", description: "Crédito de libre disposición", is_active: true, sort_order: 1 },
  { id: "cat-002", catalog_type: "tipo_credito", code: "NOMINA", name: "Crédito Nómina", description: "Crédito con descuento de nómina", is_active: true, sort_order: 2 },
  { id: "cat-003", catalog_type: "tipo_credito", code: "EMPRESARIAL", name: "Crédito Empresarial", description: "Financiamiento empresarial", is_active: true, sort_order: 3 },
  { id: "cat-004", catalog_type: "banco", code: "BBVA", name: "BBVA México", description: null, is_active: true, sort_order: 1 },
  { id: "cat-005", catalog_type: "banco", code: "BANORTE", name: "Banorte", description: null, is_active: true, sort_order: 2 },
  { id: "cat-006", catalog_type: "banco", code: "SANTANDER", name: "Santander", description: null, is_active: true, sort_order: 3 },
]

// --- Service (API-backed with demo fallback) ---

export const executiveService = {
  async getPnL(): Promise<PnLItem[]> {
    if (isDemoMode) return demoPnL
    return api.get<PnLItem[]>("/api/v1/analytics/pnl")
  },

  async getKPIs(period?: string): Promise<KPIRecord[]> {
    if (isDemoMode) return demoKPIs
    return api.get<KPIRecord[]>(`/api/v1/analytics/kpis${buildQuery({ period })}`)
  },

  async getExecutiveStats(): Promise<{
    ingresosMensuales: number
    gastosMensuales: number
    utilidadNeta: number
    aum: number
    mau: number
    nps: number
    kpisVerdes: number
    kpisAmarillos: number
    kpisRojos: number
  }> {
    if (isDemoMode) return { ingresosMensuales: 12450000, gastosMensuales: 8100000, utilidadNeta: 4350000, aum: 2340000000, mau: 48500, nps: 72, kpisVerdes: 4, kpisAmarillos: 3, kpisRojos: 1 }
    return api.get("/api/v1/analytics/executive-stats")
  },
}

export const adminService = {
  // Users
  async getUsers(): Promise<SystemUser[]> {
    if (isDemoMode) return demoSystemUsers
    return api.get<SystemUser[]>("/api/v1/analytics/admin/users")
  },

  async updateUserStatus(id: string, status: string): Promise<void> {
    if (isDemoMode) return
    await api.patch<void>(`/api/v1/analytics/admin/users/${id}/status`, { status })
  },

  async updateUserRole(id: string, role: string): Promise<void> {
    if (isDemoMode) return
    await api.patch<void>(`/api/v1/analytics/admin/users/${id}/role`, { role })
  },

  // Roles
  async getRoles(): Promise<RoleDefinition[]> {
    if (isDemoMode) return demoRoles
    return api.get<RoleDefinition[]>("/api/v1/analytics/admin/roles")
  },

  // Catalogs
  async getCatalogs(catalogType?: string): Promise<CatalogEntry[]> {
    if (isDemoMode) return catalogType ? demoCatalogs.filter(c => c.catalog_type === catalogType) : demoCatalogs
    return api.get<CatalogEntry[]>(`/api/v1/analytics/admin/catalogs${buildQuery({ catalogType })}`)
  },

  async getCatalogTypes(): Promise<string[]> {
    if (isDemoMode) return ["tipo_credito", "banco", "estado", "moneda"]
    return api.get<string[]>("/api/v1/analytics/admin/catalog-types")
  },

  async getAdminStats(): Promise<{
    totalUsers: number
    activeUsers: number
    inactiveUsers: number
    totalRoles: number
    totalCatalogs: number
    catalogEntries: number
  }> {
    if (isDemoMode) return { totalUsers: 48500, activeUsers: 45, inactiveUsers: 1, totalRoles: 5, totalCatalogs: 4, catalogEntries: 24 }
    return api.get("/api/v1/analytics/admin/stats")
  },
}
