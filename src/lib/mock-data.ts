import type {
  Transaction,
  ComplianceAlert,
  CNBVReport,
  CreditAccount,
  CollectionAction,
  Lead,
  Commission,
  SupportTicket,
  SecurityIncident,
  AuditLog,
  IAMUser,
  Campaign,
  PnLItem,
  KPI,
  SystemUser,
  RolePermission,
  ClientMovement,
  StatCardData,
  ChartDataPoint,
  ActivityItem,
} from "./types"

// ============================================================
// MESA DE CONTROL
// ============================================================

export const mesaControlStats: StatCardData[] = [
  { title: "Transacciones Hoy", value: 2847, change: 12.3, icon: "ArrowLeftRight", trend: "up" },
  { title: "Monto Procesado", value: 45_320_000, change: 8.1, icon: "DollarSign", trend: "up", format: "currency" },
  { title: "Pendientes", value: 23, change: -15.2, icon: "Clock", trend: "down" },
  { title: "Rechazadas", value: 7, change: -3.4, icon: "XCircle", trend: "down" },
]

export const transactionsTrend: ChartDataPoint[] = [
  { name: "Lun", value: 2340, spei_in: 1450, spei_out: 890 },
  { name: "Mar", value: 2780, spei_in: 1620, spei_out: 1160 },
  { name: "Mié", value: 2450, spei_in: 1380, spei_out: 1070 },
  { name: "Jue", value: 3100, spei_in: 1890, spei_out: 1210 },
  { name: "Vie", value: 2847, spei_in: 1700, spei_out: 1147 },
  { name: "Sáb", value: 1200, spei_in: 780, spei_out: 420 },
  { name: "Dom", value: 890, spei_in: 560, spei_out: 330 },
]

export const montoProcesadoTrend: ChartDataPoint[] = [
  { name: "Lun", value: 38500000 },
  { name: "Mar", value: 42100000 },
  { name: "Mié", value: 39800000 },
  { name: "Jue", value: 47600000 },
  { name: "Vie", value: 45320000 },
  { name: "Sáb", value: 18200000 },
  { name: "Dom", value: 12400000 },
]

export const transactions: Transaction[] = [
  { id: "TXN-001", claveRastreo: "SAYO2024030601", type: "SPEI_IN", status: "completada", amount: 125000, concept: "Pago nómina", senderName: "Empresa ABC S.A.", senderBank: "BBVA", senderClabe: "012180001234567891", receiverName: "Juan Pérez", receiverBank: "SAYO", receiverClabe: "646180001234567890", date: "2024-03-06", hour: "09:15:32" },
  { id: "TXN-002", claveRastreo: "SAYO2024030602", type: "SPEI_OUT", status: "completada", amount: 50000, concept: "Transferencia personal", senderName: "María López", senderBank: "SAYO", senderClabe: "646180009876543210", receiverName: "Carlos Ruiz", receiverBank: "Banorte", receiverClabe: "072180005678901234", date: "2024-03-06", hour: "09:23:15" },
  { id: "TXN-003", claveRastreo: "SAYO2024030603", type: "SPEI_IN", status: "pendiente", amount: 2350000, concept: "Pago proveedor", senderName: "Distribuidora XYZ", senderBank: "Santander", senderClabe: "014180003456789012", receiverName: "Tech Solutions", receiverBank: "SAYO", receiverClabe: "646180004567890123", date: "2024-03-06", hour: "09:45:00" },
  { id: "TXN-004", claveRastreo: "SAYO2024030604", type: "SPEI_OUT", status: "rechazada", amount: 15000, concept: "Pago de servicios", senderName: "Ana García", senderBank: "SAYO", senderClabe: "646180001111222233", receiverName: "CFE", receiverBank: "Banamex", receiverClabe: "002180007890123456", date: "2024-03-06", hour: "10:02:45" },
  { id: "TXN-005", claveRastreo: "SAYO2024030605", type: "DISPERSION", status: "en_proceso", amount: 890000, concept: "Dispersión nómina L3", senderName: "SAYO Nóminas", senderBank: "SAYO", senderClabe: "646180009999888877", receiverName: "Lote #45", receiverBank: "Varios", receiverClabe: "N/A", date: "2024-03-06", hour: "10:15:00" },
  { id: "TXN-006", claveRastreo: "SAYO2024030606", type: "SPEI_IN", status: "completada", amount: 75000, concept: "Cobro factura", senderName: "Consultores MN", senderBank: "HSBC", senderClabe: "021180002345678901", receiverName: "Roberto Díaz", receiverBank: "SAYO", receiverClabe: "646180005555666677", date: "2024-03-06", hour: "10:30:12" },
  { id: "TXN-007", claveRastreo: "SAYO2024030607", type: "SPEI_OUT", status: "completada", amount: 250000, concept: "Inversión", senderName: "Patricia Morales", senderBank: "SAYO", senderClabe: "646180003333444455", receiverName: "Casa de Bolsa XY", receiverBank: "Inbursa", receiverClabe: "036180008901234567", date: "2024-03-06", hour: "10:45:33" },
  { id: "TXN-008", claveRastreo: "SAYO2024030608", type: "CODI", status: "completada", amount: 1500, concept: "Pago cafetería", senderName: "Luis Torres", senderBank: "SAYO", senderClabe: "646180007777888899", receiverName: "Café Central", receiverBank: "SAYO", receiverClabe: "646180006666555544", date: "2024-03-06", hour: "11:00:00" },
  { id: "TXN-009", claveRastreo: "SAYO2024030609", type: "SPEI_IN", status: "completada", amount: 180000, concept: "Renta oficina", senderName: "Inmobiliaria del Centro", senderBank: "Scotiabank", senderClabe: "044180001234567890", receiverName: "SAYO Corp", receiverBank: "SAYO", receiverClabe: "646180001010101010", date: "2024-03-06", hour: "11:15:20" },
  { id: "TXN-010", claveRastreo: "SAYO2024030610", type: "SPEI_OUT", status: "pendiente", amount: 43000, concept: "Pago seguro", senderName: "Diana Ruiz", senderBank: "SAYO", senderClabe: "646180002020202020", receiverName: "GNP Seguros", receiverBank: "Banorte", receiverClabe: "072180009012345678", date: "2024-03-06", hour: "11:30:00" },
]

