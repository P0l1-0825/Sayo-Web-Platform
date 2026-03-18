// ============================================================
// SAYO — Edge Function: Send Notification
// ============================================================
// Dispatches notifications through multiple channels:
// - Email (Resend API)
// - SMS (Twilio API)
// - Push (FCM - Firebase Cloud Messaging)
// - In-App (Supabase insert to notifications table)
// Uses templates from notification_templates table.
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// External service keys (optional — graceful degradation if not set)
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");
const FCM_SERVER_KEY = Deno.env.get("FCM_SERVER_KEY");

const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL") || "notificaciones@sayo.mx";
const SENDER_NAME = Deno.env.get("SENDER_NAME") || "SAYO";

interface NotificationRequest {
  event_type: string;
  user_id?: string;
  channels?: ("email" | "sms" | "push" | "in_app")[];
  variables?: Record<string, string>;
  // Direct send (bypass template)
  direct_message?: string;
  direct_subject?: string;
  direct_channel?: "email" | "sms" | "push" | "in_app";
  // Recipient overrides
  to_email?: string;
  to_phone?: string;
  to_device_token?: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  event_type: string;
  channel: string;
  subject: string | null;
  body: string;
  variables: string[];
  is_active: boolean;
}

// Replace {{variable}} placeholders in template text
function interpolateTemplate(
  text: string,
  variables: Record<string, string>
): string {
  let result = text;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }
  return result;
}

// Send email via Resend API
async function sendEmail(
  to: string,
  subject: string,
  body: string
): Promise<{ success: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured — email skipped");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
        to: [to],
        subject: subject,
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #00d4aa; margin: 0; font-size: 28px; font-weight: 700;">SAYO</h1>
              <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 12px;">SOLVENDOM SOFOM E.N.R.</p>
            </div>
            <div style="background: #ffffff; padding: 32px 24px; border: 1px solid #e2e8f0; border-top: none;">
              ${body.replace(/\n/g, "<br>")}
            </div>
            <div style="background: #f8fafc; padding: 16px 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                © ${new Date().getFullYear()} SAYO — SOLVENDOM SOFOM E.N.R.<br>
                Este correo es informativo. No respondas a este mensaje.
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Resend API error:", errorData);
      return { success: false, error: `Resend error: ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: String(error) };
  }
}

// Send SMS via Twilio API
async function sendSMS(
  to: string,
  body: string
): Promise<{ success: boolean; error?: string }> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.warn("Twilio not configured — SMS skipped");
    return { success: false, error: "SMS service not configured" };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    const formData = new URLSearchParams();
    formData.append("To", to);
    formData.append("From", TWILIO_PHONE_NUMBER);
    formData.append("Body", body);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Twilio API error:", errorData);
      return { success: false, error: `Twilio error: ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    console.error("SMS send error:", error);
    return { success: false, error: String(error) };
  }
}

