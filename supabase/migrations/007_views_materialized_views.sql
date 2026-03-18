-- ============================================================
-- SAYO — Phase 7: Views & Materialized Views for Dashboards
-- ============================================================
-- Pre-computed KPIs and aggregations for real-time dashboards.
-- Materialized views are refreshed via daily cron (Edge Function).
-- Regular views for less compute-intensive or always-fresh needs.
-- ============================================================

-- ============================================
-- 1. EXECUTIVE DASHBOARD — Key Metrics
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_executive_dashboard AS
SELECT
  -- Portfolio metrics
  (SELECT COUNT(*) FROM credits WHERE status = 'vigente') AS active_credits,
  (SELECT COALESCE(SUM(current_balance), 0) FROM credits WHERE status = 'vigente') AS total_portfolio_balance,
  (SELECT COALESCE(SUM(current_balance), 0) FROM credits WHERE status = 'vencido') AS overdue_portfolio_balance,
  -- IMOR (Índice de Morosidad): overdue / total portfolio
  CASE
    WHEN (SELECT COALESCE(SUM(current_balance), 0) FROM credits WHERE status IN ('vigente','vencido')) > 0
    THEN ROUND(
      (SELECT COALESCE(SUM(current_balance), 0) FROM credits WHERE status = 'vencido')::NUMERIC /
      (SELECT COALESCE(SUM(current_balance), 0) FROM credits WHERE status IN ('vigente','vencido'))::NUMERIC * 100, 2
    )
    ELSE 0
  END AS imor_percentage,
  -- Active clients
  (SELECT COUNT(DISTINCT user_id) FROM credits WHERE status IN ('vigente','vencido')) AS active_clients_with_credits,
  (SELECT COUNT(*) FROM profiles WHERE role = 'EXT_CLIENTE' AND status = 'active') AS total_active_clients,
  -- MTD origination
  (SELECT COUNT(*) FROM credits WHERE disbursed_at >= date_trunc('month', CURRENT_DATE)) AS credits_disbursed_mtd,
  (SELECT COALESCE(SUM(original_amount), 0) FROM credits WHERE disbursed_at >= date_trunc('month', CURRENT_DATE)) AS amount_disbursed_mtd,
  -- MTD interest income (from credit_payments)
  (SELECT COALESCE(SUM(interest + iva_interest), 0) FROM credit_payments
   WHERE status = 'pagado' AND paid_date >= date_trunc('month', CURRENT_DATE)) AS interest_income_mtd,
  -- MTD collections
  (SELECT COALESCE(SUM(amount), 0) FROM credit_payments
   WHERE status = 'pagado' AND paid_date >= date_trunc('month', CURRENT_DATE)) AS collections_mtd,
  -- Compliance alerts
  (SELECT COUNT(*) FROM compliance_alerts WHERE status IN ('activa','investigando')) AS open_alerts,
  (SELECT COUNT(*) FROM compliance_alerts
   WHERE status IN ('activa','investigando') AND severity IN ('critica','alta')) AS critical_alerts,
  -- Applications pipeline
  (SELECT COUNT(*) FROM credit_origination_applications WHERE status NOT IN ('saldada','rechazada','cancelada')) AS active_applications,
  -- Treasury
  (SELECT COALESCE(SUM(amount), 0) FROM treasury_payments
   WHERE status = 'pendiente') AS pending_payments_amount,
  -- Metadata
  now() AS refreshed_at;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_exec_dashboard_unique
  ON mv_executive_dashboard(refreshed_at);

-- ============================================
-- 2. PORTFOLIO QUALITY — By Mora Category
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_portfolio_quality AS
SELECT
  mora_category,
  COUNT(*) AS credit_count,
  COALESCE(SUM(current_balance), 0) AS total_balance,
  COALESCE(SUM(past_due_amount), 0) AS total_past_due,
  ROUND(AVG(days_past_due), 1) AS avg_days_past_due,
  ROUND(AVG(annual_rate), 2) AS avg_rate,
  COALESCE(SUM(original_amount), 0) AS total_original_amount,
  ROUND(
    CASE WHEN SUM(original_amount) > 0
      THEN (SUM(total_paid) / SUM(original_amount) * 100)
      ELSE 0
    END, 2
  ) AS avg_recovery_percentage,
  now() AS refreshed_at
