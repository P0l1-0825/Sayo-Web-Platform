import { api, isDemoMode } from "./api-client"

// ============================================================
// SAYO — Accounts & Transactions Service
// Now calls backend API (sayo-platform) instead of Supabase directly.
// When isDemoMode is true, returns inline demo data without network calls.
// ============================================================

// --- Types ---

export interface Account {
  id: string
  user_id: string
  account_number: string
  clabe: string
  account_type: "debito" | "nomina" | "credito" | "ahorro" | "inversiones"
  currency: string
  balance: number
  available_balance: number
  hold_amount: number
  credit_limit: number | null
  status: "active" | "blocked" | "frozen" | "closed" | "pending"
  alias: string | null
  opened_at: string
  created_at: string
}

export interface Beneficiary {
  id: string
  user_id: string
  name: string
  bank_name: string
  bank_code: string | null
  clabe: string
  alias: string | null
  email: string | null
  phone: string | null
  is_favorite: boolean
  created_at: string
}

export interface TransactionRecord {
  id: string
  account_id: string
  user_id: string
  type: string
  direction: "IN" | "OUT"
  amount: number
  fee: number
  tax: number
  total_amount: number
  balance_before: number | null
  balance_after: number | null
  clave_rastreo: string | null
  concepto: string | null
  referencia_numerica: string | null
  sender_name: string | null
  sender_bank: string | null
  sender_clabe: string | null
  receiver_name: string | null
  receiver_bank: string | null
  receiver_clabe: string | null
  status: string
  rejection_reason: string | null
  batch_id: string | null
  initiated_at: string
  processed_at: string | null
  completed_at: string | null
}

