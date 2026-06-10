import { expect, test } from "@playwright/test";

test("user can open a dream from the archive and read detail content", async ({ page }) => {
  await page.goto("/archive");
  await page.getByRole("link", { name: /끝없이 이어지는 복도/ }).click();

  await expect(page).toHaveURL(/\/dreams\/seed-school$/);
  await expect(page.getByRole("heading", { name: "끝없이 이어지는 복도" })).toBeVisible();
  await expect(page.getByText("현재 상태")).toBeVisible();
});

test("archive layout remains stable on tablet", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("/archive");

  const hasOverflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
  expect(hasOverflow).toBe(false);
  await expect(page.getByRole("heading", { name: "보관함" })).toBeVisible();
});
