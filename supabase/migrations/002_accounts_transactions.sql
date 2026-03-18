-- ============================================================
-- SAYO — Phase 2: Cuentas, Transacciones y SPEI
-- ============================================================

-- ============================================
-- 1. ACCOUNTS (Cuentas SAYO)
-- ============================================
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_number VARCHAR(20) UNIQUE NOT NULL,
  clabe VARCHAR(18) UNIQUE NOT NULL,
  account_type VARCHAR(30) NOT NULL DEFAULT 'debito'
    CHECK (account_type IN ('debito','nomina','credito','ahorro','inversiones')),
  currency VARCHAR(3) NOT NULL DEFAULT 'MXN',
  balance NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  available_balance NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  hold_amount NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  credit_limit NUMERIC(18,2) DEFAULT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','blocked','frozen','closed','pending')),
  alias VARCHAR(100),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_accounts_user ON accounts(user_id);
CREATE INDEX idx_accounts_clabe ON accounts(clabe);
CREATE INDEX idx_accounts_status ON accounts(status);

-- ============================================
-- 2. BENEFICIARIES (Contactos de transferencia)
-- ============================================
CREATE TABLE IF NOT EXISTS beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  bank_name VARCHAR(60) NOT NULL,
  bank_code VARCHAR(10),
  clabe VARCHAR(18) NOT NULL,
  alias VARCHAR(100),
  email VARCHAR(120),
  phone VARCHAR(20),
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, clabe)
);

CREATE INDEX idx_beneficiaries_user ON beneficiaries(user_id);

-- ============================================
-- 3. TRANSACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id),
  user_id UUID NOT NULL REFERENCES profiles(id),

  -- Type & direction
  type VARCHAR(30) NOT NULL
    CHECK (type IN ('SPEI_IN','SPEI_OUT','INTERNAL','DISPERSION','CODI','SERVICE_PAYMENT','CREDIT_DISBURSEMENT','CREDIT_PAYMENT','FEE','INTEREST','ADJUSTMENT')),
  direction VARCHAR(3) NOT NULL CHECK (direction IN ('IN','OUT')),

  -- Amounts
  amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  fee NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  tax NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(18,2) NOT NULL,
  balance_before NUMERIC(18,2),
  balance_after NUMERIC(18,2),

  -- SPEI fields
  clave_rastreo VARCHAR(50) UNIQUE,
  concepto VARCHAR(200),
  referencia_numerica VARCHAR(10),

  -- Sender
  sender_name VARCHAR(120),
  sender_bank VARCHAR(60),
  sender_clabe VARCHAR(18),
  sender_rfc VARCHAR(13),

  -- Receiver
  receiver_name VARCHAR(120),
  receiver_bank VARCHAR(60),
  receiver_clabe VARCHAR(18),
  receiver_rfc VARCHAR(13),

  -- Status & metadata
  status VARCHAR(20) NOT NULL DEFAULT 'pendiente'
    CHECK (status IN ('pendiente','en_proceso','completada','rechazada','cancelada','devuelta','conciliada')),
  rejection_reason VARCHAR(200),
  spei_response_code VARCHAR(10),

  -- Batch (dispersions)
  batch_id UUID,
  batch_sequence INT,

  -- Timestamps
  initiated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_date ON transactions(initiated_at);
CREATE INDEX idx_transactions_clave ON transactions(clave_rastreo);
CREATE INDEX idx_transactions_batch ON transactions(batch_id);

-- ============================================
-- 4. BATCHES (Lotes de dispersión)
-- ============================================
CREATE TABLE IF NOT EXISTS batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES profiles(id),
  name VARCHAR(120) NOT NULL,
  description TEXT,
  type VARCHAR(30) NOT NULL DEFAULT 'nomina'
    CHECK (type IN ('nomina','credito','proveedor','otro')),
  total_amount NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  total_transactions INT NOT NULL DEFAULT 0,
  processed_count INT NOT NULL DEFAULT 0,
  success_count INT NOT NULL DEFAULT 0,
  failed_count INT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'borrador'
    CHECK (status IN ('borrador','pendiente','en_proceso','completado','parcial','cancelado')),
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_batches_creator ON batches(created_by);
CREATE INDEX idx_batches_status ON batches(status);

