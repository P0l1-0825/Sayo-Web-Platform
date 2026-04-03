"use client"

import * as React from "react"
import { getSupabase, isDemoMode, type Profile } from "./supabase"
import { demoUsers } from "./portals"
import type { PortalId, UserRole } from "./types"
import type { Session } from "@supabase/supabase-js"

// ── Session timeout constants ──────────────────────────────────
const SESSION_TIMEOUT_MS = 30 * 60 * 1000       // 30 minutes
const SESSION_WARNING_MS = 28 * 60 * 1000        // warn at 28 min (2 min before expiry)

// ============================================================
// Auth Types
// ============================================================

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: UserRole
  portal: PortalId
  department?: string
  position?: string
  avatarUrl?: string
  status: "active" | "inactive" | "suspended"
  kycStatus: "pending" | "in_progress" | "verified" | "rejected"
  kycLevel: number
  lastLoginAt?: string
  createdAt: string
}

export interface AuthState {
  user: AuthUser | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  isDemoMode: boolean
  error: string | null
  /** True for the 2 minutes before the inactivity timeout fires */
  sessionExpiryWarning: boolean
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; mfaRequired?: boolean; factorId?: string }>
  verifyMfa: (factorId: string, code: string) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  demoLogin: (portalId: PortalId) => void
  updateProfile: (data: Partial<Profile>) => Promise<{ success: boolean; error?: string }>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  refreshSession: () => Promise<void>
  clearError: () => void
}

export interface RegisterData {
  email: string
  password: string
  fullName: string
  phone?: string
  role?: UserRole
  portal?: PortalId
}

type AuthContextType = AuthState & AuthActions

// ============================================================
// Context
// ============================================================

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

// ============================================================
// Demo Mode Helpers
// ============================================================

function createDemoUser(portalId: PortalId): AuthUser {
  const demoUser = demoUsers.find((u) => u.portal === portalId)
  return {
    id: `demo-${portalId}`,
    email: demoUser?.email || `demo@sayo.mx`,
    fullName: demoUser?.name || "Usuario Demo",
    role: (demoUser?.role || "EXT_CLIENTE") as UserRole,
    portal: portalId,
    department: getDemoDepartment(portalId),
    status: "active",
    kycStatus: "verified",
    kycLevel: 3,
    lastLoginAt: new Date().toISOString(),
    createdAt: "2023-01-15T00:00:00Z",
  }
}

function getDemoDepartment(portal: PortalId): string {
  const map: Record<string, string> = {
    "mesa-control": "Operaciones",
    cumplimiento: "Cumplimiento",
    cobranza: "Cobranza",
    comercial: "Comercial",
    soporte: "Soporte",
    seguridad: "Seguridad IT",
    marketing: "Marketing",
    ejecutivo: "Dirección General",
    admin: "Tecnología",
    cliente: "Cliente",
    "sayo-mx": "Público",
  }
  return map[portal] || "General"
}

function profileToAuthUser(profile: Profile): AuthUser {
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role as UserRole,
    portal: profile.portal as PortalId,
    department: profile.department || undefined,
    position: profile.position || undefined,
    avatarUrl: profile.avatar_url || undefined,
    status: profile.status,
    kycStatus: profile.kyc_status,
    kycLevel: profile.kyc_level,
    lastLoginAt: profile.last_login_at || undefined,
    createdAt: profile.created_at,
  }
}

/**
 * Build a minimal AuthUser from the JWT user_metadata when the profile
 * table row is unavailable (RLS block, missing record, network error).
 * This ensures the user can still access the app after a successful
 * Supabase auth — we never want to show "Perfil no encontrado".
 */
function jwtToAuthUser(supabaseUser: { id: string; email?: string; user_metadata?: Record<string, unknown>; created_at?: string }): AuthUser {
  const meta = supabaseUser.user_metadata || {}
  const role = (meta.role as UserRole) || "EXT_CLIENTE"
  const portal = (meta.portal as PortalId) || "cliente"
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    fullName: (meta.full_name as string) || (supabaseUser.email?.split("@")[0] ?? "Usuario"),
    role,
    portal,
    department: undefined,
    position: undefined,
    avatarUrl: undefined,
    status: "active",
    kycStatus: "pending",
    kycLevel: 0,
    lastLoginAt: undefined,
    createdAt: supabaseUser.created_at || new Date().toISOString(),
  }
}

// ============================================================
// Storage keys
// ============================================================
const DEMO_USER_KEY = "sayo-demo-user"

