import { test, expect } from "@playwright/test";

test("chat page loads", async ({ page }) => {
  await page.goto("/chat");
  await expect(page.locator("h1")).toContainText("Chat");
});