export const mesaControlActivity: ActivityItem[] = [
  { id: "A1", type: "transaction", title: "SPEI Entrante procesado", description: "$125,000 — Empresa ABC → Juan Pérez", timestamp: "2024-03-06T09:15:32", status: "success" },
  { id: "A2", type: "alert", title: "Transacción rechazada", description: "CLABE destino inválida — TXN-004", timestamp: "2024-03-06T10:02:45", status: "error" },
  { id: "A3", type: "system", title: "Dispersión nómina iniciada", description: "Lote #45 — 35 beneficiarios — $890,000", timestamp: "2024-03-06T10:15:00", status: "info" },
  { id: "A4", type: "transaction", title: "Conciliación automática", description: "142 transacciones conciliadas exitosamente", timestamp: "2024-03-06T08:00:00", status: "success" },
  { id: "A5", type: "alert", title: "Monto inusual detectado", description: "$2,350,000 — Distribuidora XYZ — Pendiente revisión", timestamp: "2024-03-06T09:45:00", status: "warning" },
]

// ============================================================
// CUMPLIMIENTO PLD/FT
// ============================================================

export const cumplimientoStats: StatCardData[] = [
  { title: "Alertas Activas", value: 12, change: 3, icon: "AlertTriangle", trend: "up" },
  { title: "Ops. Inusuales", value: 5, change: -2, icon: "Eye", trend: "down" },
  { title: "Reportes CNBV", value: 3, change: 0, icon: "FileText", trend: "neutral" },
  { title: "Score Riesgo Global", value: "72/100", icon: "Gauge", trend: "neutral" },
]

