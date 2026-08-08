import { test, expect } from "@playwright/test";

test("ui generator page loads", async ({ page }) => {
  await page.goto("/ui-generator");
  await expect(page.locator("h1")).toContainText("UI Generator");
});
