import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// ============================================================
// Supabase Client — Singleton for browser-side usage
// ============================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

/**
 * Whether Supabase is properly configured with URL and key.
 * When false, the app operates in demo mode with mock data.
 */
export const isSupabaseConfigured =
  supabaseUrl.length > 0 &&
  supabaseAnonKey.length > 0 &&
  supabaseUrl.startsWith("https://")

/**
 * Whether demo mode is explicitly enabled via env var
 * OR Supabase is not configured (auto-fallback)
 */
export const isDemoMode =
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !isSupabaseConfigured

let supabaseInstance: SupabaseClient | null = null

/**
 * Get the Supabase client instance (singleton pattern).
 * Returns null if Supabase is not configured.
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null

  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "sayo-auth",
      },
    })
  }

  return supabaseInstance
}

// ============================================================
// Database Types (matches Supabase schema)
// ============================================================

export interface Profile {
  id: string
  email: string
  full_name: string
  phone: string | null
  curp: string | null
  rfc: string | null
  role: string
  portal: string
  department: string | null
  position: string | null
  avatar_url: string | null
  status: "active" | "inactive" | "suspended"
  kyc_status: "pending" | "in_progress" | "verified" | "rejected"
  kyc_level: number
  last_login_at: string | null
  login_count: number
  failed_login_count: number
  locked_until: string | null
  password_changed_at: string | null
  terms_accepted_at: string | null
  privacy_accepted_at: string | null
  created_at: string
  updated_at: string
}

export interface SessionRecord {
  id: string
  user_id: string
  ip_address: string | null
  user_agent: string | null
  device_type: "web" | "mobile" | "tablet" | "api"
  portal: string | null
  is_active: boolean
  started_at: string
  last_activity_at: string
  ended_at: string | null
  end_reason: "logout" | "expired" | "forced" | "replaced" | null
}

export interface AuditLogEntry {
  id: string
  user_id: string | null
  action: string
  resource_type: string | null
  resource_id: string | null
  details: Record<string, unknown>
  ip_address: string | null
  user_agent: string | null
  portal: string | null
  severity: "info" | "warning" | "error" | "critical"
  created_at: string
}

export interface PortalPermission {
  id: string
  role: string
  portal: string
  can_read: boolean
  can_write: boolean
  can_delete: boolean
  can_export: boolean
  can_admin: boolean
}
