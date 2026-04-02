// ============================================================
// SAYO — concentradora-service.ts tests
//
// Tests for the concentradora service layer, covering both
// demo mode (inline data) and API mode (delegated to api client).
// ============================================================

import { describe, it, expect, vi, beforeEach } from "vitest"

// ─── Mock the API client ──────────────────────────────────────

vi.mock("./api-client", () => ({
  api: {
    get:  vi.fn(),
    post: vi.fn(),
  },
  isDemoMode: false,
}))

vi.mock("./supabase", () => ({
  isDemoMode: false,
}))

import { api, isDemoMode as _isDemoMode } from "./api-client"
import { concentradoraService } from "./concentradora-service"

// ─── GET concentradora ────────────────────────────────────────

describe("concentradoraService.getConcentradora", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("calls GET /api/v1/banking/concentradora/ in API mode", async () => {
    const mockData = { id: "conc-001", name: "SOLVENDOM", clabe: "684180297007000000", balance_opm: 1500000 }
    ;(api.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockData)

    const result = await concentradoraService.getConcentradora()
    expect(api.get).toHaveBeenCalledWith("/api/v1/banking/concentradora/")
    expect(result.clabe).toBe("684180297007000000")
  })
})

// ─── GET subcuentas ───────────────────────────────────────────

describe("concentradoraService.getSubcuentas", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("calls GET /api/v1/banking/concentradora/subcuentas in API mode", async () => {
    const mockData = { data: [], total: 0 }
    ;(api.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockData)

    const result = await concentradoraService.getSubcuentas()
    expect(api.get).toHaveBeenCalledWith(expect.stringContaining("/api/v1/banking/concentradora/subcuentas"))
    expect(result).toEqual(mockData)
  })

  it("appends status query param when provided", async () => {
    ;(api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [], total: 0 })
    await concentradoraService.getSubcuentas({ status: "blocked" })
    expect(api.get).toHaveBeenCalledWith(expect.stringContaining("status=blocked"))
  })
})

// ─── GET reconciliation ───────────────────────────────────────

describe("concentradoraService.getReconciliation", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("calls GET /api/v1/banking/concentradora/reconciliation", async () => {
    const mockData = { is_reconciled: true, balance_diff: 0, balance_opm: 1500000 }
    ;(api.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockData)

    const result = await concentradoraService.getReconciliation()
    expect(api.get).toHaveBeenCalledWith("/api/v1/banking/concentradora/reconciliation")
    expect(result.is_reconciled).toBe(true)
  })
})

// ─── POST createSubcuenta ─────────────────────────────────────

describe("concentradoraService.createSubcuenta", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("calls POST /api/v1/banking/concentradora/subcuentas with correct body", async () => {
    const created = {
      account_id: "acc-new", clabe: "684180297007000164",
      subcuenta_number: "00016", sayo_id: "SAYO-TEST1",
    }
    ;(api.post as ReturnType<typeof vi.fn>).mockResolvedValue(created)

    const result = await concentradoraService.createSubcuenta({ full_name: "Test User", user_id: "user-123" })
    expect(api.post).toHaveBeenCalledWith(
      "/api/v1/banking/concentradora/subcuentas",
      { full_name: "Test User", user_id: "user-123" }
    )
    expect(result.clabe).toMatch(/^684180297007/)
  })

  it("calls POST without user_id when not provided", async () => {
    ;(api.post as ReturnType<typeof vi.fn>).mockResolvedValue({ account_id: "acc-nouser" })
    await concentradoraService.createSubcuenta({ full_name: "Unlinked Account" })
    expect(api.post).toHaveBeenCalledWith(
      "/api/v1/banking/concentradora/subcuentas",
      { full_name: "Unlinked Account" }
    )
  })
})

// ─── POST syncBalance ─────────────────────────────────────────

describe("concentradoraService.syncBalance", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("calls POST /api/v1/banking/concentradora/sync-balance", async () => {
    const syncResult = { balance_opm: 1500000, is_reconciled: true, synced_at: new Date().toISOString() }
    ;(api.post as ReturnType<typeof vi.fn>).mockResolvedValue(syncResult)

    const result = await concentradoraService.syncBalance()
    expect(api.post).toHaveBeenCalledWith("/api/v1/banking/concentradora/sync-balance")
    expect(result.balance_opm).toBe(1500000)
  })
})

// ─── GET movements ────────────────────────────────────────────

describe("concentradoraService.getMovements", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("calls GET /api/v1/banking/concentradora/movements", async () => {
    const mockData = { data: [{ id: "cm-001", type: "spei_in" }], total: 1 }
    ;(api.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockData)

    const result = await concentradoraService.getMovements()
    expect(api.get).toHaveBeenCalledWith(expect.stringContaining("/api/v1/banking/concentradora/movements"))
    expect(result.data).toHaveLength(1)
  })

  it("filters by type when provided", async () => {
    ;(api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [], total: 0 })
    await concentradoraService.getMovements({ type: "sync" })
    expect(api.get).toHaveBeenCalledWith(expect.stringContaining("type=sync"))
  })
})

// ─── Demo mode ────────────────────────────────────────────────

describe("concentradoraService — demo mode", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Force demo mode by intercepting the module
    vi.doMock("./api-client", () => ({
      api: { get: vi.fn(), post: vi.fn() },
      isDemoMode: true,
    }))
  })

  it("getConcentradora returns demo data without calling API", async () => {
    vi.resetModules()
    vi.doMock("./api-client", () => ({
      api: { get: vi.fn(), post: vi.fn() },
      isDemoMode: true,
    }))
    vi.doMock("./supabase", () => ({ isDemoMode: true }))

    const { concentradoraService: svc } = await import("./concentradora-service")
    const result = await svc.getConcentradora()
    expect(result.name).toBe("SOLVENDOM S.A.P.I. DE C.V. SOFOM E.N.R.")
    expect(result.rfc).toBe("SOL230822KH2")
    expect(result.clabe).toBe("684180297007000000")
  })

  it("getSubcuentas returns demo list without calling API", async () => {
    vi.resetModules()
    vi.doMock("./api-client", () => ({
      api: { get: vi.fn(), post: vi.fn() },
      isDemoMode: true,
    }))
    vi.doMock("./supabase", () => ({ isDemoMode: true }))

    const { concentradoraService: svc } = await import("./concentradora-service")
    const result = await svc.getSubcuentas()
    expect(result.data.length).toBeGreaterThan(0)
    expect(result.data[0].clabe).toMatch(/^684180297007/)
  })
})