export interface Batch {
  id: string
  created_by: string
  name: string
  description: string | null
  type: string
  total_amount: number
  total_transactions: number
  processed_count: number
  success_count: number
  failed_count: number
  status: string
  scheduled_at: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export interface ServiceCompany {
  id: string
  name: string
  category: string
  requires_reference: boolean
  reference_label: string
  min_amount: number
  max_amount: number | null
  commission: number
  is_active: boolean
}

// --- Demo Data ---

const demoAccounts: Account[] = [
  { id: "acc-001", user_id: "demo-user", account_number: "0001234567", clabe: "646180001234567890", account_type: "debito", currency: "MXN", balance: 47250.80, available_balance: 45000, hold_amount: 2250.80, credit_limit: null, status: "active", alias: "Cuenta Principal", opened_at: "2023-06-15", created_at: "2023-06-15" },
  { id: "acc-002", user_id: "demo-user", account_number: "0009876543", clabe: "646180009876543210", account_type: "nomina", currency: "MXN", balance: 35000, available_balance: 35000, hold_amount: 0, credit_limit: null, status: "active", alias: "Nómina", opened_at: "2023-07-01", created_at: "2023-07-01" },
  { id: "acc-003", user_id: "demo-user", account_number: "0005555666", clabe: "646180005555666677", account_type: "credito", currency: "MXN", balance: -12500, available_balance: 87500, hold_amount: 0, credit_limit: 100000, status: "active", alias: "Crédito SAYO", opened_at: "2023-09-01", created_at: "2023-09-01" },
  { id: "acc-004", user_id: "demo-user", account_number: "0003333444", clabe: "646180003333444455", account_type: "ahorro", currency: "MXN", balance: 150000, available_balance: 150000, hold_amount: 0, credit_limit: null, status: "active", alias: "Ahorro Meta", opened_at: "2023-10-15", created_at: "2023-10-15" },
  { id: "acc-005", user_id: "demo-user", account_number: "0007777888", clabe: "646180007777888899", account_type: "inversiones", currency: "MXN", balance: 500000, available_balance: 500000, hold_amount: 0, credit_limit: null, status: "active", alias: "Inversión", opened_at: "2024-01-10", created_at: "2024-01-10" },
]

const demoBeneficiaries: Beneficiary[] = [
  { id: "ben-001", user_id: "demo-user", name: "Carlos Ruiz", bank_name: "Banorte", bank_code: "072", clabe: "072180005678901234", alias: "Carlos", email: "carlos@email.com", phone: "+525512345678", is_favorite: true, created_at: "2024-01-15" },
  { id: "ben-002", user_id: "demo-user", name: "María López", bank_name: "BBVA", bank_code: "012", clabe: "012180001234567891", alias: "María", email: "maria@email.com", phone: null, is_favorite: true, created_at: "2024-02-01" },
  { id: "ben-003", user_id: "demo-user", name: "CFE", bank_name: "Banamex", bank_code: "002", clabe: "002180007890123456", alias: "Luz", email: null, phone: null, is_favorite: false, created_at: "2024-02-10" },
]

const demoTransactions: TransactionRecord[] = [
  { id: "txn-001", account_id: "acc-001", user_id: "demo-user", type: "SPEI_IN", direction: "IN", amount: 125000, fee: 0, tax: 0, total_amount: 125000, balance_before: 22250.80, balance_after: 147250.80, clave_rastreo: "SAYO2024030601", concepto: "Pago nómina", referencia_numerica: "1234567", sender_name: "Empresa ABC S.A.", sender_bank: "BBVA", sender_clabe: "012180001234567891", receiver_name: "Juan Pérez", receiver_bank: "SAYO", receiver_clabe: "646180001234567890", status: "completada", rejection_reason: null, batch_id: null, initiated_at: "2024-03-06T09:15:32", processed_at: "2024-03-06T09:15:35", completed_at: "2024-03-06T09:15:35" },
  { id: "txn-002", account_id: "acc-001", user_id: "demo-user", type: "SPEI_OUT", direction: "OUT", amount: 50000, fee: 3.50, tax: 0.56, total_amount: 50004.06, balance_before: 147250.80, balance_after: 97246.74, clave_rastreo: "SAYO2024030602", concepto: "Transferencia personal", referencia_numerica: "7654321", sender_name: "Juan Pérez", sender_bank: "SAYO", sender_clabe: "646180001234567890", receiver_name: "Carlos Ruiz", receiver_bank: "Banorte", receiver_clabe: "072180005678901234", status: "completada", rejection_reason: null, batch_id: null, initiated_at: "2024-03-06T09:23:15", processed_at: "2024-03-06T09:23:18", completed_at: "2024-03-06T09:23:18" },
  { id: "txn-003", account_id: "acc-001", user_id: "demo-user", type: "SPEI_IN", direction: "IN", amount: 2350000, fee: 0, tax: 0, total_amount: 2350000, balance_before: 97246.74, balance_after: 2447246.74, clave_rastreo: "SAYO2024030603", concepto: "Pago proveedor", referencia_numerica: "9012345", sender_name: "Distribuidora XYZ", sender_bank: "Santander", sender_clabe: "014180003456789012", receiver_name: "Tech Solutions", receiver_bank: "SAYO", receiver_clabe: "646180004567890123", status: "pendiente", rejection_reason: null, batch_id: null, initiated_at: "2024-03-06T09:45:00", processed_at: null, completed_at: null },
  { id: "txn-004", account_id: "acc-001", user_id: "demo-user", type: "SPEI_OUT", direction: "OUT", amount: 15000, fee: 3.50, tax: 0.56, total_amount: 15004.06, balance_before: null, balance_after: null, clave_rastreo: "SAYO2024030604", concepto: "Pago de servicios", referencia_numerica: "3456789", sender_name: "Ana García", sender_bank: "SAYO", sender_clabe: "646180001111222233", receiver_name: "CFE", receiver_bank: "Banamex", receiver_clabe: "002180007890123456", status: "rechazada", rejection_reason: "CLABE destino inválida", batch_id: null, initiated_at: "2024-03-06T10:02:45", processed_at: "2024-03-06T10:02:48", completed_at: null },
  { id: "txn-005", account_id: "acc-001", user_id: "demo-user", type: "DISPERSION", direction: "OUT", amount: 890000, fee: 0, tax: 0, total_amount: 890000, balance_before: null, balance_after: null, clave_rastreo: "SAYO2024030605", concepto: "Dispersión nómina L3", referencia_numerica: null, sender_name: "SAYO Nóminas", sender_bank: "SAYO", sender_clabe: "646180009999888877", receiver_name: "Lote #45", receiver_bank: "Varios", receiver_clabe: "N/A", status: "en_proceso", rejection_reason: null, batch_id: "batch-001", initiated_at: "2024-03-06T10:15:00", processed_at: null, completed_at: null },
  { id: "txn-006", account_id: "acc-002", user_id: "demo-user", type: "SPEI_IN", direction: "IN", amount: 75000, fee: 0, tax: 0, total_amount: 75000, balance_before: 10000, balance_after: 85000, clave_rastreo: "SAYO2024030606", concepto: "Cobro factura", referencia_numerica: "2345678", sender_name: "Consultores MN", sender_bank: "HSBC", sender_clabe: "021180002345678901", receiver_name: "Roberto Díaz", receiver_bank: "SAYO", receiver_clabe: "646180005555666677", status: "completada", rejection_reason: null, batch_id: null, initiated_at: "2024-03-06T10:30:12", processed_at: "2024-03-06T10:30:15", completed_at: "2024-03-06T10:30:15" },
  { id: "txn-007", account_id: "acc-004", user_id: "demo-user", type: "SPEI_OUT", direction: "OUT", amount: 250000, fee: 0, tax: 0, total_amount: 250000, balance_before: 400000, balance_after: 150000, clave_rastreo: "SAYO2024030607", concepto: "Inversión", referencia_numerica: "8901234", sender_name: "Patricia Morales", sender_bank: "SAYO", sender_clabe: "646180003333444455", receiver_name: "Casa de Bolsa XY", receiver_bank: "Inbursa", receiver_clabe: "036180008901234567", status: "completada", rejection_reason: null, batch_id: null, initiated_at: "2024-03-06T10:45:33", processed_at: "2024-03-06T10:45:36", completed_at: "2024-03-06T10:45:36" },
  { id: "txn-008", account_id: "acc-001", user_id: "demo-user", type: "CODI", direction: "OUT", amount: 1500, fee: 0, tax: 0, total_amount: 1500, balance_before: 48750.80, balance_after: 47250.80, clave_rastreo: "SAYO2024030608", concepto: "Pago cafetería", referencia_numerica: null, sender_name: "Luis Torres", sender_bank: "SAYO", sender_clabe: "646180007777888899", receiver_name: "Café Central", receiver_bank: "SAYO", receiver_clabe: "646180006666555544", status: "completada", rejection_reason: null, batch_id: null, initiated_at: "2024-03-06T11:00:00", processed_at: "2024-03-06T11:00:01", completed_at: "2024-03-06T11:00:01" },
]

const demoServiceCompanies: ServiceCompany[] = [
  { id: "sc-001", name: "CFE", category: "Electricidad", requires_reference: true, reference_label: "Número de servicio", min_amount: 50, max_amount: 50000, commission: 8, is_active: true },
  { id: "sc-002", name: "Telmex", category: "Telefonía", requires_reference: true, reference_label: "Número telefónico", min_amount: 100, max_amount: 10000, commission: 5, is_active: true },
  { id: "sc-003", name: "IZZI", category: "Internet", requires_reference: true, reference_label: "Número de cuenta", min_amount: 200, max_amount: 5000, commission: 0, is_active: true },
  { id: "sc-004", name: "SAT", category: "Gobierno", requires_reference: true, reference_label: "Línea de captura", min_amount: 1, max_amount: null, commission: 0, is_active: true },
]

const demoBatches: Batch[] = [
  { id: "batch-001", created_by: "demo-user", name: "Nómina Marzo 1Q", description: "Primera quincena marzo 2024", type: "nomina", total_amount: 890000, total_transactions: 35, processed_count: 20, success_count: 18, failed_count: 2, status: "en_proceso", scheduled_at: "2024-03-06T10:00:00", started_at: "2024-03-06T10:15:00", completed_at: null, created_at: "2024-03-05" },
  { id: "batch-002", created_by: "demo-user", name: "Proveedores Feb", description: "Pagos a proveedores febrero", type: "proveedores", total_amount: 1250000, total_transactions: 12, processed_count: 12, success_count: 12, failed_count: 0, status: "completado", scheduled_at: null, started_at: "2024-02-28T14:00:00", completed_at: "2024-02-28T14:05:00", created_at: "2024-02-28" },
]

// --- Service (API-backed with demo fallback) ---

function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined)
  if (entries.length === 0) return ""
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&")
}

