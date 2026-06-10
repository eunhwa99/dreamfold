import { expect, test } from "@playwright/test";

test("home page shows the dream insight shell", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Dream Insight" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "꿈 기록" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "내 리포트" })).toBeVisible();
});
