// ============================================================
// SAYO Web Platform — Type Definitions
// ============================================================

// --- Portal & Navigation ---
export type PortalId =
  | "mesa-control"
  | "cumplimiento"
  | "cobranza"
  | "comercial"
  | "soporte"
  | "seguridad"
  | "marketing"
  | "ejecutivo"
  | "admin"
  | "cliente"
  | "sayo-mx";

export type UserRole =
  | "L2_OPERADOR"
  | "L2_GESTOR"
  | "L2_COMERCIAL"
  | "L2_SOPORTE"
  | "L3_BACKOFFICE"
  | "L3_PLD"
  | "L3_MARKETING"
  | "L4_SEGURIDAD"
  | "L4_ADMIN"
  | "L5_EJECUTIVO"
  | "EXT_CLIENTE";

export interface NavItem {
  label: string;
  href: string;
  icon: string; // lucide icon name
  badge?: string | number;
}

export interface PortalConfig {
  id: PortalId;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  role: UserRole;
  description: string;
  navItems: NavItem[];
}

// --- Users ---
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  portal: PortalId;
  department?: string;
  lastLogin?: string;
  status: "active" | "inactive" | "suspended";
}

// --- Dashboard ---
export interface StatCardData {
  title: string;
  value: string | number;
  change?: number; // percentage change
  changeLabel?: string;
  icon: string;
  trend?: "up" | "down" | "neutral";
  format?: "currency" | "number" | "percentage";
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface ActivityItem {
  id: string;
  type: "transaction" | "alert" | "user" | "system" | "ticket" | "report";
  title: string;
  description: string;
  timestamp: string;
  status?: "success" | "warning" | "error" | "info" | "pending";
  user?: string;
  amount?: number;
}

// --- Transactions ---
export type TransactionStatus =
  | "completada"
  | "pendiente"
  | "rechazada"
  | "en_proceso"
  | "cancelada"
  | "conciliada";

export type TransactionType = "SPEI_IN" | "SPEI_OUT" | "INTERNAL" | "DISPERSION" | "CODI";

export interface Transaction {
  id: string;
  claveRastreo: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  concept: string;
  senderName: string;
  senderBank: string;
  senderClabe: string;
  receiverName: string;
  receiverBank: string;
  receiverClabe: string;
  date: string;
  hour: string;
}

// --- PLD/Compliance ---
export type AlertSeverity = "alta" | "media" | "baja";
export type AlertStatus = "activa" | "investigando" | "descartada" | "escalada" | "resuelta";

export interface ComplianceAlert {
  id: string;
  type: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  clientName: string;
  clientId: string;
  amount?: number;
  date: string;
  assignedTo: string;
  riskScore: number;
}

export interface CNBVReport {
  id: string;
  type: "ROI" | "ROP" | "RO24H";
  status: "borrador" | "enviado" | "aceptado" | "rechazado";
  date: string;
  period: string;
  alertCount: number;
}

// --- Cobranza ---
export type MoraCategory = "0-30" | "31-60" | "61-90" | "90+";

export interface CreditAccount {
  id: string;
  clientName: string;
  clientId: string;
  productType: string;
  originalAmount: number;
  currentBalance: number;
  pastDueAmount: number;
  daysPastDue: number;
  moraCategory: MoraCategory;
  lastPaymentDate: string;
  nextPaymentDate: string;
  status: "vigente" | "vencido" | "reestructurado" | "castigado";
  assignedAgent: string;
}

export interface CollectionAction {
  id: string;
  creditId: string;
  type: "llamada" | "sms" | "email" | "visita" | "legal";
  result: "contactado" | "no_contesta" | "promesa_pago" | "negativa" | "buzon";
  date: string;
  agent: string;
  notes: string;
}

// --- Comercial ---
export type PipelineStage =
  | "prospecto"
  | "contactado"
  | "evaluacion"
  | "aprobado"
  | "dispersado"
  | "rechazado";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: "web" | "referido" | "campaña" | "orgánico" | "alianza";
  product: string;
  amount: number;
  stage: PipelineStage;
  score: number;
  assignedTo: string;
  date: string;
  notes?: string;
}

export interface Commission {
  id: string;
  executiveName: string;
  product: string;
  clientName: string;
  amount: number;
  commissionRate: number;
  commissionAmount: number;
  status: "pagada" | "pendiente" | "cancelada";
  date: string;
}

// --- Soporte ---
export type TicketPriority = "urgente" | "alta" | "media" | "baja";
export type TicketStatus = "abierto" | "en_progreso" | "esperando" | "resuelto" | "cerrado";
export type TicketChannel = "chat" | "telefono" | "email" | "app" | "sucursal";

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  channel: TicketChannel;
  clientName: string;
  clientId: string;
  assignedTo: string;
  slaDeadline: string;
  createdAt: string;
  updatedAt: string;
  category: string;
}

// --- Seguridad ---
export type IncidentSeverity = "critica" | "alta" | "media" | "baja";

export interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: "activo" | "investigando" | "contenido" | "resuelto";
  type: string;
  detectedAt: string;
  resolvedAt?: string;
  assignedTo: string;
  affectedSystems: string[];
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  ip: string;
  resource: string;
  result: "exitoso" | "fallido" | "bloqueado";
  timestamp: string;
  details?: string;
}

export interface IAMUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "activo" | "inactivo" | "bloqueado";
  lastAccess: string;
  mfaEnabled: boolean;
  activeSessions: number;
}

// --- Marketing ---
export type CampaignStatus = "activa" | "pausada" | "finalizada" | "borrador" | "programada";
export type CampaignChannel = "push" | "email" | "sms" | "in_app";

export interface Campaign {
  id: string;
  name: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  audience: number;
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  startDate: string;
  endDate?: string;
}

// --- Ejecutivo ---
export interface PnLItem {
  category: string;
  subcategory: string;
  currentMonth: number;
  previousMonth: number;
  ytd: number;
  budget: number;
  variance: number;
}

export interface KPI {
  id: string;
  name: string;
  category: string;
  actual: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "stable";
  status: "verde" | "amarillo" | "rojo";
}

// --- Admin ---
export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "activo" | "inactivo" | "suspendido";
  lastLogin: string;
  createdAt: string;
}

export interface RolePermission {
  id: string;
  name: string;
  description: string;
  permissions: Record<string, boolean>;
  userCount: number;
}

// --- Cliente ---
export interface ClientAccount {
  id: string;
  clabe: string;
  balance: number;
  accountType: string;
  status: string;
}

export interface ClientMovement {
  id: string;
  type: "ingreso" | "egreso";
  concept: string;
  amount: number;
  balance: number;
  date: string;
  reference: string;
}

// --- Data Table ---
export interface DataTableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}
