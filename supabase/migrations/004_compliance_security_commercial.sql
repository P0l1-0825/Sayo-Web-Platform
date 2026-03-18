-- ============================================================
-- SAYO — Phase 5-7: Compliance, Security, Commercial, Support,
--                    Marketing, Executive, Admin
-- ============================================================

-- ============================================
-- 1. COMPLIANCE — PLD/FT Alerts
-- ============================================
CREATE TABLE IF NOT EXISTS compliance_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id),
  user_id UUID REFERENCES profiles(id),

  alert_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(10) NOT NULL CHECK (severity IN ('critica','alta','media','baja')),
  status VARCHAR(20) NOT NULL DEFAULT 'activa'
    CHECK (status IN ('activa','investigando','descartada','escalada','resuelta')),

  client_name VARCHAR(120),
  client_id VARCHAR(50),
  amount NUMERIC(18,2),
  risk_score INT CHECK (risk_score BETWEEN 0 AND 100),

  assigned_to UUID REFERENCES profiles(id),
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_compliance_alerts_status ON compliance_alerts(status);
CREATE INDEX idx_compliance_alerts_severity ON compliance_alerts(severity);

-- ============================================
-- 2. COMPLIANCE — CNBV Reports
-- ============================================
CREATE TABLE IF NOT EXISTS cnbv_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(10) NOT NULL CHECK (type IN ('ROI','ROP','RO24H')),
  status VARCHAR(20) NOT NULL DEFAULT 'borrador'
    CHECK (status IN ('borrador','enviado','aceptado','rechazado','correccion')),
  period VARCHAR(50) NOT NULL,
  alert_count INT NOT NULL DEFAULT 0,
  total_amount NUMERIC(18,2),
  report_data JSONB,
  submitted_by UUID REFERENCES profiles(id),
  submitted_at TIMESTAMPTZ,
  cnbv_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 3. COMPLIANCE — PEP/Sanctions Checks
-- ============================================
CREATE TABLE IF NOT EXISTS pep_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  check_name VARCHAR(120) NOT NULL,
  lists_checked TEXT[] NOT NULL DEFAULT '{}',
  match_found BOOLEAN NOT NULL DEFAULT false,
  match_score NUMERIC(5,2),
  match_details JSONB,
  checked_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 4. COMPLIANCE — Investigations
-- ============================================
CREATE TABLE IF NOT EXISTS investigations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_ids UUID[] NOT NULL DEFAULT '{}',
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'abierta'
    CHECK (status IN ('abierta','en_progreso','pendiente_info','cerrada_positiva','cerrada_negativa')),
  assigned_to UUID REFERENCES profiles(id),
  findings TEXT,
  documents JSONB DEFAULT '[]',
  timeline JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 5. SECURITY — Incidents
-- ============================================
CREATE TABLE IF NOT EXISTS security_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(10) NOT NULL CHECK (severity IN ('critica','alta','media','baja')),
  status VARCHAR(20) NOT NULL DEFAULT 'activo'
    CHECK (status IN ('activo','investigando','contenido','resuelto')),
  incident_type VARCHAR(50) NOT NULL,
  affected_systems TEXT[] DEFAULT '{}',
  assigned_to UUID REFERENCES profiles(id),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  contained_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  corrective_actions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 6. COMMERCIAL — Leads / Pipeline
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(120),
  phone VARCHAR(20),
  company VARCHAR(120),
  source VARCHAR(30) NOT NULL DEFAULT 'web'
    CHECK (source IN ('web','referido','campaña','organico','alianza','llamada')),
  product VARCHAR(30),
  amount NUMERIC(18,2),
  stage VARCHAR(30) NOT NULL DEFAULT 'prospecto'
    CHECK (stage IN ('prospecto','contactado','evaluacion','aprobado','dispersado','rechazado','perdido')),
  score INT CHECK (score BETWEEN 0 AND 100),
  assigned_to UUID REFERENCES profiles(id),
  notes TEXT,
  next_follow_up DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_stage ON leads(stage);
CREATE INDEX idx_leads_assigned ON leads(assigned_to);

