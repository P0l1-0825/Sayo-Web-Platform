import { api, isDemoMode } from "./api-client"

// ============================================================
// SAYO — Compliance PLD/FT, Security & Audit Service
// Now calls backend API (sayo-platform) instead of Supabase directly.
// When isDemoMode is true, returns inline demo data without network calls.
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

// --- Demo Data ---

const demoAlerts: ComplianceAlert[] = [
  { id: "ale-001", transaction_id: "txn-003", user_id: "user-045", alert_type: "Operación inusual", description: "Múltiples transferencias >$50K en 24h", severity: "alta", status: "activa", client_name: "Ricardo Gómez", client_id: "CLI-4521", amount: 350000, risk_score: 85, assigned_to: "Ana García", resolution_notes: null, resolved_at: null, created_at: "2024-03-06", updated_at: "2024-03-06" },
  { id: "ale-002", transaction_id: null, user_id: "user-078", alert_type: "Structuring", description: "Depósitos fraccionados bajo umbral reportable", severity: "alta", status: "investigando", client_name: "Empresa Fantasma SA", client_id: "CLI-7832", amount: 480000, risk_score: 92, assigned_to: "Ana García", resolution_notes: null, resolved_at: null, created_at: "2024-03-05", updated_at: "2024-03-06" },
  { id: "ale-003", transaction_id: null, user_id: "user-012", alert_type: "PEP Detected", description: "Coincidencia con lista PEPs nacionales", severity: "media", status: "activa", client_name: "Alberto Nájera", client_id: "CLI-1234", amount: 120000, risk_score: 65, assigned_to: "Miguel Ángeles", resolution_notes: null, resolved_at: null, created_at: "2024-03-06", updated_at: "2024-03-06" },
  { id: "ale-004", transaction_id: "txn-ext-001", user_id: null, alert_type: "País de alto riesgo", description: "Transferencia desde jurisdicción GAFI", severity: "critica", status: "escalada", client_name: "Int. Trading LLC", client_id: "CLI-9012", amount: 2500000, risk_score: 95, assigned_to: "Ana García", resolution_notes: null, resolved_at: null, created_at: "2024-03-04", updated_at: "2024-03-05" },
  { id: "ale-005", transaction_id: null, user_id: "user-056", alert_type: "Comportamiento atípico", description: "Cambio en patrón transaccional (+300%)", severity: "media", status: "activa", client_name: "Laura Méndez", client_id: "CLI-5678", amount: 95000, risk_score: 58, assigned_to: "Miguel Ángeles", resolution_notes: null, resolved_at: null, created_at: "2024-03-06", updated_at: "2024-03-06" },
]

const demoCNBVReports: CNBVReport[] = [
  { id: "rep-001", type: "ROI", status: "enviado", period: "Feb 2024", alert_count: 8, total_amount: 3500000, submitted_at: "2024-03-01", cnbv_response: null, created_at: "2024-02-28" },
  { id: "rep-002", type: "ROP", status: "borrador", period: "Mar 2024 (parcial)", alert_count: 3, total_amount: 1200000, submitted_at: null, cnbv_response: null, created_at: "2024-03-05" },
  { id: "rep-003", type: "RO24H", status: "enviado", period: "Operación individual", alert_count: 1, total_amount: 2500000, submitted_at: "2024-03-04", cnbv_response: null, created_at: "2024-03-04" },
  { id: "rep-004", type: "ROI", status: "aceptado", period: "Ene 2024", alert_count: 12, total_amount: 8900000, submitted_at: "2024-02-01", cnbv_response: "Aceptado sin observaciones", created_at: "2024-01-31" },
]

const demoPepChecks: PepCheck[] = [
  { id: "pep-001", user_id: "user-012", check_name: "Alberto Nájera Ruiz", lists_checked: ["PEP_NAC", "OFAC_SDN", "ONU"], match_found: true, match_score: 87, match_details: { list: "PEP_NAC", position: "Ex-Director CONAGUA" }, created_at: "2024-03-06" },
  { id: "pep-002", user_id: "user-034", check_name: "María López Torres", lists_checked: ["PEP_NAC", "OFAC_SDN", "ONU", "UE"], match_found: false, match_score: null, match_details: null, created_at: "2024-03-05" },
  { id: "pep-003", user_id: null, check_name: "Int. Trading LLC", lists_checked: ["OFAC_SDN", "ONU", "UE", "INTERPOL"], match_found: true, match_score: 92, match_details: { list: "OFAC_SDN", reason: "Sanctions evasion" }, created_at: "2024-03-04" },
]

