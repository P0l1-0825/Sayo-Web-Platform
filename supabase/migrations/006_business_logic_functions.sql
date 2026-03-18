-- ============================================================
-- SAYO — Phase 6: Business Logic Functions & Constraint Fixes
-- ============================================================
-- This migration adds production-grade business logic:
--   1. Fix roles/portal CHECK constraints (add L3_ORIGINACION, L3_TESORERIA)
--   2. Amortization calculation (French system)
--   3. Credit origination state machine
--   4. Payment authorization workflow
--   5. PLD auto-alert trigger on transactions
--   6. Daily balance & interest calculation
--   7. Account statement generation
--   8. Commission calculation
--   9. KYC level progression
--  10. Missing indexes & triggers
-- ============================================================

-- ============================================
-- 1. FIX: Add missing roles to profiles CHECK constraint
-- ============================================

-- Drop and recreate the role constraint to include L3_ORIGINACION and L3_TESORERIA
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN (
  'L2_OPERADOR', 'L2_GESTOR', 'L2_COMERCIAL', 'L2_SOPORTE',
  'L3_BACKOFFICE', 'L3_PLD', 'L3_MARKETING', 'L3_ORIGINACION', 'L3_TESORERIA',
  'L4_SEGURIDAD', 'L4_ADMIN',
  'L5_EJECUTIVO',
  'EXT_CLIENTE'
));

-- Drop and recreate the portal constraint to include originacion and tesoreria
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_portal_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_portal_check CHECK (portal IN (
  'mesa-control', 'cumplimiento', 'cobranza', 'comercial',
  'soporte', 'seguridad', 'marketing', 'ejecutivo',
  'admin', 'cliente', 'sayo-mx', 'originacion', 'tesoreria'
));

-- Add portal permissions for new roles
INSERT INTO portal_permissions (role, portal, can_read, can_write, can_delete, can_export, can_admin) VALUES
  ('L3_ORIGINACION', 'originacion', true, true, false, true, false),
  ('L3_ORIGINACION', 'mesa-control', true, false, false, true, false),
  ('L3_TESORERIA', 'tesoreria', true, true, false, true, false),
  ('L3_TESORERIA', 'mesa-control', true, false, false, true, false),
  -- Admin and Ejecutivo get access to new portals too
  ('L4_ADMIN', 'originacion', true, true, false, true, false),
  ('L4_ADMIN', 'tesoreria', true, true, false, true, false),
  ('L5_EJECUTIVO', 'originacion', true, false, false, true, false),
  ('L5_EJECUTIVO', 'tesoreria', true, false, false, true, false)
ON CONFLICT (role, portal) DO NOTHING;

-- ============================================
-- 2. Amortization Calculation (French System)
-- ============================================
-- PMT formula: P * [r(1+r)^n] / [(1+r)^n - 1]
-- Returns a table of amortization rows with principal, interest, IVA on interest
-- Used by: credit simulations, credit origination, credit disbursement

CREATE OR REPLACE FUNCTION calculate_amortization(
  p_amount NUMERIC,
  p_annual_rate NUMERIC,
  p_term_months INT,
  p_iva_rate NUMERIC DEFAULT 0.16
)
RETURNS TABLE(
  period INT,
  initial_balance NUMERIC,
  monthly_payment NUMERIC,
  principal NUMERIC,
  interest NUMERIC,
  iva_interest NUMERIC,
  total_payment NUMERIC,
  final_balance NUMERIC
)
LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_monthly_rate NUMERIC;
  v_pmt NUMERIC;
  v_balance NUMERIC;
  v_interest NUMERIC;
  v_principal NUMERIC;
  v_iva NUMERIC;
BEGIN
  -- Monthly rate from annual rate
  v_monthly_rate := p_annual_rate / 100.0 / 12.0;
  v_balance := p_amount;

  -- PMT formula: P * [r(1+r)^n] / [(1+r)^n - 1]
  IF v_monthly_rate = 0 THEN
    v_pmt := p_amount / p_term_months;
  ELSE
    v_pmt := p_amount * (v_monthly_rate * POWER(1 + v_monthly_rate, p_term_months))
             / (POWER(1 + v_monthly_rate, p_term_months) - 1);
  END IF;

  v_pmt := ROUND(v_pmt, 2);

  FOR i IN 1..p_term_months LOOP
    period := i;
    initial_balance := ROUND(v_balance, 2);

    -- Interest for this period
    v_interest := ROUND(v_balance * v_monthly_rate, 2);
    interest := v_interest;

    -- IVA on interest (16% in Mexico)
    v_iva := ROUND(v_interest * p_iva_rate, 2);
    iva_interest := v_iva;

    -- Principal is PMT minus interest
    v_principal := v_pmt - v_interest;

    -- Last period adjustment to zero out balance
    IF i = p_term_months THEN
      v_principal := v_balance;
      v_pmt := v_principal + v_interest;
    END IF;

    principal := ROUND(v_principal, 2);
    monthly_payment := ROUND(v_pmt, 2);
    total_payment := ROUND(v_pmt + v_iva, 2);

    -- Update running balance
    v_balance := v_balance - v_principal;
    final_balance := ROUND(GREATEST(v_balance, 0), 2);

    RETURN NEXT;
  END LOOP;
