// ============================================================
// SAYO — Edge Function: Generate CNBV Report
// ============================================================
// Generates regulatory reports for Mexico's CNBV:
// - ROI  (Reporte de Operaciones Internas): Monthly internal ops
// - ROP  (Reporte de Operaciones Preocupantes): Concerning ops
// - RO24H (Reporte de Operaciones en 24 Horas): Urgent 24h report
// Reports are generated in XML format per CNBV specifications,
// stored in the cnbv-reports Storage bucket, and tracked in
// the cnbv_reports table.
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// SAYO entity info for CNBV reports
const ENTITY_INFO = {
  clave_entidad: "SOFOM-SAYO-001",
  nombre_entidad: "SOLVENDOM SOFOM E.N.R.",
  rfc_entidad: "SOL230101ABC",
  clave_sujeto_obligado: "40",
  tipo_reporte: "SOFOM_ENR",
};

interface ReportRequest {
  type: "ROI" | "ROP" | "RO24H";
  period: string; // "2026-01" for monthly, "2026-03-09" for daily
  submitted_by: string; // user UUID
}

interface AlertForReport {
  id: string;
  alert_type: string;
  description: string;
  severity: string;
  amount: number | null;
  risk_score: number | null;
  client_name: string | null;
  user_id: string | null;
  created_at: string;
  status: string;
}

