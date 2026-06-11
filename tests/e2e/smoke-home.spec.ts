import { expect, test } from "@playwright/test";

test("home page shows the DreamFold shell and primary prompt", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "dreamfold" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "꿈 기록" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "내 리포트" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "오늘의 꿈, 기록해볼까요?" })).toBeVisible();
  await expect(page.getByText("좋은 아침이에요")).toBeVisible();
  await expect(page.getByText("이번 달 꿈")).toBeVisible();
  await expect(page.getByText("자주 등장")).toBeVisible();
  await expect(page.getByText("감정 톤")).toBeVisible();
});

test("home page uses the approved light palette by default", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");

  const bg = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--bg").trim()
  );

  expect(bg).toBe("#FAF8F4");
});

test("home page switches to the approved dark palette in dark mode", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");

  const bg = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--bg").trim()
  );

  expect(bg).toBe("#11111A");
});