END;
$$;

-- ============================================
-- 3. Credit Origination State Machine
-- ============================================
-- Valid transitions:
--   capturada     → por_aprobar, cancelada
--   por_aprobar   → en_comite, rechazada, cancelada
--   en_comite     → por_disponer, rechazada, condicionada (→ por_aprobar)
--   por_disponer  → activa, cancelada
--   activa        → saldada
--   rechazada     → reactivada (→ capturada)
--   cancelada     → reactivada (→ capturada)

CREATE OR REPLACE FUNCTION transition_credit_application(
  p_application_id UUID,
  p_new_status VARCHAR,
  p_user_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_app RECORD;
  v_user_role TEXT;
  v_valid BOOLEAN := false;
  v_result JSONB;
BEGIN
  -- Get current application
  SELECT * INTO v_app FROM credit_origination_applications WHERE id = p_application_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application % not found', p_application_id;
  END IF;

  -- Get user role
  SELECT role INTO v_user_role FROM profiles WHERE id = p_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User % not found', p_user_id;
  END IF;

  -- Validate transition matrix
  CASE v_app.status
    WHEN 'capturada' THEN
      v_valid := p_new_status IN ('por_aprobar', 'cancelada');
    WHEN 'por_aprobar' THEN
      v_valid := p_new_status IN ('en_comite', 'rechazada', 'cancelada');
    WHEN 'en_comite' THEN
      v_valid := p_new_status IN ('por_disponer', 'rechazada');
    WHEN 'por_disponer' THEN
      v_valid := p_new_status IN ('activa', 'cancelada');
    WHEN 'activa' THEN
      v_valid := p_new_status IN ('saldada');
    WHEN 'rechazada' THEN
      v_valid := p_new_status IN ('reactivada');
    WHEN 'cancelada' THEN
      v_valid := p_new_status IN ('reactivada');
    WHEN 'reactivada' THEN
      v_valid := p_new_status IN ('capturada', 'por_aprobar');
    ELSE
      v_valid := false;
  END CASE;

  IF NOT v_valid THEN
    RAISE EXCEPTION 'Invalid transition: % → %', v_app.status, p_new_status;
  END IF;

  -- Validate role permissions for specific transitions
  IF p_new_status = 'en_comite' AND v_user_role NOT IN ('L3_ORIGINACION', 'L4_ADMIN', 'L5_EJECUTIVO') THEN
    RAISE EXCEPTION 'Only L3_ORIGINACION, L4_ADMIN or L5_EJECUTIVO can send to committee';
  END IF;

  IF p_new_status = 'por_disponer' AND v_user_role NOT IN ('L4_ADMIN', 'L5_EJECUTIVO') THEN
    RAISE EXCEPTION 'Only L4_ADMIN or L5_EJECUTIVO can approve from committee';
  END IF;

  IF p_new_status = 'activa' AND v_user_role NOT IN ('L3_TESORERIA', 'L4_ADMIN') THEN
    RAISE EXCEPTION 'Only L3_TESORERIA or L4_ADMIN can activate (disburse)';
  END IF;

  -- Update application status
  UPDATE credit_origination_applications
  SET status = p_new_status,
      notes = COALESCE(p_notes, notes),
      updated_at = now()
  WHERE id = p_application_id;

  -- Handle reactivada: reset back to capturada
  IF p_new_status = 'reactivada' THEN
    UPDATE credit_origination_applications
    SET status = 'capturada', updated_at = now()
    WHERE id = p_application_id;
  END IF;

  -- When approved from committee (por_disponer), auto-create credit line
  IF p_new_status = 'por_disponer' THEN
    INSERT INTO credit_lines (
      credit_number, client_name, client_id, product,
      credit_limit, available, used, rate,
      start_date, expiration_date, status, application_id
    ) VALUES (
      'CL-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random() * 9999)::text, 4, '0'),
      v_app.client_name,
      v_app.client_id,
      v_app.product,
      v_app.amount,
      v_app.amount,
      0,
      v_app.rate,
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '1 year',
      'activa',
      p_application_id
    );
  END IF;

  -- Auto PLD alert for large amounts
  IF v_app.amount >= 500000 AND p_new_status IN ('por_aprobar', 'en_comite') THEN
    INSERT INTO compliance_alerts (
      user_id, alert_type, description, severity, status,
      client_name, amount, risk_score
    ) VALUES (
      p_user_id,
      'operacion_relevante_credito',
      'Solicitud de crédito por monto relevante: $' || v_app.amount::TEXT || ' - ' || v_app.client_name,
      CASE WHEN v_app.amount >= 2000000 THEN 'alta' ELSE 'media' END,
      'activa',
      v_app.client_name,
      v_app.amount,
      CASE WHEN v_app.amount >= 2000000 THEN 70 ELSE 40 END
    );
  END IF;

  -- Audit log
  INSERT INTO audit_log (user_id, action, resource_type, resource_id, details, severity)
  VALUES (
    p_user_id,
    'credit.transition',
    'credit_origination_application',
    p_application_id::text,
    jsonb_build_object(
      'from_status', v_app.status,
      'to_status', p_new_status,
      'amount', v_app.amount,
      'client', v_app.client_name,
      'notes', p_notes
    ),
    CASE
      WHEN p_new_status IN ('rechazada','cancelada') THEN 'warning'
      WHEN p_new_status = 'activa' THEN 'info'
      ELSE 'info'
    END
  );

  v_result := jsonb_build_object(
    'success', true,
    'application_id', p_application_id,
    'previous_status', v_app.status,
    'new_status', p_new_status
  );

  RETURN v_result;
END;
$$;

-- ============================================
-- 4. Payment Authorization Workflow
-- ============================================

-- 4a. Request authorization for a treasury payment
CREATE OR REPLACE FUNCTION request_payment_authorization(
  p_payment_id UUID,
  p_requested_by UUID
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_payment RECORD;
  v_auth_id UUID;
  v_required_level VARCHAR(5);
BEGIN
  -- Get payment
  SELECT * INTO v_payment FROM treasury_payments WHERE id = p_payment_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment % not found', p_payment_id;
  END IF;

  IF v_payment.status != 'pendiente' THEN
    RAISE EXCEPTION 'Payment is not in pendiente status (current: %)', v_payment.status;
  END IF;

  -- Determine required authorization level
  IF v_payment.amount >= 100000 THEN
    v_required_level := 'L4';  -- >= $100K requires L4_ADMIN
  ELSE
    v_required_level := 'L3';  -- < $100K requires L3_TESORERIA
  END IF;

  -- Create authorization request
  INSERT INTO payment_authorizations (
    payment_id, payment_folio, beneficiary_name, amount,
    requested_by, required_level, status, date
  ) VALUES (
    p_payment_id,
    v_payment.folio,
    v_payment.beneficiary_name,
    v_payment.amount,
    (SELECT full_name FROM profiles WHERE id = p_requested_by),
    v_required_level,
    'pendiente',
    CURRENT_DATE
  )
  RETURNING id INTO v_auth_id;

  -- Audit
  INSERT INTO audit_log (user_id, action, resource_type, resource_id, details)
  VALUES (
    p_requested_by,
    'payment.auth_requested',
    'treasury_payment',
    p_payment_id::text,
    jsonb_build_object(
      'auth_id', v_auth_id,
      'amount', v_payment.amount,
      'required_level', v_required_level,
      'beneficiary', v_payment.beneficiary_name
    )
  );

  RETURN v_auth_id;
END;
$$;

-- 4b. Authorize or reject a payment
CREATE OR REPLACE FUNCTION authorize_payment(
  p_auth_id UUID,
  p_authorizer_id UUID,
  p_decision VARCHAR,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_auth RECORD;
  v_user_role TEXT;
  v_authorizer_name TEXT;
BEGIN
  -- Validate decision
  IF p_decision NOT IN ('autorizado', 'rechazado') THEN
    RAISE EXCEPTION 'Decision must be autorizado or rechazado';
  END IF;

  -- Get authorization
  SELECT * INTO v_auth FROM payment_authorizations WHERE id = p_auth_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Authorization % not found', p_auth_id;
  END IF;

  IF v_auth.status != 'pendiente' THEN
    RAISE EXCEPTION 'Authorization already processed (status: %)', v_auth.status;
  END IF;

  -- Get authorizer role and name
  SELECT role, full_name INTO v_user_role, v_authorizer_name
  FROM profiles WHERE id = p_authorizer_id;

  -- Validate role has sufficient level
  IF v_auth.required_level = 'L4' AND v_user_role NOT IN ('L4_ADMIN', 'L5_EJECUTIVO') THEN
    RAISE EXCEPTION 'L4+ authorization required. Your role: %', v_user_role;
  END IF;

  IF v_auth.required_level = 'L3' AND v_user_role NOT IN ('L3_TESORERIA', 'L4_ADMIN', 'L5_EJECUTIVO') THEN
    RAISE EXCEPTION 'L3+ authorization required. Your role: %', v_user_role;
  END IF;

  -- Update authorization
  UPDATE payment_authorizations
  SET status = p_decision,
      authorized_by = v_authorizer_name,
      rejection_reason = p_reason,
      updated_at = now()
  WHERE id = p_auth_id;

  -- Update payment status based on decision
  IF p_decision = 'autorizado' THEN
    UPDATE treasury_payments
    SET status = 'autorizado',
        authorized_by = v_authorizer_name,
        updated_at = now()
    WHERE id = v_auth.payment_id;
  ELSE
    UPDATE treasury_payments
    SET status = 'rechazado',
        updated_at = now()
    WHERE id = v_auth.payment_id;
  END IF;

  -- Audit
  INSERT INTO audit_log (user_id, action, resource_type, resource_id, details, severity)
  VALUES (
    p_authorizer_id,
    'payment.' || p_decision,
    'treasury_payment',
    v_auth.payment_id::text,
    jsonb_build_object(
      'auth_id', p_auth_id,
      'decision', p_decision,
      'amount', v_auth.amount,
      'required_level', v_auth.required_level,
      'reason', p_reason
    ),
    CASE WHEN p_decision = 'rechazado' THEN 'warning' ELSE 'info' END
  );

  RETURN jsonb_build_object(
    'success', true,
    'auth_id', p_auth_id,
    'payment_id', v_auth.payment_id,
    'decision', p_decision,
    'authorized_by', v_authorizer_name
  );
END;
$$;

-- ============================================
-- 5. PLD Auto-Alert Trigger on Transactions
-- ============================================

CREATE OR REPLACE FUNCTION check_pld_rules()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_alert_type VARCHAR(50);
  v_description TEXT;
  v_severity VARCHAR(10);
  v_risk_score INT;
  v_client_name TEXT;
  v_count_24h INT;
  v_sum_24h NUMERIC;
  v_is_pep BOOLEAN := false;
BEGIN
  -- Only check completed transactions
  IF NEW.status != 'completada' THEN
    RETURN NEW;
  END IF;

  -- Get client name
  v_client_name := COALESCE(
    CASE WHEN NEW.direction = 'OUT' THEN NEW.sender_name ELSE NEW.receiver_name END,
    (SELECT full_name FROM profiles WHERE id = NEW.user_id)
  );

  -- Check if user is PEP
  SELECT EXISTS (
    SELECT 1 FROM clients_pfae WHERE id::text = (SELECT curp FROM profiles WHERE id = NEW.user_id) AND is_pep = true
    UNION ALL
    SELECT 1 FROM kyc_verifications kv
    JOIN profiles p ON p.id = kv.user_id
    WHERE kv.user_id = NEW.user_id
    AND EXISTS (SELECT 1 FROM clients_pfae cpf WHERE cpf.curp = p.curp AND cpf.is_pep = true)
  ) INTO v_is_pep;

  -- Rule 1: Operación Relevante > $50,000 MXN (art. 17 LFPIORPI)
  IF NEW.amount >= 50000 THEN
    v_alert_type := 'operacion_relevante';
    v_description := 'Operación ≥ $50,000 MXN detectada. Monto: $' || NEW.amount::TEXT
                     || '. Tipo: ' || NEW.type || '. Cliente: ' || v_client_name;
    v_severity := 'media';
    v_risk_score := 30;

    INSERT INTO compliance_alerts (
      transaction_id, user_id, alert_type, description, severity, status,
      client_name, amount, risk_score
    ) VALUES (
      NEW.id, NEW.user_id, v_alert_type, v_description, v_severity, 'activa',
      v_client_name, NEW.amount, v_risk_score
    );
  END IF;

  -- Rule 2: Operación Preocupante > $150,000 MXN
  IF NEW.amount >= 150000 THEN
    v_alert_type := 'operacion_preocupante';
    v_description := 'Operación ≥ $150,000 MXN. Alta prioridad. Monto: $' || NEW.amount::TEXT
                     || '. Cliente: ' || v_client_name;
    v_severity := 'alta';
    v_risk_score := 65;

    INSERT INTO compliance_alerts (
      transaction_id, user_id, alert_type, description, severity, status,
      client_name, amount, risk_score
    ) VALUES (
      NEW.id, NEW.user_id, v_alert_type, v_description, v_severity, 'activa',
      v_client_name, NEW.amount, v_risk_score
    );
  END IF;

  -- Rule 3: Structuring detection (multiple transactions < $50K in 24h summing >= $50K)
  SELECT COUNT(*), COALESCE(SUM(amount), 0)
  INTO v_count_24h, v_sum_24h
  FROM transactions
  WHERE user_id = NEW.user_id
    AND status = 'completada'
    AND initiated_at >= (now() - INTERVAL '24 hours')
    AND id != NEW.id;

  -- Add current transaction
  v_sum_24h := v_sum_24h + NEW.amount;
  v_count_24h := v_count_24h + 1;

  IF v_count_24h >= 3 AND v_sum_24h >= 50000 AND NEW.amount < 50000 THEN
    v_alert_type := 'posible_fraccionamiento';
    v_description := 'Posible fraccionamiento de operaciones. '
                     || v_count_24h::TEXT || ' transacciones en 24h por total de $'
                     || v_sum_24h::TEXT || '. Cada operación individual < $50K.';
    v_severity := 'alta';
    v_risk_score := 75;

    INSERT INTO compliance_alerts (
      transaction_id, user_id, alert_type, description, severity, status,
      client_name, amount, risk_score
    ) VALUES (
      NEW.id, NEW.user_id, v_alert_type, v_description, v_severity, 'activa',
      v_client_name, v_sum_24h, v_risk_score
    );
  END IF;

  -- Rule 4: PEP transaction (any amount)
  IF v_is_pep AND NEW.amount >= 10000 THEN
    v_alert_type := 'operacion_pep';
    v_description := 'Transacción de Persona Políticamente Expuesta. Monto: $' || NEW.amount::TEXT
                     || '. Cliente: ' || v_client_name;
    v_severity := 'alta';
    v_risk_score := 60;

    INSERT INTO compliance_alerts (
      transaction_id, user_id, alert_type, description, severity, status,
      client_name, amount, risk_score
    ) VALUES (
      NEW.id, NEW.user_id, v_alert_type, v_description, v_severity, 'activa',
      v_client_name, NEW.amount, v_risk_score
    );
  END IF;

  -- Rule 5: International high-risk countries
  IF NEW.sender_rfc IS NOT NULL AND length(NEW.sender_rfc) > 0
     AND NEW.type IN ('SPEI_IN', 'SPEI_OUT')
     AND NEW.amount >= 25000 THEN
    -- Check if sender/receiver from high-risk country via fund_country
    IF EXISTS (
      SELECT 1 FROM clients_pfae
      WHERE rfc = COALESCE(NEW.sender_rfc, NEW.receiver_rfc)
        AND fund_country NOT IN ('México', 'Mexico', 'Estados Unidos', 'Canadá')
    ) THEN
      v_alert_type := 'pais_alto_riesgo';
      v_description := 'Transacción con fondos de país de alto riesgo. Monto: $' || NEW.amount::TEXT;
      v_severity := 'critica';
      v_risk_score := 85;

      INSERT INTO compliance_alerts (
        transaction_id, user_id, alert_type, description, severity, status,
        client_name, amount, risk_score
      ) VALUES (
        NEW.id, NEW.user_id, v_alert_type, v_description, v_severity, 'activa',
        v_client_name, NEW.amount, v_risk_score
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger on transaction completion
CREATE TRIGGER on_transaction_pld_check
  AFTER UPDATE ON transactions
  FOR EACH ROW
  WHEN (NEW.status = 'completada' AND (OLD.status IS DISTINCT FROM 'completada'))
  EXECUTE FUNCTION check_pld_rules();

-- Also on INSERT for direct completed inserts
CREATE TRIGGER on_transaction_insert_pld_check
  AFTER INSERT ON transactions
  FOR EACH ROW
  WHEN (NEW.status = 'completada')
  EXECUTE FUNCTION check_pld_rules();

-- ============================================
-- 6. Daily Balance & Interest Calculation
-- ============================================
-- Called by daily cron job (Edge Function: daily-closing)

CREATE OR REPLACE FUNCTION calculate_daily_balances()
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_credit RECORD;
  v_daily_interest NUMERIC;
  v_updated_count INT := 0;
  v_overdue_count INT := 0;
BEGIN
  FOR v_credit IN
    SELECT id, current_balance, annual_rate, next_payment_date, days_past_due, status
    FROM credits
    WHERE status IN ('vigente', 'vencido')
      AND current_balance > 0
  LOOP
    -- Calculate daily accrued interest: balance * (annual_rate / 365)
    v_daily_interest := ROUND(v_credit.current_balance * (v_credit.annual_rate / 100.0 / 365.0), 2);

    -- Update days past due
    IF v_credit.next_payment_date IS NOT NULL AND v_credit.next_payment_date < CURRENT_DATE THEN
      UPDATE credits
      SET days_past_due = CURRENT_DATE - next_payment_date,
          updated_at = now()
      WHERE id = v_credit.id;
      v_overdue_count := v_overdue_count + 1;
    ELSIF v_credit.days_past_due > 0 AND v_credit.next_payment_date >= CURRENT_DATE THEN
      -- Reset days_past_due if payment was made
      UPDATE credits
      SET days_past_due = 0,
          updated_at = now()
      WHERE id = v_credit.id;
    END IF;

    v_updated_count := v_updated_count + 1;
  END LOOP;

  -- The existing trigger update_mora_category() handles mora_category and status changes

  RETURN jsonb_build_object(
    'success', true,
    'date', CURRENT_DATE,
    'credits_processed', v_updated_count,
    'overdue_credits', v_overdue_count
  );
END;
$$;

-- ============================================
-- 7. Account Statement Generation
-- ============================================

CREATE OR REPLACE FUNCTION generate_account_statement(
  p_account_id UUID,
  p_from DATE,
  p_to DATE
)
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_account RECORD;
  v_transactions JSONB;
  v_opening_balance NUMERIC;
  v_closing_balance NUMERIC;
  v_total_deposits NUMERIC;
  v_total_withdrawals NUMERIC;
  v_total_fees NUMERIC;
  v_tx_count INT;
BEGIN
  -- Get account info
  SELECT * INTO v_account FROM accounts WHERE id = p_account_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account % not found', p_account_id;
  END IF;

  -- Calculate opening balance (balance_after of last transaction before p_from)
  SELECT COALESCE(balance_after, 0) INTO v_opening_balance
  FROM transactions
  WHERE account_id = p_account_id
    AND status = 'completada'
    AND completed_at < (p_from::timestamp AT TIME ZONE 'America/Mexico_City')
  ORDER BY completed_at DESC
  LIMIT 1;

  IF v_opening_balance IS NULL THEN
    v_opening_balance := 0;
  END IF;

  -- Get transactions in period
  SELECT
    COALESCE(json_agg(
      json_build_object(
        'id', t.id,
        'date', t.initiated_at,
        'type', t.type,
        'direction', t.direction,
        'concept', COALESCE(t.concepto, t.type),
        'reference', t.clave_rastreo,
        'amount', t.amount,
        'fee', t.fee,
        'total', t.total_amount,
        'balance_after', t.balance_after,
        'counterpart', CASE
          WHEN t.direction = 'OUT' THEN t.receiver_name
          ELSE t.sender_name
        END,
        'status', t.status
      ) ORDER BY t.initiated_at
    ), '[]'::json)::jsonb,
    COUNT(*),
    COALESCE(SUM(CASE WHEN t.direction = 'IN' AND t.status = 'completada' THEN t.total_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN t.direction = 'OUT' AND t.status = 'completada' THEN t.total_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN t.status = 'completada' THEN t.fee ELSE 0 END), 0)
  INTO v_transactions, v_tx_count, v_total_deposits, v_total_withdrawals, v_total_fees
  FROM transactions t
  WHERE t.account_id = p_account_id
    AND t.initiated_at >= (p_from::timestamp AT TIME ZONE 'America/Mexico_City')
    AND t.initiated_at < ((p_to + INTERVAL '1 day')::timestamp AT TIME ZONE 'America/Mexico_City');

  v_closing_balance := v_opening_balance + v_total_deposits - v_total_withdrawals;

  RETURN jsonb_build_object(
    'account', jsonb_build_object(
      'id', v_account.id,
      'account_number', v_account.account_number,
      'clabe', v_account.clabe,
      'type', v_account.account_type,
      'currency', v_account.currency,
      'holder', (SELECT full_name FROM profiles WHERE id = v_account.user_id)
    ),
    'period', jsonb_build_object(
      'from', p_from,
      'to', p_to
    ),
    'summary', jsonb_build_object(
      'opening_balance', v_opening_balance,
      'closing_balance', v_closing_balance,
      'current_balance', v_account.balance,
      'total_deposits', v_total_deposits,
      'total_withdrawals', v_total_withdrawals,
      'total_fees', v_total_fees,
      'transaction_count', v_tx_count
    ),
    'transactions', v_transactions,
    'generated_at', now()
  );
END;
$$;

-- ============================================
-- 8. Commission Calculation
-- ============================================
-- Calculates commissions for a given period based on disbursed credits

CREATE OR REPLACE FUNCTION calculate_commissions(
  p_period VARCHAR  -- e.g., '2026-03'
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_credit RECORD;
  v_lead RECORD;
  v_commission_rate NUMERIC;
  v_commission_amount NUMERIC;
  v_total_commissions NUMERIC := 0;
  v_count INT := 0;
  v_period_start DATE;
  v_period_end DATE;
BEGIN
  -- Parse period
  v_period_start := (p_period || '-01')::DATE;
  v_period_end := (v_period_start + INTERVAL '1 month')::DATE;

  -- For each credit disbursed in the period
  FOR v_credit IN
    SELECT c.id, c.user_id, c.product_id, c.original_amount, c.annual_rate,
           ca.id AS application_id,
           cp.commission_rate AS product_commission_rate
    FROM credits c
    JOIN credit_applications ca ON ca.id = c.application_id
    JOIN credit_products cp ON cp.id = c.product_id
    WHERE c.disbursed_at >= v_period_start
      AND c.disbursed_at < v_period_end
      AND c.status IN ('vigente', 'vencido', 'liquidado')
      -- No duplicate commissions
      AND NOT EXISTS (
        SELECT 1 FROM commissions com
        WHERE com.credit_id = c.id AND com.period = p_period
      )
  LOOP
    v_commission_rate := v_credit.product_commission_rate;
    v_commission_amount := ROUND(v_credit.original_amount * (v_commission_rate / 100.0), 2);

    -- Find the lead/executive who originated this
    SELECT * INTO v_lead
    FROM leads
    WHERE product = v_credit.product_id
      AND assigned_to IS NOT NULL
      AND stage = 'dispersado'
    ORDER BY created_at DESC
    LIMIT 1;

    -- Insert commission record if we found an executive
    IF v_lead.assigned_to IS NOT NULL THEN
      INSERT INTO commissions (
        executive_id, credit_id, lead_id, product,
        client_name, disbursed_amount,
        commission_rate, commission_amount,
        status, period
      ) VALUES (
        v_lead.assigned_to,
        v_credit.id,
        v_lead.id,
        v_credit.product_id,
        (SELECT full_name FROM profiles WHERE id = v_credit.user_id),
        v_credit.original_amount,
        v_commission_rate,
        v_commission_amount,
        'pendiente',
        p_period
      );

      v_total_commissions := v_total_commissions + v_commission_amount;
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'period', p_period,
    'commissions_generated', v_count,
    'total_amount', v_total_commissions
  );
END;
$$;

-- ============================================
-- 9. KYC Level Progression
-- ============================================

CREATE OR REPLACE FUNCTION advance_kyc_level(
  p_user_id UUID,
  p_target_level INT
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_profile RECORD;
  v_kyc RECORD;
  v_can_advance BOOLEAN := false;
BEGIN
  -- Get profile
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User % not found', p_user_id;
  END IF;

  -- Validate target level
  IF p_target_level NOT BETWEEN 1 AND 3 THEN
    RAISE EXCEPTION 'Target level must be between 1 and 3';
  END IF;

  IF p_target_level <= v_profile.kyc_level THEN
    RAISE EXCEPTION 'Target level (%) must be higher than current level (%)', p_target_level, v_profile.kyc_level;
  END IF;

  -- Must advance sequentially
  IF p_target_level != v_profile.kyc_level + 1 THEN
    RAISE EXCEPTION 'Must advance one level at a time. Current: %, Target: %', v_profile.kyc_level, p_target_level;
  END IF;

  -- Get latest KYC verification
  SELECT * INTO v_kyc
  FROM kyc_verifications
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;

  -- Validate requirements per level
  CASE p_target_level
    WHEN 1 THEN
      -- Level 1: Basic (name, email, phone verified)
      IF v_kyc IS NOT NULL THEN
        v_can_advance := v_kyc.full_name_verified AND v_kyc.email_verified AND v_kyc.phone_verified;
      END IF;
    WHEN 2 THEN
      -- Level 2: Identity (INE + selfie + CURP/RFC)
      IF v_kyc IS NOT NULL THEN
        v_can_advance := v_kyc.ine_front_url IS NOT NULL
                         AND v_kyc.selfie_url IS NOT NULL
                         AND v_kyc.curp_verified;
        -- Must have approved documents
        IF v_can_advance THEN
          v_can_advance := EXISTS (
            SELECT 1 FROM kyc_documents
            WHERE user_id = p_user_id
              AND document_type IN ('ine_front', 'ine_back', 'selfie')
              AND status = 'approved'
            HAVING COUNT(DISTINCT document_type) >= 2
          );
        END IF;
      END IF;
    WHEN 3 THEN
      -- Level 3: Address + advanced (proof of address + liveness)
      IF v_kyc IS NOT NULL THEN
        v_can_advance := v_kyc.address_verified
                         AND v_kyc.proof_of_address_url IS NOT NULL;
        IF v_can_advance THEN
          v_can_advance := EXISTS (
            SELECT 1 FROM kyc_documents
            WHERE user_id = p_user_id
              AND document_type = 'proof_of_address'
              AND status = 'approved'
          );
        END IF;
      END IF;
  END CASE;

  IF NOT v_can_advance THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Requirements not met for level ' || p_target_level,
      'current_level', v_profile.kyc_level,
      'target_level', p_target_level
    );
  END IF;

  -- Update profile KYC level
  UPDATE profiles
  SET kyc_level = p_target_level,
      kyc_status = CASE WHEN p_target_level = 3 THEN 'verified' ELSE 'in_progress' END,
      updated_at = now()
  WHERE id = p_user_id;

  -- Update KYC verification record
  IF v_kyc IS NOT NULL THEN
    UPDATE kyc_verifications
    SET level = p_target_level,
        status = CASE WHEN p_target_level = 3 THEN 'verified' ELSE 'in_progress' END,
        verified_at = CASE WHEN p_target_level = 3 THEN now() ELSE verified_at END,
        updated_at = now()
    WHERE id = v_kyc.id;
  END IF;

  -- Audit log
  INSERT INTO audit_log (user_id, action, resource_type, resource_id, details)
  VALUES (
    p_user_id,
    'kyc.level_advanced',
    'profile',
    p_user_id::text,
    jsonb_build_object(
      'previous_level', v_profile.kyc_level,
      'new_level', p_target_level,
      'email', v_profile.email
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'previous_level', v_profile.kyc_level,
    'new_level', p_target_level,
    'kyc_status', CASE WHEN p_target_level = 3 THEN 'verified' ELSE 'in_progress' END
  );
END;
$$;

-- ============================================
-- 10. Folio Generators (Auto-sequential)
-- ============================================

-- Generate sequential folio for credit origination
CREATE OR REPLACE FUNCTION generate_origination_folio()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
  v_seq INT;
BEGIN
  IF NEW.folio IS NULL OR NEW.folio = '' THEN
    SELECT COALESCE(MAX(
      CASE WHEN folio ~ '^ORI-[0-9]{8}-[0-9]+$'
        THEN split_part(folio, '-', 3)::INT
        ELSE 0
      END
    ), 0) + 1
    INTO v_seq
    FROM credit_origination_applications
    WHERE folio LIKE 'ORI-' || to_char(now(), 'YYYYMMDD') || '-%';

    NEW.folio := 'ORI-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(v_seq::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER before_insert_orig_app_folio
  BEFORE INSERT ON credit_origination_applications
  FOR EACH ROW
  EXECUTE FUNCTION generate_origination_folio();

-- Generate sequential folio for treasury payments
CREATE OR REPLACE FUNCTION generate_treasury_folio()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
  v_seq INT;
BEGIN
  IF NEW.folio IS NULL OR NEW.folio = '' THEN
    SELECT COALESCE(MAX(
      CASE WHEN folio ~ '^PAG-[0-9]{8}-[0-9]+$'
        THEN split_part(folio, '-', 3)::INT
        ELSE 0
      END
    ), 0) + 1
    INTO v_seq
    FROM treasury_payments
    WHERE folio LIKE 'PAG-' || to_char(now(), 'YYYYMMDD') || '-%';

    NEW.folio := 'PAG-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(v_seq::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER before_insert_treasury_folio
  BEFORE INSERT ON treasury_payments
  FOR EACH ROW
  EXECUTE FUNCTION generate_treasury_folio();

-- Generate sequential folio for dispositions
CREATE OR REPLACE FUNCTION generate_disposition_folio()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
  v_seq INT;
BEGIN
  IF NEW.folio IS NULL OR NEW.folio = '' THEN
    SELECT COALESCE(MAX(
      CASE WHEN folio ~ '^DIS-[0-9]{8}-[0-9]+$'
        THEN split_part(folio, '-', 3)::INT
        ELSE 0
      END
    ), 0) + 1
    INTO v_seq
    FROM dispositions
    WHERE folio LIKE 'DIS-' || to_char(now(), 'YYYYMMDD') || '-%';

    NEW.folio := 'DIS-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(v_seq::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER before_insert_disposition_folio
  BEFORE INSERT ON dispositions
  FOR EACH ROW
  EXECUTE FUNCTION generate_disposition_folio();

-- ============================================
-- 11. Missing Indexes & Optimizations
-- ============================================

-- Composite index for account statement generation
CREATE INDEX IF NOT EXISTS idx_transactions_account_date
  ON transactions(account_id, initiated_at DESC);

-- Compliance alerts: by type for PLD dashboard
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_type
  ON compliance_alerts(alert_type);

-- Credits: by next_payment_date for daily closing
CREATE INDEX IF NOT EXISTS idx_credits_next_payment
  ON credits(next_payment_date)
  WHERE status IN ('vigente', 'vencido');

-- Commissions: by period for monthly calculation
CREATE INDEX IF NOT EXISTS idx_commissions_period
  ON commissions(period);

-- Treasury payments: by date range for reports
CREATE INDEX IF NOT EXISTS idx_treasury_date_status
  ON treasury_payments(date, status);

-- Credit origination: by created_at for pipeline views
CREATE INDEX IF NOT EXISTS idx_orig_apps_created
  ON credit_origination_applications(created_at DESC);

-- KYC: composite for level checks
CREATE INDEX IF NOT EXISTS idx_kyc_user_level
  ON kyc_verifications(user_id, level);

-- KYC documents: for level validation queries
CREATE INDEX IF NOT EXISTS idx_kyc_docs_user_type_status
  ON kyc_documents(user_id, document_type, status);

-- ============================================
-- 12. Updated_at Triggers for Phase 5 Tables
-- ============================================

-- Some Phase 5 tables were missing updated_at triggers
CREATE TRIGGER set_updated_at_credit_lines
  BEFORE UPDATE ON credit_lines
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_dispositions
  BEFORE UPDATE ON dispositions
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_treasury
  BEFORE UPDATE ON treasury_payments
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_batches_pay
  BEFORE UPDATE ON payment_batches
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_auth
  BEFORE UPDATE ON payment_authorizations
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_clients_pfae
  BEFORE UPDATE ON clients_pfae
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_clients_pm
  BEFORE UPDATE ON clients_pm
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_orig_apps
  BEFORE UPDATE ON credit_origination_applications
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
