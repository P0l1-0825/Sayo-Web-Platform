-- ============================================================
-- SAYO — Phase 5: Credit Origination & Treasury
-- ============================================================

-- ============================================
-- 1. CLIENTS — PFAE (Persona Física con Actividad Empresarial)
-- ============================================
CREATE TABLE IF NOT EXISTS clients_pfae (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificación
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  mother_last_name VARCHAR(100),
  rfc VARCHAR(13) NOT NULL UNIQUE,
  curp VARCHAR(18) NOT NULL UNIQUE,
  birth_date DATE NOT NULL,
  nationality VARCHAR(50) NOT NULL DEFAULT 'Mexicana',
  civil_status VARCHAR(20) NOT NULL DEFAULT 'soltero'
    CHECK (civil_status IN ('soltero','casado','divorciado','viudo','union_libre')),
  id_type VARCHAR(20) NOT NULL DEFAULT 'INE'
    CHECK (id_type IN ('INE','pasaporte','cedula')),
  id_number VARCHAR(30) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code VARCHAR(5) NOT NULL,

  -- Empleo
  occupation VARCHAR(100),
  company VARCHAR(200),
  position VARCHAR(100),
  seniority_years NUMERIC(4,1),
  contract_type VARCHAR(50),
  company_address TEXT,

  -- Ingresos
  monthly_income NUMERIC(14,2) NOT NULL DEFAULT 0,
  other_income NUMERIC(14,2) NOT NULL DEFAULT 0,
  monthly_expenses NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_assets NUMERIC(16,2) NOT NULL DEFAULT 0,
  total_liabilities NUMERIC(16,2) NOT NULL DEFAULT 0,

  -- PLD
  resource_origin VARCHAR(100),
  is_pep BOOLEAN NOT NULL DEFAULT false,
  pep_relation VARCHAR(200),
  fund_country VARCHAR(50) NOT NULL DEFAULT 'México',
  credit_purpose VARCHAR(200),

  -- Metadata
  status VARCHAR(20) NOT NULL DEFAULT 'activo'
    CHECK (status IN ('activo','inactivo','bloqueado')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clients_pfae_rfc ON clients_pfae(rfc);
CREATE INDEX idx_clients_pfae_curp ON clients_pfae(curp);

-- ============================================
-- 2. CLIENTS — PM (Persona Moral)
-- ============================================
CREATE TABLE IF NOT EXISTS clients_pm (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Empresa
  legal_name VARCHAR(300) NOT NULL,
  rfc VARCHAR(13) NOT NULL UNIQUE,
  business_object TEXT,
  sector VARCHAR(100),
  industry VARCHAR(100),
  fiscal_address TEXT NOT NULL,
  incorporation_date DATE,

  -- Notarial
  deed_number VARCHAR(50),
  notary VARCHAR(200),
  notary_number VARCHAR(20),
  deed_date DATE,

  -- Representante Legal
  rep_legal_name VARCHAR(200) NOT NULL,
  rep_legal_rfc VARCHAR(13),
  rep_legal_curp VARCHAR(18),
  power_of_attorney VARCHAR(100),

  -- Operaciones
  main_activity VARCHAR(200),
  annual_sales NUMERIC(16,2) NOT NULL DEFAULT 0,
  employees INT NOT NULL DEFAULT 0,
  main_clients TEXT,
  main_suppliers TEXT,

  -- Beneficiario Real
  beneficial_owner VARCHAR(200),
  beneficial_owner_rfc VARCHAR(13),
  ownership_percentage NUMERIC(5,2),

  -- PLD
  resource_origin VARCHAR(100),
  is_pep BOOLEAN NOT NULL DEFAULT false,
  fund_country VARCHAR(50) NOT NULL DEFAULT 'México',
  credit_purpose VARCHAR(200),

  -- Metadata
  status VARCHAR(20) NOT NULL DEFAULT 'activo'
    CHECK (status IN ('activo','inactivo','bloqueado')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clients_pm_rfc ON clients_pm(rfc);

-- ============================================
-- 3. CREDIT ORIGINATION APPLICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS credit_origination_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folio VARCHAR(20) NOT NULL UNIQUE,
  client_name VARCHAR(300) NOT NULL,
  client_id UUID NOT NULL, -- references clients_pfae or clients_pm
  client_type VARCHAR(4) NOT NULL CHECK (client_type IN ('PFAE', 'PM')),
  product VARCHAR(100) NOT NULL,
  amount NUMERIC(16,2) NOT NULL CHECK (amount > 0),
  term INT NOT NULL CHECK (term > 0), -- months
  rate NUMERIC(6,2) NOT NULL CHECK (rate > 0), -- annual %
  status VARCHAR(20) NOT NULL DEFAULT 'capturada'
    CHECK (status IN (
      'capturada','por_aprobar','en_comite','por_disponer',
      'activa','saldada','rechazada','cancelada','reactivada'
    )),
  assigned_to VARCHAR(200),
  bureau_score INT,
  validations JSONB DEFAULT '{}',
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orig_apps_status ON credit_origination_applications(status);
CREATE INDEX idx_orig_apps_client ON credit_origination_applications(client_id);
CREATE INDEX idx_orig_apps_folio ON credit_origination_applications(folio);

-- ============================================
-- 4. CREDIT LINES
-- ============================================
CREATE TABLE IF NOT EXISTS credit_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_number VARCHAR(20) NOT NULL UNIQUE,
  client_name VARCHAR(300) NOT NULL,
  client_id UUID NOT NULL,
  product VARCHAR(100) NOT NULL,
  credit_limit NUMERIC(16,2) NOT NULL CHECK (credit_limit > 0),
  available NUMERIC(16,2) NOT NULL DEFAULT 0,
  used NUMERIC(16,2) NOT NULL DEFAULT 0,
  rate NUMERIC(6,2) NOT NULL, -- annual %
  expiration_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'activa'
    CHECK (status IN ('activa','suspendida','vencida','cancelada')),
  start_date DATE NOT NULL,
  application_id UUID REFERENCES credit_origination_applications(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_credit_lines_client ON credit_lines(client_id);
CREATE INDEX idx_credit_lines_status ON credit_lines(status);

-- ============================================
-- 5. COMMITTEE DECISIONS
-- ============================================
CREATE TABLE IF NOT EXISTS committee_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES credit_origination_applications(id),
  client_name VARCHAR(300) NOT NULL,
  amount NUMERIC(16,2) NOT NULL,
  date DATE NOT NULL,
  members JSONB NOT NULL DEFAULT '[]', -- array of {name, vote, comment}
  decision VARCHAR(20) NOT NULL
    CHECK (decision IN ('aprobada','rechazada','condicionada')),
  conditions TEXT,
  minutes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_committee_app ON committee_decisions(application_id);

-- ============================================
-- 6. DISPOSITIONS (Credit Drawdowns)
-- ============================================
CREATE TABLE IF NOT EXISTS dispositions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_line_id UUID NOT NULL REFERENCES credit_lines(id),
  client_name VARCHAR(300) NOT NULL,
  amount NUMERIC(16,2) NOT NULL CHECK (amount > 0),
  destination_account VARCHAR(18) NOT NULL,
  date DATE NOT NULL,
  folio VARCHAR(20) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'por_autorizar'
    CHECK (status IN ('por_autorizar','autorizada','dispersada','cancelada')),
  authorized_by VARCHAR(200),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dispositions_line ON dispositions(credit_line_id);
CREATE INDEX idx_dispositions_status ON dispositions(status);

-- ============================================
-- 7. TREASURY PAYMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS treasury_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folio VARCHAR(20) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL
    CHECK (type IN ('individual','empresa','referenciado','dispersion','spei_in','spei_out')),
  beneficiary_name VARCHAR(300) NOT NULL,
  beneficiary_bank VARCHAR(100),
  beneficiary_clabe VARCHAR(18),
  amount NUMERIC(16,2) NOT NULL CHECK (amount > 0),
  concept VARCHAR(200) NOT NULL,
  reference VARCHAR(100),
  source_account VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pendiente'
    CHECK (status IN ('pendiente','autorizado','procesado','rechazado','cancelado','completado','en_proceso')),
  requested_by VARCHAR(200) NOT NULL,
  authorized_by VARCHAR(200),
  date DATE NOT NULL,
  processed_at TIMESTAMPTZ,
  spei_tracking VARCHAR(50),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_treasury_status ON treasury_payments(status);
CREATE INDEX idx_treasury_date ON treasury_payments(date);
CREATE INDEX idx_treasury_type ON treasury_payments(type);

-- ============================================
-- 8. PAYMENT BATCHES
-- ============================================
CREATE TABLE IF NOT EXISTS payment_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  type VARCHAR(20) NOT NULL
    CHECK (type IN ('nomina','dispersiones','proveedores','custom')),
  total_records INT NOT NULL DEFAULT 0,
  total_amount NUMERIC(16,2) NOT NULL DEFAULT 0,
  success_count INT NOT NULL DEFAULT 0,
  error_count INT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pendiente'
    CHECK (status IN ('pendiente','procesando','completado','parcial','fallido','procesado','error')),
  uploaded_by VARCHAR(200) NOT NULL,
  created_by UUID REFERENCES profiles(id),
  date DATE NOT NULL,
  processed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_batches_status ON payment_batches(status);

-- ============================================
-- 9. PAYMENT AUTHORIZATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS payment_authorizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES treasury_payments(id),
  payment_folio VARCHAR(20) NOT NULL,
  beneficiary_name VARCHAR(300) NOT NULL,
  amount NUMERIC(16,2) NOT NULL,
  requested_by VARCHAR(200) NOT NULL,
  required_level VARCHAR(5) NOT NULL CHECK (required_level IN ('L3','L4')),
  status VARCHAR(20) NOT NULL DEFAULT 'pendiente'
    CHECK (status IN ('pendiente','autorizado','rechazado')),
  authorized_by VARCHAR(200),
  rejection_reason TEXT,
  date DATE NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_auth_status ON payment_authorizations(status);
CREATE INDEX idx_auth_payment ON payment_authorizations(payment_id);

-- ============================================
-- 10. CREDIT SIMULATIONS (for cotizador history)
-- ============================================
CREATE TABLE IF NOT EXISTS credit_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product VARCHAR(100) NOT NULL,
  amount NUMERIC(16,2) NOT NULL,
  rate NUMERIC(6,2) NOT NULL,
  term INT NOT NULL,
  monthly_payment NUMERIC(14,2) NOT NULL,
  total_interest NUMERIC(16,2) NOT NULL,
  total_payment NUMERIC(16,2) NOT NULL,
  cat NUMERIC(6,2) NOT NULL,
  amortization JSONB NOT NULL DEFAULT '[]',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 11. RLS POLICIES
-- ============================================

ALTER TABLE clients_pfae ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients_pm ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_origination_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE committee_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispositions ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_simulations ENABLE ROW LEVEL SECURITY;

-- Internal staff can read all origination data
CREATE POLICY "staff_read_pfae" ON clients_pfae FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('L3_ORIGINACION','L4_ADMIN','L5_EJECUTIVO','L3_PLD')
  ));

CREATE POLICY "staff_read_pm" ON clients_pm FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('L3_ORIGINACION','L4_ADMIN','L5_EJECUTIVO','L3_PLD')
  ));

CREATE POLICY "staff_read_orig_apps" ON credit_origination_applications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('L3_ORIGINACION','L4_ADMIN','L5_EJECUTIVO','L2_OPERADOR')
  ));