-- ============================================
-- 5. CONCILIATION RECORDS
-- ============================================
CREATE TABLE IF NOT EXISTS conciliation_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id),
  spei_reference VARCHAR(50),
  internal_amount NUMERIC(18,2),
  spei_amount NUMERIC(18,2),
  discrepancy NUMERIC(18,2),
  status VARCHAR(20) NOT NULL DEFAULT 'pendiente'
    CHECK (status IN ('pendiente','conciliado','discrepancia','manual')),
  conciliated_by UUID REFERENCES profiles(id),
  conciliated_at TIMESTAMPTZ,
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_conciliation_date ON conciliation_records(date);
CREATE INDEX idx_conciliation_status ON conciliation_records(status);

-- ============================================
-- 6. SERVICE PAYMENTS CONFIG
-- ============================================
CREATE TABLE IF NOT EXISTS service_companies (
  id VARCHAR(30) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  category VARCHAR(30) NOT NULL,
  logo_url TEXT,
  requires_reference BOOLEAN NOT NULL DEFAULT true,
  reference_label VARCHAR(60) DEFAULT 'Número de referencia',
  reference_format VARCHAR(60),
  min_amount NUMERIC(18,2) DEFAULT 0,
  max_amount NUMERIC(18,2),
  commission NUMERIC(18,2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 7. RLS POLICIES
-- ============================================

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE conciliation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_companies ENABLE ROW LEVEL SECURITY;

-- Accounts: users see own, operators see all
CREATE POLICY accounts_user_select ON accounts
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
      AND role IN ('L2_OPERADOR','L3_BACKOFFICE','L4_ADMIN','L5_EJECUTIVO')
    )
  );

CREATE POLICY accounts_user_insert ON accounts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
      AND role IN ('L3_BACKOFFICE','L4_ADMIN')
    )
  );

CREATE POLICY accounts_user_update ON accounts
  FOR UPDATE USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
      AND role IN ('L3_BACKOFFICE','L4_ADMIN')
    )
  );

-- Beneficiaries: users see own only
CREATE POLICY beneficiaries_user ON beneficiaries
  FOR ALL USING (user_id = auth.uid());

-- Transactions: users see own, operators see all
CREATE POLICY transactions_user_select ON transactions
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
      AND role IN ('L2_OPERADOR','L3_BACKOFFICE','L3_PLD','L4_ADMIN','L5_EJECUTIVO')
    )
  );

CREATE POLICY transactions_insert ON transactions
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
      AND role IN ('L2_OPERADOR','L3_BACKOFFICE','L4_ADMIN')
    )
  );

-- Batches: creators + operators
CREATE POLICY batches_select ON batches
  FOR SELECT USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
      AND role IN ('L2_OPERADOR','L3_BACKOFFICE','L4_ADMIN','L5_EJECUTIVO')
    )
  );

CREATE POLICY batches_insert ON batches
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
      AND role IN ('L2_OPERADOR','L3_BACKOFFICE','L4_ADMIN')
    )
  );

-- Conciliation: operators only
CREATE POLICY conciliation_select ON conciliation_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
      AND role IN ('L2_OPERADOR','L3_BACKOFFICE','L4_ADMIN','L5_EJECUTIVO')
    )
  );

-- Service companies: public read
CREATE POLICY service_companies_read ON service_companies
  FOR SELECT USING (true);

-- ============================================
-- 8. FUNCTIONS
-- ============================================

-- Auto-generate CLABE (646180 + 9 digits + check digit)
CREATE OR REPLACE FUNCTION generate_clabe()
RETURNS VARCHAR(18) AS $$
DECLARE
  base_clabe VARCHAR(17);
  check_digit INT;
  weights INT[] := ARRAY[3,7,1,3,7,1,3,7,1,3,7,1,3,7,1,3,7];
  total INT := 0;
  digit INT;
