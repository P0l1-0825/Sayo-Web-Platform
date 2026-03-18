// ============================================================
// SAYO — Real-time Subscription Hooks
// ============================================================
// Reusable hooks for Supabase Realtime subscriptions.
// Compatible with demo mode (no-op when isDemoMode).
// Uses Supabase's Postgres Changes channel.
// ============================================================

"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { getSupabase, isDemoMode } from "./supabase"
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js"

// ── Types ──

type PostgresEvent = "INSERT" | "UPDATE" | "DELETE" | "*"

interface RealtimeSubscriptionOptions<T extends { [key: string]: any }> {
  /** Table name to subscribe to */
  table: string
  /** Event type(s) to listen for */
  event?: PostgresEvent
  /** Schema (default: "public") */
  schema?: string
  /** Optional column filter (e.g., "user_id=eq.abc123") */
  filter?: string
  /** Callback when data changes */
  onData?: (payload: RealtimePostgresChangesPayload<T>) => void
  /** Callback specifically for INSERT events */
  onInsert?: (record: T) => void
  /** Callback specifically for UPDATE events */
  onUpdate?: (record: T, oldRecord: T) => void
  /** Callback specifically for DELETE events */
  onDelete?: (oldRecord: T) => void
  /** Whether subscription is enabled (default: true) */
  enabled?: boolean
}

// ── Core Hook: useRealtimeSubscription ──

/**
 * Subscribe to real-time changes on a Supabase table.
 * Automatically handles cleanup on unmount.
 * No-op in demo mode.
 *
 * @example
 * ```tsx
 * useRealtimeSubscription<Transaction>({
 *   table: "transactions",
 *   filter: `account_id=eq.${accountId}`,
 *   onInsert: (tx) => setTransactions(prev => [tx, ...prev]),
 *   onUpdate: (tx) => setTransactions(prev =>
 *     prev.map(t => t.id === tx.id ? tx : t)
 *   ),
 * })
 * ```
 */
export function useRealtimeSubscription<T extends { [key: string]: any }>(
  options: RealtimeSubscriptionOptions<T>
) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const {
    table,
    event = "*",
    schema = "public",
    filter,
    onData,
    onInsert,
    onUpdate,
    onDelete,
    enabled = true,
  } = options

  useEffect(() => {
    if (isDemoMode || !enabled) return

    const supabase = getSupabase()
    if (!supabase) return

    const channelName = `realtime-${table}-${filter || "all"}-${Date.now()}`

    const channelConfig: Record<string, string> = {
      event,
      schema,
      table,
    }
    if (filter) {
      channelConfig.filter = filter
    }

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes" as any,
        channelConfig,
        (payload: RealtimePostgresChangesPayload<T>) => {
          // Call general onData callback
          onData?.(payload)

          // Call specific event callbacks
          switch (payload.eventType) {
            case "INSERT":
              onInsert?.(payload.new as T)
              break
            case "UPDATE":
              onUpdate?.(payload.new as T, payload.old as T)
              break
            case "DELETE":
              onDelete?.(payload.old as T)
              break
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.debug(`[Realtime] Subscribed to ${table}${filter ? ` (${filter})` : ""}`)
        } else if (status === "CHANNEL_ERROR") {
          console.error(`[Realtime] Error subscribing to ${table}`)
        }
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, event, schema, filter, enabled])

  return channelRef
}

// ── Specialized Hooks ──

/**
 * Subscribe to new transactions on a specific account.
 * Updates a transaction list state automatically.
 */
export function useRealtimeTransactions(
  accountId: string | null,
  onNewTransaction?: (tx: Record<string, unknown>) => void
) {
  const [latestTx, setLatestTx] = useState<Record<string, unknown> | null>(null)

  useRealtimeSubscription({
    table: "transactions",
    filter: accountId ? `account_id=eq.${accountId}` : undefined,
    enabled: !!accountId,
    onInsert: (tx) => {
      setLatestTx(tx)
      onNewTransaction?.(tx)
    },
    onUpdate: (tx) => {
      setLatestTx(tx)
    },
  })

  return { latestTransaction: latestTx }
}

/**
 * Subscribe to compliance alerts (for PLD dashboard).
 * Notifies on new or escalated alerts.
 */
export function useRealtimeAlerts(
  onNewAlert?: (alert: Record<string, unknown>) => void
) {
  const [alertCount, setAlertCount] = useState(0)

  useRealtimeSubscription({
    table: "compliance_alerts",
    event: "INSERT",
    onInsert: (alert) => {
      setAlertCount((prev) => prev + 1)
      onNewAlert?.(alert)
    },
  })

  return { newAlertCount: alertCount, resetCount: () => setAlertCount(0) }
}

/**
 * Subscribe to payment authorization updates (for treasury).
 * Notifies on new authorizations and status changes.
 */
export function useRealtimeAuthorizations(
  onUpdate?: (auth: Record<string, unknown>) => void
) {
  const [pendingCount, setPendingCount] = useState(0)

  useRealtimeSubscription({
    table: "payment_authorizations",
    onInsert: (auth) => {
      setPendingCount((prev) => prev + 1)
      onUpdate?.(auth)
    },
    onUpdate: (auth) => {
      onUpdate?.(auth)
    },
  })

  return {
    newPendingCount: pendingCount,
    resetCount: () => setPendingCount(0),
  }
}

/**
 * Subscribe to support ticket updates (for soporte dashboard).
 */
export function useRealtimeTickets(
  onTicketUpdate?: (ticket: Record<string, unknown>) => void
) {
  useRealtimeSubscription({
    table: "support_tickets",
    onInsert: (ticket) => onTicketUpdate?.(ticket),
    onUpdate: (ticket) => onTicketUpdate?.(ticket),
  })
}

/**
 * Subscribe to notifications for a specific user.
 * Returns unread count and latest notification.
 */
export function useRealtimeNotifications(userId: string | null) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [latestNotification, setLatestNotification] = useState<Record<string, unknown> | null>(null)

  useRealtimeSubscription({
    table: "notifications",
    filter: userId ? `user_id=eq.${userId}` : undefined,
    enabled: !!userId,
    onInsert: (notification) => {
      setUnreadCount((prev) => prev + 1)
      setLatestNotification(notification)
    },
  })

  return {
    unreadCount,
    latestNotification,
    resetUnread: () => setUnreadCount(0),
  }
}

/**
 * Subscribe to credit application status changes.
 * Useful for origination workflow tracking.
 */
export function useRealtimeApplications(
  onStatusChange?: (app: Record<string, unknown>) => void
) {
  useRealtimeSubscription({
    table: "credit_origination_applications",
    event: "UPDATE",
    onUpdate: (app) => onStatusChange?.(app),
  })
}

// ── Utility: Presence (Online Users) ──

/**
 * Track user presence in a specific portal/room.
 * Returns list of currently online users.
 */
export function usePresence(room: string, userId: string | null) {
  const [onlineUsers, setOnlineUsers] = useState<
    { user_id: string; portal: string; online_at: string }[]
  >([])
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (isDemoMode || !userId) return

    const supabase = getSupabase()
    if (!supabase) return

    const channel = supabase.channel(`presence-${room}`)

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState()
        const users = Object.values(state)
          .flat()
          .map((u: any) => ({
            user_id: u.user_id,
            portal: u.portal,
            online_at: u.online_at,
          }))
        setOnlineUsers(users)
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: userId,
            portal: room,
            online_at: new Date().toISOString(),
          })
        }
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [room, userId])

  return { onlineUsers }
}
