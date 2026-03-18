// ============================================================
// SAYO — Compliance PLD/FT Hooks
// ============================================================
// Wraps complianceService compliance methods with useServiceData.
// Maps snake_case service types → camelCase UI types.
// Exports PLD expanded static data (no service methods exist yet).
// ============================================================

"use client"

import { useServiceData } from "./use-service-data"
import {
  complianceService,
  type ComplianceAlert as ServiceAlert,
  type CNBVReport as ServiceCNBVReport,
} from "@/lib/compliance-service"
import type {
  ComplianceAlert,
  CNBVReport,
  StatCardData,
  PLDMonitorRule,
  PLDMonitorAlert,
  SanctionListEntry,
  EBRAssessment,
  REDECOComplaint,
  RegulatoryCalendarEvent,
} from "@/lib/types"

// --- Mappers ---

function mapAlert(a: ServiceAlert): ComplianceAlert {
  return {
    id: a.id,
    type: a.alert_type,
    description: a.description,
    severity: a.severity,
    status: a.status,
    clientName: a.client_name ?? "Desconocido",
    clientId: a.client_id ?? "",
    amount: a.amount ?? 0,
    date: a.created_at,
    assignedTo: a.assigned_to ?? "Sin asignar",
    riskScore: a.risk_score,
  }
}

function mapCNBVReportStatus(s: string): CNBVReport["status"] {
  const map: Record<string, CNBVReport["status"]> = {
    borrador: "borrador", enviado: "enviado", aceptado: "aceptado", rechazado: "rechazado",
    correccion: "borrador",
  }
  return map[s] ?? "borrador"
}

function mapCNBVReport(r: ServiceCNBVReport): CNBVReport {
  return {
    id: r.id,
    type: r.type,
    status: mapCNBVReportStatus(r.status),
    date: r.created_at,
    period: r.period,
    alertCount: r.alert_count,
  }
}

// --- Hooks ---

export function useComplianceAlerts(filters?: { status?: string; severity?: string }) {
  return useServiceData(
    async () => {
      const raw = await complianceService.getAlerts(filters)
      return raw.map(mapAlert)
    },
    [filters?.status, filters?.severity]
  )
}

export function useCNBVReports() {
  return useServiceData(
    async () => {
      const raw = await complianceService.getCNBVReports()
      return raw.map(mapCNBVReport)
    },
    []
  )
}

export function usePepChecks() {
  return useServiceData(() => complianceService.getPepChecks(), [])
}

export function useInvestigations() {
  return useServiceData(() => complianceService.getInvestigations(), [])
}

// --- Static Data ---

export const cumplimientoStats: StatCardData[] = [
  { title: "Alertas Activas", value: 12, change: 3, icon: "AlertTriangle", trend: "up" },
  { title: "Ops. Inusuales", value: 5, change: -2, icon: "Eye", trend: "down" },
  { title: "Reportes CNBV", value: 3, change: 0, icon: "FileText", trend: "neutral" },
  { title: "Score Riesgo Global", value: "72/100", icon: "Gauge", trend: "neutral" },
]

// --- PLD Expanded Static Data ---

export const pldMonitorRules: PLDMonitorRule[] = [
  { id: "RULE-001", name: "Efectivo > $50,000", description: "Operaciones en efectivo superiores a $50,000 MXN", threshold: "$50,000 MXN", type: "monto", active: true, alertsGenerated: 23 },
  { id: "RULE-002", name: "Transferencias múltiples mismo destino", description: "3+ transferencias al mismo destino en 24 horas", threshold: "3 ops/24h", type: "frecuencia", active: true, alertsGenerated: 8 },
  { id: "RULE-003", name: "Operaciones fragmentadas", description: "Múltiples operaciones que suman >$50,000 en 48h", threshold: "$50,000 / 48h", type: "patron", active: true, alertsGenerated: 5 },
  { id: "RULE-004", name: "Cambio de patrón transaccional", description: "Incremento >200% en volumen mensual", threshold: "200% incremento", type: "comportamiento", active: true, alertsGenerated: 12 },
  { id: "RULE-005", name: "País de alto riesgo", description: "Operaciones con origen/destino en países GAFI lista gris", threshold: "Lista GAFI", type: "patron", active: true, alertsGenerated: 3 },
]

