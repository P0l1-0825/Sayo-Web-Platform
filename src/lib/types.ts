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
  | "sayo-mx"
  | "originacion"
  | "tesoreria";

export type UserRole =
  | "L2_OPERADOR"
  | "L2_GESTOR"
  | "L2_COMERCIAL"
  | "L2_SOPORTE"
  | "L3_BACKOFFICE"
  | "L3_PLD"
  | "L3_MARKETING"
  | "L3_ORIGINACION"
  | "L3_TESORERIA"
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
export type AlertSeverity = "critica" | "alta" | "media" | "baja";
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
  nextAction?: string;
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

// ============================================================
// ORIGINACIÓN DE CRÉDITOS
// ============================================================

export type CreditApplicationStatus =
  | "capturada"
  | "por_aprobar"
  | "en_comite"
  | "por_disponer"
  | "activa"
  | "saldada"
  | "rechazada"
  | "cancelada"
  | "reactivada";

export type ClientType = "PFAE" | "PM";

export interface CreditApplication {
  id: string;
  folio: string;
  clientName: string;
  clientId: string;
  clientType: ClientType;
  product: string;
  amount: number;
  term: number; // months
  rate: number; // annual %
  status: CreditApplicationStatus;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  bureauScore?: number;
  validations?: Record<string, boolean>;
  notes?: string;
}

export interface CreditSimulation {
  id: string;
  product: string;
  amount: number;
  rate: number;
  term: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  cat: number; // Costo Anual Total %
  amortization: AmortizationRow[];
  createdAt: string;
}

export interface AmortizationRow {
  period: number;
  initialBalance: number;
  capital: number;
  interest: number;
  iva: number;
  totalPayment: number;
  finalBalance: number;
}

export interface ClientPFAE {
  id: string;
  // Identificación
  firstName: string;
  lastName: string;
  motherLastName: string;
  rfc: string;
  curp: string;
  birthDate: string;
  nationality: string;
  civilStatus: string;
  idType: "INE" | "pasaporte" | "cédula";
  idNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  // Empleo
  occupation: string;
  company: string;
  position: string;
  seniority: number; // years
  contractType: string;
  companyAddress: string;
  // Ingresos
  monthlyIncome: number;
  otherIncome: number;
  monthlyExpenses: number;
  totalAssets: number;
  totalLiabilities: number;
  // PLD
  resourceOrigin: string;
  isPEP: boolean;
  pepRelation?: string;
  fundCountry: string;
  creditPurpose: string;
}

export interface ClientPM {
  id: string;
  // Empresa
  legalName: string;
  rfc: string;
  businessObject: string;
  sector: string;
  industry: string;
  fiscalAddress: string;
  incorporationDate: string;
  // Notarial
  deedNumber: string;
  notary: string;
  notaryNumber: string;
  deedDate: string;
  // Representante Legal
  repLegalName: string;
  repLegalRFC: string;
  repLegalCURP: string;
  powerOfAttorney: string;
  // Operaciones
  mainActivity: string;
  annualSales: number;
  employees: number;
  mainClients: string;
  mainSuppliers: string;
  // Beneficiario Real
  beneficialOwner: string;
  beneficialOwnerRFC: string;
  ownershipPercentage: number;
  // PLD
  resourceOrigin: string;
  isPEP: boolean;
  fundCountry: string;
  creditPurpose: string;
}

export interface CreditLine {
  id: string;
  creditNumber: string;
  clientName: string;
  clientId: string;
  product: string;
  limit: number;
  available: number;
  used: number;
  rate: number;
  expirationDate: string;
  status: "activa" | "suspendida" | "vencida" | "cancelada";
  startDate: string;
}

export interface CommitteeDecision {
  id: string;
  applicationId: string;
  clientName: string;
  amount: number;
  date: string;
  members: { name: string; vote: "aprobar" | "rechazar" | "condicionar"; comment?: string }[];
  decision: "aprobada" | "rechazada" | "condicionada";
  conditions?: string;
  minutes?: string;
}

export interface Disposition {
  id: string;
  creditLineId: string;
  clientName: string;
  amount: number;
  destinationAccount: string;
  date: string;
  folio: string;
  status: "por_autorizar" | "autorizada" | "dispersada" | "cancelada";
  authorizedBy?: string;
}

// ============================================================
// TESORERÍA
// ============================================================

export type TreasuryPaymentType = "individual" | "empresa" | "referenciado" | "dispersion" | "spei_in" | "spei_out";
export type TreasuryPaymentStatus = "pendiente" | "autorizado" | "procesado" | "rechazado" | "cancelado" | "completado" | "en_proceso";

