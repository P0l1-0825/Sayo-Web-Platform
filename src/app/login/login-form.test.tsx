import { describe, it, expect } from "vitest"

describe("LoginForm", () => {
  it("exports LoginForm component", async () => {
    const mod = await import("./login-form")
    expect(mod.LoginForm).toBeDefined()
  })
})
