-- ============================================================
-- SAYO — Phase 9: Real-time Publication & Cron Jobs
-- ============================================================
-- Enables Supabase Realtime on critical tables for live updates.
-- Configures pg_cron for scheduled tasks.
-- ============================================================

-- ============================================
-- 1. ENABLE REAL-TIME ON CRITICAL TABLES
-- ============================================
-- These tables push live updates to connected clients.

-- Transactions — live balance updates, transfer status
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

-- Compliance alerts — instant PLD notifications
ALTER PUBLICATION supabase_realtime ADD TABLE compliance_alerts;

-- Payment authorizations — treasury approval workflow
ALTER PUBLICATION supabase_realtime ADD TABLE payment_authorizations;

-- Support tickets — live ticket updates
ALTER PUBLICATION supabase_realtime ADD TABLE support_tickets;

-- Credit origination — application status changes
ALTER PUBLICATION supabase_realtime ADD TABLE credit_origination_applications;

-- Notifications — instant in-app notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Collection actions — live cobranza updates
ALTER PUBLICATION supabase_realtime ADD TABLE collection_actions;

-- ============================================
-- 2. CRON JOBS (pg_cron extension)
-- ============================================
-- Note: pg_cron must be enabled in Supabase dashboard.
-- These are reference statements; actual scheduling is
-- done via Supabase Dashboard > Database > Extensions > pg_cron.

-- Daily closing at 2:00 AM CST (8:00 AM UTC)
-- SELECT cron.schedule(
--   'daily-closing',
--   '0 8 * * *',
--   $$SELECT net.http_post(
--     url := current_setting('app.settings.supabase_url') || '/functions/v1/daily-closing',
--     headers := jsonb_build_object(
--       'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
--       'Content-Type', 'application/json'
--     ),
--     body := '{}'::jsonb
--   )$$
-- );

-- Refresh materialized views every 4 hours
-- SELECT cron.schedule(
--   'refresh-mv-views',
--   '0 */4 * * *',
--   $$SELECT refresh_all_materialized_views()$$
-- );

-- Monthly ROI report generation (1st of each month at 6 AM)
-- SELECT cron.schedule(
--   'monthly-roi-report',
--   '0 12 1 * *',
--   $$SELECT net.http_post(
--     url := current_setting('app.settings.supabase_url') || '/functions/v1/generate-cnbv-report',
--     headers := jsonb_build_object(
--       'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
--       'Content-Type', 'application/json'
--     ),
--     body := jsonb_build_object(
--       'type', 'ROI',
--       'period', to_char(CURRENT_DATE - INTERVAL '1 month', 'YYYY-MM')
--     )
--   )$$
-- );
