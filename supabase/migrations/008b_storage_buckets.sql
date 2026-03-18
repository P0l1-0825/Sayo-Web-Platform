-- ============================================================
-- SAYO — Phase 8b: Storage Buckets & RLS Policies
-- ============================================================
-- Supabase Storage configuration for document management
-- ============================================================

-- ============================================
-- 1. CREATE STORAGE BUCKETS
-- ============================================

-- KYC Documents — INE, selfie, proof of address, CURP, RFC
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc-documents',
  'kyc-documents',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Account Statements — Generated PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'account-statements',
  'account-statements',
  false,
  5242880, -- 5MB
  ARRAY['application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Credit Documents — Contracts, pagarés, approval letters
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'credit-documents',
  'credit-documents',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO NOTHING;

-- CNBV Reports — Regulatory reports (ROI, ROP, RO24H)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cnbv-reports',
  'cnbv-reports',
  false,
  20971520, -- 20MB
  ARRAY['application/pdf', 'application/xml', 'text/xml', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
) ON CONFLICT (id) DO NOTHING;

-- Profile Avatars — User profile photos (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-avatars',
  'profile-avatars',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Company Logos — For PM clients and branding
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logos',
  'company-logos',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Payment Receipts — SPEI vouchers, payment proofs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-receipts',
  'payment-receipts',
  false,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. STORAGE RLS POLICIES
-- ============================================

-- ---- KYC DOCUMENTS ----
-- Users can upload their own KYC documents
CREATE POLICY "kyc_upload_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'kyc-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can view their own KYC documents
CREATE POLICY "kyc_read_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'kyc-documents'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role IN ('L3_PLD', 'L4_ADMIN', 'L5_EJECUTIVO')
      )
    )
  );

-- PLD/Admin can view all KYC documents
CREATE POLICY "kyc_admin_read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'kyc-documents'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('L3_PLD', 'L4_ADMIN', 'L5_EJECUTIVO')
    )
  );

-- ---- ACCOUNT STATEMENTS ----
-- Users can read their own statements
CREATE POLICY "statements_read_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'account-statements'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role IN ('L3_BACKOFFICE', 'L4_ADMIN', 'L5_EJECUTIVO')
      )
    )
  );

-- System can create statements (via service role)
CREATE POLICY "statements_insert_system"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'account-statements'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('L3_BACKOFFICE', 'L4_ADMIN')
    )
  );

-- ---- CREDIT DOCUMENTS ----
-- Origination staff can upload credit documents
CREATE POLICY "credit_docs_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'credit-documents'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('L3_ORIGINACION', 'L4_ADMIN')
    )
  );

-- Origination and admin can read credit documents
CREATE POLICY "credit_docs_read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'credit-documents'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('L3_ORIGINACION', 'L4_ADMIN', 'L5_EJECUTIVO', 'L3_BACKOFFICE')
    )
  );

-- ---- CNBV REPORTS ----
-- PLD staff can manage CNBV reports
CREATE POLICY "cnbv_reports_manage"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'cnbv-reports'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('L3_PLD', 'L4_ADMIN', 'L5_EJECUTIVO')
    )
  );

-- ---- PROFILE AVATARS ----
-- Anyone can read avatars (bucket is public)
CREATE POLICY "avatars_read_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-avatars');

-- Users can upload their own avatar
CREATE POLICY "avatars_upload_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own avatar
CREATE POLICY "avatars_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own avatar
CREATE POLICY "avatars_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---- COMPANY LOGOS ----
-- Anyone can read logos (bucket is public)
CREATE POLICY "logos_read_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'company-logos');

-- Admin can manage logos
CREATE POLICY "logos_manage"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'company-logos'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('L4_ADMIN', 'L3_MARKETING')
    )
  );

-- ---- PAYMENT RECEIPTS ----
-- Users can upload payment receipts
CREATE POLICY "receipts_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'payment-receipts'
    AND auth.uid() IS NOT NULL
  );

-- Users can view their own + treasury staff can view all
CREATE POLICY "receipts_read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'payment-receipts'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role IN ('L3_TESORERIA', 'L4_ADMIN', 'L5_EJECUTIVO')
      )
    )
  );
