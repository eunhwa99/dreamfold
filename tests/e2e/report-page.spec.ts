import { expect, test } from "@playwright/test";

test("report page shows recurring emotions and symbols", async ({ page }) => {
  await page.goto("/report");

  await expect(page.getByRole("heading", { name: "내 리포트" })).toBeVisible();
  await expect(page.getByText("지금 가장 오래 머무는 감정")).toBeVisible();
  await expect(page.getByText("최근 3개의 꿈에서").first()).toBeVisible();
  await expect(page.getByText("이전 흐름과 비교하면").first()).toBeVisible();
});