export const complianceAlerts: ComplianceAlert[] = [
  { id: "ALE-001", type: "Operación inusual", description: "Múltiples transferencias >$50K en 24h", severity: "alta", status: "activa", clientName: "Ricardo Gómez", clientId: "CLI-4521", amount: 350000, date: "2024-03-06", assignedTo: "Ana García", riskScore: 85 },
  { id: "ALE-002", type: "Structuring", description: "Depósitos fraccionados bajo umbral reportable", severity: "alta", status: "investigando", clientName: "Empresa Fantasma SA", clientId: "CLI-7832", amount: 480000, date: "2024-03-05", assignedTo: "Ana García", riskScore: 92 },
  { id: "ALE-003", type: "PEP Detected", description: "Coincidencia con lista PEPs nacionales", severity: "media", status: "activa", clientName: "Alberto Nájera", clientId: "CLI-1234", amount: 120000, date: "2024-03-06", assignedTo: "Miguel Ángeles", riskScore: 65 },
  { id: "ALE-004", type: "País de alto riesgo", description: "Transferencia desde jurisdicción GAFI", severity: "alta", status: "escalada", clientName: "Int. Trading LLC", clientId: "CLI-9012", amount: 2500000, date: "2024-03-04", assignedTo: "Ana García", riskScore: 95 },
  { id: "ALE-005", type: "Comportamiento atípico", description: "Cambio en patrón transaccional (+300%)", severity: "media", status: "activa", clientName: "Laura Méndez", clientId: "CLI-5678", amount: 95000, date: "2024-03-06", assignedTo: "Miguel Ángeles", riskScore: 58 },
]

export const cnbvReports: CNBVReport[] = [
  { id: "REP-001", type: "ROI", status: "enviado", date: "2024-03-01", period: "Feb 2024", alertCount: 8 },
  { id: "REP-002", type: "ROP", status: "borrador", date: "2024-03-05", period: "Mar 2024 (parcial)", alertCount: 3 },
  { id: "REP-003", type: "RO24H", status: "enviado", date: "2024-03-04", period: "Operación individual", alertCount: 1 },
  { id: "REP-004", type: "ROI", status: "aceptado", date: "2024-02-01", period: "Ene 2024", alertCount: 12 },
]

// ============================================================
// COBRANZA
// ============================================================

export const cobranzaStats: StatCardData[] = [
  { title: "Cartera Total", value: 185_000_000, icon: "Briefcase", format: "currency", trend: "neutral" },
  { title: "Cartera Vencida", value: 12_450_000, change: -5.2, icon: "AlertCircle", trend: "down", format: "currency" },
  { title: "Recuperación %", value: "78.5%", change: 3.2, icon: "TrendingUp", trend: "up" },
  { title: "Mora 90+", value: 2_100_000, change: -8.1, icon: "Clock", trend: "down", format: "currency" },
]

export const creditAccounts: CreditAccount[] = [
  { id: "CRD-001", clientName: "Fernando Ríos", clientId: "CLI-3001", productType: "Crédito Personal", originalAmount: 150000, currentBalance: 98000, pastDueAmount: 15000, daysPastDue: 45, moraCategory: "31-60", lastPaymentDate: "2024-01-20", nextPaymentDate: "2024-02-20", status: "vencido", assignedAgent: "Roberto López" },
  { id: "CRD-002", clientName: "Empresa Delta", clientId: "CLI-3002", productType: "Crédito Empresarial", originalAmount: 2000000, currentBalance: 1500000, pastDueAmount: 250000, daysPastDue: 95, moraCategory: "90+", lastPaymentDate: "2023-12-01", nextPaymentDate: "2024-01-01", status: "castigado", assignedAgent: "Roberto López" },
  { id: "CRD-003", clientName: "Carmen Vega", clientId: "CLI-3003", productType: "Crédito Nómina", originalAmount: 80000, currentBalance: 45000, pastDueAmount: 5000, daysPastDue: 15, moraCategory: "0-30", lastPaymentDate: "2024-02-15", nextPaymentDate: "2024-03-15", status: "vencido", assignedAgent: "Mariana Cruz" },
  { id: "CRD-004", clientName: "Tech Innovate SA", clientId: "CLI-3004", productType: "Línea de Crédito", originalAmount: 500000, currentBalance: 320000, pastDueAmount: 80000, daysPastDue: 72, moraCategory: "61-90", lastPaymentDate: "2024-01-05", nextPaymentDate: "2024-02-05", status: "vencido", assignedAgent: "Roberto López" },
]

export const collectionActions: CollectionAction[] = [
  { id: "GES-001", creditId: "CRD-001", type: "llamada", result: "promesa_pago", date: "2024-03-05", agent: "Roberto López", notes: "Cliente promete pagar $15,000 el viernes 8/mar" },
  { id: "GES-002", creditId: "CRD-002", type: "email", result: "no_contesta", date: "2024-03-04", agent: "Roberto López", notes: "Correo enviado, sin respuesta" },
  { id: "GES-003", creditId: "CRD-003", type: "sms", result: "contactado", date: "2024-03-06", agent: "Mariana Cruz", notes: "SMS recordatorio enviado, cliente confirmó lectura" },
  { id: "GES-004", creditId: "CRD-002", type: "legal", result: "contactado", date: "2024-03-03", agent: "Legal SAYO", notes: "Carta de requerimiento enviada vía notario" },
]

