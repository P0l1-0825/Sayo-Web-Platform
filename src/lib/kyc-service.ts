import { api, isDemoMode } from "./api-client"

// ============================================================
// SAYO — KYC & Verification Service
// Now calls backend API (sayo-platform) instead of Supabase directly.
// When isDemoMode is true, returns inline demo data without network calls.
// ============================================================

export interface KycVerification {
  id: string
  user_id: string
  level: number
  full_name_verified: boolean
  email_verified: boolean
  phone_verified: boolean
  ine_front_url: string | null
  ine_back_url: string | null
  selfie_url: string | null
  curp_verified: boolean
  rfc: string | null
  rfc_verified: boolean
  proof_of_address_url: string | null
  address_verified: boolean
  liveness_check: boolean
  biometric_score: number | null
  jaak_verification_id: string | null
  jaak_status: "pending" | "processing" | "approved" | "rejected" | "manual_review"
  status: "pending" | "in_progress" | "verified" | "rejected" | "expired"
  rejection_reason: string | null
  verified_at: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface KycDocument {
  id: string
  user_id: string
  kyc_id: string | null
  document_type: string
  file_url: string
  file_name: string | null
  file_size: number | null
  mime_type: string | null
  status: "pending" | "approved" | "rejected"
  rejection_reason: string | null
  reviewed_at: string | null
  created_at: string
}

// --- Demo Data ---

const demoVerifications: KycVerification[] = [
  { id: "kyc-001", user_id: "demo-user", level: 3, full_name_verified: true, email_verified: true, phone_verified: true, ine_front_url: "/mock/ine-front.jpg", ine_back_url: "/mock/ine-back.jpg", selfie_url: "/mock/selfie.jpg", curp_verified: true, rfc: "PEJJ850315XX1", rfc_verified: true, proof_of_address_url: "/mock/proof-address.pdf", address_verified: true, liveness_check: true, biometric_score: 95, jaak_verification_id: "jaak-001", jaak_status: "approved", status: "verified", rejection_reason: null, verified_at: "2024-01-20", expires_at: "2025-01-20", created_at: "2024-01-15", updated_at: "2024-01-20" },
  { id: "kyc-002", user_id: "user-002", level: 2, full_name_verified: true, email_verified: true, phone_verified: true, ine_front_url: "/mock/ine-front-2.jpg", ine_back_url: "/mock/ine-back-2.jpg", selfie_url: "/mock/selfie-2.jpg", curp_verified: true, rfc: null, rfc_verified: false, proof_of_address_url: null, address_verified: false, liveness_check: true, biometric_score: 88, jaak_verification_id: "jaak-002", jaak_status: "approved", status: "in_progress", rejection_reason: null, verified_at: null, expires_at: null, created_at: "2024-02-10", updated_at: "2024-03-01" },
  { id: "kyc-003", user_id: "user-003", level: 1, full_name_verified: true, email_verified: true, phone_verified: false, ine_front_url: null, ine_back_url: null, selfie_url: null, curp_verified: false, rfc: null, rfc_verified: false, proof_of_address_url: null, address_verified: false, liveness_check: false, biometric_score: null, jaak_verification_id: null, jaak_status: "pending", status: "pending", rejection_reason: null, verified_at: null, expires_at: null, created_at: "2024-03-05", updated_at: "2024-03-05" },
  { id: "kyc-004", user_id: "user-004", level: 2, full_name_verified: true, email_verified: true, phone_verified: true, ine_front_url: "/mock/ine-front-4.jpg", ine_back_url: "/mock/ine-back-4.jpg", selfie_url: "/mock/selfie-4.jpg", curp_verified: true, rfc: "VEGS900720XX2", rfc_verified: true, proof_of_address_url: "/mock/proof-4.pdf", address_verified: false, liveness_check: false, biometric_score: 42, jaak_verification_id: "jaak-004", jaak_status: "rejected", status: "rejected", rejection_reason: "Liveness check failed - possible spoofing detected", verified_at: null, expires_at: null, created_at: "2024-02-20", updated_at: "2024-03-02" },
]

const demoDocuments: KycDocument[] = [
  { id: "doc-001", user_id: "demo-user", kyc_id: "kyc-001", document_type: "INE Frente", file_url: "/mock/ine-front.jpg", file_name: "ine_frente.jpg", file_size: 245000, mime_type: "image/jpeg", status: "approved", rejection_reason: null, reviewed_at: "2024-01-18", created_at: "2024-01-15" },
  { id: "doc-002", user_id: "demo-user", kyc_id: "kyc-001", document_type: "INE Reverso", file_url: "/mock/ine-back.jpg", file_name: "ine_reverso.jpg", file_size: 230000, mime_type: "image/jpeg", status: "approved", rejection_reason: null, reviewed_at: "2024-01-18", created_at: "2024-01-15" },
  { id: "doc-003", user_id: "demo-user", kyc_id: "kyc-001", document_type: "Selfie", file_url: "/mock/selfie.jpg", file_name: "selfie.jpg", file_size: 180000, mime_type: "image/jpeg", status: "approved", rejection_reason: null, reviewed_at: "2024-01-19", created_at: "2024-01-15" },
  { id: "doc-004", user_id: "demo-user", kyc_id: "kyc-001", document_type: "Comprobante de domicilio", file_url: "/mock/proof-address.pdf", file_name: "recibo_cfe.pdf", file_size: 520000, mime_type: "application/pdf", status: "approved", rejection_reason: null, reviewed_at: "2024-01-20", created_at: "2024-01-16" },
  { id: "doc-005", user_id: "user-004", kyc_id: "kyc-004", document_type: "Selfie", file_url: "/mock/selfie-4.jpg", file_name: "selfie.jpg", file_size: 195000, mime_type: "image/jpeg", status: "rejected", rejection_reason: "Imagen borrosa, no se puede verificar identidad", reviewed_at: "2024-03-02", created_at: "2024-02-20" },
]

// --- Service (API-backed with demo fallback) ---

function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined)
  if (entries.length === 0) return ""
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&")
}

