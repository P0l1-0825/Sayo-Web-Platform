-- ============================================================
-- SAYO Web Platform — Supabase Migration 001: Auth Schema
-- ============================================================
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES — extends Supabase auth.users
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  curp TEXT,
  rfc TEXT,
  role TEXT NOT NULL DEFAULT 'EXT_CLIENTE' CHECK (role IN (
    'L2_OPERADOR', 'L2_GESTOR', 'L2_COMERCIAL', 'L2_SOPORTE',
    'L3_BACKOFFICE', 'L3_PLD', 'L3_MARKETING',
    'L4_SEGURIDAD', 'L4_ADMIN',
    'L5_EJECUTIVO',
    'EXT_CLIENTE'
  )),
  portal TEXT NOT NULL DEFAULT 'cliente' CHECK (portal IN (
    'mesa-control', 'cumplimiento', 'cobranza', 'comercial',
    'soporte', 'seguridad', 'marketing', 'ejecutivo',
    'admin', 'cliente', 'sayo-mx'
  )),
  department TEXT,
  position TEXT,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  kyc_status TEXT NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'in_progress', 'verified', 'rejected')),
  kyc_level INTEGER NOT NULL DEFAULT 0 CHECK (kyc_level BETWEEN 0 AND 3),
  last_login_at TIMESTAMPTZ,
  login_count INTEGER NOT NULL DEFAULT 0,
  failed_login_count INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  password_changed_at TIMESTAMPTZ DEFAULT NOW(),
  terms_accepted_at TIMESTAMPTZ,
  privacy_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_portal ON public.profiles(portal);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ============================================================
-- 2. SESSIONS — custom session tracking (beyond Supabase auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  device_type TEXT CHECK (device_type IN ('web', 'mobile', 'tablet', 'api')),
  portal TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  end_reason TEXT CHECK (end_reason IN ('logout', 'expired', 'forced', 'replaced'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON public.sessions(is_active) WHERE is_active = true;

-- ============================================================
-- 3. AUDIT LOG — tracks all auth-related events
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  portal TEXT,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_log(created_at DESC);

-- ============================================================
-- 4. PORTAL PERMISSIONS — role-based portal access
-- ============================================================
CREATE TABLE IF NOT EXISTS public.portal_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT NOT NULL,
  portal TEXT NOT NULL,
  can_read BOOLEAN NOT NULL DEFAULT true,
  can_write BOOLEAN NOT NULL DEFAULT false,
  can_delete BOOLEAN NOT NULL DEFAULT false,
  can_export BOOLEAN NOT NULL DEFAULT false,
  can_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(role, portal)
);

-- ============================================================
-- 5. OTP VERIFICATIONS — for phone/email verification
-- ============================================================
CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email', 'phone', 'login', 'password_reset', 'transaction')),
  target TEXT NOT NULL, -- email or phone number
  code TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  verified BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_user ON public.otp_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_target ON public.otp_verifications(target, type);

-- ============================================================
-- 6. FUNCTIONS — Auto-update timestamps, profile creation
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, portal)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'EXT_CLIENTE'),
    COALESCE(NEW.raw_user_meta_data->>'portal', 'cliente')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: auto-create profile after auth signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Log login events
CREATE OR REPLACE FUNCTION public.handle_login()
RETURNS TRIGGER AS $$
BEGIN
  -- Update profile
  UPDATE public.profiles
  SET last_login_at = NOW(), login_count = login_count + 1, failed_login_count = 0
  WHERE id = NEW.id;

  -- Create audit log entry
  INSERT INTO public.audit_log (user_id, action, resource_type, resource_id, details)
  VALUES (NEW.id, 'auth.login', 'user', NEW.id::text, jsonb_build_object('email', NEW.email));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own, admins can read all
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('L4_ADMIN', 'L5_EJECUTIVO', 'L4_SEGURIDAD')
    )
  );

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('L4_ADMIN')
    )
  );

-- Sessions: users see their own, security sees all
CREATE POLICY "Users can view own sessions"
  ON public.sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Security can view all sessions"
  ON public.sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('L4_SEGURIDAD', 'L4_ADMIN')
    )
  );

CREATE POLICY "Users can insert own sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sessions"
  ON public.sessions FOR UPDATE
  USING (user_id = auth.uid());

-- Audit log: admins and security only
CREATE POLICY "Security can view audit log"
  ON public.audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('L4_SEGURIDAD', 'L4_ADMIN', 'L5_EJECUTIVO', 'L3_PLD')
    )
  );