export interface TreasuryPayment {
  id: string;
  folio: string;
  type: TreasuryPaymentType;
  beneficiaryName: string;
  beneficiaryBank: string;
  beneficiaryClabe: string;
  amount: number;
  concept: string;
  reference: string;
  sourceAccount: string;
  status: TreasuryPaymentStatus;
  requestedBy: string;
  authorizedBy?: string;
  date: string;
  processedAt?: string;
  speiTracking?: string;
}

export interface PaymentBatch {
  id: string;
  name: string;
  type: "nomina" | "dispersiones" | "proveedores" | "custom";
  totalRecords: number;
  totalAmount: number;
  successCount: number;
  errorCount: number;
  status: "pendiente" | "procesando" | "completado" | "parcial" | "fallido" | "procesado" | "error";
  uploadedBy: string;
  createdBy?: string;
  date: string;
  processedAt?: string;
}

export interface PaymentAuthorization {
  id: string;
  paymentId: string;
  paymentFolio: string;
  beneficiaryName: string;
  amount: number;
  requestedBy: string;
  requiredLevel: "L3" | "L4";
  status: "pendiente" | "autorizado" | "rechazado";
  authorizedBy?: string;
  rejectionReason?: string;
  date: string;
}

// ============================================================
// PLD/COMPLIANCE EXPANDIDO
// ============================================================

export interface PLDMonitorRule {
  id: string;
  name: string;
  description: string;
  threshold: string;
  type: "monto" | "frecuencia" | "patron" | "comportamiento";
  active: boolean;
  alertsGenerated: number;
}

export interface PLDMonitorAlert {
  id: string;
  ruleId: string;
  ruleName: string;
  clientName: string;
  clientId: string;
  description: string;
  triggeredAmount: number;
  threshold: string;
  relatedOperations: number;
  severity: AlertSeverity;
  status: AlertStatus;
  date: string;
}

export interface SanctionListEntry {
  id: string;
  listType: "OFAC_SDN" | "UE" | "ONU" | "PEP_NAC" | "INTERPOL";
  name: string;
  matchPercentage: number;
  matchedWith: string;
  country: string;
  date: string;
  status: "pendiente" | "confirmado" | "descartado";
}

export interface EBRAssessment {
  id: string;
  clientName: string;
  clientId: string;
  clientType: ClientType;
  riskLevel: "bajo" | "medio" | "alto" | "prohibido";
  score: number;
  factors: { factor: string; weight: number; value: string; score: number }[];
  lastReview: string;
  nextReview: string;
  reviewer: string;
}

export interface REDECOComplaint {
  id: string;
  folio: string;
  type: "REDECO" | "REUNE";
  clientName: string;
  product: string;
  reason: string;
  status: "recibida" | "en_atencion" | "resuelta" | "no_favorable";
  slaDate: string;
  receivedDate: string;
  resolvedDate?: string;
  resolution?: string;
}

export interface RegulatoryCalendarEvent {
  id: string;
  title: string;
  type: "reporte" | "auditoria" | "capacitacion" | "entrega";
  entity: "CNBV" | "CONDUSEF" | "SAT" | "BANXICO" | "Interno";
  dueDate: string;
  status: "pendiente" | "completado" | "vencido";
  assignedTo: string;
  notes?: string;
}

// ============================================================
// ADMIN EXPANDIDO
// ============================================================

export interface CatalogItem {
  id: string;
  catalogType: string;
  key: string;
  name: string;
  description?: string;
  active: boolean;
  order: number;
}

export interface ParameterConfig {
  id: string;
  category: "general" | "credito" | "pld" | "tesoreria" | "notificaciones";
  key: string;
  value: string;
  type: "string" | "number" | "boolean" | "json";
  description: string;
  lastModified: string;
  modifiedBy: string;
}

export interface NotificationTemplate {
  id: string;
  event: string;
  channel: "email" | "sms" | "push";
  subject: string;
  body: string;
  variables: string[];
  active: boolean;
  lastEdited: string;
}

// ============================================================
// MESA DE CONTROL EXPANDIDO
// ============================================================

export interface PortfolioClosing {
  id: string;
  date: string;
  type: "diario" | "mensual";
  vigente: number;
  preventiva: number;
  vencida: number;
  castigada: number;
  total: number;
  status: "generado" | "validado" | "publicado";
  generatedBy: string;
}

export type SubstitutionType = "saldo_capital" | "saldo_liquidar" | "saldo_total" | "credito_nuevo";

export interface ClientSubstitution {
  id: string;
  folio: string;
  originalCreditId: string;
  originalClientName: string;
  newClientName: string;
  substitutionType: SubstitutionType;
  amount: number;
  date: string;
  status: "pendiente" | "aprobada" | "procesada" | "rechazada";
  processedBy?: string;
}