-- ============================================
-- 7. COMMERCIAL — Commissions
-- ============================================
CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  executive_id UUID NOT NULL REFERENCES profiles(id),
  credit_id UUID REFERENCES credits(id),
  lead_id UUID REFERENCES leads(id),
  product VARCHAR(50) NOT NULL,
  client_name VARCHAR(120) NOT NULL,
  disbursed_amount NUMERIC(18,2) NOT NULL,
  commission_rate NUMERIC(5,2) NOT NULL,
  commission_amount NUMERIC(18,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pendiente'
    CHECK (status IN ('pendiente','aprobada','pagada','cancelada')),
  paid_at TIMESTAMPTZ,
  period VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_commissions_exec ON commissions(executive_id);

-- ============================================
-- 8. SUPPORT — Tickets
-- ============================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  subject VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  priority VARCHAR(10) NOT NULL DEFAULT 'media'
    CHECK (priority IN ('urgente','alta','media','baja')),
  status VARCHAR(20) NOT NULL DEFAULT 'abierto'
    CHECK (status IN ('abierto','en_progreso','esperando','resuelto','cerrado')),
  channel VARCHAR(20) NOT NULL DEFAULT 'app'
    CHECK (channel IN ('chat','telefono','email','app','sucursal','redes')),
  assigned_to UUID REFERENCES profiles(id),
  sla_deadline TIMESTAMPTZ,
  resolution TEXT,
  satisfaction_score INT CHECK (satisfaction_score BETWEEN 1 AND 5),
  is_une BOOLEAN NOT NULL DEFAULT false,
  condusef_folio VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tickets_status ON support_tickets(status);
CREATE INDEX idx_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX idx_tickets_une ON support_tickets(is_une) WHERE is_une = true;

-- ============================================
-- 9. SUPPORT — Ticket Messages
-- ============================================
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('user','agent','system')),
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 10. SUPPORT — Knowledge Base
-- ============================================
CREATE TABLE IF NOT EXISTS knowledge_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT false,
  view_count INT NOT NULL DEFAULT 0,
  helpful_count INT NOT NULL DEFAULT 0,
  author_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 11. MARKETING — Campaigns
-- ============================================
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('push','email','sms','in_app')),
  status VARCHAR(20) NOT NULL DEFAULT 'borrador'
    CHECK (status IN ('borrador','programada','activa','pausada','finalizada','cancelada')),
  audience_filter JSONB DEFAULT '{}',
  audience_count INT NOT NULL DEFAULT 0,
  sent_count INT NOT NULL DEFAULT 0,
  opened_count INT NOT NULL DEFAULT 0,
  clicked_count INT NOT NULL DEFAULT 0,
  converted_count INT NOT NULL DEFAULT 0,
  template_id UUID,
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 12. MARKETING — Notification Templates
-- ============================================
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('push','email','sms','in_app')),
  subject VARCHAR(200),
  body TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 13. EXECUTIVE — KPIs
-- ============================================
CREATE TABLE IF NOT EXISTS kpi_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  actual NUMERIC(18,2) NOT NULL,
  target NUMERIC(18,2) NOT NULL,
  unit VARCHAR(20) NOT NULL DEFAULT 'number',
  period VARCHAR(20) NOT NULL,
  period_date DATE NOT NULL,
  trend VARCHAR(10) CHECK (trend IN ('up','down','stable')),
  status VARCHAR(10) CHECK (status IN ('verde','amarillo','rojo')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kpi_period ON kpi_records(period_date);

-- ============================================
-- 14. ADMIN — System Catalogs
-- ============================================
CREATE TABLE IF NOT EXISTS catalogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_type VARCHAR(50) NOT NULL,
  code VARCHAR(30) NOT NULL,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  parent_code VARCHAR(30),
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(catalog_type, code)
);

CREATE INDEX idx_catalogs_type ON catalogs(catalog_type);

-- ============================================
-- 15. RLS for all new tables
-- ============================================

ALTER TABLE compliance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cnbv_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE pep_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogs ENABLE ROW LEVEL SECURITY;

-- Compliance: PLD officers + admins
CREATE POLICY compliance_alerts_policy ON compliance_alerts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('L3_PLD','L4_ADMIN','L5_EJECUTIVO'))
  );

CREATE POLICY cnbv_reports_policy ON cnbv_reports
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('L3_PLD','L4_ADMIN','L5_EJECUTIVO'))
  );

CREATE POLICY pep_checks_policy ON pep_checks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('L3_PLD','L4_ADMIN'))
  );

CREATE POLICY investigations_policy ON investigations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('L3_PLD','L4_ADMIN','L5_EJECUTIVO'))
  );

-- Security: security team + admins
CREATE POLICY security_incidents_policy ON security_incidents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('L4_SEGURIDAD','L4_ADMIN','L5_EJECUTIVO'))
  );

-- Commercial: sales team + managers
CREATE POLICY leads_policy ON leads
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('L2_COMERCIAL','L3_BACKOFFICE','L4_ADMIN','L5_EJECUTIVO'))
  );

CREATE POLICY commissions_policy ON commissions
  FOR SELECT USING (
    executive_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('L3_BACKOFFICE','L4_ADMIN','L5_EJECUTIVO'))
  );

-- Support: agents + users (own tickets)
CREATE POLICY tickets_policy ON support_tickets
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('L2_SOPORTE','L3_BACKOFFICE','L4_ADMIN','L5_EJECUTIVO'))
  );

CREATE POLICY ticket_messages_policy ON ticket_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM support_tickets t
      WHERE t.id = ticket_messages.ticket_id
      AND (t.user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('L2_SOPORTE','L3_BACKOFFICE','L4_ADMIN')))
    )
  );

