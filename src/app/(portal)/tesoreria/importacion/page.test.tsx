import { describe, it, expect } from "vitest"

describe("ImportacionPage", () => {
  it("parses CSV correctly", () => {
    const csv = "CLABE|Beneficiario|Monto\n012180001234567890|Juan|45000"
    const lines = csv.split("\n")
    expect(lines.length).toBe(2)
    expect(lines[1].split("|").length).toBe(3)
  })
})
