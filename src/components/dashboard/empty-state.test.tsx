import { describe, it, expect } from "vitest"

describe("EmptyState", () => {
  it("should export EmptyState component", async () => {
    const mod = await import("./empty-state")
    expect(mod.EmptyState).toBeDefined()
  })
})
