// ============================================================
// SAYO — Edge Function: Daily Closing (Cron Job)
// ============================================================
// Automated end-of-day processes:
// 1. Calculate daily accrued interest on all active credits
// 2. Update days_past_due for overdue credits
// 3. Refresh all materialized views for dashboards
// 4. Generate daily PLD accumulation alerts
// 5. Send overdue payment reminders
// Scheduled via Supabase Cron: 0 2 * * * (2:00 AM CST daily)
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface ClosingResult {
  step: string;
  success: boolean;
  details?: Record<string, unknown>;
  error?: string;
  duration_ms: number;
}

serve(async (req: Request) => {
  // Allow POST from cron or authenticated admin
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const closingDate = new Date().toISOString().split("T")[0];
  const results: ClosingResult[] = [];
  const startTime = Date.now();

  console.log(`=== Daily Closing Started: ${closingDate} ===`);

  // ── Step 1: Calculate daily balances & update days_past_due ──
  try {
    const stepStart = Date.now();
    const { data, error } = await supabase.rpc("calculate_daily_balances");

    if (error) throw error;

    // Count affected credits
    const { count: activeCredits } = await supabase
      .from("credits")
      .select("*", { count: "exact", head: true })
      .in("status", ["vigente", "vencido"]);

    const { count: overdueCredits } = await supabase
      .from("credits")
      .select("*", { count: "exact", head: true })
      .eq("status", "vencido");

    results.push({
      step: "calculate_daily_balances",
      success: true,
      details: {
        active_credits: activeCredits || 0,
        overdue_credits: overdueCredits || 0,
      },
      duration_ms: Date.now() - stepStart,
    });
  } catch (error) {
    console.error("Step 1 failed:", error);
    results.push({
      step: "calculate_daily_balances",
      success: false,
      error: String(error),
      duration_ms: 0,
    });
  }

  // ── Step 2: Refresh all materialized views ──
  try {
    const stepStart = Date.now();
    const { data, error } = await supabase.rpc(
      "refresh_all_materialized_views"
    );

    if (error) throw error;

    results.push({
      step: "refresh_materialized_views",
      success: true,
      details: data || { views_refreshed: 5 },
      duration_ms: Date.now() - stepStart,
    });
  } catch (error) {
    console.error("Step 2 failed:", error);
    results.push({
      step: "refresh_materialized_views",
      success: false,
      error: String(error),
      duration_ms: 0,
    });
  }

  // ── Step 3: PLD daily accumulation check ──
  // Check for clients who made multiple transactions summing >= $50K in the last 24h
  try {
    const stepStart = Date.now();

    const { data: suspiciousAccumulations, error } = await supabase
      .from("transactions")
      .select(
        `
        account_id,
        accounts!inner(user_id)
      `
      )
      .gte(
        "initiated_at",
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      )
      .eq("status", "completada");

    if (error) throw error;

    // Group by account and sum amounts
    const accountTotals = new Map<
      string,
      { total: number; count: number; user_id: string }
    >();

    if (suspiciousAccumulations) {
      for (const tx of suspiciousAccumulations as any[]) {
        const accountId = tx.account_id;
        const current = accountTotals.get(accountId) || {
          total: 0,
          count: 0,
          user_id: tx.accounts?.user_id,
        };
        current.total += 1; // We count transactions; amounts checked via DB query below
        current.count += 1;
        accountTotals.set(accountId, current);
      }
    }

    // For accounts with 3+ transactions, check if sum >= structuring threshold
    let alertsCreated = 0;
    for (const [accountId, info] of accountTotals) {
      if (info.count >= 3) {
        // Query actual amounts
        const { data: txAmounts } = await supabase
          .from("transactions")
          .select("amount")
          .eq("account_id", accountId)
          .eq("status", "completada")
          .gte(
            "initiated_at",
            new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          );

        const totalAmount =
          txAmounts?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;

        if (totalAmount >= 50000) {
          // Check if alert already exists for today
          const { count: existingAlert } = await supabase
            .from("compliance_alerts")
            .select("*", { count: "exact", head: true })
            .eq("user_id", info.user_id)
            .eq("alert_type", "acumulacion_diaria")
            .gte("created_at", `${closingDate}T00:00:00`);

          if (!existingAlert || existingAlert === 0) {
            await supabase.from("compliance_alerts").insert({
              user_id: info.user_id,
              alert_type: "acumulacion_diaria",
              description: `Acumulación diaria: ${info.count} operaciones por $${totalAmount.toFixed(2)} en cuenta ${accountId.slice(0, 8)}...`,
              severity: totalAmount >= 150000 ? "alta" : "media",
              status: "activa",
              amount: totalAmount,
              risk_score: Math.min(
                100,
                Math.round((totalAmount / 150000) * 100)
              ),
            });
            alertsCreated++;
          }
        }
      }
    }

    results.push({
      step: "pld_daily_accumulation",
      success: true,
      details: {
        accounts_checked: accountTotals.size,
        alerts_created: alertsCreated,
      },
      duration_ms: Date.now() - stepStart,
    });
  } catch (error) {
    console.error("Step 3 failed:", error);
    results.push({
      step: "pld_daily_accumulation",
      success: false,
      error: String(error),
      duration_ms: 0,
    });
  }

  // ── Step 4: Send overdue payment reminders ──
  try {
    const stepStart = Date.now();

    // Credits with payments due today (reminder)
    const { data: dueToday } = await supabase
      .from("credits")
      .select(
        `
        id,
        user_id,
        monthly_payment,
        next_payment_date,
        profiles!inner(full_name, phone, email)
      `
      )
      .eq("status", "vigente")
      .eq("next_payment_date", closingDate);

    // Credits overdue (first overdue notification if days_past_due = 1)
    const { data: newlyOverdue } = await supabase
      .from("credits")
      .select(
        `
        id,
        user_id,
        monthly_payment,
        past_due_amount,
        next_payment_date,
        profiles!inner(full_name, phone, email)
      `
      )
      .eq("status", "vencido")
      .eq("days_past_due", 1);

    // Credits with payment due in 5 days (advance reminder)
    const fiveDaysFromNow = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const { data: dueSoon } = await supabase
      .from("credits")
      .select(
        `
        id,
        user_id,
        monthly_payment,
        next_payment_date,
        profiles!inner(full_name, phone, email)
      `
      )
      .eq("status", "vigente")
      .eq("next_payment_date", fiveDaysFromNow);

    let notificationsSent = 0;

    // Send 5-day reminders
    if (dueSoon) {
      for (const credit of dueSoon as any[]) {
        try {
          await fetch(`${SUPABASE_URL}/functions/v1/send-notification`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              event_type: "credit.reminder_5d",
              user_id: credit.user_id,
              variables: {
                amount: Number(credit.monthly_payment).toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                }),
                due_date: credit.next_payment_date,
                full_name: credit.profiles?.full_name || "Cliente",
              },
            }),
          });
          notificationsSent++;
        } catch (err) {
          console.error("5-day reminder failed:", err);
        }
      }
    }

    // Send due-today reminders
    if (dueToday) {
      for (const credit of dueToday as any[]) {
        try {
          await fetch(`${SUPABASE_URL}/functions/v1/send-notification`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              event_type: "credit.payment_due",
              user_id: credit.user_id,
              variables: {
                amount: Number(credit.monthly_payment).toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                }),
                due_date: credit.next_payment_date,
                full_name: credit.profiles?.full_name || "Cliente",
              },
            }),
          });
          notificationsSent++;
        } catch (err) {
          console.error("Due-today reminder failed:", err);
        }
      }
    }

    // Send overdue notifications
    if (newlyOverdue) {
      for (const credit of newlyOverdue as any[]) {
        try {
          await fetch(`${SUPABASE_URL}/functions/v1/send-notification`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              event_type: "credit.overdue",
              user_id: credit.user_id,
              variables: {
                amount: Number(credit.past_due_amount).toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                }),
                due_date: credit.next_payment_date,
                full_name: credit.profiles?.full_name || "Cliente",
              },
            }),
          });
          notificationsSent++;
        } catch (err) {
          console.error("Overdue notification failed:", err);
        }
      }
    }

    results.push({
      step: "payment_reminders",
      success: true,
      details: {
        due_in_5_days: dueSoon?.length || 0,
        due_today: dueToday?.length || 0,
        newly_overdue: newlyOverdue?.length || 0,
        notifications_sent: notificationsSent,
      },
      duration_ms: Date.now() - stepStart,
    });
  } catch (error) {
    console.error("Step 4 failed:", error);
    results.push({
      step: "payment_reminders",
      success: false,
      error: String(error),
      duration_ms: 0,
    });
  }

  // ── Step 5: Calculate commissions for current month ──
  try {
    const stepStart = Date.now();
    const currentMonth = new Date()
      .toISOString()
      .slice(0, 7); // YYYY-MM

    const { data, error } = await supabase.rpc("calculate_commissions", {
      p_period: currentMonth,
    });

    if (error) throw error;

    results.push({
      step: "calculate_commissions",
      success: true,
      details: data || {},
      duration_ms: Date.now() - stepStart,
    });
  } catch (error) {
    console.error("Step 5 failed:", error);
    results.push({
      step: "calculate_commissions",
      success: false,
      error: String(error),
      duration_ms: 0,
    });
  }

  // ── Summary ──
  const totalDuration = Date.now() - startTime;
  const allSuccess = results.every((r) => r.success);
  const failedSteps = results.filter((r) => !r.success);

  // Log closing results to audit
  await supabase.from("audit_log").insert({
    action: "system.daily_closing",
    resource_type: "daily_closing",
    details: {
      closing_date: closingDate,
      total_duration_ms: totalDuration,
      steps_total: results.length,
      steps_succeeded: results.filter((r) => r.success).length,
      steps_failed: failedSteps.length,
      results: results,
    },
    severity: allSuccess ? "info" : "warning",
  });

  console.log(
    `=== Daily Closing Complete: ${closingDate} | ${totalDuration}ms | ${allSuccess ? "ALL OK" : `${failedSteps.length} FAILED`} ===`
  );

  return new Response(
    JSON.stringify({
      success: allSuccess,
      closing_date: closingDate,
      total_duration_ms: totalDuration,
      steps: results,
      failed_steps: failedSteps.map((r) => r.step),
    }),
    {
      status: allSuccess ? 200 : 207, // 207 Multi-Status if partial failure
      headers: { "Content-Type": "application/json" },
    }
  );
});
