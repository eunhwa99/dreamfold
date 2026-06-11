import { expect, test } from "@playwright/test";

test.describe("record page interactions", () => {
  test("user can type into the dream textarea and click the main CTA", async ({ page }) => {
    await page.goto("/record");

    const textarea = page.getByPlaceholder("사라지기 전에, 기억나는 장면을 적어보세요.");
    await textarea.fill("어두운 바다 위에 집 한 채가 떠 있었고, 나는 그 창문 안을 오래 들여다보고 있었어요.");
    await expect(textarea).toHaveValue(/바다 위에 집/);

    await expect(page.getByRole("button", { name: "AI 분석 & 일러스트 생성" })).toBeVisible();
  });

  test("record page stays usable on mobile without horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/record");

    const hasOverflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
    expect(hasOverflow).toBe(false);
    await expect(page.getByRole("button", { name: "AI 분석 & 일러스트 생성" })).toBeVisible();
  });

  test("record page uses the same light background tone as the home screen", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/record");

    const surfaces = await page.evaluate(() => {
      const phone = getComputedStyle(document.querySelector(".phone")!).backgroundColor;
      const screen = getComputedStyle(document.querySelector(".screen-screen")!).backgroundColor;
      const form = getComputedStyle(document.querySelector(".form-card")!).backgroundColor;
      return { phone, screen, form };
    });

    expect(surfaces.phone).toBe("rgb(250, 248, 244)");
    expect(surfaces.screen).toBe("rgb(250, 248, 244)");
    expect(surfaces.form).toBe("rgb(250, 248, 244)");
  });
});