// ============================================================
// Provider
// ============================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,
    isDemoMode,
    error: null,
    sessionExpiryWarning: false,
  })

  // ── Inactivity session timeout refs ─────────────────────────
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const isAuthenticatedRef = React.useRef(false)

  // Keep ref in sync with state so event listeners see current value
  React.useEffect(() => {
    isAuthenticatedRef.current = state.isAuthenticated
  }, [state.isAuthenticated])

  // ----------------------------------------------------------
  // Initialize: check existing session
  // ----------------------------------------------------------
  React.useEffect(() => {
    const initialize = async () => {
      // Check for demo user in localStorage
      if (isDemoMode) {
        try {
          const stored = localStorage.getItem(DEMO_USER_KEY)
          if (stored) {
            const user = JSON.parse(stored) as AuthUser
            setState((s) => ({
              ...s,
              user,
              isAuthenticated: true,
              isLoading: false,
              isDemoMode: true,
            }))
            return
          }
        } catch {
          // Invalid stored data, ignore
        }
        setState((s) => ({ ...s, isLoading: false }))
        return
      }

      // Supabase mode: check existing session
      const supabase = getSupabase()
      if (!supabase) {
        setState((s) => ({ ...s, isLoading: false, isDemoMode: true }))
        return
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error || !session) {
          setState((s) => ({ ...s, isLoading: false }))
          return
        }

        // Fetch profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (profile) {
          setState((s) => ({
            ...s,
            user: profileToAuthUser(profile),
            session,
            profile,
            isAuthenticated: true,
            isLoading: false,
          }))
        } else if (session) {
          // Profile missing but session is valid — gracefully degrade
          setState((s) => ({
            ...s,
            user: jwtToAuthUser(session.user),
            session,
            profile: null,
            isAuthenticated: true,
            isLoading: false,
          }))
        } else {
          setState((s) => ({ ...s, isLoading: false }))
        }
      } catch {
        setState((s) => ({ ...s, isLoading: false }))
      }

      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === "SIGNED_IN" && session) {
            // Check if user has MFA enabled — if so, DON'T set isAuthenticated
            // until MFA verification is complete (AAL2). The login() function
            // handles the MFA flow separately.
            const { data: mfaData } = await supabase.auth.mfa.listFactors()
            const hasVerifiedTotp = (mfaData?.totp?.filter((f) => f.status === "verified") ?? []).length > 0
            const isAal2 = session.aal === "aal2"

            if (hasVerifiedTotp && !isAal2) {
              // MFA required but not yet verified — keep session but don't authenticate
              setState((s) => ({ ...s, session, isLoading: false }))
              return
            }

            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single()

            const authUser = profile
              ? profileToAuthUser(profile)
              : jwtToAuthUser(session.user)

            setState((s) => ({
              ...s,
              user: authUser,
              session,
              profile: profile ?? null,
              isAuthenticated: true,
            }))
          } else if (event === "SIGNED_OUT") {
            setState((s) => ({
              ...s,
              user: null,
              session: null,
              profile: null,
              isAuthenticated: false,
            }))
          } else if (event === "TOKEN_REFRESHED" && session) {
            setState((s) => ({ ...s, session }))
          }
        }
      )

      return () => subscription.unsubscribe()
    }

    initialize()
  }, [])

  // ----------------------------------------------------------
  // Inactivity session timeout
  // ----------------------------------------------------------

  const clearTimeouts = React.useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)
    timeoutRef.current = null
    warningRef.current = null
  }, [])

  const resetInactivityTimer = React.useCallback(() => {
    if (!isAuthenticatedRef.current) return

    clearTimeouts()

    // Warning fires 2 minutes before expiry
    warningRef.current = setTimeout(() => {
      setState((s) => ({ ...s, sessionExpiryWarning: true }))
    }, SESSION_WARNING_MS)

    // Logout fires at 30 minutes of inactivity
    timeoutRef.current = setTimeout(() => {
      // logout() is defined below — we call it indirectly via a ref to avoid
      // a stale closure, but since this fires inside the component lifecycle
      // we dispatch a custom event to trigger the logout action.
      window.dispatchEvent(new CustomEvent("sayo:session-timeout"))
    }, SESSION_TIMEOUT_MS)
  }, [clearTimeouts])

  // Listen for user activity to reset the inactivity timer
  React.useEffect(() => {
    const activityEvents = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"]

    const handleActivity = () => {
      if (isAuthenticatedRef.current) {
        setState((s) => s.sessionExpiryWarning ? { ...s, sessionExpiryWarning: false } : s)
        resetInactivityTimer()
      }
    }

    activityEvents.forEach((evt) => window.addEventListener(evt, handleActivity, { passive: true }))

    return () => {
      activityEvents.forEach((evt) => window.removeEventListener(evt, handleActivity))
    }
  }, [resetInactivityTimer])

  // ----------------------------------------------------------
  // Actions
  // ----------------------------------------------------------

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setState((s) => ({ ...s, isLoading: true, error: null }))

    if (isDemoMode) {
      // SECURITY: In production, demo mode login is forbidden regardless of
      // whether isDemoMode is true. If somehow NEXT_PUBLIC_DEMO_MODE slips
      // through to a production deployment, this guard is the last line of defence.
      if (process.env.NODE_ENV === "production") {
        setState((s) => ({ ...s, isLoading: false, error: "Demo mode no disponible en produccion" }))
        throw new Error("Demo mode is not permitted in production builds")
      }

      // Demo mode (development/staging only): find matching demo user by email
      const demoUser = demoUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      )
      if (demoUser) {
        const user = createDemoUser(demoUser.portal as PortalId)
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user))
        setState((s) => ({
          ...s,
          user,
          isAuthenticated: true,
          isLoading: false,
          isDemoMode: true,
        }))
        resetInactivityTimer()
        return { success: true }
      }

      // In demo mode (non-production only), unknown emails are rejected —
      // the "any email works" fallback was a critical security hole.
      setState((s) => ({ ...s, isLoading: false, error: "Usuario demo no encontrado" }))
      return { success: false, error: "Usuario demo no encontrado" }
    }

    // Supabase mode
    const supabase = getSupabase()
    if (!supabase) {
      setState((s) => ({ ...s, isLoading: false, error: "Supabase no configurado" }))
      return { success: false, error: "Supabase no configurado" }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        const msg = error.message === "Invalid login credentials"
          ? "Credenciales incorrectas. Verifica tu email y contraseña."
          : error.message
        setState((s) => ({ ...s, isLoading: false, error: msg }))
        return { success: false, error: msg }
      }

      if (data.session && data.user) {
        // Check if MFA (TOTP) is required
        const { data: mfaData } = await supabase.auth.mfa.listFactors()
        const totpFactors = mfaData?.totp?.filter((f) => f.status === "verified") ?? []

        if (totpFactors.length > 0) {
          // User has MFA enabled — don't authenticate yet, return mfaRequired
          setState((s) => ({ ...s, isLoading: false }))
          return {
            success: false,
            error: "MFA_REQUIRED",
            mfaRequired: true,
            factorId: totpFactors[0].id,
          } as { success: boolean; error?: string; mfaRequired?: boolean; factorId?: string }
        }

        // Fetch profile — failure here must never block the user from
        // accessing the app after a successful Supabase authentication.
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single()

        // Graceful degradation: build from JWT metadata when profile row
        // is unavailable (RLS policy not satisfied, row not yet created
        // by a trigger, or network error on the profiles table).
        const authUser = profile
          ? profileToAuthUser(profile)
          : jwtToAuthUser(data.user)

        if (profile) {
          // Create session record (best-effort, non-blocking)
          supabase.from("sessions").insert({
            user_id: data.user.id,
            device_type: "web",
            portal: profile.portal,
            user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
          }).then(() => {})

          // Audit log (best-effort, non-blocking)
          supabase.from("audit_log").insert({
            user_id: data.user.id,
            action: "auth.login",
            resource_type: "user",
            resource_id: data.user.id,
            portal: profile.portal,
            details: { method: "password", email },
          }).then(() => {})
        }

        setState((s) => ({
          ...s,
          user: authUser,
          session: data.session,
          profile: profile ?? null,
          isAuthenticated: true,
          isLoading: false,
          sessionExpiryWarning: false,
        }))
        resetInactivityTimer()
        return { success: true }
      }

      // data.session or data.user was null despite no error — should not
      // happen in practice but handle it gracefully.
      setState((s) => ({ ...s, isLoading: false }))
      return { success: false, error: "Error al iniciar sesión. Inténtalo de nuevo." }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error de autenticación"
      setState((s) => ({ ...s, isLoading: false, error: msg }))
      return { success: false, error: msg }
    }
  }

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    setState((s) => ({ ...s, isLoading: true, error: null }))

    if (isDemoMode) {
      // Demo mode: simulate registration
      const user = createDemoUser(data.portal || "cliente")
      user.email = data.email
      user.fullName = data.fullName
      if (data.role) user.role = data.role
      if (data.portal) user.portal = data.portal
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user))
      setState((s) => ({
        ...s,
        user,
        isAuthenticated: true,
        isLoading: false,
        isDemoMode: true,
      }))
      return { success: true }
    }

    const supabase = getSupabase()
    if (!supabase) {
      setState((s) => ({ ...s, isLoading: false }))
      return { success: false, error: "Supabase no configurado" }
    }

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone: data.phone,
            role: data.role || "EXT_CLIENTE",
            portal: data.portal || "cliente",
          },
        },
      })

      if (error) {
        const msg = error.message === "User already registered"
          ? "Ya existe una cuenta con este email."
          : error.message
        setState((s) => ({ ...s, isLoading: false, error: msg }))
        return { success: false, error: msg }
      }

      if (authData.user) {
        setState((s) => ({ ...s, isLoading: false }))
        return { success: true }
      }

      setState((s) => ({ ...s, isLoading: false }))
      return { success: false, error: "Error al crear la cuenta" }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error de registro"
      setState((s) => ({ ...s, isLoading: false, error: msg }))
      return { success: false, error: msg }
    }
  }

  const verifyMfa = async (factorId: string, code: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabase()
    if (!supabase) return { success: false, error: "Supabase no configurado" }

    try {
      // Create challenge
      const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId })
      if (challengeErr) return { success: false, error: challengeErr.message }

      // Verify with TOTP code
      const { data: verifyData, error: verifyErr } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      })
      if (verifyErr) return { success: false, error: "Código incorrecto. Intenta de nuevo." }

      // MFA verified — now complete the login
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()

        const authUser = profile ? profileToAuthUser(profile) : jwtToAuthUser(session.user)

        setState((s) => ({
          ...s,
          user: authUser,
          session,
          profile: profile ?? null,
          isAuthenticated: true,
          isLoading: false,
        }))
        resetInactivityTimer()
        return { success: true }
      }

      return { success: false, error: "Sesión no encontrada después de MFA" }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error de verificación MFA"
      return { success: false, error: msg }
    }
  }

  const logout = React.useCallback(async (reason: "manual" | "timeout" = "manual") => {
    clearTimeouts()

    if (isDemoMode) {
      localStorage.removeItem(DEMO_USER_KEY)
      setState((s) => ({
        ...s,
        user: null,
        session: null,
        profile: null,
        isAuthenticated: false,
        sessionExpiryWarning: false,
      }))
      return
    }

    const supabase = getSupabase()
    // Capture current user before clearing state
    const currentUserId = state.user?.id
    if (supabase && currentUserId) {
      // End active sessions
      await supabase
        .from("sessions")
        .update({
          is_active: false,
          ended_at: new Date().toISOString(),
          end_reason: reason === "timeout" ? "expired" : "logout",
        })
        .eq("user_id", currentUserId)
        .eq("is_active", true)

      // Audit log
      await supabase.from("audit_log").insert({
        user_id: currentUserId,
        action: reason === "timeout" ? "auth.session_timeout" : "auth.logout",
        resource_type: "user",
        resource_id: currentUserId,
        severity: reason === "timeout" ? "warning" : "info",
      })

      await supabase.auth.signOut()
    }

    setState((s) => ({
      ...s,
      user: null,
      session: null,
      profile: null,
      isAuthenticated: false,
      sessionExpiryWarning: false,
    }))
  }, [clearTimeouts, isDemoMode, state.user])

  // Listen for the inactivity timeout event dispatched by the timer
  React.useEffect(() => {
    const handleSessionTimeout = () => {
      logout("timeout")
    }
    window.addEventListener("sayo:session-timeout", handleSessionTimeout)
    return () => window.removeEventListener("sayo:session-timeout", handleSessionTimeout)
  }, [logout])

  const demoLogin = (portalId: PortalId) => {
    // SECURITY: demoLogin is blocked in production environments.
    if (process.env.NODE_ENV === "production") {
      throw new Error("Demo login is not permitted in production builds")
    }
    const user = createDemoUser(portalId)
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user))
    setState((s) => ({
      ...s,
      user,
      isAuthenticated: true,
      isDemoMode: true,
    }))
    resetInactivityTimer()
  }

  const updateProfile = async (data: Partial<Profile>): Promise<{ success: boolean; error?: string }> => {
    if (isDemoMode || !state.user) {
      return { success: true }
    }

    const supabase = getSupabase()
    if (!supabase) return { success: false, error: "Supabase no configurado" }

    const { error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", state.user.id)

    if (error) return { success: false, error: error.message }

    // Refresh profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", state.user.id)
      .single()

    if (profile) {
      setState((s) => ({
        ...s,
        user: profileToAuthUser(profile),
        profile,
      }))
    }

    return { success: true }
  }

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (isDemoMode) {
      return { success: true }
    }

    const supabase = getSupabase()
    if (!supabase) return { success: false, error: "Supabase no configurado" }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) return { success: false, error: error.message }
    return { success: true }
  }

  const refreshSession = async () => {
    if (isDemoMode) return

    const supabase = getSupabase()
    if (!supabase) return

    const { data: { session } } = await supabase.auth.refreshSession()
    if (session) {
      setState((s) => ({ ...s, session }))
    }
  }

  const clearError = () => {
    setState((s) => ({ ...s, error: null }))
  }

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  const value: AuthContextType = {
    ...state,
    login,
    verifyMfa,
    register,
    logout,
    demoLogin,
    updateProfile,
    resetPassword,
    refreshSession,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ============================================================
// Hook
// ============================================================

export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
