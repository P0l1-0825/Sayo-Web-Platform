-- ============================================================
-- SAYO — Phase 3 & 4: KYC, Credits, Payments, Collections
-- ============================================================

-- ============================================
-- 1. KYC VERIFICATION
-- ============================================
CREATE TABLE IF NOT EXISTS kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  level INT NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 3),

  -- Level 1: Basic (name, email, phone)
  full_name_verified BOOLEAN NOT NULL DEFAULT false,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  phone_verified BOOLEAN NOT NULL DEFAULT false,

  -- Level 2: Identity (INE, selfie, CURP/RFC)
  ine_front_url TEXT,
  ine_back_url TEXT,
  selfie_url TEXT,
  curp_verified BOOLEAN NOT NULL DEFAULT false,
  rfc VARCHAR(13),
  rfc_verified BOOLEAN NOT NULL DEFAULT false,

  -- Level 3: Address + advanced
  proof_of_address_url TEXT,
  address_verified BOOLEAN NOT NULL DEFAULT false,
  liveness_check BOOLEAN NOT NULL DEFAULT false,
  biometric_score NUMERIC(5,2),

  -- JAAK integration
  jaak_verification_id VARCHAR(100),
  jaak_status VARCHAR(30) DEFAULT 'pending'
    CHECK (jaak_status IN ('pending','processing','approved','rejected','manual_review')),
  jaak_response JSONB,

  -- Overall status
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','in_progress','verified','rejected','expired')),
  rejection_reason TEXT,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kyc_user ON kyc_verifications(user_id);
CREATE INDEX idx_kyc_status ON kyc_verifications(status);

-- ============================================
-- 2. KYC DOCUMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  kyc_id UUID REFERENCES kyc_verifications(id),
  document_type VARCHAR(30) NOT NULL
    CHECK (document_type IN ('ine_front','ine_back','selfie','proof_of_address','bank_statement','payslip','curp','rfc','other')),
  file_url TEXT NOT NULL,
  file_name VARCHAR(200),
  file_size INT,
  mime_type VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kyc_docs_user ON kyc_documents(user_id);