CREATE POLICY "Authenticated users can insert audit entries"
  ON public.audit_log FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Portal permissions: read-only for all authenticated
CREATE POLICY "Authenticated users can read permissions"
  ON public.portal_permissions FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- OTP: users see their own
CREATE POLICY "Users can view own OTPs"
  ON public.otp_verifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own OTPs"
  ON public.otp_verifications FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 8. SEED DATA — Default portal permissions
-- ============================================================
INSERT INTO public.portal_permissions (role, portal, can_read, can_write, can_delete, can_export, can_admin) VALUES
  -- L2 Operador
  ('L2_OPERADOR', 'mesa-control', true, true, false, true, false),
  -- L3 PLD
  ('L3_PLD', 'cumplimiento', true, true, true, true, false),
  ('L3_PLD', 'mesa-control', true, false, false, true, false),
  -- L2 Gestor
  ('L2_GESTOR', 'cobranza', true, true, false, true, false),
  -- L2 Comercial
  ('L2_COMERCIAL', 'comercial', true, true, false, true, false),
  -- L2 Soporte
  ('L2_SOPORTE', 'soporte', true, true, false, true, false),
  -- L4 Seguridad
  ('L4_SEGURIDAD', 'seguridad', true, true, true, true, true),
  ('L4_SEGURIDAD', 'mesa-control', true, false, false, true, false),
  ('L4_SEGURIDAD', 'cumplimiento', true, false, false, true, false),
  -- L3 Marketing
  ('L3_MARKETING', 'marketing', true, true, false, true, false),
  -- L5 Ejecutivo
  ('L5_EJECUTIVO', 'ejecutivo', true, true, false, true, true),
  ('L5_EJECUTIVO', 'mesa-control', true, false, false, true, false),
  ('L5_EJECUTIVO', 'cumplimiento', true, false, false, true, false),
  ('L5_EJECUTIVO', 'comercial', true, false, false, true, false),
  ('L5_EJECUTIVO', 'cobranza', true, false, false, true, false),
  -- L4 Admin
  ('L4_ADMIN', 'admin', true, true, true, true, true),
  ('L4_ADMIN', 'seguridad', true, true, false, true, false),
  ('L4_ADMIN', 'mesa-control', true, true, false, true, false),
  -- EXT Cliente
  ('EXT_CLIENTE', 'cliente', true, true, false, false, false),
  ('EXT_CLIENTE', 'sayo-mx', true, false, false, false, false)
ON CONFLICT (role, portal) DO NOTHING;

-- ============================================================
-- 9. SEED DATA — Demo users (for development only)
-- ============================================================
-- NOTE: These users must be created through Supabase Auth first.
-- Run this AFTER creating the users via supabase.auth.signUp() or Dashboard:
--
-- INSERT INTO public.profiles (id, email, full_name, role, portal, department, status) VALUES
--   ('<user-uuid>', 'carlos.mendoza@sayo.mx', 'Carlos Mendoza', 'L2_OPERADOR', 'mesa-control', 'Operaciones', 'active'),
--   ('<user-uuid>', 'ana.garcia@sayo.mx', 'Ana García', 'L3_PLD', 'cumplimiento', 'Cumplimiento', 'active'),
--   ('<user-uuid>', 'roberto.lopez@sayo.mx', 'Roberto López', 'L2_GESTOR', 'cobranza', 'Cobranza', 'active'),
--   ('<user-uuid>', 'maria.fernandez@sayo.mx', 'María Fernández', 'L2_COMERCIAL', 'comercial', 'Comercial', 'active'),
--   ('<user-uuid>', 'luis.torres@sayo.mx', 'Luis Torres', 'L2_SOPORTE', 'soporte', 'Soporte', 'active'),
--   ('<user-uuid>', 'diana.ruiz@sayo.mx', 'Diana Ruiz', 'L4_SEGURIDAD', 'seguridad', 'Seguridad IT', 'active'),
--   ('<user-uuid>', 'pedro.sanchez@sayo.mx', 'Pedro Sánchez', 'L3_MARKETING', 'marketing', 'Marketing', 'active'),
--   ('<user-uuid>', 'patricia.morales@sayo.mx', 'Patricia Morales', 'L5_EJECUTIVO', 'ejecutivo', 'Dirección', 'active'),
--   ('<user-uuid>', 'jorge.ramirez@sayo.mx', 'Jorge Ramírez', 'L4_ADMIN', 'admin', 'Tecnología', 'active'),
--   ('<user-uuid>', 'sofia.hernandez@gmail.com', 'Sofía Hernández', 'EXT_CLIENTE', 'cliente', NULL, 'active');
