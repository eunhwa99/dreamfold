import { expect, test } from "@playwright/test";

test("report page shows recurring emotions and symbols", async ({ page }) => {
  await page.goto("/report");

  await expect(page.getByRole("heading", { name: "내 리포트" })).toBeVisible();
  await expect(page.getByText("자주 반복된 감정")).toBeVisible();
  await expect(page.getByText("자주 나타난 상징")).toBeVisible();
});
