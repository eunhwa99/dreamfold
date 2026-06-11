import { expect, test } from "@playwright/test";

test("home page shows the DreamFold shell and primary prompt", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "dreamfold" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "꿈 기록" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "내 리포트" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "오늘의 꿈, 기록해볼까요?" })).toBeVisible();
  await expect(page.getByText("좋은 아침이에요")).toBeVisible();
  await expect(page.getByText("최근 기록").first()).toBeVisible();
  await expect(page.getByText("이번 흐름")).toBeVisible();
  await expect(page.getByText("되풀이되는 상징")).toBeVisible();
});

test("desktop home shell feels like a web app instead of a narrow phone frame", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/");

  const shellMetrics = await page.evaluate(() => {
    const shell = document.querySelector(".app-shell");
    const pageShell = document.querySelector(".page-shell");

    if (!(shell instanceof HTMLElement) || !(pageShell instanceof HTMLElement)) {
      throw new Error("expected app shell elements to exist");
    }

    return {
      shellWidth: shell.getBoundingClientRect().width,
      pageShellWidth: pageShell.getBoundingClientRect().width,
      shellRadius: getComputedStyle(pageShell).borderTopLeftRadius
    };
  });

  expect(shellMetrics.shellWidth).toBeGreaterThan(960);
  expect(shellMetrics.pageShellWidth).toBeGreaterThan(900);
  expect(shellMetrics.shellRadius).not.toBe("44px");
});

test("main navigation links move between all primary screens", async ({ page }) => {
  await page.goto("/");

  const nav = page.getByRole("navigation", { name: "Main navigation" });

  await nav.getByRole("link", { name: "꿈 기록" }).click();
  await expect(page).toHaveURL(/\/record$/);

  await nav.getByRole("link", { name: "내 리포트" }).click();
  await expect(page).toHaveURL(/\/report$/);

  await nav.getByRole("link", { name: "보관함" }).click();
  await expect(page).toHaveURL(/\/archive$/);

  await nav.getByRole("link", { name: "홈" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("home page filters entries by selected mood", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "여운 필터" }).click();
  await expect(page).toHaveURL(/mood=%EC%97%AC%EC%9A%B4/);
  await expect(page.getByText("바다 위의 집")).toBeVisible();
  await expect(page.getByText("끝없이 이어지는 복도")).toHaveCount(0);
});