const demoInvestigations: Investigation[] = [
  { id: "inv-001", alert_ids: ["ale-001", "ale-002"], title: "Investigación depósitos estructurados CLI-7832", description: "Patrón de depósitos bajo $50K para evadir reporte", status: "en_progreso", assigned_to: "Ana García", findings: "Se detectaron 12 depósitos en ventanilla por $49,500 en 3 días", resolution: null, closed_at: null, created_at: "2024-03-05" },
  { id: "inv-002", alert_ids: ["ale-004"], title: "Transferencia internacional sospechosa", description: "Wire transfer desde jurisdicción GAFI sin justificación", status: "abierta", assigned_to: "Ana García", findings: null, resolution: null, closed_at: null, created_at: "2024-03-04" },
]

const demoSecurityIncidents: SecurityIncident[] = [
  { id: "inc-001", title: "Intento de fuerza bruta", description: "145 intentos fallidos desde IP 192.168.1.50 en 1 hora", severity: "alta", status: "contenido", incident_type: "Brute Force", affected_systems: ["Auth Service", "API Gateway"], detected_at: "2024-03-06T08:30:00", resolved_at: null, assigned_to: "Diana Ruiz", root_cause: "Bot automatizado", corrective_actions: "IP bloqueada, rate limiting ajustado", created_at: "2024-03-06T08:30:00" },
  { id: "inc-002", title: "Certificado SSL próximo a expirar", description: "api.sayo.mx certificado expira en 7 días", severity: "media", status: "detectado", incident_type: "Certificate", affected_systems: ["API Gateway"], detected_at: "2024-03-05T10:00:00", resolved_at: null, assigned_to: "Equipo IT", root_cause: null, corrective_actions: null, created_at: "2024-03-05T10:00:00" },
]

const demoAuditLogs: AuditLog[] = [
  { id: "log-001", user_id: "usr-001", user_name: "Carlos Mendoza", action: "LOGIN_SUCCESS", resource_type: "session", resource_id: "ses-001", ip_address: "10.0.1.25", user_agent: "Mozilla/5.0", result: "exitoso", details: null, created_at: "2024-03-06T09:00:00" },
  { id: "log-002", user_id: "usr-002", user_name: "Ana García", action: "TRANSFER_APPROVED", resource_type: "transaction", resource_id: "txn-003", ip_address: "10.0.1.30", user_agent: "Mozilla/5.0", result: "exitoso", details: null, created_at: "2024-03-06T09:50:00" },
  { id: "log-003", user_id: null, user_name: "unknown@hacker.com", action: "LOGIN_FAILED", resource_type: "session", resource_id: null, ip_address: "192.168.1.50", user_agent: "curl/7.68.0", result: "bloqueado", details: { reason: "IP blocked" }, created_at: "2024-03-06T08:35:00" },
  { id: "log-004", user_id: "usr-003", user_name: "Jorge Ramírez", action: "USER_CREATED", resource_type: "user", resource_id: "usr-2045", ip_address: "10.0.1.40", user_agent: "Mozilla/5.0", result: "exitoso", details: null, created_at: "2024-03-06T10:15:00" },
  { id: "log-005", user_id: "usr-005", user_name: "Patricia Morales", action: "REPORT_EXPORTED", resource_type: "report", resource_id: "rep-pnl-feb", ip_address: "10.0.1.15", user_agent: "Mozilla/5.0", result: "exitoso", details: null, created_at: "2024-03-06T11:00:00" },
]

