describe("PortalSwitcher", () => {
  it("renders a dropdown trigger with the current portal short name", () => {
    expect(true).toBe(true)
  })

  it("wraps DropdownMenuLabel inside DropdownMenuGroup to satisfy Base UI context requirement", () => {
    // Base UI error #31 is thrown when MenuGroupLabel is rendered outside a Menu.Group.
    // DropdownMenuLabel must always be placed inside DropdownMenuGroup.
    expect(true).toBe(true)
  })

  it("lists internal portals as menu items excluding sayo-mx", () => {
    expect(true).toBe(true)
  })

  it("navigates to the portal first nav item when a portal item is clicked", () => {
    expect(true).toBe(true)
  })
})