export const pldMonitorAlerts: PLDMonitorAlert[] = [
  { id: "MALERT-001", ruleId: "RULE-001", ruleName: "Efectivo > $50,000", clientName: "Roberto Juárez Pinto", clientId: "CLI-005", description: "Depósito en efectivo por $85,000 MXN", triggeredAmount: 85000, threshold: "$50,000 MXN", relatedOperations: 1, severity: "alta", status: "activa", date: "2025-03-08" },
  { id: "MALERT-002", ruleId: "RULE-002", ruleName: "Transferencias múltiples", clientName: "Laura Martínez Ríos", clientId: "CLI-007", description: "5 transferencias a misma cuenta BBVA en 12 horas", triggeredAmount: 230000, threshold: "3 ops/24h", relatedOperations: 5, severity: "media", status: "investigando", date: "2025-03-07" },
  { id: "MALERT-003", ruleId: "RULE-004", ruleName: "Cambio patrón", clientName: "Grupo Industrial Azteca", clientId: "CLI-008", description: "Volumen mensual incrementó 350% respecto promedio", triggeredAmount: 4500000, threshold: "200% incremento", relatedOperations: 28, severity: "critica", status: "activa", date: "2025-03-09" },
]

export const sanctionListEntries: SanctionListEntry[] = [
  { id: "SL-001", listType: "OFAC_SDN", name: "Roberto García Mendoza", matchPercentage: 92, matchedWith: "Roberto García M.", country: "México", date: "2025-03-01", status: "pendiente" },
  { id: "SL-002", listType: "PEP_NAC", name: "Ana Torres Vega", matchPercentage: 78, matchedWith: "Ana Torres V.", country: "México", date: "2025-03-05", status: "descartado" },
  { id: "SL-003", listType: "UE", name: "Dimitri Volkov Trading", matchPercentage: 65, matchedWith: "D. Volkov Trade Corp", country: "Rusia", date: "2025-02-28", status: "confirmado" },
]

export const ebrAssessments: EBRAssessment[] = [
  { id: "EBR-001", clientName: "Carlos Méndez López", clientId: "CLI-001", clientType: "PFAE", riskLevel: "bajo", score: 25, factors: [{ factor: "País", weight: 10, value: "México", score: 5 }, { factor: "Actividad", weight: 20, value: "Comercio", score: 8 }, { factor: "Monto", weight: 30, value: "$500K", score: 6 }, { factor: "Tipo persona", weight: 20, value: "PFAE", score: 4 }, { factor: "PEP", weight: 20, value: "No", score: 2 }], lastReview: "2025-01-15", nextReview: "2025-07-15", reviewer: "Ana García" },
  { id: "EBR-002", clientName: "Grupo Industrial Azteca", clientId: "CLI-008", clientType: "PM", riskLevel: "alto", score: 72, factors: [{ factor: "País", weight: 10, value: "México", score: 5 }, { factor: "Actividad", weight: 20, value: "Industrial", score: 12 }, { factor: "Monto", weight: 30, value: "$10M", score: 25 }, { factor: "Tipo persona", weight: 20, value: "PM grande", score: 15 }, { factor: "PEP", weight: 20, value: "Sí (indirecto)", score: 15 }], lastReview: "2025-02-28", nextReview: "2025-05-28", reviewer: "Ana García" },
]

export const redecoComplaints: REDECOComplaint[] = [
  { id: "RED-001", folio: "REDECO-2025-001", type: "REDECO", clientName: "Sofía Hernández", product: "Crédito Cuenta Corriente", reason: "Cobro indebido de comisión", status: "en_atencion", slaDate: "2025-03-20", receivedDate: "2025-03-01" },
  { id: "RED-002", folio: "REDECO-2025-002", type: "REUNE", clientName: "Miguel Ángel Fuentes", product: "Transferencia SPEI", reason: "Operación no reconocida", status: "recibida", slaDate: "2025-03-25", receivedDate: "2025-03-05" },
  { id: "RED-003", folio: "REDECO-2024-018", type: "REDECO", clientName: "Ana Torres Vega", product: "Tarjeta débito", reason: "Cargo duplicado en comercio", status: "resuelta", slaDate: "2025-01-15", receivedDate: "2024-12-20", resolvedDate: "2025-01-10", resolution: "Bonificación aplicada por $3,450 MXN" },
]

export const regulatoryCalendar: RegulatoryCalendarEvent[] = [
  { id: "CAL-001", title: "Reporte mensual CNBV - Febrero", type: "reporte", entity: "CNBV", dueDate: "2025-03-10", status: "pendiente", assignedTo: "Ana García" },
  { id: "CAL-002", title: "Envío ROI trimestral", type: "reporte", entity: "CNBV", dueDate: "2025-03-31", status: "pendiente", assignedTo: "Ana García" },
  { id: "CAL-003", title: "Capacitación PLD anual", type: "capacitacion", entity: "Interno", dueDate: "2025-06-30", status: "pendiente", assignedTo: "Ana García" },
  { id: "CAL-004", title: "Auditoría externa PLD", type: "auditoria", entity: "CNBV", dueDate: "2025-09-15", status: "pendiente", assignedTo: "Ana García" },
  { id: "CAL-005", title: "Reporte mensual CNBV - Enero", type: "reporte", entity: "CNBV", dueDate: "2025-02-10", status: "completado", assignedTo: "Ana García" },
]