export const kycService = {
  async getVerifications(): Promise<KycVerification[]> {
    if (isDemoMode) return demoVerifications
    return api.get<KycVerification[]>("/api/v1/kyc/verifications")
  },

  async getVerification(id: string): Promise<KycVerification | null> {
    if (isDemoMode) return demoVerifications.find(v => v.id === id) ?? null
    return api.get<KycVerification | null>(`/api/v1/kyc/verifications/${id}`)
  },

  async getUserVerification(userId: string): Promise<KycVerification | null> {
    if (isDemoMode) return demoVerifications.find(v => v.user_id === userId) ?? null
    return api.get<KycVerification | null>(`/api/v1/kyc/verifications/user/${userId}`)
  },

  async getDocuments(userId: string): Promise<KycDocument[]> {
    if (isDemoMode) return demoDocuments.filter(d => d.user_id === userId || userId === "demo-user")
    return api.get<KycDocument[]>(`/api/v1/kyc/documents${buildQuery({ userId })}`)
  },

  async updateVerificationStatus(id: string, status: string, rejectionReason?: string): Promise<void> {
    if (isDemoMode) return
    await api.patch<void>(`/api/v1/kyc/verifications/${id}/status`, { status, rejection_reason: rejectionReason })
  },

  async approveDocument(docId: string, reviewerId: string): Promise<void> {
    if (isDemoMode) return
    await api.post<void>(`/api/v1/kyc/documents/${docId}/approve`, { reviewerId })
  },

  async rejectDocument(docId: string, reviewerId: string, reason: string): Promise<void> {
    if (isDemoMode) return
    await api.post<void>(`/api/v1/kyc/documents/${docId}/reject`, { reviewerId, reason })
  },

  // Stats for dashboards
  async getStats(): Promise<{
    total: number
    verified: number
    pending: number
    rejected: number
    avgBiometricScore: number
  }> {
    if (isDemoMode) return { total: 4, verified: 1, pending: 2, rejected: 1, avgBiometricScore: 75 }
    return api.get("/api/v1/kyc/stats")
  },
}
