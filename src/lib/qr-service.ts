import { api, isDemoMode } from "./api-client"

export interface QrCode {
  id: string
  user_id: string
  type: "cobro" | "pago" | "cobro_abierto"
  amount: number | null
  currency: string
  description: string | null
  clabe_destino: string
  status: "active" | "used" | "expired" | "cancelled"
  qr_data: string
  expires_at: string | null
  created_at: string
}

export interface QrValidation {
  valid: boolean
  reason?: string
  qr_id?: string
  type?: string
  amount?: number
  currency?: string
  description?: string
  beneficiary_name?: string
  beneficiary_clabe?: string
  expires_at?: string
}

export interface QrPaymentResult {
  transaction_id: string
  qr_id: string
  amount: number
  currency: string
  status: string
  beneficiary_name?: string
  confirmation_number?: string
  debit_movement_id?: string
  credit_movement_id?: string
  paid_at: string
}

// Demo data
const demoQrCodes: QrCode[] = [
  { id: "qr-001", user_id: "demo-user", type: "cobro", amount: 500, currency: "MXN", description: "Cobro servicio", clabe_destino: "684180297007000014", status: "active", qr_data: "https://sayo.mx/qr/qr-001", expires_at: new Date(Date.now() + 86400000).toISOString(), created_at: new Date().toISOString() },
  { id: "qr-002", user_id: "demo-user", type: "cobro_abierto", amount: null, currency: "MXN", description: "Cobro abierto tienda", clabe_destino: "684180297007000014", status: "active", qr_data: "https://sayo.mx/qr/qr-002", expires_at: null, created_at: new Date().toISOString() },
]

export const qrService = {
  async generate(params: {
    amount?: number
    description?: string
    type?: "cobro" | "pago"
  }): Promise<QrCode> {
    if (isDemoMode) {
      const id = `qr-${Date.now()}`
      return {
        id,
        user_id: "demo-user",
        type: params.amount ? (params.type ?? "cobro") : "cobro_abierto",
        amount: params.amount ?? null,
        currency: "MXN",
        description: params.description ?? null,
        clabe_destino: "684180297007000014",
        status: "active",
        qr_data: `https://sayo.mx/qr/${id}`,
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        created_at: new Date().toISOString(),
      }
    }
    return api.post<QrCode>("/api/v1/qr/generate", params)
  },

  async validate(qrData: string): Promise<QrValidation> {
    if (isDemoMode) {
      return {
        valid: true,
        qr_id: "qr-001",
        type: "cobro",
        amount: 500,
        currency: "MXN",
        description: "Cobro servicio demo",
        beneficiary_name: "Juan Pérez",
        beneficiary_clabe: "684180297007000014",
        expires_at: new Date(Date.now() + 86400000).toISOString(),
      }
    }
    return api.post<QrValidation>("/api/v1/qr/scan/validate", { qr_data: qrData })
  },

  async pay(params: { qr_id: string; amount?: number }): Promise<QrPaymentResult> {
    if (isDemoMode) {
      return {
        transaction_id: `txn-qr-${Date.now()}`,
        qr_id: params.qr_id,
        amount: params.amount ?? 500,
        currency: "MXN",
        status: "completed",
        beneficiary_name: "Juan Pérez",
        confirmation_number: `QR-${Date.now()}`,
        paid_at: new Date().toISOString(),
      }
    }
    return api.post<QrPaymentResult>("/api/v1/qr/scan/pay", params)
  },

  async getMyQrCodes(): Promise<QrCode[]> {
    if (isDemoMode) return demoQrCodes
    try {
      return await api.get<QrCode[]>("/api/v1/qr/generate")
    } catch {
      return demoQrCodes
    }
  },
}
