import { test, expect } from "@playwright/test";

test("billing page loads", async ({ page }) => {
  await page.goto("/settings/billing");
  await expect(page.locator("h1")).toContainText("Billing");
});
