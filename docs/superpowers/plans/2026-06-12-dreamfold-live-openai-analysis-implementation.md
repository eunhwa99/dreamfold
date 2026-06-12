# DreamFold Live OpenAI Analysis Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace mock dream analysis with real server-side OpenAI interpretation and add separately triggered image generation with local file persistence.

**Architecture:** Keep the existing local JSON dream store, add a server-only OpenAI client layer, and extend the stored `analysis` object with image metadata. Use one route for structured text interpretation and a second route for optional image generation so latency, cost, and retries stay separate.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, Playwright, OpenAI Node SDK, local filesystem storage

---

## File Map

- Create: `src/lib/dreams/ai-schema.ts`
- Create: `src/lib/dreams/openai-client.ts`
- Create: `src/lib/dreams/image-store.ts`
- Create: `src/app/api/dreams/[id]/image/route.ts`
- Modify: `package.json`
- Modify: `src/lib/dreams/types.ts`
- Modify: `src/lib/dreams/file-store.ts`
- Modify: `src/lib/mock-store.ts`
- Modify: `src/app/api/dreams/[id]/analyze/route.ts`
- Modify: `src/components/record/analysis-result.tsx`
- Modify: `src/components/record/dream-form.tsx`
- Modify: `src/app/dreams/[id]/page.tsx`
- Modify: `README.md`
- Test: `tests/unit/dreams/openai-client.test.ts`
- Test: `tests/unit/api/analyze-route.test.ts`
- Test: `tests/unit/api/image-route.test.ts`
- Test: `tests/e2e/analyze-flow.spec.ts`

### Task 1: Add the OpenAI client contract and failing unit tests

**Files:**
- Create: `src/lib/dreams/ai-schema.ts`
- Create: `src/lib/dreams/openai-client.ts`
- Test: `tests/unit/dreams/openai-client.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
it("parses a structured interpretation payload into AnalysisResult", async () => {
  const payload = {
    interpretation: "해석",
    emotionalSummary: "감정",
    currentStateReflection: "상태",
    dominantScene: "장면",
    sceneSummary: "요약",
    scenePrompt: "프롬프트",
    symbols: [{ name: "water", label: "물", meaning: "감정" }]
  };

  expect(() => parseAnalysisPayload(payload)).not.toThrow();
});

it("throws when OPENAI_API_KEY is missing", async () => {
  delete process.env.OPENAI_API_KEY;
  await expect(generateDreamAnalysis({ dreamText: "긴 꿈 내용", moodTags: [] })).rejects.toThrow(
    "OPENAI_API_KEY"
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/dreams/openai-client.test.ts`
Expected: FAIL with missing module or missing exports for the new OpenAI helpers.

- [ ] **Step 3: Write minimal implementation**

```ts
export function parseAnalysisPayload(payload: unknown): AnalysisResult {
  return analysisResponseSchema.parse(payload);
}

export async function generateDreamAnalysis(): Promise<AnalysisResult> {
  throw new Error("OPENAI_API_KEY is required");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/dreams/openai-client.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/dreams/ai-schema.ts src/lib/dreams/openai-client.ts tests/unit/dreams/openai-client.test.ts
git commit -m "test: scaffold live OpenAI dream client"
```

### Task 2: Switch analyze route to live interpretation and persist it

**Files:**
- Modify: `src/lib/dreams/types.ts`
- Modify: `src/lib/dreams/file-store.ts`
- Modify: `src/lib/mock-store.ts`
- Modify: `src/app/api/dreams/[id]/analyze/route.ts`
- Test: `tests/unit/api/analyze-route.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
it("returns the saved analysis when OpenAI analysis succeeds", async () => {
  vi.doMock("@/lib/mock-store", () => ({
    runDreamAnalysis: vi.fn(async () => ({
      interpretation: "해석",
      emotionalSummary: "감정",
      currentStateReflection: "상태",
      dominantScene: "장면",
      sceneSummary: "요약",
      scenePrompt: "프롬프트",
      symbols: []
    }))
  }));

  const { POST } = await import("@/app/api/dreams/[id]/analyze/route");
  const response = await POST(new Request("http://localhost") as never, {
    params: Promise.resolve({ id: "dream-1" })
  });

  expect(response.status).toBe(200);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/api/analyze-route.test.ts`