// ============================================================
// COMERCIAL
// ============================================================

export const comercialStats: StatCardData[] = [
  { title: "Pipeline Value", value: 25_800_000, change: 15.4, icon: "TrendingUp", trend: "up", format: "currency" },
  { title: "Leads Nuevos", value: 47, change: 22.0, icon: "UserPlus", trend: "up" },
  { title: "Conversión", value: "18.5%", change: 2.3, icon: "Target", trend: "up" },
  { title: "Comisiones Mes", value: 342_000, change: 8.7, icon: "DollarSign", trend: "up", format: "currency" },
]

export const leads: Lead[] = [
  { id: "LED-001", name: "Grupo Industrial MX", email: "contacto@gimx.com", phone: "+52 55 1234 5678", source: "web", product: "Crédito Empresarial", amount: 5000000, stage: "evaluacion", score: 82, assignedTo: "María Fernández", date: "2024-03-01" },
  { id: "LED-002", name: "Arturo Mendoza", email: "arturo.m@gmail.com", phone: "+52 33 8765 4321", source: "referido", product: "Crédito Personal", amount: 200000, stage: "contactado", score: 65, assignedTo: "María Fernández", date: "2024-03-03" },
  { id: "LED-003", name: "Logística Express SA", email: "ventas@logex.mx", phone: "+52 81 2468 1357", source: "campaña", product: "Línea de Crédito", amount: 3000000, stage: "aprobado", score: 91, assignedTo: "Carlos Vega", date: "2024-02-15" },
  { id: "LED-004", name: "Sofía Ramírez", email: "sofia.r@outlook.com", phone: "+52 55 9876 5432", source: "orgánico", product: "Cuenta SAYO", amount: 0, stage: "prospecto", score: 45, assignedTo: "María Fernández", date: "2024-03-06" },
  { id: "LED-005", name: "Restaurante El Buen Sabor", email: "admin@elbuensabor.mx", phone: "+52 55 1357 2468", source: "alianza", product: "Terminal Punto de Venta", amount: 15000, stage: "dispersado", score: 95, assignedTo: "Carlos Vega", date: "2024-02-01" },
]

export const commissions: Commission[] = [
  { id: "COM-001", executiveName: "María Fernández", product: "Crédito Empresarial", clientName: "Grupo Industrial MX", amount: 5000000, commissionRate: 0.5, commissionAmount: 25000, status: "pendiente", date: "2024-03-01" },
  { id: "COM-002", executiveName: "Carlos Vega", product: "Terminal POS", clientName: "El Buen Sabor", amount: 15000, commissionRate: 2.0, commissionAmount: 300, status: "pagada", date: "2024-02-15" },
  { id: "COM-003", executiveName: "Carlos Vega", product: "Línea de Crédito", clientName: "Logística Express", amount: 3000000, commissionRate: 0.3, commissionAmount: 9000, status: "pagada", date: "2024-02-20" },
  { id: "COM-004", executiveName: "María Fernández", product: "Crédito Personal", clientName: "Arturo Mendoza", amount: 200000, commissionRate: 1.0, commissionAmount: 2000, status: "pendiente", date: "2024-03-05" },
]

// ============================================================
// SOPORTE
// ============================================================

export const soporteStats: StatCardData[] = [
  { title: "Tickets Abiertos", value: 23, change: -12, icon: "Ticket", trend: "down" },
  { title: "SLA Cumplido", value: "94.2%", change: 1.8, icon: "Clock", trend: "up" },
  { title: "Satisfacción", value: "4.6/5", change: 0.2, icon: "Star", trend: "up" },
  { title: "Tiempo Resp. Prom.", value: "12 min", change: -3, icon: "Zap", trend: "down" },
]

