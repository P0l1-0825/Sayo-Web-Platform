import { describe, it, expect } from "vitest"

describe("Portal error boundary", () => {
  it("exports a default error component", async () => {
    const mod = await import("./error")
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe("function")
  })
})
