import { api } from "./api-client"

// ============================================================
// SAYO — Executive (P&L, KPIs, Board) +
//         Admin (Users, Roles, Catalogs) Service
// Now calls backend API (sayo-platform) instead of Supabase directly.
// Demo mode is handled server-side.
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

// --- Service (API-backed) ---

export const executiveService = {
  async getPnL(): Promise<PnLItem[]> {
    return api.get<PnLItem[]>("/api/v1/analytics/pnl")
  },

  async getKPIs(period?: string): Promise<KPIRecord[]> {
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
    return api.get("/api/v1/analytics/executive-stats")
  },
}

export const adminService = {
  // Users
  async getUsers(): Promise<SystemUser[]> {
    return api.get<SystemUser[]>("/api/v1/analytics/admin/users")
  },

  async updateUserStatus(id: string, status: string): Promise<void> {
    await api.patch<void>(`/api/v1/analytics/admin/users/${id}/status`, { status })
  },

  async updateUserRole(id: string, role: string): Promise<void> {
    await api.patch<void>(`/api/v1/analytics/admin/users/${id}/role`, { role })
  },

  // Roles
  async getRoles(): Promise<RoleDefinition[]> {
    return api.get<RoleDefinition[]>("/api/v1/analytics/admin/roles")
  },

  // Catalogs
  async getCatalogs(catalogType?: string): Promise<CatalogEntry[]> {
    return api.get<CatalogEntry[]>(`/api/v1/analytics/admin/catalogs${buildQuery({ catalogType })}`)
  },

  async getCatalogTypes(): Promise<string[]> {
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
    return api.get("/api/v1/analytics/admin/stats")
  },
}
