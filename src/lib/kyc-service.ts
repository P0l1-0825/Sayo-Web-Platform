import { api } from "./api-client"

// ============================================================
// SAYO — KYC & Verification Service
// Now calls backend API (sayo-platform) instead of Supabase directly.
// Demo mode is handled server-side.
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

// --- Service (API-backed) ---

function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined)
  if (entries.length === 0) return ""
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&")
}

export const kycService = {
  async getVerifications(): Promise<KycVerification[]> {
    return api.get<KycVerification[]>("/api/v1/kyc/verifications")
  },

  async getVerification(id: string): Promise<KycVerification | null> {
    return api.get<KycVerification | null>(`/api/v1/kyc/verifications/${id}`)
  },

  async getUserVerification(userId: string): Promise<KycVerification | null> {
    return api.get<KycVerification | null>(`/api/v1/kyc/verifications/user/${userId}`)
  },

  async getDocuments(userId: string): Promise<KycDocument[]> {
    return api.get<KycDocument[]>(`/api/v1/kyc/documents${buildQuery({ userId })}`)
  },

  async updateVerificationStatus(id: string, status: string, rejectionReason?: string): Promise<void> {
    await api.patch<void>(`/api/v1/kyc/verifications/${id}/status`, { status, rejection_reason: rejectionReason })
  },

  async approveDocument(docId: string, reviewerId: string): Promise<void> {
    await api.post<void>(`/api/v1/kyc/documents/${docId}/approve`, { reviewerId })
  },

  async rejectDocument(docId: string, reviewerId: string, reason: string): Promise<void> {
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
    return api.get("/api/v1/kyc/stats")
  },
}