-- ============================================
-- 3. CREDIT PRODUCTS (catalog)
-- ============================================
CREATE TABLE IF NOT EXISTS credit_products (
  id VARCHAR(30) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(30) NOT NULL
    CHECK (type IN ('nomina','personal','empresarial','auto','hipotecario','revolvente')),
  min_amount NUMERIC(18,2) NOT NULL,
  max_amount NUMERIC(18,2) NOT NULL,
  min_plazo INT NOT NULL, -- months
  max_plazo INT NOT NULL,
  annual_rate NUMERIC(6,2) NOT NULL,
  cat NUMERIC(6,2) NOT NULL, -- Costo Anual Total
  commission_rate NUMERIC(6,2) NOT NULL DEFAULT 0,
  requires_kyc_level INT NOT NULL DEFAULT 2,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 4. CREDIT APPLICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS credit_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  product_id VARCHAR(30) NOT NULL REFERENCES credit_products(id),
  account_id UUID REFERENCES accounts(id),

  -- Requested
  requested_amount NUMERIC(18,2) NOT NULL,
  requested_plazo INT NOT NULL,

  -- Approved (may differ from requested)
  approved_amount NUMERIC(18,2),
  approved_plazo INT,
  approved_rate NUMERIC(6,2),
  monthly_payment NUMERIC(18,2),

  -- Scoring
  credit_score INT,
  risk_level VARCHAR(10) CHECK (risk_level IN ('bajo','medio','alto','muy_alto')),
  scoring_details JSONB,

  -- Status workflow
  status VARCHAR(30) NOT NULL DEFAULT 'borrador'
    CHECK (status IN ('borrador','enviada','en_revision','aprobada','rechazada','documentacion','dispersada','cancelada')),
  rejection_reason TEXT,

  -- Workflow tracking
  submitted_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  disbursed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_credit_apps_user ON credit_applications(user_id);
CREATE INDEX idx_credit_apps_status ON credit_applications(status);

-- ============================================
-- 5. ACTIVE CREDITS (after disbursement)
-- ============================================
CREATE TABLE IF NOT EXISTS credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES credit_applications(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  product_id VARCHAR(30) NOT NULL REFERENCES credit_products(id),
  account_id UUID REFERENCES accounts(id),

  -- Terms
  original_amount NUMERIC(18,2) NOT NULL,
  current_balance NUMERIC(18,2) NOT NULL,
  monthly_payment NUMERIC(18,2) NOT NULL,
  annual_rate NUMERIC(6,2) NOT NULL,
  cat NUMERIC(6,2) NOT NULL,
  total_plazo INT NOT NULL,
  remaining_plazo INT NOT NULL,

  -- Payment tracking
  next_payment_date DATE,
  last_payment_date DATE,
  last_payment_amount NUMERIC(18,2),
  days_past_due INT NOT NULL DEFAULT 0,
  past_due_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  total_paid NUMERIC(18,2) NOT NULL DEFAULT 0,
  total_interest_paid NUMERIC(18,2) NOT NULL DEFAULT 0,

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'vigente'
    CHECK (status IN ('vigente','vencido','liquidado','reestructurado','castigado','cancelado')),
  mora_category VARCHAR(10) DEFAULT '0'
    CHECK (mora_category IN ('0','0-30','31-60','61-90','90+')),

  disbursed_at TIMESTAMPTZ NOT NULL,
  maturity_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_credits_user ON credits(user_id);
CREATE INDEX idx_credits_status ON credits(status);
CREATE INDEX idx_credits_mora ON credits(mora_category);

-- ============================================
-- 6. CREDIT PAYMENTS (amortization)
-- ============================================
CREATE TABLE IF NOT EXISTS credit_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_id UUID NOT NULL REFERENCES credits(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  transaction_id UUID REFERENCES transactions(id),

  payment_number INT NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  principal NUMERIC(18,2) NOT NULL,
  interest NUMERIC(18,2) NOT NULL,
  iva_interest NUMERIC(18,2) NOT NULL DEFAULT 0,
  late_fee NUMERIC(18,2) NOT NULL DEFAULT 0,
  balance_after NUMERIC(18,2) NOT NULL,

  due_date DATE NOT NULL,
  paid_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'pendiente'
    CHECK (status IN ('pendiente','pagado','vencido','parcial')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_credit_payments_credit ON credit_payments(credit_id);
CREATE INDEX idx_credit_payments_status ON credit_payments(status);
CREATE INDEX idx_credit_payments_due ON credit_payments(due_date);

-- ============================================
-- 7. COLLECTION ACTIONS (Cobranza)
-- ============================================
CREATE TABLE IF NOT EXISTS collection_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_id UUID NOT NULL REFERENCES credits(id),
  agent_id UUID NOT NULL REFERENCES profiles(id),

  action_type VARCHAR(20) NOT NULL
    CHECK (action_type IN ('llamada','sms','email','whatsapp','visita','carta','legal')),
  result VARCHAR(30) NOT NULL
    CHECK (result IN ('contactado','no_contesta','promesa_pago','negativa','buzon','numero_incorrecto','pagado','reestructura')),

  promise_date DATE,
  promise_amount NUMERIC(18,2),
  notes TEXT,
  next_action_date DATE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_collection_credit ON collection_actions(credit_id);
CREATE INDEX idx_collection_agent ON collection_actions(agent_id);

-- ============================================
-- 8. COLLECTION STRATEGIES
-- ============================================
CREATE TABLE IF NOT EXISTS collection_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  mora_category VARCHAR(10) NOT NULL,
  description TEXT,
  actions JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 9. RLS POLICIES
-- ============================================

ALTER TABLE kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_strategies ENABLE ROW LEVEL SECURITY;

-- KYC: users see own, compliance/admin see all
CREATE POLICY kyc_user ON kyc_verifications
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('L3_PLD','L4_ADMIN','L5_EJECUTIVO'))
  );

CREATE POLICY kyc_docs_user ON kyc_documents
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('L3_PLD','L4_ADMIN'))
  );

-- Credit products: public read
CREATE POLICY credit_products_read ON credit_products
  FOR SELECT USING (true);

-- Credit applications: users see own, back-office/comercial see all
CREATE POLICY credit_apps_select ON credit_applications
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('L2_COMERCIAL','L3_BACKOFFICE','L4_ADMIN','L5_EJECUTIVO'))
  );

CREATE POLICY credit_apps_insert ON credit_applications
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Credits: users see own, collectors/back-office see all
CREATE POLICY credits_select ON credits
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('L2_GESTOR','L2_COMERCIAL','L3_BACKOFFICE','L4_ADMIN','L5_EJECUTIVO'))
  );

