// ============================================================
// SAYO — Concentradora Service
//
// Wraps the banking-service concentradora API endpoints.
// When isDemoMode is true, returns inline demo data without
// making any network requests.
// ============================================================

import { api, isDemoMode } from "./api-client"

// ─── Types ────────────────────────────────────────────────────

export interface ConcentradoraInfo {
  id:                  string
  name:                string
  rfc:                 string
  clabe:               string
  banco:               string
  sucursal:            string
  integrador:          string
  centro_costos:       string
  balance_opm:         number
  balance_local:       number
  balance_diff:        number
  total_subcuentas:    number
  active_subcuentas:   number
  blocked_subcuentas:  number
  inactive_subcuentas: number
  closed_subcuentas:   number
  max_subcuentas:      number
  status:              "active" | "suspended" | "closed"
  created_at:          string
  updated_at:          string
}

export interface SubcuentaRecord {
  id:               string
  user_id:          string | null
  sayo_id:          string | null
  account_number:   string
  clabe:            string
  subcuenta_number: string | null
  type:             string
  currency:         string
  balance:          number
  available_balance: number
  hold_amount:      number
  status:           string
  is_primary:       boolean
  concentradora_id: string
  created_at:       string
  updated_at:       string
  profiles: {
    full_name: string
    email:     string
  } | null
}

export interface ReconciliationReport {
  concentradora_id:          string
  name:                      string
  rfc:                       string
  clabe:                     string
  balance_opm:               number
  balance_local_stored:      number
  balance_local_calculated:  number
  balance_diff:              number
  is_reconciled:             boolean
  total_subcuentas:          number
  last_opm_sync:             string
  generated_at:              string
}

export interface CreateSubcuentaParams {
  user_id?:  string
  full_name: string
}

export interface CreatedSubcuenta {
  account_id:       string
  sayo_id:          string
  account_number:   string
  clabe:            string
  subcuenta_number: string
  concentradora_id: string
  user_id:          string | null
  full_name:        string
  status:           string
  balance:          number
  created_at:       string
}

export interface ConcentradoraMovement {
  id:               string
  concentradora_id: string
  type:             string
  direction:        "credit" | "debit"
  amount:           number
  balance_before:   number | null
  balance_after:    number | null
  subcuenta_id:     string | null
  reference_id:     string | null
  description:      string | null
  metadata:         Record<string, unknown> | null
  created_at:       string
}

export interface SyncBalanceResult {
  concentradora_id: string
  clabe:            string
  balance_opm:      number
  balance_local:    number
  balance_diff:     number
  is_reconciled:    boolean
  previous_opm:     number
  synced_at:        string
}

// ─── Demo Data ────────────────────────────────────────────────

const demoConcentradora: ConcentradoraInfo = {
  id:                  "conc-demo-0001",
  name:                "SOLVENDOM S.A.P.I. DE C.V. SOFOM E.N.R.",
  rfc:                 "SOL230822KH2",
  clabe:               "684180297007000000",
  banco:               "684",
  sucursal:            "180",
  integrador:          "297",
  centro_costos:       "007",
  balance_opm:         1_500_000,
  balance_local:       1_500_000,
  balance_diff:        0,
  total_subcuentas:    15,
  active_subcuentas:   12,
  blocked_subcuentas:  2,
  inactive_subcuentas: 1,
  closed_subcuentas:   0,
  max_subcuentas:      99999,
  status:              "active",
  created_at:          "2023-08-22T00:00:00Z",
  updated_at:          new Date().toISOString(),
}