-- Knowledge base: published articles are public
CREATE POLICY knowledge_read ON knowledge_articles
  FOR SELECT USING (
    is_published = true
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('L2_SOPORTE','L4_ADMIN'))
  );

-- Marketing: marketing team
CREATE POLICY campaigns_policy ON campaigns
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('L3_MARKETING','L4_ADMIN','L5_EJECUTIVO'))
  );

CREATE POLICY templates_policy ON notification_templates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('L3_MARKETING','L4_ADMIN'))
  );

-- KPIs: executives + admins
CREATE POLICY kpi_policy ON kpi_records
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('L5_EJECUTIVO','L4_ADMIN'))
  );

-- Catalogs: admin only for write, everyone can read
CREATE POLICY catalogs_read ON catalogs FOR SELECT USING (true);
CREATE POLICY catalogs_write ON catalogs FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('L4_ADMIN'))
);

-- ============================================
-- 16. TRIGGERS for updated_at
-- ============================================

CREATE TRIGGER set_updated_at_compliance_alerts BEFORE UPDATE ON compliance_alerts FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at_cnbv_reports BEFORE UPDATE ON cnbv_reports FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at_investigations BEFORE UPDATE ON investigations FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at_security_incidents BEFORE UPDATE ON security_incidents FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at_leads BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at_tickets BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at_knowledge BEFORE UPDATE ON knowledge_articles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at_campaigns BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at_templates BEFORE UPDATE ON notification_templates FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- 17. SEED DATA — Catalogs
-- ============================================
INSERT INTO catalogs (catalog_type, code, name, sort_order) VALUES
  -- Banks
  ('banco', '002', 'Banamex', 1),
  ('banco', '012', 'BBVA México', 2),
  ('banco', '014', 'Santander', 3),
  ('banco', '021', 'HSBC', 4),
  ('banco', '036', 'Inbursa', 5),
  ('banco', '044', 'Scotiabank', 6),
  ('banco', '058', 'Banregio', 7),
  ('banco', '072', 'Banorte', 8),
  ('banco', '646', 'SAYO (STP)', 9),
  -- Rejection reasons
  ('motivo_rechazo', 'CLABE_INV', 'CLABE inválida', 1),
  ('motivo_rechazo', 'SALDO_INS', 'Saldo insuficiente', 2),
  ('motivo_rechazo', 'CUENTA_BLQ', 'Cuenta bloqueada', 3),
  ('motivo_rechazo', 'MONTO_MAX', 'Excede monto máximo', 4),
  ('motivo_rechazo', 'DOC_INCOMP', 'Documentación incompleta', 5),
  ('motivo_rechazo', 'RIESGO', 'Nivel de riesgo alto', 6),
  -- States (Mexico)
  ('estado', 'AGU', 'Aguascalientes', 1),
  ('estado', 'BCN', 'Baja California', 2),
  ('estado', 'BCS', 'Baja California Sur', 3),
  ('estado', 'CAM', 'Campeche', 4),
  ('estado', 'CHP', 'Chiapas', 5),
  ('estado', 'CHH', 'Chihuahua', 6),
  ('estado', 'CMX', 'Ciudad de México', 7),
  ('estado', 'COA', 'Coahuila', 8),
  ('estado', 'COL', 'Colima', 9),
  ('estado', 'DUR', 'Durango', 10),
  ('estado', 'GUA', 'Guanajuato', 11),
  ('estado', 'GRO', 'Guerrero', 12),
  ('estado', 'HID', 'Hidalgo', 13),
  ('estado', 'JAL', 'Jalisco', 14),
  ('estado', 'MEX', 'Estado de México', 15),
  ('estado', 'MIC', 'Michoacán', 16),
  ('estado', 'MOR', 'Morelos', 17),
  ('estado', 'NAY', 'Nayarit', 18),
  ('estado', 'NLE', 'Nuevo León', 19),
  ('estado', 'OAX', 'Oaxaca', 20),
  ('estado', 'PUE', 'Puebla', 21),
  ('estado', 'QUE', 'Querétaro', 22),
  ('estado', 'ROO', 'Quintana Roo', 23),
  ('estado', 'SLP', 'San Luis Potosí', 24),
  ('estado', 'SIN', 'Sinaloa', 25),
  ('estado', 'SON', 'Sonora', 26),
  ('estado', 'TAB', 'Tabasco', 27),
  ('estado', 'TAM', 'Tamaulipas', 28),
  ('estado', 'TLA', 'Tlaxcala', 29),
  ('estado', 'VER', 'Veracruz', 30),
  ('estado', 'YUC', 'Yucatán', 31),
  ('estado', 'ZAC', 'Zacatecas', 32),
  -- Currencies
  ('moneda', 'MXN', 'Peso Mexicano', 1),
  ('moneda', 'USD', 'Dólar Estadounidense', 2),
  ('moneda', 'EUR', 'Euro', 3)
ON CONFLICT (catalog_type, code) DO NOTHING;