export const supportTickets: SupportTicket[] = [
  { id: "TKT-001", subject: "No puedo transferir", description: "Error al intentar SPEI", priority: "alta", status: "en_progreso", channel: "chat", clientName: "Juan Pérez", clientId: "CLI-1001", assignedTo: "Luis Torres", slaDeadline: "2024-03-06T18:00:00", createdAt: "2024-03-06T09:00:00", updatedAt: "2024-03-06T09:30:00", category: "Transferencias" },
  { id: "TKT-002", subject: "Cobro duplicado", description: "Me cobraron dos veces la mensualidad", priority: "urgente", status: "abierto", channel: "telefono", clientName: "Ana Torres", clientId: "CLI-1002", assignedTo: "Luis Torres", slaDeadline: "2024-03-06T14:00:00", createdAt: "2024-03-06T10:00:00", updatedAt: "2024-03-06T10:00:00", category: "Cobros" },
  { id: "TKT-003", subject: "Actualizar RFC", description: "Necesito actualizar mi RFC en el sistema", priority: "baja", status: "esperando", channel: "email", clientName: "Carlos Díaz", clientId: "CLI-1003", assignedTo: "Mariana Soto", slaDeadline: "2024-03-08T18:00:00", createdAt: "2024-03-05T14:00:00", updatedAt: "2024-03-06T08:00:00", category: "Datos personales" },
  { id: "TKT-004", subject: "App no abre", description: "La app se cierra al iniciar sesión", priority: "media", status: "resuelto", channel: "app", clientName: "Sofía Hernández", clientId: "CLI-1004", assignedTo: "Luis Torres", slaDeadline: "2024-03-07T18:00:00", createdAt: "2024-03-04T16:00:00", updatedAt: "2024-03-05T10:00:00", category: "App Móvil" },
]

// ============================================================
// SEGURIDAD
// ============================================================

export const seguridadStats: StatCardData[] = [
  { title: "Incidentes Activos", value: 2, change: -1, icon: "AlertOctagon", trend: "down" },
  { title: "Login Fallidos (24h)", value: 145, change: 23, icon: "ShieldOff", trend: "up" },
  { title: "Vulnerabilidades", value: 3, icon: "Bug", trend: "neutral" },
  { title: "Uptime", value: "99.97%", change: 0.02, icon: "Activity", trend: "up" },
]

export const securityIncidents: SecurityIncident[] = [
  { id: "INC-001", title: "Intento de fuerza bruta", description: "145 intentos fallidos desde IP 192.168.1.50 en 1 hora", severity: "alta", status: "contenido", type: "Brute Force", detectedAt: "2024-03-06T08:30:00", assignedTo: "Diana Ruiz", affectedSystems: ["Auth Service", "API Gateway"] },
  { id: "INC-002", title: "Certificado SSL próximo a expirar", description: "api.sayo.mx certificado expira en 7 días", severity: "media", status: "activo", type: "Certificate", detectedAt: "2024-03-05T10:00:00", assignedTo: "Equipo IT", affectedSystems: ["API Gateway"] },
]

export const auditLogs: AuditLog[] = [
  { id: "LOG-001", action: "LOGIN_SUCCESS", user: "carlos.mendoza@sayo.mx", ip: "10.0.1.25", resource: "Portal Mesa Control", result: "exitoso", timestamp: "2024-03-06T09:00:00" },
  { id: "LOG-002", action: "TRANSFER_APPROVED", user: "ana.garcia@sayo.mx", ip: "10.0.1.30", resource: "TXN-003", result: "exitoso", timestamp: "2024-03-06T09:50:00" },
  { id: "LOG-003", action: "LOGIN_FAILED", user: "unknown@hacker.com", ip: "192.168.1.50", resource: "Portal Admin", result: "bloqueado", timestamp: "2024-03-06T08:35:00" },
  { id: "LOG-004", action: "USER_CREATED", user: "jorge.ramirez@sayo.mx", ip: "10.0.1.40", resource: "USR-2045", result: "exitoso", timestamp: "2024-03-06T10:15:00" },
  { id: "LOG-005", action: "REPORT_EXPORTED", user: "patricia.morales@sayo.mx", ip: "10.0.1.15", resource: "Reporte P&L Febrero", result: "exitoso", timestamp: "2024-03-06T11:00:00" },
]

