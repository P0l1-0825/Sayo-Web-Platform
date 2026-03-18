import { api } from "./api-client"

// ============================================================
// SAYO — Compliance PLD/FT, Security & Audit Service
// Now calls backend API (sayo-platform) instead of Supabase directly.
// Demo mode is handled server-side.
// ============================================================

export interface ComplianceAlert {
  id: string
  transaction_id: string | null
  user_id: string | null
  alert_type: string
  description: string
  severity: "critica" | "alta" | "media" | "baja"
  status: "activa" | "investigando" | "descartada" | "escalada" | "resuelta"
  client_name: string | null
  client_id: string | null
  amount: number | null
  risk_score: number
  assigned_to: string | null
  resolution_notes: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
}

export interface CNBVReport {
  id: string
  type: "ROI" | "ROP" | "RO24H"
  status: "borrador" | "enviado" | "aceptado" | "rechazado" | "correccion"
  period: string
  alert_count: number
  total_amount: number | null
  submitted_at: string | null
  cnbv_response: string | null
  created_at: string
}

export interface PepCheck {
  id: string
  user_id: string | null
  check_name: string
  lists_checked: string[]
  match_found: boolean
  match_score: number | null
  match_details: Record<string, unknown> | null
  created_at: string
}

export interface Investigation {
  id: string
  alert_ids: string[]
  title: string
  description: string | null
  status: "abierta" | "en_progreso" | "pendiente_info" | "cerrada_positiva" | "cerrada_negativa"
  assigned_to: string | null
  findings: string | null
  resolution: string | null
  closed_at: string | null
  created_at: string
}

export interface SecurityIncident {
  id: string
  title: string
  description: string
  severity: "critica" | "alta" | "media" | "baja"
  status: "detectado" | "investigando" | "contenido" | "resuelto" | "cerrado"
  incident_type: string
  affected_systems: string[]
  detected_at: string
  resolved_at: string | null
  assigned_to: string | null
  root_cause: string | null
  corrective_actions: string | null
  created_at: string
}

export interface AuditLog {
  id: string
  user_id: string | null
  user_name?: string
  action: string
  resource_type: string
  resource_id: string | null
  ip_address: string | null
  user_agent: string | null
  result: "exitoso" | "fallido" | "bloqueado"
  details: Record<string, unknown> | null
  created_at: string
}

// --- Service (API-backed) ---

function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined)
  if (entries.length === 0) return ""
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&")
}

export const complianceService = {
  // Alerts
  async getAlerts(filters?: { status?: string; severity?: string }): Promise<ComplianceAlert[]> {
    return api.get<ComplianceAlert[]>(`/api/v1/compliance/alerts${buildQuery({ status: filters?.status, severity: filters?.severity })}`)
  },

  async updateAlertStatus(id: string, status: string, notes?: string): Promise<void> {
    await api.patch<void>(`/api/v1/compliance/alerts/${id}/status`, { status, resolution_notes: notes })
  },

  // CNBV Reports
  async getCNBVReports(): Promise<CNBVReport[]> {
    return api.get<CNBVReport[]>("/api/v1/compliance/cnbv-reports")
  },

  // PEP Checks
  async getPepChecks(): Promise<PepCheck[]> {
    return api.get<PepCheck[]>("/api/v1/compliance/pep-checks")
  },

  async runPepCheck(name: string): Promise<PepCheck> {
    return api.post<PepCheck>("/api/v1/compliance/pep-checks", { check_name: name })
  },

  // Investigations
  async getInvestigations(): Promise<Investigation[]> {
    return api.get<Investigation[]>("/api/v1/compliance/investigations")
  },

  // Security Incidents
  async getSecurityIncidents(): Promise<SecurityIncident[]> {
    return api.get<SecurityIncident[]>("/api/v1/compliance/security-incidents")
  },

  // Audit Logs
  async getAuditLogs(limit = 50): Promise<AuditLog[]> {
    return api.get<AuditLog[]>(`/api/v1/compliance/audit-logs${buildQuery({ limit })}`)
  },

  // IAM Users
  async getIAMUsers(): Promise<Array<{ id: string; name: string; email: string; role: string; department: string; status: string; last_access: string; mfa_enabled: boolean; active_sessions: number }>> {
    return api.get("/api/v1/compliance/iam-users")
  },

  // Dashboard stats
  async getComplianceStats(): Promise<{
    alertasActivas: number
    alertasCriticas: number
    investigacionesAbiertas: number
    reportesPendientes: number
    riskScoreGlobal: number
  }> {
    return api.get("/api/v1/compliance/stats")
  },

  async getSecurityStats(): Promise<{
    incidentesActivos: number
    incidentesCriticos: number
    loginsFallidos: number
    uptimePercent: number
    usuariosActivos: number
    sesionesActivas: number
  }> {
    return api.get("/api/v1/compliance/security-stats")
  },
}
