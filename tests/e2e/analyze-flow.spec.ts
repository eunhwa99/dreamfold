import { expect, test } from "@playwright/test";

test.describe("analysis flow states", () => {
  test("user sees result cards after a successful analysis flow", async ({ page }) => {
    await page.goto("/record");
    await page
      .getByPlaceholder("사라지기 전에, 기억나는 장면을 적어보세요.")
      .fill("끝없이 이어지는 학교 복도를 달리는데 문이 하나씩 닫히고 있었어요.");
    await page.getByRole("button", { name: "저장하고 AI 리딩 보기" }).click();

    const result = page.getByTestId("analysis-result");
    await expect(result.getByRole("heading", { name: "오늘의 해몽" })).toBeVisible();
    await expect(result.getByText("현재 상태")).toBeVisible();
    await expect(result.getByText("장면 스케치").first()).toBeVisible();
    await expect(result.getByText("상징 단서")).toBeVisible();
    await expect(result.getByText("Dreamy editorial illustration")).toHaveCount(0);
  });

  test("error feedback appears when analysis request fails", async ({ page }) => {
    await page.route("**/api/dreams/*/analyze", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "analysis failed" })
      });
    });

    await page.goto("/record");
    await page
      .getByPlaceholder("사라지기 전에, 기억나는 장면을 적어보세요.")
      .fill("나는 물속 유리 성당 안에 있었고, 천장 위로 흐르는 빛을 바라보고 있었어요.");
    await page.getByRole("button", { name: "저장하고 AI 리딩 보기" }).click();

    await expect(page.getByText("해몽을 불러오지 못했어요")).toBeVisible();
  });

  test("validation feedback appears when the dream is too short to save", async ({ page }) => {
    await page.goto("/record");
    await page.getByPlaceholder("사라지기 전에, 기억나는 장면을 적어보세요.").fill("짧은 꿈");
    await page.getByRole("button", { name: "저장하고 AI 리딩 보기" }).click();

    await expect(page.getByText("꿈 기록은 조금 더 자세히 적어주세요.")).toBeVisible();
  });
});