Expected: FAIL because the route still imports the old mock analyzer.

- [ ] **Step 3: Write minimal implementation**

```ts
export async function runDreamAnalysis(id: string) {
  const dream = getDream(id);
  if (!dream) return null;

  const analysis = await generateDreamAnalysis({
    dreamText: dream.dreamText,
    moodTags: dream.moodTags
  });

  return saveDreamAnalysis(id, analysis);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/api/analyze-route.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/dreams/types.ts src/lib/dreams/file-store.ts src/lib/mock-store.ts src/app/api/dreams/[id]/analyze/route.ts tests/unit/api/analyze-route.test.ts
git commit -m "feat: add live dream analysis route"
```

### Task 3: Add image generation route and local image persistence

**Files:**
- Create: `src/lib/dreams/image-store.ts`
- Modify: `src/lib/dreams/openai-client.ts`
- Modify: `src/lib/mock-store.ts`
- Create: `src/app/api/dreams/[id]/image/route.ts`
- Test: `tests/unit/api/image-route.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
it("returns 409 when image generation is requested before analysis exists", async () => {
  vi.doMock("@/lib/mock-store", () => ({
    generateDreamImage: vi.fn(async () => ({ status: "missing-analysis" }))
  }));

  const { POST } = await import("@/app/api/dreams/[id]/image/route");
  const response = await POST(new Request("http://localhost") as never, {
    params: Promise.resolve({ id: "dream-1" })
  });

  expect(response.status).toBe(409);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/api/image-route.test.ts`
Expected: FAIL because the route does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
export async function generateDreamImage(id: string) {
  const dream = getDream(id);
  if (!dream) return { status: "missing-dream" } as const;
  if (!dream.analysis) return { status: "missing-analysis" } as const;

  const image = await generateDreamSceneImage(dream.analysis.scenePrompt);
  const imagePath = saveGeneratedDreamImage({ dreamId: id, imageBase64: image.imageBase64 });
  return saveDreamImageMetadata(id, imagePath, image.revisedPrompt);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/api/image-route.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/dreams/image-store.ts src/lib/dreams/openai-client.ts src/lib/mock-store.ts src/app/api/dreams/[id]/image/route.ts tests/unit/api/image-route.test.ts
git commit -m "feat: add dream image generation route"
```

### Task 4: Update the UI and E2E coverage for separate image generation

**Files:**
- Modify: `src/components/record/analysis-result.tsx`
- Modify: `src/components/record/dream-form.tsx`
- Modify: `src/app/dreams/[id]/page.tsx`
- Test: `tests/e2e/analyze-flow.spec.ts`

- [ ] **Step 1: Write the failing tests**

```ts
test("user can generate an image after the interpretation loads", async ({ page }) => {
  await page.goto("/record");
  await page.getByPlaceholder("사라지기 전에, 기억나는 장면을 적어보세요.").fill("충분히 긴 꿈 내용...");
  await page.getByRole("button", { name: "저장하고 AI 리딩 보기" }).click();
  await page.getByRole("button", { name: "그림 만들기" }).click();
  await expect(page.getByAltText("AI가 그린 꿈 장면")).toBeVisible();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- analyze-flow.spec.ts`
Expected: FAIL because the button and preview do not exist yet.

- [ ] **Step 3: Write minimal implementation**

```tsx
{result ? (
  <AnalysisResultCard
    result={result}
    onGenerateImage={handleGenerateImage}
    imageLoading={imageLoading}
    imageError={imageError}
  />
) : null}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:e2e -- analyze-flow.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/record/analysis-result.tsx src/components/record/dream-form.tsx src/app/dreams/[id]/page.tsx tests/e2e/analyze-flow.spec.ts
git commit -m "feat: add separate dream image generation UI"
```

### Task 5: Document env vars and run full verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update docs**

```md
## Environment

- `OPENAI_API_KEY` required for live analysis and image generation
- `OPENAI_TEXT_MODEL` optional
- `OPENAI_IMAGE_MODEL` optional
```

- [ ] **Step 2: Run unit tests**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: Run E2E**

Run: `npm run test:e2e`
Expected: PASS

- [ ] **Step 4: Run production build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: describe live dream AI setup"
```
