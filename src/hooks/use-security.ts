// ============================================================
// SAYO — Security Hooks
// ============================================================
// Wraps complianceService security methods with useServiceData.
// Maps snake_case service types → camelCase UI types.
// ============================================================

"use client"

import { useServiceData } from "./use-service-data"
import {
  complianceService,
  type SecurityIncident as ServiceSecurityIncident,
  type AuditLog as ServiceAuditLog,
} from "@/lib/compliance-service"
import type {
  SecurityIncident,
  AuditLog,
  IAMUser,
  StatCardData,
} from "@/lib/types"

// --- Mappers ---

function mapIncidentStatus(s: string): SecurityIncident["status"] {
  const map: Record<string, SecurityIncident["status"]> = {
    activo: "activo", investigando: "investigando", contenido: "contenido", resuelto: "resuelto",
    detectado: "activo", cerrado: "resuelto",
  }
  return map[s] ?? "activo"
}

function mapSecurityIncident(s: ServiceSecurityIncident): SecurityIncident {
  return {
    id: s.id,
    title: s.title,
    description: s.description,
    severity: s.severity,
    status: mapIncidentStatus(s.status),
    type: s.incident_type,
    detectedAt: s.detected_at,
    resolvedAt: s.resolved_at ?? undefined,
    assignedTo: s.assigned_to ?? "Sin asignar",
    affectedSystems: s.affected_systems,
  }
}

function mapAuditLog(l: ServiceAuditLog): AuditLog {
  return {
    id: l.id,
    action: l.action,
    user: l.user_name ?? l.user_id ?? "Sistema",
    ip: l.ip_address ?? "N/A",
    resource: l.resource_type + (l.resource_id ? ` (${l.resource_id})` : ""),
    result: l.result,
    timestamp: l.created_at,
  }
}

function mapIAMUser(u: {
  id: string
  name: string
  email: string
  role: string
  department: string
  status: string
  last_access: string
  mfa_enabled: boolean
  active_sessions: number
}): IAMUser {
  const validStatus = (s: string): IAMUser["status"] => {
    const map: Record<string, IAMUser["status"]> = { activo: "activo", inactivo: "inactivo", bloqueado: "bloqueado" }
    return map[s] ?? "activo"
  }
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    department: u.department,
    status: validStatus(u.status),
    lastAccess: u.last_access,
    mfaEnabled: u.mfa_enabled,
    activeSessions: u.active_sessions,
  }
}

// --- Hooks ---

export function useSecurityIncidents() {
  return useServiceData(
    async () => {
      const raw = await complianceService.getSecurityIncidents()
      return raw.map(mapSecurityIncident)
    },
    []
  )
}

export function useAuditLogs(limit = 50) {
  return useServiceData(
    async () => {
      const raw = await complianceService.getAuditLogs(limit)
      return raw.map(mapAuditLog)
    },
    [limit]
  )
}

export function useIAMUsers() {
  return useServiceData(
    async () => {
      const raw = await complianceService.getIAMUsers()
      return raw.map(mapIAMUser)
    },
    []
  )
}

// --- Static Data ---

export const seguridadStats: StatCardData[] = [
  { title: "Incidentes Activos", value: 2, change: -1, icon: "AlertOctagon", trend: "down" },
  { title: "Login Fallidos (24h)", value: 145, change: 23, icon: "ShieldOff", trend: "up" },
  { title: "Vulnerabilidades", value: 3, icon: "Bug", trend: "neutral" },
  { title: "Uptime", value: "99.97%", change: 0.02, icon: "Activity", trend: "up" },
]