export const iamUsers: IAMUser[] = [
  { id: "USR-001", name: "Carlos Mendoza", email: "carlos.mendoza@sayo.mx", role: "L2 Operador", department: "Operaciones", status: "activo", lastAccess: "2024-03-06T09:00:00", mfaEnabled: true, activeSessions: 1 },
  { id: "USR-002", name: "Ana García", email: "ana.garcia@sayo.mx", role: "L3 Oficial PLD", department: "Cumplimiento", status: "activo", lastAccess: "2024-03-06T08:45:00", mfaEnabled: true, activeSessions: 1 },
  { id: "USR-003", name: "Jorge Ramírez", email: "jorge.ramirez@sayo.mx", role: "L4 Admin", department: "TI", status: "activo", lastAccess: "2024-03-06T10:00:00", mfaEnabled: true, activeSessions: 2 },
  { id: "USR-004", name: "Ex Empleado", email: "exempleado@sayo.mx", role: "L2 Soporte", department: "Soporte", status: "inactivo", lastAccess: "2024-01-15T16:00:00", mfaEnabled: false, activeSessions: 0 },
]

// ============================================================
// MARKETING
// ============================================================

export const marketingStats: StatCardData[] = [
  { title: "Campañas Activas", value: 5, icon: "Rocket", trend: "neutral" },
  { title: "Tasa Apertura", value: "32.4%", change: 4.1, icon: "Mail", trend: "up" },
  { title: "Conversión", value: "8.7%", change: 1.2, icon: "Target", trend: "up" },
  { title: "Usuarios Alcanzados", value: 45200, change: 18.5, icon: "Users", trend: "up" },
]

export const campaigns: Campaign[] = [
  { id: "CMP-001", name: "Bienvenida Q1 2024", channel: "email", status: "activa", audience: 12000, sent: 11800, opened: 3820, clicked: 1230, converted: 245, startDate: "2024-01-15", endDate: "2024-03-31" },
  { id: "CMP-002", name: "Crédito Express Push", channel: "push", status: "activa", audience: 25000, sent: 24500, opened: 8575, clicked: 2940, converted: 412, startDate: "2024-02-01" },
  { id: "CMP-003", name: "Recordatorio pago SMS", channel: "sms", status: "activa", audience: 8200, sent: 8200, opened: 7790, clicked: 0, converted: 3284, startDate: "2024-03-01" },
  { id: "CMP-004", name: "Marketplace Launch", channel: "in_app", status: "programada", audience: 50000, sent: 0, opened: 0, clicked: 0, converted: 0, startDate: "2024-03-15" },
  { id: "CMP-005", name: "Black Friday 2023", channel: "email", status: "finalizada", audience: 35000, sent: 34800, opened: 14616, clicked: 5568, converted: 1392, startDate: "2023-11-20", endDate: "2023-11-30" },
]

// ============================================================
// EJECUTIVO
// ============================================================

export const ejecutivoStats: StatCardData[] = [
  { title: "Ingresos Netos", value: 12_450_000, change: 14.2, icon: "TrendingUp", trend: "up", format: "currency" },
  { title: "AUM", value: 2_340_000_000, change: 8.7, icon: "Landmark", trend: "up", format: "currency" },
  { title: "Usuarios Activos", value: 48500, change: 22.1, icon: "Users", trend: "up" },
  { title: "NPS", value: 72, change: 5, icon: "Heart", trend: "up" },
]

export const revenuetrend: ChartDataPoint[] = [
  { name: "Oct", value: 9200000, gastos: 7100000 },
  { name: "Nov", value: 10500000, gastos: 7800000 },
  { name: "Dic", value: 11800000, gastos: 8200000 },
  { name: "Ene", value: 10900000, gastos: 7500000 },
  { name: "Feb", value: 11200000, gastos: 7900000 },
  { name: "Mar", value: 12450000, gastos: 8100000 },
]