const demoSubcuentas: SubcuentaRecord[] = [
  {
    id: "acc-s001", user_id: "user-d01", sayo_id: "SAYO-AA001122", account_number: "SAY0000000001",
    clabe: "684180297007000014", subcuenta_number: "00001", type: "primary", currency: "MXN",
    balance: 47250.80, available_balance: 47250.80, hold_amount: 0, status: "active", is_primary: true,
    concentradora_id: "conc-demo-0001", created_at: "2024-01-10T10:00:00Z", updated_at: "2024-03-06T09:00:00Z",
    profiles: { full_name: "Juan Pérez García", email: "juan@sayo.mx" },
  },
  {
    id: "acc-s002", user_id: "user-d02", sayo_id: "SAYO-BB334455", account_number: "SAY0000000002",
    clabe: "684180297007000028", subcuenta_number: "00002", type: "primary", currency: "MXN",
    balance: 125000, available_balance: 100000, hold_amount: 25000, status: "active", is_primary: true,
    concentradora_id: "conc-demo-0001", created_at: "2024-01-15T10:00:00Z", updated_at: "2024-03-05T14:30:00Z",
    profiles: { full_name: "María López Fernández", email: "maria@sayo.mx" },
  },
  {
    id: "acc-s003", user_id: "user-d03", sayo_id: "SAYO-CC667788", account_number: "SAY0000000003",
    clabe: "684180297007000036", subcuenta_number: "00003", type: "primary", currency: "MXN",
    balance: 890000, available_balance: 890000, hold_amount: 0, status: "active", is_primary: true,
    concentradora_id: "conc-demo-0001", created_at: "2024-02-01T10:00:00Z", updated_at: "2024-03-06T11:00:00Z",
    profiles: { full_name: "Empresa ABC S.A. de C.V.", email: "contacto@empresa-abc.mx" },
  },
  {
    id: "acc-s004", user_id: "user-d04", sayo_id: "SAYO-DD990011", account_number: "SAY0000000004",
    clabe: "684180297007000044", subcuenta_number: "00004", type: "primary", currency: "MXN",
    balance: 2340000, available_balance: 2240000, hold_amount: 100000, status: "blocked", is_primary: true,
    concentradora_id: "conc-demo-0001", created_at: "2024-02-10T10:00:00Z", updated_at: "2024-03-04T15:00:00Z",
    profiles: { full_name: "Tech Solutions MX", email: "ops@techsolutions.mx" },
  },
  {
    id: "acc-s005", user_id: "user-d05", sayo_id: "SAYO-EE223344", account_number: "SAY0000000005",
    clabe: "684180297007000058", subcuenta_number: "00005", type: "primary", currency: "MXN",
    balance: 0, available_balance: 0, hold_amount: 0, status: "active", is_primary: true,
    concentradora_id: "conc-demo-0001", created_at: "2024-02-20T10:00:00Z", updated_at: "2024-01-15T10:00:00Z",
    profiles: { full_name: "Carlos Ruiz Méndez", email: "carlos@sayo.mx" },
  },
  {
    id: "acc-s006", user_id: "user-d06", sayo_id: "SAYO-FF556677", account_number: "SAY0000000006",
    clabe: "684180297007000066", subcuenta_number: "00006", type: "primary", currency: "MXN",
    balance: 18500.50, available_balance: 18500.50, hold_amount: 0, status: "active", is_primary: true,
    concentradora_id: "conc-demo-0001", created_at: "2024-03-01T10:00:00Z", updated_at: "2024-03-06T08:30:00Z",
    profiles: { full_name: "Ana Torres Vega", email: "ana@sayo.mx" },
  },
]

const demoMovements: ConcentradoraMovement[] = [
  {
    id: "cm-001", concentradora_id: "conc-demo-0001", type: "spei_in", direction: "credit",
    amount: 47250.80, balance_before: 1452749.20, balance_after: 1500000, subcuenta_id: "acc-s001",
    reference_id: "SAYO202601101200", description: "SPEI entrante subcuenta 00001",
    metadata: null, created_at: "2024-01-10T12:00:00Z",
  },
  {
    id: "cm-002", concentradora_id: "conc-demo-0001", type: "sync", direction: "credit",
    amount: 0, balance_before: 1500000, balance_after: 1500000, subcuenta_id: null,
    reference_id: null, description: "Balance sync from OPM API",
    metadata: { synced_by: "admin" }, created_at: "2024-03-06T08:00:00Z",
  },
  {
    id: "cm-003", concentradora_id: "conc-demo-0001", type: "spei_in", direction: "credit",
    amount: 125000, balance_before: 1375000, balance_after: 1500000, subcuenta_id: "acc-s002",
    reference_id: "SAYO202601151430", description: "SPEI entrante subcuenta 00002",
    metadata: null, created_at: "2024-01-15T14:30:00Z",
  },
]

// ─── Service ──────────────────────────────────────────────────

function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined)
  if (entries.length === 0) return ""
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&")
}