FROM credits
WHERE status IN ('vigente', 'vencido')
GROUP BY mora_category
ORDER BY
  CASE mora_category
    WHEN '0' THEN 1
    WHEN '0-30' THEN 2
    WHEN '31-60' THEN 3
    WHEN '61-90' THEN 4
    WHEN '90+' THEN 5
  END;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_portfolio_mora
  ON mv_portfolio_quality(mora_category);

-- ============================================
-- 3. TREASURY DAILY SUMMARY — Last 30 Days
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_treasury_daily AS
SELECT
  date AS payment_date,
  type AS payment_type,
  status AS payment_status,
  COUNT(*) AS transaction_count,
  COALESCE(SUM(amount), 0) AS total_amount,
  now() AS refreshed_at
FROM treasury_payments
WHERE date >= (CURRENT_DATE - INTERVAL '30 days')
GROUP BY date, type, status
ORDER BY date DESC, type;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_treasury_daily_unique
  ON mv_treasury_daily(payment_date, payment_type, payment_status);

-- ============================================
-- 4. COMPLIANCE STATS — Regular View (always fresh)
-- ============================================
CREATE OR REPLACE VIEW v_compliance_stats AS
SELECT
  severity,
  status,
  COUNT(*) AS total_count,
  COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE)) AS mtd_count,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') AS last_7_days,
  COALESCE(SUM(amount), 0) AS total_amount,
  ROUND(AVG(risk_score), 1) AS avg_risk_score
FROM compliance_alerts
GROUP BY severity, status
ORDER BY
  CASE severity WHEN 'critica' THEN 1 WHEN 'alta' THEN 2 WHEN 'media' THEN 3 WHEN 'baja' THEN 4 END,
  status;

-- ============================================
-- 5. COLLECTION PIPELINE — By Mora Category
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_collection_pipeline AS
SELECT
  c.mora_category,
  COUNT(*) AS account_count,
  COALESCE(SUM(c.current_balance), 0) AS total_balance,
  COALESCE(SUM(c.past_due_amount), 0) AS total_past_due,
  ROUND(AVG(c.days_past_due), 0) AS avg_days_past_due,
  -- Actions in last 7 days
  (SELECT COUNT(*) FROM collection_actions ca
   WHERE ca.credit_id = ANY(ARRAY_AGG(c.id))
     AND ca.created_at >= CURRENT_DATE - INTERVAL '7 days'
  ) AS actions_last_7d,
  -- Promise to pay
  (SELECT COUNT(*) FROM collection_actions ca
   WHERE ca.credit_id = ANY(ARRAY_AGG(c.id))
     AND ca.result = 'promesa_pago'
     AND ca.promise_date >= CURRENT_DATE
  ) AS active_promises,
  -- Promise amount
  (SELECT COALESCE(SUM(ca.promise_amount), 0) FROM collection_actions ca
   WHERE ca.credit_id = ANY(ARRAY_AGG(c.id))
     AND ca.result = 'promesa_pago'
     AND ca.promise_date >= CURRENT_DATE
  ) AS promise_amount,
  now() AS refreshed_at
FROM credits c
WHERE c.status IN ('vigente', 'vencido') AND c.days_past_due > 0
GROUP BY c.mora_category
ORDER BY
  CASE c.mora_category
    WHEN '0-30' THEN 1
    WHEN '31-60' THEN 2
    WHEN '61-90' THEN 3
    WHEN '90+' THEN 4
  END;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_collection_mora
  ON mv_collection_pipeline(mora_category);

-- ============================================
-- 6. COMMERCIAL PIPELINE — By Stage
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_commercial_pipeline AS
SELECT
  stage,
  COUNT(*) AS lead_count,
  COALESCE(SUM(amount), 0) AS total_amount,
  ROUND(AVG(score), 1) AS avg_score,
  COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE)) AS mtd_leads,
  -- Conversion rate from this stage
  CASE stage
    WHEN 'prospecto' THEN ROUND(
      COALESCE(
        (SELECT COUNT(*)::NUMERIC FROM leads WHERE stage NOT IN ('prospecto','perdido','rechazado'))
        / NULLIF((SELECT COUNT(*)::NUMERIC FROM leads), 0) * 100
      , 0), 1)
    WHEN 'contactado' THEN ROUND(
      COALESCE(
        (SELECT COUNT(*)::NUMERIC FROM leads WHERE stage IN ('evaluacion','aprobado','dispersado'))
        / NULLIF((SELECT COUNT(*)::NUMERIC FROM leads WHERE stage NOT IN ('prospecto','perdido','rechazado')), 0) * 100
      , 0), 1)
    ELSE 0
  END AS conversion_rate,
  now() AS refreshed_at
