# DreamFold Visual Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved DreamFold redesign with A1 light mode, A3 dark mode, updated typography, calmer mobile-inspired layout, and regression coverage.

**Architecture:** Keep the current routes and mock data flow intact while replacing the global design token system, shell structure, and core page/component presentation. Drive the redesign through test-first changes that verify the new brand copy and theme-token behavior before updating the UI implementation.

**Tech Stack:** Next.js App Router, React 19, TypeScript, CSS in `src/app/globals.css`, Vitest, Playwright

---

### Task 1: Lock the new UX contract in tests

**Files:**
- Modify: `tests/e2e/smoke-home.spec.ts`
- Modify: `tests/e2e/report-page.spec.ts`

- [ ] **Step 1: Write the failing tests for the new home and theme contract**

```ts
import { expect, test } from "@playwright/test";

test("home page shows the DreamFold shell and primary prompt", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "dreamfold" })).toBeVisible();
  await expect(page.getByRole("link", { name: "꿈 기록" })).toBeVisible();
  await expect(page.getByText("오늘의 꿈,")).toBeVisible();
});

test("home page uses the approved light palette by default", async ({ page }) => {
  await page.goto("/");

  const bg = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--bg").trim()
  );

  expect(bg).toBe("#FAF8F4");
});

test("report page follows the reflective report framing", async ({ page }) => {
  await page.goto("/report");

  await expect(page.getByRole("heading", { name: "내 리포트" })).toBeVisible();
  await expect(page.getByText("Frequent Mood")).not.toBeVisible();
  await expect(page.getByText("자주 반복된 감정")).toBeVisible();
});
```

- [ ] **Step 2: Run the targeted Playwright tests to confirm they fail for the right reason**

Run: `npm run test:e2e -- smoke-home.spec.ts report-page.spec.ts`

Expected: FAIL because the current app still renders `Dream Insight`, the dark-first palette tokens, and the older report labels.

- [ ] **Step 3: Add a dark-mode regression test before touching theme code**

```ts
test("home page switches to the approved dark palette for dark mode", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");

  const bg = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--bg").trim()
  );

  expect(bg).toBe("#11111A");
});
```

- [ ] **Step 4: Re-run the single spec to confirm the dark-mode test also fails**

Run: `npm run test:e2e -- smoke-home.spec.ts`

Expected: FAIL because the current CSS hardcodes the old dark palette and has no approved light/dark token split.

### Task 2: Implement the new design system and shell

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/components/app-shell.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add the approved Google fonts at the layout boundary**

```tsx
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display"
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body"
});
```

- [ ] **Step 2: Update the shell branding and navigation copy to the new DreamFold presentation**

```tsx
<span className="brand__eyebrow">Dream journal</span>
<h1 className="brand__title">dreamfold</h1>
<p className="brand__tagline">a soft place for recurring symbols and quiet readings</p>
```

- [ ] **Step 3: Replace the old dark glass styles with token-based light and dark themes**

```css
:root {
  color-scheme: light;
  --bg: #FAF8F4;
  --bg-soft: #F3EFFA;
  --surface: rgba(255, 255, 255, 0.78);
  --surface-strong: #fffaf7;
  --text: #1C1824;
  --text-muted: #6B6478;
  --accent: #8B6FBF;
  --accent-soft: #C4B5E8;
  --warm-soft: #E8C9C2;
  --deep: #2D2050;
}

@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
    --bg: #11111A;
    --bg-soft: #171624;
    --surface: rgba(28, 26, 43, 0.78);
    --surface-strong: #1C1A2B;
    --text: #F6F0FF;
    --text-muted: #B8AFD1;
    --accent: #8B6FBF;
    --accent-soft: #C4B5E8;
    --warm-soft: #D9B9C4;
    --deep: #0F0C18;
  }
}
```

- [ ] **Step 4: Reshape the shell into the approved mobile-inspired frame**

```css
.shell__inner {
  width: min(960px, 100%);
}

.topbar {
  align-items: flex-start;
}

.topnav {
  padding: 8px;
  border-radius: 999px;
}
```

- [ ] **Step 5: Run the targeted specs to verify the shell and palette are now green**

Run: `npm run test:e2e -- smoke-home.spec.ts report-page.spec.ts`

Expected: PASS

### Task 3: Refresh the home, record, report, archive, and detail surfaces

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/record/page.tsx`
- Modify: `src/app/report/page.tsx`
- Modify: `src/app/archive/page.tsx`
- Modify: `src/app/dreams/[id]/page.tsx`
- Modify: `src/components/home/today-message-card.tsx`
- Modify: `src/components/record/dream-form.tsx`
- Modify: `src/components/record/analysis-result.tsx`
- Modify: `src/components/report/report-summary.tsx`
- Modify: `src/components/archive/dream-list.tsx`

- [ ] **Step 1: Reframe the home page around one poetic hero and two supporting cards**

```tsx
<section className="hero hero--home">
  <p className="eyebrow">Good morning</p>
  <h2>오늘의 꿈, 기록해볼까요?</h2>
  <p className="lede">사라지기 전에 붙잡은 장면은 시간이 지나며 당신만의 상징 지도가 됩니다.</p>
</section>
```

- [ ] **Step 2: Make the record flow feel like a journal rather than a dark form**

```tsx
<label className="label" htmlFor="dream-text">
  오늘 가장 선명한 장면
</label>
<button className="button" type="submit" disabled={loading}>
  {loading ? "AI 리딩을 준비하는 중..." : "AI 분석 & 일러스트 생성"}
</button>
```

- [ ] **Step 3: Rename report sections to the new reflective Korean labels**

```tsx
<ReportSummary title="자주 반복된 감정" items={report.topMoods} emptyLabel="감정 데이터가 아직 적어요" />
<ReportSummary title="자주 나타난 상징" items={report.topSymbols} emptyLabel="상징 데이터가 아직 적어요" />
```

- [ ] **Step 4: Give archive and detail pages the new curated-card treatment**

```tsx
<div className="archive-list__meta">
  <span>{dream.createdAt}</span>
  <span className="archive-list__pill">{dream.moodTags[0] ?? "여운"}</span>
</div>
```

- [ ] **Step 5: Run the full Playwright suite to catch layout or label regressions**

Run: `npm run test:e2e`

Expected: PASS

### Task 4: Verify code health and production readiness

**Files:**
- Modify if needed based on failures from: `src/app/*`, `src/components/*`, `tests/e2e/*`

- [ ] **Step 1: Run the unit tests**

Run: `npm test`

Expected: PASS

- [ ] **Step 2: Run the production build**

Run: `npm run build`

Expected: PASS

- [ ] **Step 3: Start the app locally and spot-check the refreshed UI in the browser**

Run: `npm run dev`

Expected: Next.js dev server starts without runtime errors on the chosen local port.

- [ ] **Step 4: Capture final browser evidence for home, record, and report**

Use the browser to verify:

- home reflects the new DreamFold branding
- record page has no horizontal overflow on mobile width
- dark mode preserves readability

- [ ] **Step 5: Commit the verified implementation**

```bash
git add src/app/layout.tsx src/components/app-shell.tsx src/app/globals.css src/app/page.tsx src/app/record/page.tsx src/app/report/page.tsx src/app/archive/page.tsx 'src/app/dreams/[id]/page.tsx' src/components/home/today-message-card.tsx src/components/record/dream-form.tsx src/components/record/analysis-result.tsx src/components/report/report-summary.tsx src/components/archive/dream-list.tsx tests/e2e/smoke-home.spec.ts tests/e2e/report-page.spec.ts
git commit -m "feat: refresh dreamfold visual design"
```