export const pnlItems: PnLItem[] = [
  { category: "Ingresos", subcategory: "Intereses por créditos", currentMonth: 6200000, previousMonth: 5800000, ytd: 18200000, budget: 6000000, variance: 3.3 },
  { category: "Ingresos", subcategory: "Comisiones SPEI", currentMonth: 3100000, previousMonth: 2900000, ytd: 8800000, budget: 3000000, variance: 3.3 },
  { category: "Ingresos", subcategory: "Comisiones tarjeta", currentMonth: 1800000, previousMonth: 1650000, ytd: 5100000, budget: 1700000, variance: 5.9 },
  { category: "Ingresos", subcategory: "Otros ingresos", currentMonth: 1350000, previousMonth: 1200000, ytd: 3800000, budget: 1300000, variance: 3.8 },
  { category: "Gastos", subcategory: "Nómina", currentMonth: 4200000, previousMonth: 4200000, ytd: 12600000, budget: 4200000, variance: 0 },
  { category: "Gastos", subcategory: "Tecnología", currentMonth: 1500000, previousMonth: 1400000, ytd: 4200000, budget: 1600000, variance: -6.3 },
  { category: "Gastos", subcategory: "Regulatorio", currentMonth: 800000, previousMonth: 750000, ytd: 2300000, budget: 850000, variance: -5.9 },
  { category: "Gastos", subcategory: "Marketing", currentMonth: 600000, previousMonth: 550000, ytd: 1700000, budget: 700000, variance: -14.3 },
  { category: "Gastos", subcategory: "Operaciones", currentMonth: 1000000, previousMonth: 980000, ytd: 2900000, budget: 1050000, variance: -4.8 },
]

export const kpis: KPI[] = [
  { id: "KPI-001", name: "Crecimiento de usuarios", category: "Crecimiento", actual: 22.1, target: 20, unit: "%", trend: "up", status: "verde" },
  { id: "KPI-002", name: "Retención 30 días", category: "Crecimiento", actual: 85.3, target: 90, unit: "%", trend: "stable", status: "amarillo" },
  { id: "KPI-003", name: "CAC", category: "Financiero", actual: 450, target: 500, unit: "MXN", trend: "down", status: "verde" },
  { id: "KPI-004", name: "ARPU", category: "Financiero", actual: 285, target: 300, unit: "MXN", trend: "up", status: "amarillo" },
  { id: "KPI-005", name: "Índice de mora", category: "Riesgo", actual: 6.7, target: 5, unit: "%", trend: "down", status: "rojo" },
  { id: "KPI-006", name: "Uptime plataforma", category: "Operaciones", actual: 99.97, target: 99.9, unit: "%", trend: "stable", status: "verde" },
  { id: "KPI-007", name: "NPS", category: "Satisfacción", actual: 72, target: 70, unit: "pts", trend: "up", status: "verde" },
  { id: "KPI-008", name: "Tiempo resolución tickets", category: "Satisfacción", actual: 4.2, target: 4, unit: "hrs", trend: "down", status: "amarillo" },
]

// ============================================================
// ADMIN
// ============================================================

export const adminStats: StatCardData[] = [
  { title: "Usuarios Totales", value: 48500, change: 22.1, icon: "Users", trend: "up" },
  { title: "Usuarios Internos", value: 45, icon: "UserCog", trend: "neutral" },
  { title: "Productos Activos", value: 6, icon: "Package", trend: "neutral" },
  { title: "Integraciones", value: 12, icon: "Plug", trend: "neutral" },
]

export const systemUsers: SystemUser[] = [
  { id: "USR-001", name: "Carlos Mendoza", email: "carlos.mendoza@sayo.mx", role: "L2 Operador", department: "Operaciones", status: "activo", lastLogin: "2024-03-06T09:00:00", createdAt: "2023-06-15" },
  { id: "USR-002", name: "Ana García", email: "ana.garcia@sayo.mx", role: "L3 Oficial PLD", department: "Cumplimiento", status: "activo", lastLogin: "2024-03-06T08:45:00", createdAt: "2023-04-01" },
  { id: "USR-003", name: "Roberto López", email: "roberto.lopez@sayo.mx", role: "L2 Gestor Cobranza", department: "Cobranza", status: "activo", lastLogin: "2024-03-05T17:30:00", createdAt: "2023-07-20" },
  { id: "USR-004", name: "María Fernández", email: "maria.fernandez@sayo.mx", role: "L2 Ejecutivo Comercial", department: "Comercial", status: "activo", lastLogin: "2024-03-06T10:15:00", createdAt: "2023-05-10" },
  { id: "USR-005", name: "Diana Ruiz", email: "diana.ruiz@sayo.mx", role: "L4 Seguridad IT", department: "TI", status: "activo", lastLogin: "2024-03-06T07:30:00", createdAt: "2023-03-01" },
  { id: "USR-006", name: "Ex Empleado", email: "ex.empleado@sayo.mx", role: "L2 Soporte", department: "Soporte", status: "suspendido", lastLogin: "2024-01-15T16:00:00", createdAt: "2023-08-01" },
]