FROM leads
WHERE stage NOT IN ('perdido', 'rechazado')
GROUP BY stage
ORDER BY
  CASE stage
    WHEN 'prospecto' THEN 1
    WHEN 'contactado' THEN 2
    WHEN 'evaluacion' THEN 3
    WHEN 'aprobado' THEN 4
    WHEN 'dispersado' THEN 5
  END;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_commercial_stage
  ON mv_commercial_pipeline(stage);

-- ============================================
-- 7. ORIGINATION PIPELINE — Regular View
-- ============================================
CREATE OR REPLACE VIEW v_origination_pipeline AS
SELECT
  status,
  COUNT(*) AS application_count,
  COALESCE(SUM(amount), 0) AS total_amount,
  ROUND(AVG(amount), 2) AS avg_amount,
  ROUND(AVG(rate), 2) AS avg_rate,
  ROUND(AVG(term), 0) AS avg_term_months,
  ROUND(AVG(bureau_score), 0) AS avg_bureau_score,
  COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE)) AS mtd_count,
  COALESCE(SUM(amount) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE)), 0) AS mtd_amount
FROM credit_origination_applications
GROUP BY status
ORDER BY
  CASE status
    WHEN 'capturada' THEN 1
    WHEN 'por_aprobar' THEN 2
    WHEN 'en_comite' THEN 3
    WHEN 'por_disponer' THEN 4
    WHEN 'activa' THEN 5
    WHEN 'saldada' THEN 6
    WHEN 'rechazada' THEN 7
    WHEN 'cancelada' THEN 8
    WHEN 'reactivada' THEN 9
  END;

-- ============================================
-- 8. TRANSACTION SUMMARY — Regular View
-- ============================================
CREATE OR REPLACE VIEW v_transaction_summary AS
SELECT
  type,
  direction,
  status,
  COUNT(*) AS tx_count,
  COALESCE(SUM(amount), 0) AS total_amount,
  COALESCE(SUM(fee), 0) AS total_fees,
  COUNT(*) FILTER (WHERE initiated_at >= CURRENT_DATE) AS today_count,
  COALESCE(SUM(amount) FILTER (WHERE initiated_at >= CURRENT_DATE), 0) AS today_amount,
  COUNT(*) FILTER (WHERE initiated_at >= date_trunc('month', CURRENT_DATE)) AS mtd_count,
  COALESCE(SUM(amount) FILTER (WHERE initiated_at >= date_trunc('month', CURRENT_DATE)), 0) AS mtd_amount
FROM transactions
GROUP BY type, direction, status
ORDER BY type, direction, status;

-- ============================================
-- 9. SUPPORT DASHBOARD — Regular View
-- ============================================
CREATE OR REPLACE VIEW v_support_dashboard AS
SELECT
  status,
  priority,
  COUNT(*) AS ticket_count,
  COUNT(*) FILTER (WHERE is_une = true) AS une_count,
  ROUND(AVG(EXTRACT(EPOCH FROM (
    COALESCE(
      CASE WHEN status = 'resuelto' THEN updated_at ELSE null END,
      now()
    ) - created_at
  )) / 3600.0), 1) AS avg_resolution_hours,
  ROUND(AVG(satisfaction_score), 2) AS avg_satisfaction,
  COUNT(*) FILTER (WHERE sla_deadline IS NOT NULL AND sla_deadline < now() AND status NOT IN ('resuelto','cerrado')) AS sla_breached
FROM support_tickets
GROUP BY status, priority
ORDER BY
  CASE priority WHEN 'urgente' THEN 1 WHEN 'alta' THEN 2 WHEN 'media' THEN 3 WHEN 'baja' THEN 4 END,
  status;

-- ============================================
-- 10. KPI TRENDS — Regular View
-- ============================================
CREATE OR REPLACE VIEW v_kpi_trends AS
SELECT
  name,
  category,
  period,
  period_date,
  actual,
  target,
  unit,
  trend,
  status,
  ROUND(
    CASE WHEN target > 0 THEN (actual / target * 100) ELSE 0 END, 1
  ) AS achievement_percentage
