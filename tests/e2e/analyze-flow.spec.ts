import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

test.describe("analysis flow states", () => {
  test("user sees result cards and can generate an image after a successful analysis flow", async ({ page }) => {
    const dataDir = process.env.DREAMFOLD_DATA_DIR;
    if (!dataDir) {
      throw new Error("DREAMFOLD_DATA_DIR must be available to Playwright tests");
    }

    const imageDir = path.join(dataDir, "generated-dreams");
    const imageFilename = "dream-e2e-preview-123456.png";
    fs.mkdirSync(imageDir, { recursive: true });
    fs.writeFileSync(
      path.join(imageDir, imageFilename),
      Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a5KcAAAAASUVORK5CYII=", "base64")
    );

    await page.route("**/api/dreams/*/analyze", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          interpretation: "이 꿈은 닫히는 문 앞에서 타이밍을 놓치지 않으려는 마음을 비추고 있어요.",
          emotionalSummary: "조급함과 긴장이 얇게 깔려 있어요.",
          currentStateReflection: "중요한 기회를 붙잡고 싶은 마음이 무의식에 남아 있을 수 있어요.",
          dominantScene: "학교 복도를 달리는데 문이 하나씩 닫히는 장면",
          sceneSummary: "\"학교 복도를 달리는데 문이 하나씩 닫히는 장면\"이 오늘 꿈의 중심에 남아 있어요.",
          scenePrompt: "Dreamy editorial illustration, endless school hallway, closing doors, soft surreal watercolor",
          symbols: [{ name: "door", label: "문", meaning: "경계와 선택" }]
        })
      });
    });

    await page.route("**/api/dreams/*/image", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          interpretation: "이 꿈은 닫히는 문 앞에서 타이밍을 놓치지 않으려는 마음을 비추고 있어요.",
          emotionalSummary: "조급함과 긴장이 얇게 깔려 있어요.",
          currentStateReflection: "중요한 기회를 붙잡고 싶은 마음이 무의식에 남아 있을 수 있어요.",
          dominantScene: "학교 복도를 달리는데 문이 하나씩 닫히는 장면",
          sceneSummary: "\"학교 복도를 달리는데 문이 하나씩 닫히는 장면\"이 오늘 꿈의 중심에 남아 있어요.",
          scenePrompt: "Dreamy editorial illustration, endless school hallway, closing doors, soft surreal watercolor",
          symbols: [{ name: "door", label: "문", meaning: "경계와 선택" }],
          imagePath: `/generated-dreams/${imageFilename}`,
          imagePrompt: "endless school hallway watercolor",
          imageGeneratedAt: "2026-06-12T00:00:00.000Z"
        })
      });
    });

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

    await page.getByRole("button", { name: "그림 만들기" }).click();
    const image = page.getByAltText("AI가 그린 꿈 장면");
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute("src", /\/generated-dreams\/dream-e2e-preview-123456\.png$/);
    await expect(page.getByText("저장된 이미지를 보여주지 못했어요.")).toHaveCount(0);
    await expect
      .poll(async () =>
        image.evaluate((element) => (element instanceof HTMLImageElement ? element.complete && element.naturalWidth > 0 : false))
      )
      .toBe(true);

    await page.getByRole("link", { name: "상세 보기" }).click();
    const detailImage = page.getByAltText("AI가 그린 꿈 장면");
    await expect(detailImage).toBeVisible();
    await expect
      .poll(async () =>
        detailImage.evaluate((element) => (element instanceof HTMLImageElement ? element.complete && element.naturalWidth > 0 : false))
      )
      .toBe(true);
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

    await expect(page.getByText("해몽을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.")).toBeVisible();
    await expect(page.getByText("꿈 기록은 저장되었어요.")).toBeVisible();
  });

  test("saved dreams expose an analysis retry action on the detail page after an initial failure", async ({ page }) => {
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

    await page.getByRole("link", { name: "상세 페이지에서 해몽을 다시 시도할 수 있어요." }).click();
    await expect(page.getByText("아직 해몽이 생성되지 않았어요.")).toBeVisible();
    await expect(page.getByRole("button", { name: "해몽 다시 시도하기" })).toBeVisible();
  });

  test("retrying after an analysis failure reuses the saved dream instead of creating a duplicate", async ({ page }) => {
    let analyzeAttempts = 0;
    let createRequests = 0;

    page.on("request", (request) => {
      if (request.method() === "POST" && /\/api\/dreams$/.test(request.url())) {
        createRequests += 1;
      }
    });

    await page.route("**/api/dreams/*/analyze", async (route) => {
      analyzeAttempts += 1;

      if (analyzeAttempts === 1) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "analysis failed" })
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          interpretation: "해석",
          emotionalSummary: "감정",
          currentStateReflection: "상태",
          dominantScene: "장면",
          sceneSummary: "요약",
          scenePrompt: "프롬프트",
          symbols: [{ name: "water", label: "물", meaning: "감정" }]
        })
      });
    });

    await page.goto("/record");
    await page
      .getByPlaceholder("사라지기 전에, 기억나는 장면을 적어보세요.")
      .fill("나는 물속 유리 성당 안에 있었고, 천장 위로 흐르는 빛을 바라보고 있었어요.");

    const submitButton = page.getByRole("button", { name: "저장하고 AI 리딩 보기" });
    await submitButton.click();
    await expect(page.getByText("꿈 기록은 저장되었어요.")).toBeVisible();

    await submitButton.click();
    await expect(page.getByTestId("analysis-result")).toBeVisible();
    expect(createRequests).toBe(1);
  });

  test("validation feedback appears when the dream is too short to save", async ({ page }) => {
    await page.goto("/record");
    await page.getByPlaceholder("사라지기 전에, 기억나는 장면을 적어보세요.").fill("짧은 꿈");
    await page.getByRole("button", { name: "저장하고 AI 리딩 보기" }).click();

    await expect(page.getByText("꿈 기록은 조금 더 자세히 적어주세요.")).toBeVisible();
  });
});
