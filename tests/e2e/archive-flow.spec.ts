import { expect, test } from "@playwright/test";

test("archive page shows a month calendar shell with recorded day markers", async ({ page }) => {
  await page.goto("/archive");

  await expect(page.getByRole("heading", { name: "보관함" })).toBeVisible();
  await expect(page.getByText("기록된 꿈을 다시 열어보고")).toBeVisible();
  await expect(page.getByTestId("archive-calendar")).toBeVisible();
  const previousMonthLink = page.getByRole("link", { name: "이전 달" });
  const nextMonthLink = page.getByRole("link", { name: "다음 달" });

  await expect(previousMonthLink).toBeVisible();
  await expect(nextMonthLink).toBeVisible();
  await expect(page.getByTestId("archive-day-dot").first()).toBeVisible();
  await expect(page.getByLabel("선택한 날짜의 기록")).toHaveCount(0);

  const nextHref = await nextMonthLink.getAttribute("href");
  await nextMonthLink.click();
  await expect(page).toHaveURL(new RegExp(`${nextHref?.replace("?", "\\?")}$`));

  const firstOutsideMonthCell = page.locator('[data-current-month="false"]').first();
  await expect(firstOutsideMonthCell).toBeVisible();
  await expect(firstOutsideMonthCell).not.toHaveJSProperty("tagName", "A");
});

test("archive layout remains stable on tablet", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("/archive");

  const hasOverflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
  expect(hasOverflow).toBe(false);
  await expect(page.getByRole("heading", { name: "보관함" })).toBeVisible();
  await expect(page.getByTestId("archive-calendar")).toBeVisible();
});
