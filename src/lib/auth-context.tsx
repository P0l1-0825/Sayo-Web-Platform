"use client"

import * as React from "react"
import { getSupabase, isDemoMode, type Profile } from "./supabase"
import { demoUsers } from "./portals"
import type { PortalId, UserRole } from "./types"
import type { Session, User } from "@supabase/supabase-js"

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
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
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
  })

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
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single()

            setState((s) => ({
              ...s,
              user: profile ? profileToAuthUser(profile) : null,
              session,
              profile,
              isAuthenticated: !!profile,
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
  // Actions
  // ----------------------------------------------------------

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setState((s) => ({ ...s, isLoading: true, error: null }))

    if (isDemoMode) {
      // Demo mode: find matching demo user by email
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
        return { success: true }
      }
      // In demo mode, any email works — create client user
      const user = createDemoUser("cliente")
      user.email = email
      user.fullName = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
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
        // Fetch profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (profile) {
          // Create session record
          await supabase.from("sessions").insert({
            user_id: data.user.id,
            device_type: "web",
            portal: profile.portal,
            user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
          })

          // Audit log
          await supabase.from("audit_log").insert({
            user_id: data.user.id,
            action: "auth.login",
            resource_type: "user",
            resource_id: data.user.id,
            portal: profile.portal,
            details: { method: "password", email },
          })

          setState((s) => ({
            ...s,
            user: profileToAuthUser(profile),
            session: data.session,
            profile,
            isAuthenticated: true,
            isLoading: false,
          }))
          return { success: true }
        }
      }

      setState((s) => ({ ...s, isLoading: false, error: "Perfil no encontrado" }))
      return { success: false, error: "Perfil no encontrado" }
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

  const logout = async () => {
    if (isDemoMode) {
      localStorage.removeItem(DEMO_USER_KEY)
      setState((s) => ({
        ...s,
        user: null,
        session: null,
        profile: null,
        isAuthenticated: false,
      }))
      return
    }

    const supabase = getSupabase()
    if (supabase && state.user) {
      // End active sessions
      await supabase
        .from("sessions")
        .update({ is_active: false, ended_at: new Date().toISOString(), end_reason: "logout" })
        .eq("user_id", state.user.id)
        .eq("is_active", true)

      // Audit log
      await supabase.from("audit_log").insert({
        user_id: state.user.id,
        action: "auth.logout",
        resource_type: "user",
        resource_id: state.user.id,
      })

      await supabase.auth.signOut()
    }

    setState((s) => ({
      ...s,
      user: null,
      session: null,
      profile: null,
      isAuthenticated: false,
    }))
  }

  const demoLogin = (portalId: PortalId) => {
    const user = createDemoUser(portalId)
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user))
    setState((s) => ({
      ...s,
      user,
      isAuthenticated: true,
      isDemoMode: true,
    }))
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
      redirectTo: `${window.location.origin}/reset-password`,
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
