// ============================================================
// SAYO — Edge Function: PLD Screening
// ============================================================
// Screens individuals/entities against sanctions lists:
// - OFAC/SDN (US Treasury)
// - EU Sanctions
// - UN Sanctions
// - National PEP lists (Mexico)
// Returns match results and creates compliance alerts.
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface ScreeningRequest {
  user_id?: string;
  name: string;
  rfc?: string;
  curp?: string;
  check_type?: "full" | "sanctions_only" | "pep_only";
  checked_by?: string;
}

interface MatchResult {
  list: string;
  matched_name: string;
  score: number;
  details: Record<string, unknown>;
}

// Normalize name for comparison (remove accents, lowercase, trim)
function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

// Calculate similarity score using Levenshtein-based approach
function calculateSimilarity(a: string, b: string): number {
  const normalA = normalizeName(a);
  const normalB = normalizeName(b);

  if (normalA === normalB) return 100;

  // Check if one contains the other
  if (normalA.includes(normalB) || normalB.includes(normalA)) {
    return 85;
  }

  // Token-based matching
  const tokensA = normalA.split(" ");
  const tokensB = normalB.split(" ");
  let matchedTokens = 0;

  for (const tokenA of tokensA) {
    for (const tokenB of tokensB) {
      if (tokenA === tokenB && tokenA.length > 2) {
        matchedTokens++;
        break;
      }
    }
  }

  const maxTokens = Math.max(tokensA.length, tokensB.length);
  if (maxTokens === 0) return 0;

  return Math.round((matchedTokens / maxTokens) * 100);
}

// Simulated sanctions list check
// In production, this would call external APIs (OFAC, EU, UN)
async function checkSanctionsLists(
  name: string,
  _rfc?: string
): Promise<MatchResult[]> {
  const matches: MatchResult[] = [];

  // Known high-risk names for demo/testing
  const sanctionedEntities = [
    {
      name: "Joaquín Guzmán Loera",
      list: "OFAC/SDN",
      program: "SDNTK",
      id: "SDN-12345",
    },
    {
      name: "Ismael Zambada García",
      list: "OFAC/SDN",
      program: "SDNTK",
      id: "SDN-12346",
    },
    {
      name: "Cartel del Pacífico SA",
      list: "OFAC/SDN",
      program: "SDNTK",
      id: "SDN-12347",
    },
    {
      name: "Empresa Fantasma Internacional",
      list: "UE_SANCTIONS",
      program: "EU-FRZN",
      id: "EU-5678",
    },
    {
      name: "Offshore Holdings Panama",
      list: "UN_SANCTIONS",
      program: "UN-1267",
      id: "UN-9012",
    },
  ];

  for (const entity of sanctionedEntities) {
    const score = calculateSimilarity(name, entity.name);
    if (score >= 70) {
      matches.push({
        list: entity.list,
        matched_name: entity.name,
        score,
        details: {
          program: entity.program,
          list_id: entity.id,
          match_type: score === 100 ? "exact" : "fuzzy",
        },
      });
    }
  }

  return matches;
}

// Check PEP (Politically Exposed Persons)
async function checkPEPList(
  name: string,
  _rfc?: string
): Promise<MatchResult[]> {
  const matches: MatchResult[] = [];

  // Known PEPs for demo/testing
  // In production, this would check against SFP/INE/CNBV PEP databases
  const pepList = [
    {
      name: "Andrés Manuel López Obrador",
      position: "Ex Presidente de México",
      level: "alto",
    },
    {
      name: "Claudia Sheinbaum Pardo",
      position: "Presidenta de México",
      level: "alto",
    },
    {
      name: "Rogelio Ramírez de la O",
      position: "Secretario de Hacienda",
      level: "alto",
    },
    {
      name: "Victoria Rodríguez Ceja",
      position: "Gobernadora Banxico",
      level: "alto",
    },
  ];

  for (const pep of pepList) {
    const score = calculateSimilarity(name, pep.name);
    if (score >= 70) {
      matches.push({
        list: "PEP_NACIONAL",
        matched_name: pep.name,
        score,
        details: {
          position: pep.position,
          risk_level: pep.level,
          match_type: score === 100 ? "exact" : "fuzzy",
        },
      });
    }
  }

  return matches;
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payload: ScreeningRequest = await req.json();

    if (!payload.name || payload.name.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: "Name is required (min 3 characters)" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const checkType = payload.check_type || "full";
    const allMatches: MatchResult[] = [];
    const listsChecked: string[] = [];

    // Run sanctions checks
    if (checkType === "full" || checkType === "sanctions_only") {
      listsChecked.push("OFAC/SDN", "UE_SANCTIONS", "UN_SANCTIONS");
      const sanctionsMatches = await checkSanctionsLists(
        payload.name,
        payload.rfc
      );
      allMatches.push(...sanctionsMatches);
    }

    // Run PEP checks
    if (checkType === "full" || checkType === "pep_only") {
      listsChecked.push("PEP_NACIONAL");
      const pepMatches = await checkPEPList(payload.name, payload.rfc);
      allMatches.push(...pepMatches);
    }

    const matchFound = allMatches.length > 0;
    const maxScore = matchFound
      ? Math.max(...allMatches.map((m) => m.score))
      : 0;

    // Store check result in pep_checks table
    const { data: pepCheck, error: pepError } = await supabase
      .from("pep_checks")
      .insert({
        user_id: payload.user_id || null,
        check_name: payload.name,
        lists_checked: listsChecked,
        match_found: matchFound,
        match_score: maxScore,
        match_details: { matches: allMatches, rfc: payload.rfc },
        checked_by: payload.checked_by || null,
      })
      .select("id")
      .single();

    if (pepError) {
      console.error("Failed to store PEP check:", pepError);
    }

    // If match found, create compliance alert
    if (matchFound && maxScore >= 70) {
      const highestMatch = allMatches.reduce((a, b) =>
        a.score > b.score ? a : b
      );

      await supabase.from("compliance_alerts").insert({
        user_id: payload.user_id || null,
        alert_type: highestMatch.list.includes("PEP")
          ? "coincidencia_pep"
          : "coincidencia_listas",
        description: `Coincidencia en lista ${highestMatch.list}: "${payload.name}" ~ "${highestMatch.matched_name}" (${highestMatch.score}% similitud)`,
        severity: maxScore >= 90 ? "critica" : maxScore >= 80 ? "alta" : "media",
        status: "activa",
        client_name: payload.name,
        risk_score: maxScore,
      });
    }

    // Audit log
    await supabase.from("audit_log").insert({
      user_id: payload.checked_by || null,
      action: "pld.screening",
      resource_type: "pep_check",
      resource_id: pepCheck?.id || null,
      details: {
        screened_name: payload.name,
        lists_checked: listsChecked,
        match_found: matchFound,
        match_count: allMatches.length,
        max_score: maxScore,
      },
      severity: matchFound ? "warning" : "info",
    });

    return new Response(
      JSON.stringify({
        success: true,
        check_id: pepCheck?.id,
        screened_name: payload.name,
        lists_checked: listsChecked,
        match_found: matchFound,
        match_count: allMatches.length,
        max_score: maxScore,
        matches: allMatches,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("PLD screening error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