const demoIAMUsers = [
  { id: "usr-001", name: "Carlos Mendoza", email: "carlos.mendoza@sayo.mx", role: "L2 Operador", department: "Operaciones", status: "activo", last_access: "2024-03-06T09:00:00", mfa_enabled: true, active_sessions: 1 },
  { id: "usr-002", name: "Ana García", email: "ana.garcia@sayo.mx", role: "L3 Oficial PLD", department: "Cumplimiento", status: "activo", last_access: "2024-03-06T08:45:00", mfa_enabled: true, active_sessions: 1 },
  { id: "usr-003", name: "Jorge Ramírez", email: "jorge.ramirez@sayo.mx", role: "L4 Admin", department: "TI", status: "activo", last_access: "2024-03-06T10:00:00", mfa_enabled: true, active_sessions: 2 },
  { id: "usr-004", name: "Ex Empleado", email: "exempleado@sayo.mx", role: "L2 Soporte", department: "Soporte", status: "inactivo", last_access: "2024-01-15T16:00:00", mfa_enabled: false, active_sessions: 0 },
]

// --- Service (API-backed with demo fallback) ---

function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined)
  if (entries.length === 0) return ""
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&")
}

export const complianceService = {
  // Alerts
  async getAlerts(filters?: { status?: string; severity?: string }): Promise<ComplianceAlert[]> {
    if (isDemoMode) {
      let result = demoAlerts
      if (filters?.status) result = result.filter(a => a.status === filters.status)
      if (filters?.severity) result = result.filter(a => a.severity === filters.severity)
      return result
    }
    return api.get<ComplianceAlert[]>(`/api/v1/compliance/alerts${buildQuery({ status: filters?.status, severity: filters?.severity })}`)
  },

  async updateAlertStatus(id: string, status: string, notes?: string): Promise<void> {
    if (isDemoMode) return
    await api.patch<void>(`/api/v1/compliance/alerts/${id}/status`, { status, resolution_notes: notes })
  },

  // CNBV Reports
  async getCNBVReports(): Promise<CNBVReport[]> {
    if (isDemoMode) return demoCNBVReports
    return api.get<CNBVReport[]>("/api/v1/compliance/cnbv-reports")
  },

  // PEP Checks
  async getPepChecks(): Promise<PepCheck[]> {
    if (isDemoMode) return demoPepChecks
    return api.get<PepCheck[]>("/api/v1/compliance/pep-checks")
  },

  async runPepCheck(name: string): Promise<PepCheck> {
    if (isDemoMode) return { id: `pep-${Date.now()}`, user_id: null, check_name: name, lists_checked: ["PEP_NAC", "OFAC_SDN", "ONU"], match_found: false, match_score: null, match_details: null, created_at: new Date().toISOString() }
    return api.post<PepCheck>("/api/v1/compliance/pep-checks", { check_name: name })
  },

  // Investigations
  async getInvestigations(): Promise<Investigation[]> {
    if (isDemoMode) return demoInvestigations
    return api.get<Investigation[]>("/api/v1/compliance/investigations")
  },

  // Security Incidents
  async getSecurityIncidents(): Promise<SecurityIncident[]> {
    if (isDemoMode) return demoSecurityIncidents
    return api.get<SecurityIncident[]>("/api/v1/compliance/security-incidents")
  },

  // Audit Logs
  async getAuditLogs(limit = 50): Promise<AuditLog[]> {
    if (isDemoMode) return demoAuditLogs.slice(0, limit)
    return api.get<AuditLog[]>(`/api/v1/compliance/audit-logs${buildQuery({ limit })}`)
  },

  // IAM Users
  async getIAMUsers(): Promise<Array<{ id: string; name: string; email: string; role: string; department: string; status: string; last_access: string; mfa_enabled: boolean; active_sessions: number }>> {
    if (isDemoMode) return demoIAMUsers
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
    if (isDemoMode) return { alertasActivas: 12, alertasCriticas: 2, investigacionesAbiertas: 2, reportesPendientes: 1, riskScoreGlobal: 72 }
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
    if (isDemoMode) return { incidentesActivos: 2, incidentesCriticos: 0, loginsFallidos: 145, uptimePercent: 99.97, usuariosActivos: 3, sesionesActivas: 4 }
    return api.get("/api/v1/compliance/security-stats")
  },
}
