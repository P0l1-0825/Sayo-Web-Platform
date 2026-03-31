import { describe, it, expect } from "vitest"

describe("NotificationsDropdown", () => {
  it("should export NotificationsDropdown component", async () => {
    const mod = await import("./notifications-dropdown")
    expect(mod.NotificationsDropdown).toBeDefined()
  })
})