BEGIN
  -- 646180 (SAYO bank code) + random 11 digits
  base_clabe := '646180' || lpad(floor(random() * 99999999999)::text, 11, '0');

  -- Calculate check digit (modulo 10)
  FOR i IN 1..17 LOOP
    digit := substring(base_clabe FROM i FOR 1)::int;
    total := total + ((digit * weights[i]) % 10);
  END LOOP;
  check_digit := (10 - (total % 10)) % 10;

  RETURN base_clabe || check_digit::text;
END;
$$ LANGUAGE plpgsql;

-- Generate account number
CREATE OR REPLACE FUNCTION generate_account_number()
RETURNS VARCHAR(20) AS $$
BEGIN
  RETURN '6461' || lpad(floor(random() * 9999999999)::text, 10, '0');
END;
$$ LANGUAGE plpgsql;

-- Auto-create account for new user
CREATE OR REPLACE FUNCTION handle_new_account()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO accounts (user_id, account_number, clabe, account_type, balance, available_balance)
  VALUES (
    NEW.id,
    generate_account_number(),
    generate_clabe(),
    'debito',
    0.00,
    0.00
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_account
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_account();

-- Generate clave rastreo
CREATE OR REPLACE FUNCTION generate_clave_rastreo()
RETURNS VARCHAR(50) AS $$
BEGIN
  RETURN 'SAYO' || to_char(now(), 'YYYYMMDD') || lpad(floor(random() * 999999)::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Process transaction: update balances
CREATE OR REPLACE FUNCTION process_transaction()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completada' AND (OLD.status IS NULL OR OLD.status != 'completada') THEN
    -- Record balance before
    NEW.balance_before := (SELECT balance FROM accounts WHERE id = NEW.account_id);

    IF NEW.direction = 'OUT' THEN
      UPDATE accounts
      SET balance = balance - NEW.total_amount,
          available_balance = available_balance - NEW.total_amount,
          updated_at = now()
      WHERE id = NEW.account_id;
    ELSIF NEW.direction = 'IN' THEN
      UPDATE accounts
      SET balance = balance + NEW.total_amount,
          available_balance = available_balance + NEW.total_amount,
          updated_at = now()
      WHERE id = NEW.account_id;
    END IF;

    -- Record balance after
    NEW.balance_after := (SELECT balance FROM accounts WHERE id = NEW.account_id);
    NEW.completed_at := now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_transaction_process
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION process_transaction();

-- Updated at trigger for new tables
CREATE TRIGGER set_updated_at_accounts
  BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_beneficiaries
  BEFORE UPDATE ON beneficiaries
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_transactions
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_batches
  BEFORE UPDATE ON batches
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- 9. SEED DATA: Service Companies
-- ============================================
INSERT INTO service_companies (id, name, category, requires_reference, reference_label, commission) VALUES
  ('cfe', 'CFE (Luz)', 'energia', true, 'Número de servicio', 0),
  ('telmex', 'Telmex', 'telefonia', true, 'Número telefónico', 0),
  ('telcel', 'Telcel', 'telefonia', true, 'Número de línea', 0),
  ('att', 'AT&T', 'telefonia', true, 'Número de cuenta', 0),
  ('izzi', 'izzi', 'internet', true, 'Número de cuenta', 0),
  ('totalplay', 'Totalplay', 'internet', true, 'Número de cliente', 0),
  ('sky', 'SKY', 'television', true, 'Número de suscriptor', 0),
  ('dish', 'Dish', 'television', true, 'Número de cuenta', 0),
  ('naturgy', 'Naturgy (Gas)', 'energia', true, 'Número de cuenta', 0),
  ('jmas', 'JMAS (Agua)', 'agua', true, 'Número de contrato', 0),
  ('sat', 'SAT (Impuestos)', 'gobierno', true, 'Línea de captura', 0),
  ('imss', 'IMSS', 'gobierno', true, 'Número patronal', 0),
  ('netflix', 'Netflix', 'entretenimiento', true, 'Email de cuenta', 8.50),
  ('spotify', 'Spotify', 'entretenimiento', true, 'Email de cuenta', 5.00),
  ('uber', 'Uber', 'transporte', true, 'Número de teléfono', 0),
  ('amazon', 'Amazon', 'marketplace', true, 'Número de pedido', 0)
ON CONFLICT (id) DO NOTHING;