CREATE POLICY "staff_read_credit_lines" ON credit_lines FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('L3_ORIGINACION','L4_ADMIN','L5_EJECUTIVO','L2_OPERADOR','L3_TESORERIA')
  ));

CREATE POLICY "staff_read_committee" ON committee_decisions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('L3_ORIGINACION','L4_ADMIN','L5_EJECUTIVO')
  ));

CREATE POLICY "staff_read_dispositions" ON dispositions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('L3_ORIGINACION','L3_TESORERIA','L4_ADMIN','L5_EJECUTIVO','L2_OPERADOR')
  ));

-- Treasury staff can read treasury data
CREATE POLICY "staff_read_treasury" ON treasury_payments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('L3_TESORERIA','L4_ADMIN','L5_EJECUTIVO','L2_OPERADOR')
  ));

CREATE POLICY "staff_read_batches" ON payment_batches FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('L3_TESORERIA','L4_ADMIN','L5_EJECUTIVO')
  ));

CREATE POLICY "staff_read_auth" ON payment_authorizations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('L3_TESORERIA','L4_ADMIN','L5_EJECUTIVO')
  ));

CREATE POLICY "staff_read_simulations" ON credit_simulations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('L3_ORIGINACION','L4_ADMIN','L5_EJECUTIVO','L2_COMERCIAL')
  ));

-- Write policies for origination staff
CREATE POLICY "orig_write_pfae" ON clients_pfae FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('L3_ORIGINACION','L4_ADMIN')
  ));

CREATE POLICY "orig_write_pm" ON clients_pm FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('L3_ORIGINACION','L4_ADMIN')
  ));

CREATE POLICY "orig_write_apps" ON credit_origination_applications FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('L3_ORIGINACION','L4_ADMIN')
  ));

CREATE POLICY "orig_update_apps" ON credit_origination_applications FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('L3_ORIGINACION','L4_ADMIN','L5_EJECUTIVO')
  ));

-- Write policies for treasury staff
CREATE POLICY "treas_write_payments" ON treasury_payments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('L3_TESORERIA','L4_ADMIN')
  ));

CREATE POLICY "treas_update_payments" ON treasury_payments FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('L3_TESORERIA','L4_ADMIN','L5_EJECUTIVO')
  ));

CREATE POLICY "treas_write_auth" ON payment_authorizations FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('L3_TESORERIA','L4_ADMIN','L5_EJECUTIVO')
  ));