export const rolePermissions: RolePermission[] = [
  { id: "ROL-001", name: "L2 Operador", description: "Operaciones SPEI y conciliación", permissions: { dashboard: true, spei: true, dispersiones: true, conciliacion: true, cuentas: false, reportes: false }, userCount: 8 },
  { id: "ROL-002", name: "L3 Back-Office", description: "Supervisión operativa completa", permissions: { dashboard: true, spei: true, dispersiones: true, conciliacion: true, cuentas: true, reportes: true }, userCount: 3 },
  { id: "ROL-003", name: "L3 Oficial PLD", description: "Cumplimiento y reportes regulatorios", permissions: { dashboard: true, alertas: true, reportes_cnbv: true, peps: true, investigaciones: true }, userCount: 2 },
  { id: "ROL-004", name: "L4 Admin", description: "Administración completa del sistema", permissions: { dashboard: true, usuarios: true, roles: true, catalogos: true, config: true }, userCount: 2 },
  { id: "ROL-005", name: "L5 Ejecutivo", description: "Acceso ejecutivo: P&L, KPIs, board", permissions: { dashboard: true, pnl: true, kpis: true, board: true }, userCount: 3 },
]

// ============================================================
// CLIENTE
// ============================================================

export const clienteStats: StatCardData[] = [
  { title: "Saldo Disponible", value: 47_250.80, icon: "Wallet", format: "currency", trend: "neutral" },
  { title: "Ingresos Mes", value: 35_000, change: 5.2, icon: "ArrowDownLeft", trend: "up", format: "currency" },
  { title: "Gastos Mes", value: 22_340, change: -3.1, icon: "ArrowUpRight", trend: "down", format: "currency" },
  { title: "Puntos SAYO", value: "1,250 pts", icon: "Star", trend: "up" },
]

export const clientMovements: ClientMovement[] = [
  { id: "MOV-001", type: "ingreso", concept: "Nómina quincenal", amount: 17500, balance: 47250.80, date: "2024-03-01T12:00:00", reference: "NOM-2024-005" },
  { id: "MOV-002", type: "egreso", concept: "Transferencia a Carlos", amount: 5000, balance: 42250.80, date: "2024-03-02T14:30:00", reference: "SPEI-OUT-001" },
  { id: "MOV-003", type: "egreso", concept: "Pago CFE", amount: 1200, balance: 41050.80, date: "2024-03-03T10:00:00", reference: "PAG-CFE-001" },
  { id: "MOV-004", type: "egreso", concept: "Amazon MX", amount: 2340, balance: 38710.80, date: "2024-03-04T16:45:00", reference: "TDC-AMZ-001" },
  { id: "MOV-005", type: "ingreso", concept: "Transferencia recibida", amount: 8500, balance: 47210.80, date: "2024-03-05T09:15:00", reference: "SPEI-IN-001" },
  { id: "MOV-006", type: "egreso", concept: "Uber", amount: 185, balance: 47025.80, date: "2024-03-06T08:30:00", reference: "TDC-UBR-001" },
  { id: "MOV-007", type: "egreso", concept: "Starbucks", amount: 125, balance: 46900.80, date: "2024-03-06T09:00:00", reference: "TDC-SBX-001" },
  { id: "MOV-008", type: "ingreso", concept: "Devolución", amount: 350, balance: 47250.80, date: "2024-03-06T10:00:00", reference: "DEV-001" },
]

// ============================================================
// SHARED CHART DATA
// ============================================================

export const monthlyTrend6M: ChartDataPoint[] = [
  { name: "Oct", value: 38200 },
  { name: "Nov", value: 41500 },
  { name: "Dic", value: 44800 },
  { name: "Ene", value: 43200 },
  { name: "Feb", value: 46100 },
  { name: "Mar", value: 48500 },
]

export const productDistribution: ChartDataPoint[] = [
  { name: "Cuenta SAYO", value: 28500 },
  { name: "Crédito Personal", value: 8200 },
  { name: "Crédito Nómina", value: 5400 },
  { name: "Crédito Empresarial", value: 2100 },
  { name: "Tarjeta", value: 4300 },
]

export const channelDistribution: ChartDataPoint[] = [
  { name: "Chat", value: 42 },
  { name: "Teléfono", value: 28 },
  { name: "Email", value: 18 },
  { name: "App", value: 8 },
  { name: "Sucursal", value: 4 },
]