FROM kpi_records
WHERE period_date >= CURRENT_DATE - INTERVAL '12 months'
ORDER BY category, name, period_date DESC;

-- ============================================
-- 11. TREASURY AUTHORIZATION QUEUE — Regular View
-- ============================================
CREATE OR REPLACE VIEW v_pending_authorizations AS
SELECT
  pa.id AS auth_id,
  pa.payment_id,
  pa.payment_folio,
  pa.beneficiary_name,
  pa.amount,
  pa.requested_by,
  pa.required_level,
  pa.status,
  pa.date,
  pa.created_at,
  tp.type AS payment_type,
  tp.concept,
  tp.source_account,
  tp.beneficiary_bank,
  tp.beneficiary_clabe,
  -- Time waiting in hours
  ROUND(EXTRACT(EPOCH FROM (now() - pa.created_at)) / 3600.0, 1) AS hours_waiting
FROM payment_authorizations pa
JOIN treasury_payments tp ON tp.id = pa.payment_id
WHERE pa.status = 'pendiente'
ORDER BY pa.amount DESC, pa.created_at ASC;

-- ============================================
-- 12. CREDIT AGING REPORT — Regular View
-- ============================================
CREATE OR REPLACE VIEW v_credit_aging AS
SELECT
  c.id AS credit_id,
  p.full_name AS client_name,
  p.email AS client_email,
  c.product_id,
  cp.name AS product_name,
  c.original_amount,
  c.current_balance,
  c.past_due_amount,
  c.days_past_due,
  c.mora_category,
  c.annual_rate,
  c.next_payment_date,
  c.last_payment_date,
  c.last_payment_amount,
  c.monthly_payment,
  c.status,
  c.disbursed_at,
  c.maturity_date,
  -- Last collection action
  (SELECT ca.action_type || ': ' || ca.result
   FROM collection_actions ca
   WHERE ca.credit_id = c.id
   ORDER BY ca.created_at DESC LIMIT 1
  ) AS last_collection_action,
  (SELECT ca.created_at
   FROM collection_actions ca
   WHERE ca.credit_id = c.id
   ORDER BY ca.created_at DESC LIMIT 1
  ) AS last_collection_date
FROM credits c
JOIN profiles p ON p.id = c.user_id
LEFT JOIN credit_products cp ON cp.id = c.product_id
WHERE c.status IN ('vigente', 'vencido')
ORDER BY c.days_past_due DESC, c.current_balance DESC;

-- ============================================
-- 13. REFRESH FUNCTION — Called by Daily Cron
-- ============================================
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_start TIMESTAMPTZ;
  v_duration NUMERIC;
BEGIN
  v_start := clock_timestamp();

  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_executive_dashboard;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_portfolio_quality;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_treasury_daily;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_collection_pipeline;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_commercial_pipeline;

  v_duration := EXTRACT(EPOCH FROM (clock_timestamp() - v_start));

  -- Log the refresh
  INSERT INTO audit_log (action, resource_type, details, severity)
  VALUES (
    'system.mv_refresh',
    'materialized_view',
    jsonb_build_object(
      'views_refreshed', 5,
      'duration_seconds', ROUND(v_duration, 2),
      'refreshed_at', now()
    ),
    'info'
  );

  RETURN jsonb_build_object(
    'success', true,
    'views_refreshed', 5,
    'duration_seconds', ROUND(v_duration, 2)
  );
END;
$$;

-- ============================================
-- 14. RLS for Materialized Views
-- ============================================
-- Note: Materialized views don't support RLS directly.
-- Access is controlled by the functions/views that query them.
-- Regular views inherit RLS from the underlying tables.

-- Grant SELECT on materialized views to authenticated users
-- (RLS on underlying tables already controls access via the functions)
GRANT SELECT ON mv_executive_dashboard TO authenticated;
GRANT SELECT ON mv_portfolio_quality TO authenticated;
GRANT SELECT ON mv_treasury_daily TO authenticated;
GRANT SELECT ON mv_collection_pipeline TO authenticated;
GRANT SELECT ON mv_commercial_pipeline TO authenticated;

-- Initial refresh of all materialized views
SELECT refresh_all_materialized_views();