-- Credit payments: users see own
CREATE POLICY credit_payments_select ON credit_payments
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('L2_GESTOR','L3_BACKOFFICE','L4_ADMIN','L5_EJECUTIVO'))
  );

-- Collection: gestors and above
CREATE POLICY collection_actions_select ON collection_actions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('L2_GESTOR','L3_BACKOFFICE','L4_ADMIN','L5_EJECUTIVO'))
  );

CREATE POLICY collection_strategies_read ON collection_strategies
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('L2_GESTOR','L3_BACKOFFICE','L4_ADMIN'))
  );

-- ============================================
-- 10. TRIGGERS
-- ============================================

CREATE TRIGGER set_updated_at_kyc
  BEFORE UPDATE ON kyc_verifications
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_credit_apps
  BEFORE UPDATE ON credit_applications
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_credits
  BEFORE UPDATE ON credits
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Update mora category based on days past due
CREATE OR REPLACE FUNCTION update_mora_category()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.days_past_due = 0 THEN
    NEW.mora_category := '0';
  ELSIF NEW.days_past_due <= 30 THEN
    NEW.mora_category := '0-30';
  ELSIF NEW.days_past_due <= 60 THEN
    NEW.mora_category := '31-60';
  ELSIF NEW.days_past_due <= 90 THEN
    NEW.mora_category := '61-90';
  ELSE
    NEW.mora_category := '90+';
  END IF;

  IF NEW.days_past_due > 0 AND NEW.status = 'vigente' THEN
    NEW.status := 'vencido';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_credit_mora_update
  BEFORE UPDATE ON credits
  FOR EACH ROW
  WHEN (OLD.days_past_due IS DISTINCT FROM NEW.days_past_due)
  EXECUTE FUNCTION update_mora_category();

-- ============================================
-- 11. SEED DATA: Credit Products
-- ============================================
INSERT INTO credit_products (id, name, description, type, min_amount, max_amount, min_plazo, max_plazo, annual_rate, cat, commission_rate) VALUES
  ('nomina', 'Crédito de Nómina', 'Crédito con descuento vía nómina, tasa preferencial', 'nomina', 5000, 500000, 6, 48, 18.50, 24.80, 2.00),
  ('personal', 'Crédito Personal', 'Crédito personal sin garantía para cualquier propósito', 'personal', 3000, 300000, 3, 36, 28.00, 36.50, 3.50),
  ('empresarial', 'Crédito Empresarial', 'Financiamiento para PyMEs y empresas', 'empresarial', 50000, 5000000, 12, 60, 15.00, 19.20, 1.50),
  ('auto', 'Crédito Automotriz', 'Financiamiento para vehículos nuevos y seminuevos', 'auto', 100000, 2000000, 12, 60, 12.50, 16.80, 2.00),
  ('revolvente', 'Línea Revolvente', 'Línea de crédito revolvente disponible 24/7', 'revolvente', 1000, 100000, 1, 12, 35.00, 45.00, 0)
ON CONFLICT (id) DO NOTHING;

-- Seed collection strategies
INSERT INTO collection_strategies (name, mora_category, description, actions) VALUES
  ('Preventiva', '0', 'Recordatorio antes del vencimiento', '[{"day":-5,"type":"sms","template":"reminder_5d"},{"day":-1,"type":"push","template":"reminder_1d"}]'),
  ('Administrativa 30', '0-30', 'Gestión temprana de mora', '[{"day":1,"type":"sms","template":"past_due_1d"},{"day":3,"type":"llamada"},{"day":7,"type":"email","template":"past_due_7d"},{"day":15,"type":"llamada"},{"day":25,"type":"carta"}]'),
  ('Administrativa 60', '31-60', 'Gestión intensiva de mora', '[{"day":31,"type":"llamada"},{"day":35,"type":"sms"},{"day":40,"type":"llamada"},{"day":45,"type":"visita"},{"day":55,"type":"carta","template":"legal_warning"}]'),
  ('Pre-jurídica', '61-90', 'Última oportunidad antes de acción legal', '[{"day":61,"type":"llamada"},{"day":65,"type":"carta","template":"legal_final"},{"day":75,"type":"visita"},{"day":85,"type":"legal","template":"demand_prep"}]'),
  ('Jurídica', '90+', 'Proceso legal de recuperación', '[{"day":91,"type":"legal","template":"formal_demand"}]')
ON CONFLICT DO NOTHING;
