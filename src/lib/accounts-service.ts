import { api } from "./api-client"

// ============================================================
// SAYO — Accounts & Transactions Service
// Now calls backend API (sayo-platform) instead of Supabase directly.
// Demo mode is handled server-side.
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

// --- Service (API-backed) ---

function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined)
  if (entries.length === 0) return ""
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&")
}

export const accountsService = {
  async getAccounts(userId: string): Promise<Account[]> {
    return api.get<Account[]>(`/api/v1/banking/accounts${buildQuery({ userId })}`)
  },

  async getAccount(accountId: string): Promise<Account | null> {
    return api.get<Account | null>(`/api/v1/banking/accounts/${accountId}`)
  },

  async getAllAccounts(filters?: { status?: string; type?: string }): Promise<Account[]> {
    return api.get<Account[]>(`/api/v1/banking/accounts/all${buildQuery({ status: filters?.status, type: filters?.type })}`)
  },

  async getBeneficiaries(userId: string): Promise<Beneficiary[]> {
    return api.get<Beneficiary[]>(`/api/v1/banking/beneficiaries${buildQuery({ userId })}`)
  },

  async addBeneficiary(beneficiary: Omit<Beneficiary, "id" | "created_at">): Promise<Beneficiary> {
    return api.post<Beneficiary>("/api/v1/banking/beneficiaries", beneficiary)
  },

  async getTransactions(accountId: string, limit = 50): Promise<TransactionRecord[]> {
    return api.get<TransactionRecord[]>(`/api/v1/banking/transactions/account/${accountId}${buildQuery({ limit })}`)
  },

  async getUserTransactions(userId: string, limit = 50): Promise<TransactionRecord[]> {
    return api.get<TransactionRecord[]>(`/api/v1/banking/transactions/user/${userId}${buildQuery({ limit })}`)
  },

  async getAllTransactions(filters?: {
    type?: string
    status?: string
    dateFrom?: string
    dateTo?: string
    limit?: number
  }): Promise<TransactionRecord[]> {
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
    return api.post<TransactionRecord>("/api/v1/banking/transactions/transfer", {
      source_account_id: params.accountId,
      destination_clabe: params.receiverClabe,
      amount: params.amount,
      concept: params.concepto,
      reference: null,
    })
  },

  async getServiceCompanies(): Promise<ServiceCompany[]> {
    return api.get<ServiceCompany[]>("/api/v1/banking/service-companies")
  },

  async getBatches(filters?: { status?: string }): Promise<Batch[]> {
    return api.get<Batch[]>(`/api/v1/banking/batches${buildQuery({ status: filters?.status })}`)
  },
}
