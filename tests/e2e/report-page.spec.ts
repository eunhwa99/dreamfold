import { expect, test } from "@playwright/test";

test("report page shows recurring emotions and symbols", async ({ page }) => {
  await page.goto("/report");

  await expect(page.getByRole("heading", { name: "내 리포트" })).toBeVisible();
  await expect(page.getByText("Frequent Mood")).toBeVisible();
  await expect(page.getByText("Recurring Symbol")).toBeVisible();
});