export const concentradoraService = {
  /**
   * Fetch master account info with subcuenta status counts.
   */
  async getConcentradora(): Promise<ConcentradoraInfo> {
    if (isDemoMode) return demoConcentradora
    return api.get<ConcentradoraInfo>("/api/v1/banking/concentradora")
  },

  /**
   * List all subcuentas with pagination and optional filters.
   */
  async getSubcuentas(params?: {
    status?: string
    search?: string
    limit?:  number
    offset?: number
  }): Promise<{ data: SubcuentaRecord[]; total: number }> {
    if (isDemoMode) {
      let result = [...demoSubcuentas]
      if (params?.status) result = result.filter((s) => s.status === params.status)
      if (params?.search) {
        const q = params.search.toLowerCase()
        result = result.filter((s) =>
          s.clabe.includes(q) ||
          s.sayo_id?.toLowerCase().includes(q) ||
          s.subcuenta_number?.includes(q) ||
          s.profiles?.full_name.toLowerCase().includes(q)
        )
      }
      const offset = params?.offset ?? 0
      const limit  = params?.limit  ?? 50
      return { data: result.slice(offset, offset + limit), total: result.length }
    }
    return api.get<{ data: SubcuentaRecord[]; total: number }>(
      `/api/v1/banking/concentradora/subcuentas${buildQuery({
        status: params?.status,
        search: params?.search,
        limit:  params?.limit,
        offset: params?.offset,
      })}`
    )
  },

  /**
   * Get reconciliation report: OPM balance vs sum of subcuentas.
   */
  async getReconciliation(): Promise<ReconciliationReport> {
    if (isDemoMode) {
      return {
        concentradora_id:          demoConcentradora.id,
        name:                      demoConcentradora.name,
        rfc:                       demoConcentradora.rfc,
        clabe:                     demoConcentradora.clabe,
        balance_opm:               demoConcentradora.balance_opm,
        balance_local_stored:      demoConcentradora.balance_local,
        balance_local_calculated:  demoConcentradora.balance_local,
        balance_diff:              0,
        is_reconciled:             true,
        total_subcuentas:          demoConcentradora.total_subcuentas,
        last_opm_sync:             demoConcentradora.updated_at,
        generated_at:              new Date().toISOString(),
      }
    }
    return api.get<ReconciliationReport>("/api/v1/banking/concentradora/reconciliation")
  },

  /**
   * Manually create a new subcuenta (admin only).
   */
  async createSubcuenta(params: CreateSubcuentaParams): Promise<CreatedSubcuenta> {
    if (isDemoMode) {
      const nextNum = String(demoSubcuentas.length + 1).padStart(5, "0")
      const clabe   = `684180297007${nextNum}0` // mock — control digit not computed client-side
      const created: CreatedSubcuenta = {
        account_id:       `acc-s${String(demoSubcuentas.length + 1).padStart(3, "0")}`,
        sayo_id:          `SAYO-${Math.random().toString(16).substring(2, 10).toUpperCase()}`,
        account_number:   `SAY${String(demoSubcuentas.length + 1).padStart(10, "0")}`,
        clabe,
        subcuenta_number: nextNum,
        concentradora_id: demoConcentradora.id,
        user_id:          params.user_id ?? null,
        full_name:        params.full_name,
        status:           "active",
        balance:          0,
        created_at:       new Date().toISOString(),
      }
      demoSubcuentas.push({
        id:               created.account_id,
        user_id:          params.user_id ?? null,
        sayo_id:          created.sayo_id,
        account_number:   created.account_number,
        clabe:            created.clabe,
        subcuenta_number: nextNum,
        type:             "primary",
        currency:         "MXN",
        balance:          0,
        available_balance: 0,
        hold_amount:      0,
        status:           "active",
        is_primary:       true,
        concentradora_id: demoConcentradora.id,
        created_at:       created.created_at,
        updated_at:       created.created_at,
        profiles:         { full_name: params.full_name, email: "" },
      })
      demoConcentradora.total_subcuentas  += 1
      demoConcentradora.active_subcuentas += 1
      return created
    }
    return api.post<CreatedSubcuenta>("/api/v1/banking/concentradora/subcuentas", params)
  },

  /**
   * Trigger a balance sync from OPM API (admin only).
   */
  async syncBalance(): Promise<SyncBalanceResult> {
    if (isDemoMode) {
      return {
        concentradora_id: demoConcentradora.id,
        clabe:            demoConcentradora.clabe,
        balance_opm:      demoConcentradora.balance_opm,
        balance_local:    demoConcentradora.balance_local,
        balance_diff:     0,
        is_reconciled:    true,
        previous_opm:     demoConcentradora.balance_opm,
        synced_at:        new Date().toISOString(),
      }
    }
    return api.post<SyncBalanceResult>("/api/v1/banking/concentradora/sync-balance")
  },

  /**
   * Fetch concentradora-level movement history.
   */
  async getMovements(params?: {
    type?:   string
    limit?:  number
    offset?: number
  }): Promise<{ data: ConcentradoraMovement[]; total: number }> {
    if (isDemoMode) {
      let result = [...demoMovements]
      if (params?.type) result = result.filter((m) => m.type === params.type)
      const offset = params?.offset ?? 0
      const limit  = params?.limit  ?? 50
      return { data: result.slice(offset, offset + limit), total: result.length }
    }
    return api.get<{ data: ConcentradoraMovement[]; total: number }>(
      `/api/v1/banking/concentradora/movements${buildQuery({
        type:   params?.type,
        limit:  params?.limit,
        offset: params?.offset,
      })}`
    )
  },
}