export const accountsService = {
  async getAccounts(userId: string): Promise<Account[]> {
    if (isDemoMode) return demoAccounts.filter(a => a.user_id === userId || userId === "demo-user")
    return api.get<Account[]>(`/api/v1/banking/accounts${buildQuery({ userId })}`)
  },

  async getAccount(accountId: string): Promise<Account | null> {
    if (isDemoMode) return demoAccounts.find(a => a.id === accountId) ?? null
    return api.get<Account | null>(`/api/v1/banking/accounts/${accountId}`)
  },

  async getAllAccounts(filters?: { status?: string; type?: string }): Promise<Account[]> {
    if (isDemoMode) {
      let result = demoAccounts
      if (filters?.status) result = result.filter(a => a.status === filters.status)
      if (filters?.type) result = result.filter(a => a.account_type === filters.type)
      return result
    }
    return api.get<Account[]>(`/api/v1/banking/accounts/all${buildQuery({ status: filters?.status, type: filters?.type })}`)
  },

  async getBeneficiaries(userId: string): Promise<Beneficiary[]> {
    if (isDemoMode) return demoBeneficiaries.filter(b => b.user_id === userId || userId === "demo-user")
    return api.get<Beneficiary[]>(`/api/v1/banking/beneficiaries${buildQuery({ userId })}`)
  },

  async addBeneficiary(beneficiary: Omit<Beneficiary, "id" | "created_at">): Promise<Beneficiary> {
    if (isDemoMode) return { ...beneficiary, id: `ben-${Date.now()}`, created_at: new Date().toISOString() } as Beneficiary
    return api.post<Beneficiary>("/api/v1/banking/beneficiaries", beneficiary)
  },

  async getTransactions(accountId: string, limit = 50): Promise<TransactionRecord[]> {
    if (isDemoMode) return demoTransactions.filter(t => t.account_id === accountId).slice(0, limit)
    return api.get<TransactionRecord[]>(`/api/v1/banking/transactions/account/${accountId}${buildQuery({ limit })}`)
  },

  async getUserTransactions(userId: string, limit = 50): Promise<TransactionRecord[]> {
    if (isDemoMode) return demoTransactions.filter(t => t.user_id === userId || userId === "demo-user").slice(0, limit)
    return api.get<TransactionRecord[]>(`/api/v1/banking/transactions/user/${userId}${buildQuery({ limit })}`)
  },

  async getAllTransactions(filters?: {
    type?: string
    status?: string
    dateFrom?: string
    dateTo?: string
    limit?: number
  }): Promise<TransactionRecord[]> {
    if (isDemoMode) {
      let result = demoTransactions
      if (filters?.type) result = result.filter(t => t.type === filters.type)
      if (filters?.status) result = result.filter(t => t.status === filters.status)
      return result.slice(0, filters?.limit ?? 50)
    }
    return api.get<TransactionRecord[]>(`/api/v1/banking/transactions/all${buildQuery({
      type: filters?.type,
      status: filters?.status,
      dateFrom: filters?.dateFrom,
      dateTo: filters?.dateTo,
      limit: filters?.limit,
    })}`)
  },

  async createTransfer(params: {
    accountId: string
    userId: string
    receiverName: string
    receiverBank: string
    receiverClabe: string
    amount: number
    concepto: string
  }): Promise<TransactionRecord> {
    if (isDemoMode) {
      return {
        id: `txn-${Date.now()}`, account_id: params.accountId, user_id: params.userId, type: "SPEI_OUT", direction: "OUT",
        amount: params.amount, fee: 3.50, tax: 0.56, total_amount: params.amount + 4.06,
        balance_before: null, balance_after: null, clave_rastreo: `SAYO${Date.now()}`,
        concepto: params.concepto, referencia_numerica: null,
        sender_name: "Demo User", sender_bank: "SAYO", sender_clabe: "646180001234567890",
        receiver_name: params.receiverName, receiver_bank: params.receiverBank, receiver_clabe: params.receiverClabe,
        status: "pendiente", rejection_reason: null, batch_id: null,
        initiated_at: new Date().toISOString(), processed_at: null, completed_at: null,
      }
    }
    return api.post<TransactionRecord>("/api/v1/banking/transactions/transfer", {
      source_account_id: params.accountId,
      destination_clabe: params.receiverClabe,
      amount: params.amount,
      concept: params.concepto,
      reference: null,
    })
  },

  async getServiceCompanies(): Promise<ServiceCompany[]> {
    if (isDemoMode) return demoServiceCompanies
    return api.get<ServiceCompany[]>("/api/v1/banking/service-companies")
  },

  async getBatches(filters?: { status?: string }): Promise<Batch[]> {
    if (isDemoMode) {
      if (filters?.status) return demoBatches.filter(b => b.status === filters.status)
      return demoBatches
    }
    return api.get<Batch[]>(`/api/v1/banking/batches${buildQuery({ status: filters?.status })}`)
  },
}