// Send push notification via FCM
async function sendPush(
  deviceToken: string,
  title: string,
  body: string
): Promise<{ success: boolean; error?: string }> {
  if (!FCM_SERVER_KEY) {
    console.warn("FCM_SERVER_KEY not configured — push skipped");
    return { success: false, error: "Push service not configured" };
  }

  try {
    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        Authorization: `key=${FCM_SERVER_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: deviceToken,
        notification: {
          title,
          body,
          icon: "/icons/sayo-icon-192.png",
          click_action: "https://app.sayo.mx",
        },
        data: {
          type: "notification",
          timestamp: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("FCM API error:", errorData);
      return { success: false, error: `FCM error: ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    console.error("Push send error:", error);
    return { success: false, error: String(error) };
  }
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payload: NotificationRequest = await req.json();

    if (!payload.event_type && !payload.direct_message) {
      return new Response(
        JSON.stringify({
          error: "event_type or direct_message is required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const results: {
      channel: string;
      success: boolean;
      error?: string;
    }[] = [];

    // Fetch user profile if user_id is provided
    let userProfile: {
      email?: string;
      phone?: string;
      full_name?: string;
      device_token?: string;
    } | null = null;

    if (payload.user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, phone, full_name")
        .eq("id", payload.user_id)
        .single();

      userProfile = profile;
    }

    // Determine recipient details
    const recipientEmail =
      payload.to_email || userProfile?.email || null;
    const recipientPhone =
      payload.to_phone || userProfile?.phone || null;
    const recipientDeviceToken =
      payload.to_device_token || null;

    // --- Direct message mode (no template) ---
    if (payload.direct_message) {
      const channel = payload.direct_channel || "in_app";

      if (channel === "email" && recipientEmail) {
        const result = await sendEmail(
          recipientEmail,
          payload.direct_subject || "Notificación SAYO",
          payload.direct_message
        );
        results.push({ channel: "email", ...result });
      } else if (channel === "sms" && recipientPhone) {
        const result = await sendSMS(recipientPhone, payload.direct_message);
        results.push({ channel: "sms", ...result });
      } else if (channel === "push" && recipientDeviceToken) {
        const result = await sendPush(
          recipientDeviceToken,
          payload.direct_subject || "SAYO",
          payload.direct_message
        );
        results.push({ channel: "push", ...result });
      }

      // Always create in-app notification
      if (payload.user_id) {
        await supabase.from("notifications").insert({
          user_id: payload.user_id,
          title: payload.direct_subject || "Notificación",
          message: payload.direct_message,
          type: "info",
          read: false,
        });
        results.push({ channel: "in_app", success: true });
      }

      return new Response(JSON.stringify({ success: true, results }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // --- Template-based mode ---
    // Fetch all matching templates for the event type
    const { data: templates, error: templateError } = await supabase
      .from("notification_templates")
      .select("*")
      .eq("event_type", payload.event_type)
      .eq("is_active", true);

    if (templateError || !templates || templates.length === 0) {
      console.warn(
        `No active templates found for event: ${payload.event_type}`
      );
      return new Response(
        JSON.stringify({
          success: false,
          error: `No templates for event_type: ${payload.event_type}`,
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build variables map (merge template defaults with provided)
    const variables: Record<string, string> = {
      full_name: userProfile?.full_name || "Cliente",
      ...(payload.variables || {}),
    };

    // Filter templates by requested channels (if specified)
    const filteredTemplates = payload.channels
      ? templates.filter((t: NotificationTemplate) =>
          payload.channels!.includes(t.channel as "email" | "sms" | "push" | "in_app")
        )
      : templates;

    // Process each template
    for (const template of filteredTemplates as NotificationTemplate[]) {
      const interpolatedBody = interpolateTemplate(template.body, variables);
      const interpolatedSubject = template.subject
        ? interpolateTemplate(template.subject, variables)
        : "Notificación SAYO";

      switch (template.channel) {
        case "email":
          if (recipientEmail) {
            const result = await sendEmail(
              recipientEmail,
              interpolatedSubject,
              interpolatedBody
            );
            results.push({ channel: "email", ...result });
          } else {
            results.push({
              channel: "email",
              success: false,
              error: "No email address available",
            });
          }
          break;

        case "sms":
          if (recipientPhone) {
            const result = await sendSMS(recipientPhone, interpolatedBody);
            results.push({ channel: "sms", ...result });
          } else {
            results.push({
              channel: "sms",
              success: false,
              error: "No phone number available",
            });
          }
          break;

        case "push":
          if (recipientDeviceToken) {
            const result = await sendPush(
              recipientDeviceToken,
              interpolatedSubject,
              interpolatedBody
            );
            results.push({ channel: "push", ...result });
          } else {
            results.push({
              channel: "push",
              success: false,
              error: "No device token available",
            });
          }
          break;

        case "in_app":
          if (payload.user_id) {
            await supabase.from("notifications").insert({
              user_id: payload.user_id,
              title: interpolatedSubject,
              message: interpolatedBody,
              type: template.event_type.includes("alert") ? "warning" : "info",
              read: false,
            });
            results.push({ channel: "in_app", success: true });
          }
          break;
      }
    }

    // Always create in-app notification (if user_id and not already done)
    if (
      payload.user_id &&
      !results.some((r) => r.channel === "in_app")
    ) {
      const firstTemplate = filteredTemplates[0] as NotificationTemplate;
      const body = interpolateTemplate(firstTemplate.body, variables);
      const subject = firstTemplate.subject
        ? interpolateTemplate(firstTemplate.subject, variables)
        : "Notificación SAYO";

      await supabase.from("notifications").insert({
        user_id: payload.user_id,
        title: subject,
        message: body,
        type: "info",
        read: false,
      });
      results.push({ channel: "in_app", success: true });
    }

    // Log notification dispatch
    await supabase.from("audit_log").insert({
      user_id: payload.user_id || null,
      action: "notification.dispatch",
      resource_type: "notification",
      details: {
        event_type: payload.event_type,
        channels_attempted: results.map((r) => r.channel),
        channels_succeeded: results
          .filter((r) => r.success)
          .map((r) => r.channel),
        template_count: filteredTemplates.length,
      },
      severity: "info",
    });

    return new Response(
      JSON.stringify({
        success: results.some((r) => r.success),
        event_type: payload.event_type,
        templates_matched: filteredTemplates.length,
        results,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Notification dispatch error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