// Escape XML special characters
function escapeXml(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Format date to CNBV format (YYYYMMDD)
function formatCnbvDate(dateStr: string): string {
  return dateStr.replace(/-/g, "").slice(0, 8);
}

// Generate unique folio for CNBV report
function generateFolio(type: string, period: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  return `SAYO-${type}-${period.replace(/-/g, "")}-${timestamp}`;
}

// Build ROI XML — Monthly report of relevant operations (> $50K)
function buildROI(
  alerts: AlertForReport[],
  period: string,
  folio: string
): string {
  const relevantAlerts = alerts.filter(
    (a) =>
      a.alert_type === "operacion_relevante" ||
      (a.amount && a.amount >= 50000)
  );

  const operaciones = relevantAlerts
    .map(
      (alert, idx) => `
    <operacion numero="${idx + 1}">
      <tipo_operacion>${escapeXml(alert.alert_type)}</tipo_operacion>
      <fecha_operacion>${formatCnbvDate(alert.created_at)}</fecha_operacion>
      <monto>${alert.amount?.toFixed(2) || "0.00"}</monto>
      <moneda>MXN</moneda>
      <nombre_cliente>${escapeXml(alert.client_name)}</nombre_cliente>
      <descripcion>${escapeXml(alert.description)}</descripcion>
      <nivel_riesgo>${alert.risk_score || 0}</nivel_riesgo>
      <estatus>${escapeXml(alert.status)}</estatus>
      <referencia_interna>${alert.id.slice(0, 8)}</referencia_interna>
    </operacion>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<reporte_operaciones_internas xmlns="urn:cnbv:sofom:roi:v1">
  <encabezado>
    <clave_entidad>${ENTITY_INFO.clave_entidad}</clave_entidad>
    <nombre_entidad>${escapeXml(ENTITY_INFO.nombre_entidad)}</nombre_entidad>
    <rfc>${ENTITY_INFO.rfc_entidad}</rfc>
    <clave_sujeto_obligado>${ENTITY_INFO.clave_sujeto_obligado}</clave_sujeto_obligado>
    <tipo_reporte>ROI</tipo_reporte>
    <periodo>${period}</periodo>
    <folio>${folio}</folio>
    <fecha_generacion>${new Date().toISOString()}</fecha_generacion>
    <total_operaciones>${relevantAlerts.length}</total_operaciones>
    <monto_total>${relevantAlerts.reduce((sum, a) => sum + (a.amount || 0), 0).toFixed(2)}</monto_total>
  </encabezado>
  <operaciones>${operaciones}
  </operaciones>
</reporte_operaciones_internas>`;
}

// Build ROP XML — Report of concerning/suspicious operations
function buildROP(
  alerts: AlertForReport[],
  period: string,
  folio: string
): string {
  const concerningAlerts = alerts.filter(
    (a) =>
      a.alert_type === "operacion_preocupante" ||
      a.alert_type === "fragmentacion" ||
      a.alert_type === "pais_alto_riesgo" ||
      a.alert_type === "coincidencia_listas" ||
      a.alert_type === "coincidencia_pep" ||
      a.severity === "critica" ||
      a.severity === "alta"
  );

  const operaciones = concerningAlerts
    .map(
      (alert, idx) => `
    <operacion_preocupante numero="${idx + 1}">
      <tipo_alerta>${escapeXml(alert.alert_type)}</tipo_alerta>
      <fecha_deteccion>${formatCnbvDate(alert.created_at)}</fecha_deteccion>
      <severidad>${escapeXml(alert.severity)}</severidad>
      <monto>${alert.amount?.toFixed(2) || "0.00"}</monto>
      <moneda>MXN</moneda>
      <nombre_cliente>${escapeXml(alert.client_name)}</nombre_cliente>
      <descripcion_conducta>${escapeXml(alert.description)}</descripcion_conducta>
      <puntaje_riesgo>${alert.risk_score || 0}</puntaje_riesgo>
      <estatus_investigacion>${escapeXml(alert.status)}</estatus_investigacion>
      <referencia_interna>${alert.id.slice(0, 8)}</referencia_interna>
      <razon_preocupacion>
        ${alert.alert_type === "fragmentacion" ? "Posible estructuración de operaciones para evadir controles" : ""}
        ${alert.alert_type === "pais_alto_riesgo" ? "Operación vinculada a jurisdicción de alto riesgo" : ""}
        ${alert.alert_type === "coincidencia_listas" ? "Coincidencia con listas de sanciones internacionales" : ""}
        ${alert.alert_type === "coincidencia_pep" ? "Cliente identificado como Persona Políticamente Expuesta" : ""}
        ${alert.alert_type === "operacion_preocupante" ? "Operación que excede umbrales regulatorios" : ""}
      </razon_preocupacion>
    </operacion_preocupante>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<reporte_operaciones_preocupantes xmlns="urn:cnbv:sofom:rop:v1">
  <encabezado>
    <clave_entidad>${ENTITY_INFO.clave_entidad}</clave_entidad>
    <nombre_entidad>${escapeXml(ENTITY_INFO.nombre_entidad)}</nombre_entidad>
    <rfc>${ENTITY_INFO.rfc_entidad}</rfc>
    <clave_sujeto_obligado>${ENTITY_INFO.clave_sujeto_obligado}</clave_sujeto_obligado>
    <tipo_reporte>ROP</tipo_reporte>
    <periodo>${period}</periodo>
    <folio>${folio}</folio>
    <fecha_generacion>${new Date().toISOString()}</fecha_generacion>
    <total_operaciones_preocupantes>${concerningAlerts.length}</total_operaciones_preocupantes>
    <monto_total>${concerningAlerts.reduce((sum, a) => sum + (a.amount || 0), 0).toFixed(2)}</monto_total>
  </encabezado>
  <operaciones_preocupantes>${operaciones}
  </operaciones_preocupantes>
</reporte_operaciones_preocupantes>`;
}

// Build RO24H XML — Urgent 24-hour report (critical severity)
function buildRO24H(
  alerts: AlertForReport[],
  period: string,
  folio: string
): string {
  const urgentAlerts = alerts.filter(
    (a) =>
      a.severity === "critica" ||
      (a.amount && a.amount >= 150000) ||
      a.alert_type === "coincidencia_listas"
  );

  const operaciones = urgentAlerts
    .map(
      (alert, idx) => `
    <operacion_urgente numero="${idx + 1}">
      <tipo_alerta>${escapeXml(alert.alert_type)}</tipo_alerta>
      <fecha_deteccion>${formatCnbvDate(alert.created_at)}</fecha_deteccion>
      <hora_deteccion>${new Date(alert.created_at).toTimeString().slice(0, 8)}</hora_deteccion>
      <severidad>CRITICA</severidad>
      <monto>${alert.amount?.toFixed(2) || "0.00"}</monto>
      <moneda>MXN</moneda>
      <nombre_involucrado>${escapeXml(alert.client_name)}</nombre_involucrado>
      <descripcion>${escapeXml(alert.description)}</descripcion>
      <puntaje_riesgo>${alert.risk_score || 0}</puntaje_riesgo>
      <referencia_interna>${alert.id.slice(0, 8)}</referencia_interna>
      <accion_tomada>Alerta generada automáticamente. Pendiente de investigación por oficial PLD.</accion_tomada>
    </operacion_urgente>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<reporte_operaciones_24h xmlns="urn:cnbv:sofom:ro24h:v1">
  <encabezado>
    <clave_entidad>${ENTITY_INFO.clave_entidad}</clave_entidad>
    <nombre_entidad>${escapeXml(ENTITY_INFO.nombre_entidad)}</nombre_entidad>
    <rfc>${ENTITY_INFO.rfc_entidad}</rfc>
    <clave_sujeto_obligado>${ENTITY_INFO.clave_sujeto_obligado}</clave_sujeto_obligado>
    <tipo_reporte>RO24H</tipo_reporte>
    <fecha_reporte>${period}</fecha_reporte>
    <folio>${folio}</folio>
    <fecha_generacion>${new Date().toISOString()}</fecha_generacion>
    <total_operaciones_urgentes>${urgentAlerts.length}</total_operaciones_urgentes>
    <requiere_atencion_inmediata>${urgentAlerts.length > 0 ? "SI" : "NO"}</requiere_atencion_inmediata>
  </encabezado>
  <operaciones_urgentes>${operaciones}
  </operaciones_urgentes>
</reporte_operaciones_24h>`;
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payload: ReportRequest = await req.json();

    if (!payload.type || !["ROI", "ROP", "RO24H"].includes(payload.type)) {
      return new Response(
        JSON.stringify({
          error: "type must be ROI, ROP, or RO24H",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!payload.period) {
      return new Response(
        JSON.stringify({
          error: "period is required (YYYY-MM for ROI/ROP, YYYY-MM-DD for RO24H)",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const folio = generateFolio(payload.type, payload.period);

    // Determine date range based on report type
    let dateFrom: string;
    let dateTo: string;

    if (payload.type === "RO24H") {
      // Daily report: specific date
      dateFrom = `${payload.period}T00:00:00`;
      dateTo = `${payload.period}T23:59:59`;
    } else {
      // Monthly report: full month
      dateFrom = `${payload.period}-01T00:00:00`;
      const [year, month] = payload.period.split("-").map(Number);
      const lastDay = new Date(year, month, 0).getDate();
      dateTo = `${payload.period}-${lastDay}T23:59:59`;
    }

    // Fetch compliance alerts for the period
    const { data: alerts, error: alertsError } = await supabase
      .from("compliance_alerts")
      .select("*")
      .gte("created_at", dateFrom)
      .lte("created_at", dateTo)
      .order("created_at", { ascending: true });

    if (alertsError) {
      throw new Error(`Failed to fetch alerts: ${alertsError.message}`);
    }

    const alertList = (alerts as AlertForReport[]) || [];

    // Generate XML based on report type
    let xmlContent: string;
    switch (payload.type) {
      case "ROI":
        xmlContent = buildROI(alertList, payload.period, folio);
        break;
      case "ROP":
        xmlContent = buildROP(alertList, payload.period, folio);
        break;
      case "RO24H":
        xmlContent = buildRO24H(alertList, payload.period, folio);
        break;
    }

    // Store XML file in Storage
    const fileName = `${payload.type}/${payload.period}/${folio}.xml`;
    const xmlBlob = new Blob([xmlContent], { type: "application/xml" });

    const { error: uploadError } = await supabase.storage
      .from("cnbv-reports")
      .upload(fileName, xmlBlob, {
        contentType: "application/xml",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      // Continue even if upload fails — we still save report_data
    }

    // Count alerts by type for summary
    const alertsByType: Record<string, number> = {};
    for (const alert of alertList) {
      alertsByType[alert.alert_type] =
        (alertsByType[alert.alert_type] || 0) + 1;
    }

    const totalAmount = alertList.reduce(
      (sum, a) => sum + (a.amount || 0),
      0
    );

    // Create/update record in cnbv_reports table
    const { data: reportRecord, error: reportError } = await supabase
      .from("cnbv_reports")
      .insert({
        type: payload.type,
        status: "borrador",
        period: payload.period,
        alert_count: alertList.length,
        total_amount: totalAmount,
        report_data: {
          folio,
          file_path: fileName,
          alerts_by_type: alertsByType,
          generated_at: new Date().toISOString(),
          period_from: dateFrom,
          period_to: dateTo,
        },
        submitted_by: payload.submitted_by || null,
      })
      .select("id")
      .single();

    if (reportError) {
      console.error("Failed to create report record:", reportError);
    }

    // Audit log
    await supabase.from("audit_log").insert({
      user_id: payload.submitted_by || null,
      action: "cnbv.report_generated",
      resource_type: "cnbv_report",
      resource_id: reportRecord?.id || null,
      details: {
        report_type: payload.type,
        period: payload.period,
        folio,
        alert_count: alertList.length,
        total_amount: totalAmount,
        file_path: fileName,
        alerts_by_type: alertsByType,
      },
      severity: "info",
    });

    return new Response(
      JSON.stringify({
        success: true,
        report_id: reportRecord?.id,
        type: payload.type,
        period: payload.period,
        folio,
        alert_count: alertList.length,
        total_amount: totalAmount,
        alerts_by_type: alertsByType,
        file_path: fileName,
        storage_uploaded: !uploadError,
        status: "borrador",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("CNBV report generation error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
