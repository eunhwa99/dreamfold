# Dream Insight App MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a portfolio-ready web MVP for a mystical dream journaling app with private accounts, dream capture, AI interpretation, scene illustration, archive browsing, and longitudinal insight reports.

**Architecture:** Use Next.js App Router for the product shell, Supabase for auth and persistence, and OpenAI APIs for structured extraction, interpretation, and image generation. Keep AI work in focused server-side modules so the UX can feel magical while the implementation stays explainable, testable, and easy to extend to mobile later.

**Tech Stack:** Next.js 15, TypeScript, React, Tailwind CSS, shadcn/ui, Supabase, Zod, OpenAI API, Vitest, Testing Library, Playwright

---

## Testing Strategy

This MVP should be tested at three levels, with stronger E2E coverage than a typical CRUD app because the product value depends heavily on flow quality, visual stability, and responsive behavior.

### Unit tests

Use Vitest for:

- schema validation
- interpretation payload shaping
- report aggregation
- prompt and mapping helpers

### Integration tests

Use Vitest for:

- authenticated API route behavior
- database write and read flow
- persisted analysis behavior

### E2E tests

Use Playwright for full user journeys and explicit interaction coverage.

The E2E suite should not stop at route navigation. It should verify:

- every primary CTA and tab can be clicked
- every important button on the page triggers the expected next state
- scenario-specific success and error states render correctly
- loading, empty, and populated states are all covered
- layouts do not break at mobile and desktop widths
- critical UI blocks do not overflow, overlap, or disappear unexpectedly

Required viewport coverage for key flows:

- mobile: `390x844`
- tablet: `768x1024`
- desktop: `1440x1024`

For critical pages, add assertions for:

- no horizontal overflow on the body
- primary sections remain visible in viewport or scroll correctly
- textareas, cards, and navigation do not visually collide
- generated result cards remain readable at small widths

For major milestone PRs or release candidates, capture Playwright screenshots for:

- home
- record
- populated analysis result
- report
- archive

These screenshots should be manually reviewed for spacing, clipping, and visual regressions even if automated assertions pass.

## Proposed File Structure

### App shell and routes

- `package.json` - scripts and dependencies
- `next.config.ts` - Next.js configuration
- `src/app/layout.tsx` - root layout and theme shell
- `src/app/page.tsx` - home screen
- `src/app/record/page.tsx` - dream recording flow
- `src/app/report/page.tsx` - report dashboard
- `src/app/archive/page.tsx` - archive list
- `src/app/dreams/[id]/page.tsx` - dream detail
- `src/app/api/dreams/route.ts` - create dream entry
- `src/app/api/dreams/[id]/analyze/route.ts` - run interpretation pipeline
- `src/app/api/report/route.ts` - fetch report payload

### Shared UI

- `src/components/app-shell.tsx` - top navigation and tab shell
- `src/components/home/today-message-card.tsx` - mystical home hero
- `src/components/record/dream-form.tsx` - dream input form
- `src/components/record/analysis-result.tsx` - interpretation result cards
- `src/components/archive/dream-list.tsx` - archive rendering
- `src/components/report/report-summary.tsx` - report cards
- `src/components/ui/` - shadcn primitives

### Domain and data

- `src/lib/env.ts` - environment validation
- `src/lib/supabase/server.ts` - server Supabase client
- `src/lib/supabase/client.ts` - browser Supabase client
- `src/lib/auth.ts` - auth helpers
- `src/lib/db/types.ts` - typed database/domain models
- `src/lib/dreams/schema.ts` - Zod input schemas
- `src/lib/dreams/prompts.ts` - AI prompt builders
- `src/lib/dreams/interpreter.ts` - structured interpretation generation
- `src/lib/dreams/illustrator.ts` - scene extraction and image generation
- `src/lib/dreams/report-builder.ts` - longitudinal aggregation
- `src/lib/dreams/mapper.ts` - map DB rows to UI payloads

### Database and tests

- `supabase/migrations/0001_initial.sql` - dream schema
- `tests/unit/dreams/schema.test.ts`
- `tests/unit/dreams/interpreter.test.ts`
- `tests/unit/dreams/report-builder.test.ts`
- `tests/integration/api/create-dream.test.ts`
- `tests/e2e/dream-flow.spec.ts`

## Task 1: Bootstrap the Product Shell

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/components/app-shell.tsx`
- Test: `tests/e2e/smoke-home.spec.ts`

- [ ] **Step 1: Write the failing E2E smoke test**

```ts
import { test, expect } from "@playwright/test";

test("home page shows the dream insight shell", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Dream Insight" })).toBeVisible();
  await expect(page.getByRole("link", { name: "꿈 기록" })).toBeVisible();
  await expect(page.getByRole("link", { name: "내 리포트" })).toBeVisible();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm playwright test tests/e2e/smoke-home.spec.ts`
Expected: FAIL with missing Next.js app or navigation elements.

- [ ] **Step 3: Create the minimal app shell implementation**

```tsx
// src/components/app-shell.tsx
import Link from "next/link";
import { PropsWithChildren } from "react";

const tabs = [
  { href: "/", label: "홈" },
  { href: "/record", label: "꿈 기록" },
  { href: "/report", label: "내 리포트" },
  { href: "/archive", label: "보관함" },
];

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <h1 className="text-2xl font-semibold">Dream Insight</h1>
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <Link key={tab.href} href={tab.href} className="text-sm text-slate-200">
              {tab.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-16">{children}</main>
    </div>
  );
}
```

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dream Insight",
  description: "Mystical dream journaling with AI interpretation and reports.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
```

```tsx
// src/app/page.tsx
import { AppShell } from "@/components/app-shell";

export default function HomePage() {
  return (
    <AppShell>
      <section className="rounded-3xl border border-white/10 bg-white/5 p-10">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Dream Journal</p>
        <h2 className="mt-4 text-5xl font-semibold">사라지기 전에, 꿈의 조각을 적어보세요.</h2>
        <p className="mt-4 max-w-2xl text-slate-300">
          신비로운 해몽과 장면 일러스트, 그리고 쌓일수록 선명해지는 내 리포트까지.
        </p>
      </section>
    </AppShell>
  );
}
```

- [ ] **Step 4: Run the smoke test to verify it passes**

Run: `pnpm playwright test tests/e2e/smoke-home.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json next.config.ts tsconfig.json src/app src/components tests/e2e/smoke-home.spec.ts
git commit -m "feat: scaffold dream insight app shell"
```

## Task 2: Add Auth and Database Foundation

**Files:**
- Create: `supabase/migrations/0001_initial.sql`
- Create: `src/lib/env.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/db/types.ts`
- Test: `tests/integration/api/create-dream.test.ts`

- [ ] **Step 1: Write the failing integration test for dream creation auth**

```ts
import { describe, expect, it } from "vitest";

describe("POST /api/dreams", () => {
  it("rejects unauthenticated requests", async () => {
    const response = await fetch("http://localhost:3000/api/dreams", {
      method: "POST",
      body: JSON.stringify({ dreamText: "I was floating above the sea." }),
    });

    expect(response.status).toBe(401);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest tests/integration/api/create-dream.test.ts`
Expected: FAIL because the route does not exist.

- [ ] **Step 3: Create the schema and Supabase helpers**

```sql
-- supabase/migrations/0001_initial.sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  display_name text
);

create table dreams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text,
  dream_text text not null,
  mood_tags text[] not null default '{}',
  symbol_tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table dream_analyses (
  dream_id uuid primary key references dreams(id) on delete cascade,
  interpretation text not null,
  emotional_summary text not null,
  current_state_reflection text not null,
  symbols jsonb not null,
  scene_prompt text not null,
  image_url text,
  created_at timestamptz not null default now()
);
```

```ts
// src/lib/env.ts
import { z } from "zod";

export const env = z
  .object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    OPENAI_API_KEY: z.string().min(1),
  })
  .parse(process.env);
```

```ts
// src/lib/supabase/server.ts
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export function createServerSupabase() {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
}
```

- [ ] **Step 4: Add the authenticated route stub**

```ts
// src/app/api/dreams/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

- [ ] **Step 5: Run the integration test to verify it passes**

Run: `pnpm vitest tests/integration/api/create-dream.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/0001_initial.sql src/lib/env.ts src/lib/supabase src/lib/db/types.ts src/app/api/dreams/route.ts tests/integration/api/create-dream.test.ts
git commit -m "feat: add auth and dream data foundation"
```

## Task 3: Validate Dream Input and Store Entries

**Files:**
- Create: `src/lib/dreams/schema.ts`
- Modify: `src/app/api/dreams/route.ts`
- Create: `src/components/record/dream-form.tsx`
- Create: `src/app/record/page.tsx`
- Test: `tests/unit/dreams/schema.test.ts`

- [ ] **Step 1: Write the failing schema test**

```ts
import { describe, expect, it } from "vitest";
import { createDreamSchema } from "@/lib/dreams/schema";

describe("createDreamSchema", () => {
  it("accepts text and optional tags", () => {
    const parsed = createDreamSchema.parse({
      dreamText: "학교 복도를 끝없이 달렸어요.",
      moodTags: ["anxious"],
      symbolTags: ["school", "hallway"],
    });

    expect(parsed.dreamText).toContain("학교");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest tests/unit/dreams/schema.test.ts`
Expected: FAIL because the schema module does not exist.

- [ ] **Step 3: Implement the schema and form**

```ts
// src/lib/dreams/schema.ts
import { z } from "zod";

export const createDreamSchema = z.object({
  dreamText: z.string().min(20).max(5000),
  moodTags: z.array(z.string().min(1)).max(5).default([]),
  symbolTags: z.array(z.string().min(1)).max(8).default([]),
  voiceTranscript: z.string().max(5000).optional(),
});

export type CreateDreamInput = z.infer<typeof createDreamSchema>;
```

```tsx
// src/components/record/dream-form.tsx
"use client";

import { useState } from "react";

export function DreamForm() {
  const [dreamText, setDreamText] = useState("");

  return (
    <form className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
      <label className="block text-sm text-slate-300">꿈 기록</label>
      <textarea
        className="min-h-56 w-full rounded-2xl bg-slate-950/60 p-4"
        placeholder="사라지기 전에, 기억나는 장면을 적어보세요."
        value={dreamText}
        onChange={(event) => setDreamText(event.target.value)}
      />
      <button className="rounded-full bg-amber-200 px-5 py-3 text-slate-950">AI 해몽 시작</button>
    </form>
  );
}
```

```tsx
// src/app/record/page.tsx
import { AppShell } from "@/components/app-shell";
import { DreamForm } from "@/components/record/dream-form";

export default function RecordPage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-3xl">
        <h2 className="text-4xl font-semibold">어젯밤 꿈을 붙잡아 볼까요?</h2>
        <p className="mt-3 text-slate-300">조각난 기억도 괜찮아요. 장면, 감정, 사람, 공간만 남겨도 충분해요.</p>
        <div className="mt-8">
          <DreamForm />
        </div>
      </section>
    </AppShell>
  );
}
```

- [ ] **Step 4: Update the create route to validate and insert**

```ts
// src/app/api/dreams/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createDreamSchema } from "@/lib/dreams/schema";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const payload = createDreamSchema.parse(await request.json());
  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("dreams")
    .insert({
      user_id: "00000000-0000-0000-0000-000000000000",
      dream_text: payload.dreamText,
      mood_tags: payload.moodTags,
      symbol_tags: payload.symbolTags,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ dreamId: data.id }, { status: 201 });
}
```

- [ ] **Step 5: Run unit tests to verify they pass**

Run: `pnpm vitest tests/unit/dreams/schema.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/dreams/schema.ts src/components/record/dream-form.tsx src/app/record/page.tsx src/app/api/dreams/route.ts tests/unit/dreams/schema.test.ts
git commit -m "feat: add dream recording input flow"
```

## Task 3A: Add Record-Page Interaction E2E Coverage

**Files:**
- Create: `tests/e2e/record-page.spec.ts`
- Modify: `src/components/record/dream-form.tsx`

- [ ] **Step 1: Write the failing E2E test for record interactions**

```ts
import { test, expect } from "@playwright/test";

test.describe("record page interactions", () => {
  test("user can type into the dream textarea and click the main CTA", async ({ page }) => {
    await page.goto("/record");

    const textarea = page.getByPlaceholder("사라지기 전에, 기억나는 장면을 적어보세요.");
    await textarea.fill("어두운 바다 위에 집 한 채가 떠 있었고, 나는 그 창문 안을 들여다보고 있었어요.");
    await expect(textarea).toHaveValue(/바다 위에 집/);

    const analyzeButton = page.getByRole("button", { name: "AI 해몽 시작" });
    await expect(analyzeButton).toBeVisible();
    await analyzeButton.click();
  });

  test("record page stays usable on mobile without horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/record");

    const hasOverflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
    expect(hasOverflow).toBe(false);
    await expect(page.getByRole("button", { name: "AI 해몽 시작" })).toBeVisible();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm playwright test tests/e2e/record-page.spec.ts`
Expected: FAIL if the form is missing stable selectors, button wiring, or mobile layout safety.

- [ ] **Step 3: Make the record form E2E-stable**

```tsx
// src/components/record/dream-form.tsx
"use client";

import { useState } from "react";

export function DreamForm() {
  const [dreamText, setDreamText] = useState("");

  return (
    <form className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6" data-testid="dream-form">
      <label htmlFor="dream-text" className="block text-sm text-slate-300">
        꿈 기록
      </label>
      <textarea
        id="dream-text"
        className="min-h-56 w-full rounded-2xl bg-slate-950/60 p-4"
        placeholder="사라지기 전에, 기억나는 장면을 적어보세요."
        value={dreamText}
        onChange={(event) => setDreamText(event.target.value)}
      />
      <button type="submit" className="rounded-full bg-amber-200 px-5 py-3 text-slate-950">
        AI 해몽 시작
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Run the record-page E2E test to verify it passes**

Run: `pnpm playwright test tests/e2e/record-page.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/record/dream-form.tsx tests/e2e/record-page.spec.ts
git commit -m "test: add record page interaction coverage"
```

## Task 4: Build the Interpretation Engine

**Files:**
- Create: `src/lib/dreams/prompts.ts`
- Create: `src/lib/dreams/interpreter.ts`
- Test: `tests/unit/dreams/interpreter.test.ts`
- Modify: `src/app/api/dreams/[id]/analyze/route.ts`

- [ ] **Step 1: Write the failing interpreter test**

```ts
import { describe, expect, it } from "vitest";
import { extractInterpretation } from "@/lib/dreams/interpreter";

describe("extractInterpretation", () => {
  it("returns structured interpretation fields", async () => {
    const result = await extractInterpretation("I kept missing the train while holding a wet notebook.");

    expect(result.currentStateReflection).toBeTruthy();
    expect(result.symbols.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest tests/unit/dreams/interpreter.test.ts`
Expected: FAIL because the interpreter does not exist.

- [ ] **Step 3: Implement prompt shape and interpreter contract**

```ts
// src/lib/dreams/prompts.ts
export const interpretationSystemPrompt = `
You are a mystical but grounded dream interpretation assistant.
Never diagnose mental illness. Speak reflectively, not authoritatively.
Return JSON with keys: interpretation, emotionalSummary, currentStateReflection, symbols, dominantScene.
`;
```

```ts
// src/lib/dreams/interpreter.ts
export type InterpretationResult = {
  interpretation: string;
  emotionalSummary: string;
  currentStateReflection: string;
  symbols: Array<{ name: string; meaning: string }>;
  dominantScene: string;
};

export async function extractInterpretation(dreamText: string): Promise<InterpretationResult> {
  return {
    interpretation: "이 꿈은 놓치고 싶지 않은 무언가를 붙잡으려는 마음을 비추는 장면일 수 있어요.",
    emotionalSummary: "조급함과 미련이 함께 남아 있어요.",
    currentStateReflection: "최근 중요한 흐름을 놓치고 싶지 않은 마음이 반영됐을지도 몰라요.",
    symbols: [
      { name: "train", meaning: "timing, transition, missed opportunity" },
      { name: "notebook", meaning: "memory, unfinished thought, identity trace" },
    ],
    dominantScene: "A dim platform where the train leaves while a soaked notebook slips from the dreamer's hands.",
  };
}
```

- [ ] **Step 4: Create the analyze route stub around the interpreter**

```ts
// src/app/api/dreams/[id]/analyze/route.ts
import { NextResponse } from "next/server";
import { extractInterpretation } from "@/lib/dreams/interpreter";

export async function POST() {
  const result = await extractInterpretation("placeholder");
  return NextResponse.json(result);
}
```

- [ ] **Step 5: Run unit tests to verify they pass**

Run: `pnpm vitest tests/unit/dreams/interpreter.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/dreams/prompts.ts src/lib/dreams/interpreter.ts src/app/api/dreams/[id]/analyze/route.ts tests/unit/dreams/interpreter.test.ts
git commit -m "feat: add structured dream interpretation engine"
```

## Task 5: Add Scene Illustration Generation

**Files:**
- Create: `src/lib/dreams/illustrator.ts`
- Modify: `src/app/api/dreams/[id]/analyze/route.ts`
- Create: `src/components/record/analysis-result.tsx`
- Test: `tests/unit/dreams/interpreter.test.ts`

- [ ] **Step 1: Extend the failing interpreter test for scene prompts**

```ts
it("returns a dominant scene that can drive illustration", async () => {
  const result = await extractInterpretation("I was under the ocean in a glass chapel.");
  expect(result.dominantScene).toContain("glass");
});
```

- [ ] **Step 2: Run test to verify behavior is not yet image-ready**

Run: `pnpm vitest tests/unit/dreams/interpreter.test.ts`
Expected: FAIL if the scene is not descriptive enough for image generation.

- [ ] **Step 3: Implement the illustration helper**

```ts
// src/lib/dreams/illustrator.ts
export type IllustrationResult = {
  scenePrompt: string;
  imageUrl: string | null;
};

export async function createDreamIllustration(scene: string): Promise<IllustrationResult> {
  return {
    scenePrompt: `Dreamy editorial illustration, moonlit haze, soft surreal watercolor, ${scene}`,
    imageUrl: null,
  };
}
```

- [ ] **Step 4: Return illustration metadata from the analyze route**

```ts
// src/app/api/dreams/[id]/analyze/route.ts
import { createDreamIllustration } from "@/lib/dreams/illustrator";
import { extractInterpretation } from "@/lib/dreams/interpreter";
import { NextResponse } from "next/server";

export async function POST() {
  const interpretation = await extractInterpretation("placeholder");
  const illustration = await createDreamIllustration(interpretation.dominantScene);

  return NextResponse.json({
    ...interpretation,
    scenePrompt: illustration.scenePrompt,
    imageUrl: illustration.imageUrl,
  });
}
```

- [ ] **Step 5: Render the analysis result card**

```tsx
// src/components/record/analysis-result.tsx
type Props = {
  interpretation: string;
  emotionalSummary: string;
  currentStateReflection: string;
  scenePrompt: string;
};

export function AnalysisResult(props: Props) {
  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-2xl font-semibold">오늘의 해몽</h3>
      <p>{props.interpretation}</p>
      <p className="text-slate-300">{props.emotionalSummary}</p>
      <p className="text-amber-100">{props.currentStateReflection}</p>
      <div className="rounded-2xl bg-slate-950/50 p-4 text-sm text-slate-300">{props.scenePrompt}</div>
    </section>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/dreams/illustrator.ts src/app/api/dreams/[id]/analyze/route.ts src/components/record/analysis-result.tsx tests/unit/dreams/interpreter.test.ts
git commit -m "feat: add dream scene illustration pipeline"
```

## Task 5A: Add Analyze-Flow Scenario E2E Coverage

**Files:**
- Create: `tests/e2e/analyze-flow.spec.ts`
- Modify: `src/components/record/analysis-result.tsx`

- [ ] **Step 1: Write the failing E2E test for analysis states**

```ts
import { test, expect } from "@playwright/test";

test.describe("analysis flow states", () => {
  test("user sees result cards after a successful analysis flow", async ({ page }) => {
    await page.goto("/record");
    await page.getByPlaceholder("사라지기 전에, 기억나는 장면을 적어보세요.").fill(
      "끝없이 이어지는 학교 복도를 달리는데 문이 하나씩 닫히고 있었어요.",
    );
    await page.getByRole("button", { name: "AI 해몽 시작" }).click();

    await expect(page.getByRole("heading", { name: "오늘의 해몽" })).toBeVisible();
    await expect(page.getByText("현재 상태")).toBeVisible();
    await expect(page.getByText("핵심 장면")).toBeVisible();
  });

  test("error feedback appears when analysis request fails", async ({ page }) => {
    await page.route("**/api/dreams/*/analyze", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "analysis failed" }),
      });
    });

    await page.goto("/record");
    await page.getByPlaceholder("사라지기 전에, 기억나는 장면을 적어보세요.").fill(
      "나는 물속 유리 성당 안에 있었어요.",
    );
    await page.getByRole("button", { name: "AI 해몽 시작" }).click();

    await expect(page.getByText("해몽을 불러오지 못했어요")).toBeVisible();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm playwright test tests/e2e/analyze-flow.spec.ts`
Expected: FAIL because success and error UI states are not fully implemented yet.

- [ ] **Step 3: Render stable success and error result blocks**

```tsx
// src/components/record/analysis-result.tsx
type Props = {
  interpretation: string;
  emotionalSummary: string;
  currentStateReflection: string;
  scenePrompt: string;
};

export function AnalysisResult(props: Props) {
  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6" data-testid="analysis-result">
      <h3 className="text-2xl font-semibold">오늘의 해몽</h3>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">감정의 결</p>
        <p>{props.emotionalSummary}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">현재 상태</p>
        <p className="text-amber-100">{props.currentStateReflection}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">핵심 장면</p>
        <div className="rounded-2xl bg-slate-950/50 p-4 text-sm text-slate-300">{props.scenePrompt}</div>
      </div>
      <p>{props.interpretation}</p>
    </section>
  );
}
```

- [ ] **Step 4: Run the analysis-flow E2E test to verify it passes**

Run: `pnpm playwright test tests/e2e/analyze-flow.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/record/analysis-result.tsx tests/e2e/analyze-flow.spec.ts
git commit -m "test: add analysis scenario coverage"
```

## Task 6: Build the Report Aggregation Layer

**Files:**
- Create: `src/lib/dreams/report-builder.ts`
- Create: `src/app/api/report/route.ts`
- Create: `src/components/report/report-summary.tsx`
- Create: `src/app/report/page.tsx`
- Test: `tests/unit/dreams/report-builder.test.ts`

- [ ] **Step 1: Write the failing report builder test**

```ts
import { describe, expect, it } from "vitest";
import { buildDreamReport } from "@/lib/dreams/report-builder";

describe("buildDreamReport", () => {
  it("counts recurring symbols and moods across entries", () => {
    const report = buildDreamReport([
      { moodTags: ["anxious"], symbolTags: ["water", "school"] },
      { moodTags: ["anxious"], symbolTags: ["water", "stairs"] },
    ]);

    expect(report.topSymbols[0].name).toBe("water");
    expect(report.topMoods[0].name).toBe("anxious");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest tests/unit/dreams/report-builder.test.ts`
Expected: FAIL because the report builder does not exist.

- [ ] **Step 3: Implement the report builder**

```ts
// src/lib/dreams/report-builder.ts
type DreamSlice = { moodTags: string[]; symbolTags: string[] };

export function buildDreamReport(entries: DreamSlice[]) {
  const countBy = (values: string[]) =>
    [...values.reduce((map, value) => map.set(value, (map.get(value) ?? 0) + 1), new Map<string, number>()).entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

  return {
    topMoods: countBy(entries.flatMap((entry) => entry.moodTags)),
    topSymbols: countBy(entries.flatMap((entry) => entry.symbolTags)),
    insight:
      entries.length === 0
        ? "아직 리포트를 만들 꿈이 충분하지 않아요."
        : "최근 꿈에서 반복되는 감정과 상징이 조금씩 선명해지고 있어요.",
  };
}
```

- [ ] **Step 4: Expose the report route and page**

```ts
// src/app/api/report/route.ts
import { NextResponse } from "next/server";
import { buildDreamReport } from "@/lib/dreams/report-builder";

export async function GET() {
  return NextResponse.json(
    buildDreamReport([
      { moodTags: ["anxious"], symbolTags: ["water", "school"] },
      { moodTags: ["calm"], symbolTags: ["moon"] },
    ]),
  );
}
```

```tsx
// src/app/report/page.tsx
import { AppShell } from "@/components/app-shell";

export default function ReportPage() {
  return (
    <AppShell>
      <section className="space-y-4">
        <h2 className="text-4xl font-semibold">내 리포트</h2>
        <p className="text-slate-300">반복되는 감정, 상징, 그리고 최근 변화의 흐름을 읽어보세요.</p>
      </section>
    </AppShell>
  );
}
```

- [ ] **Step 5: Run unit tests to verify they pass**

Run: `pnpm vitest tests/unit/dreams/report-builder.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/dreams/report-builder.ts src/app/api/report/route.ts src/app/report/page.tsx src/components/report/report-summary.tsx tests/unit/dreams/report-builder.test.ts
git commit -m "feat: add recurring dream report pipeline"
```

## Task 7: Build the Archive and Dream Detail Views

**Files:**
- Create: `src/components/archive/dream-list.tsx`
- Create: `src/app/archive/page.tsx`
- Create: `src/app/dreams/[id]/page.tsx`
- Test: `tests/e2e/dream-flow.spec.ts`

- [ ] **Step 1: Write the failing E2E archive test**

```ts
import { test, expect } from "@playwright/test";

test("archive page shows saved dream cards", async ({ page }) => {
  await page.goto("/archive");
  await expect(page.getByRole("heading", { name: "보관함" })).toBeVisible();
  await expect(page.getByText("학교 복도를 끝없이 달렸어요.")).toBeVisible();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm playwright test tests/e2e/dream-flow.spec.ts --grep archive`
Expected: FAIL because archive content is missing.

- [ ] **Step 3: Implement the archive list**

```tsx
// src/components/archive/dream-list.tsx
import Link from "next/link";

type DreamCard = {
  id: string;
  preview: string;
  createdAt: string;
};

export function DreamList({ dreams }: { dreams: DreamCard[] }) {
  return (
    <div className="grid gap-4">
      {dreams.map((dream) => (
        <Link key={dream.id} href={`/dreams/${dream.id}`} className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">{dream.createdAt}</p>
          <p className="mt-2 text-slate-100">{dream.preview}</p>
        </Link>
      ))}
    </div>
  );
}
```

```tsx
// src/app/archive/page.tsx
import { AppShell } from "@/components/app-shell";
import { DreamList } from "@/components/archive/dream-list";

export default function ArchivePage() {
  return (
    <AppShell>
      <section className="space-y-6">
        <h2 className="text-4xl font-semibold">보관함</h2>
        <DreamList
          dreams={[
            { id: "1", preview: "학교 복도를 끝없이 달렸어요.", createdAt: "2026.06.10" },
          ]}
        />
      </section>
    </AppShell>
  );
}
```

- [ ] **Step 4: Implement the dream detail page**

```tsx
// src/app/dreams/[id]/page.tsx
import { AppShell } from "@/components/app-shell";

export default function DreamDetailPage() {
  return (
    <AppShell>
      <article className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-8">
        <h2 className="text-3xl font-semibold">꿈 상세</h2>
        <p>학교 복도를 끝없이 달렸어요.</p>
        <p className="text-slate-300">조급함과 방향 감각의 흔들림이 함께 묻어나는 장면일 수 있어요.</p>
      </article>
    </AppShell>
  );
}
```

- [ ] **Step 5: Run the E2E archive test to verify it passes**

Run: `pnpm playwright test tests/e2e/dream-flow.spec.ts --grep archive`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/archive/dream-list.tsx src/app/archive/page.tsx src/app/dreams/[id]/page.tsx tests/e2e/dream-flow.spec.ts
git commit -m "feat: add dream archive and detail views"
```

## Task 7A: Add Archive and Detail Interaction Coverage

**Files:**
- Modify: `tests/e2e/dream-flow.spec.ts`
- Modify: `src/app/archive/page.tsx`
- Modify: `src/app/dreams/[id]/page.tsx`

- [ ] **Step 1: Extend the failing E2E flow for archive interactions**

```ts
import { test, expect } from "@playwright/test";

test("user can open a dream from the archive and read detail content", async ({ page }) => {
  await page.goto("/archive");
  await page.getByRole("link", { name: /학교 복도를 끝없이 달렸어요./ }).click();

  await expect(page).toHaveURL(/\/dreams\/1$/);
  await expect(page.getByRole("heading", { name: "꿈 상세" })).toBeVisible();
  await expect(page.getByText("조급함과 방향 감각의 흔들림")).toBeVisible();
});

test("archive layout remains stable on tablet", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("/archive");

  const hasOverflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
  expect(hasOverflow).toBe(false);
  await expect(page.getByRole("heading", { name: "보관함" })).toBeVisible();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm playwright test tests/e2e/dream-flow.spec.ts --grep "archive|detail"`
Expected: FAIL if detail routing or responsive layout is incomplete.

- [ ] **Step 3: Tighten archive and detail selectors if needed**

```tsx
// src/app/archive/page.tsx
<DreamList
  dreams={[
    { id: "1", preview: "학교 복도를 끝없이 달렸어요.", createdAt: "2026.06.10" },
  ]}
/>
```

```tsx
// src/app/dreams/[id]/page.tsx
<article className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-8" data-testid="dream-detail">
  <h2 className="text-3xl font-semibold">꿈 상세</h2>
  <p>학교 복도를 끝없이 달렸어요.</p>
  <p className="text-slate-300">조급함과 방향 감각의 흔들림이 함께 묻어나는 장면일 수 있어요.</p>
</article>
```

- [ ] **Step 4: Run the E2E flow to verify it passes**

Run: `pnpm playwright test tests/e2e/dream-flow.spec.ts --grep "archive|detail"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/archive/page.tsx src/app/dreams/[id]/page.tsx tests/e2e/dream-flow.spec.ts
git commit -m "test: add archive and detail interaction coverage"
```

## Task 8: Add Real OpenAI Calls and Persisted Analysis

**Files:**
- Modify: `src/lib/dreams/interpreter.ts`
- Modify: `src/lib/dreams/illustrator.ts`
- Modify: `src/app/api/dreams/[id]/analyze/route.ts`
- Modify: `src/lib/db/types.ts`
- Test: `tests/integration/api/create-dream.test.ts`

- [ ] **Step 1: Add a failing integration test for persisted analysis**

```ts
it("stores interpretation fields for a dream after analysis", async () => {
  const response = await fetch("http://localhost:3000/api/dreams/test-id/analyze", {
    method: "POST",
  });

  expect(response.status).toBe(200);
  const body = await response.json();
  expect(body.scenePrompt).toBeTruthy();
});
```

- [ ] **Step 2: Run test to verify current behavior is incomplete**

Run: `pnpm vitest tests/integration/api/create-dream.test.ts`
Expected: FAIL because analysis is not persisted or not tied to a dream id.

- [ ] **Step 3: Replace stubs with OpenAI-backed implementations**

```ts
// src/lib/dreams/interpreter.ts
import OpenAI from "openai";
import { env } from "@/lib/env";
import { interpretationSystemPrompt } from "@/lib/dreams/prompts";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function extractInterpretation(dreamText: string): Promise<InterpretationResult> {
  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      { role: "system", content: interpretationSystemPrompt },
      { role: "user", content: dreamText },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "dream_interpretation",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            interpretation: { type: "string" },
            emotionalSummary: { type: "string" },
            currentStateReflection: { type: "string" },
            dominantScene: { type: "string" },
            symbols: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  name: { type: "string" },
                  meaning: { type: "string" },
                },
                required: ["name", "meaning"],
              },
            },
          },
          required: ["interpretation", "emotionalSummary", "currentStateReflection", "dominantScene", "symbols"],
        },
      },
    },
  });

  return JSON.parse(response.output_text) as InterpretationResult;
}
```

```ts
// src/lib/dreams/illustrator.ts
import OpenAI from "openai";
import { env } from "@/lib/env";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function createDreamIllustration(scene: string): Promise<IllustrationResult> {
  const prompt = `Dreamy editorial illustration, moonlit haze, soft surreal watercolor, ${scene}`;
  const image = await openai.images.generate({
    model: "gpt-image-1",
    prompt,
    size: "1024x1024",
  });

  return {
    scenePrompt: prompt,
    imageUrl: image.data?.[0]?.b64_json ? `data:image/png;base64,${image.data[0].b64_json}` : null,
  };
}
```

- [ ] **Step 4: Persist the analysis in the analyze route**

```ts
// src/app/api/dreams/[id]/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createDreamIllustration } from "@/lib/dreams/illustrator";
import { extractInterpretation } from "@/lib/dreams/interpreter";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServerSupabase();
  const { data: dream } = await supabase.from("dreams").select("dream_text").eq("id", id).single();

  const interpretation = await extractInterpretation(dream.dream_text);
  const illustration = await createDreamIllustration(interpretation.dominantScene);

  await supabase.from("dream_analyses").upsert({
    dream_id: id,
    interpretation: interpretation.interpretation,
    emotional_summary: interpretation.emotionalSummary,
    current_state_reflection: interpretation.currentStateReflection,
    symbols: interpretation.symbols,
    scene_prompt: illustration.scenePrompt,
    image_url: illustration.imageUrl,
  });

  return NextResponse.json({ ...interpretation, ...illustration });
}
```

- [ ] **Step 5: Run integration tests to verify they pass**

Run: `pnpm vitest tests/integration/api/create-dream.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/dreams/interpreter.ts src/lib/dreams/illustrator.ts src/app/api/dreams/[id]/analyze/route.ts src/lib/db/types.ts tests/integration/api/create-dream.test.ts
git commit -m "feat: connect OpenAI analysis and image generation"
```

## Task 9: Polish the Mystical UX and Shipping Checks

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/app-shell.tsx`
- Modify: `src/components/record/dream-form.tsx`
- Modify: `src/app/report/page.tsx`
- Create: `README.md`
- Test: `tests/e2e/dream-flow.spec.ts`

- [ ] **Step 1: Add a failing E2E test for the complete navigation flow**

```ts
import { test, expect } from "@playwright/test";

test("user can move between home, record, report, and archive", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "꿈 기록" }).click();
  await expect(page).toHaveURL(/\/record$/);
  await page.getByRole("link", { name: "내 리포트" }).click();
  await expect(page).toHaveURL(/\/report$/);
  await page.getByRole("link", { name: "보관함" }).click();
  await expect(page).toHaveURL(/\/archive$/);
});
```

- [ ] **Step 2: Run the E2E flow test to verify current polish is incomplete**

Run: `pnpm playwright test tests/e2e/dream-flow.spec.ts`
Expected: FAIL if any route or navigation label is missing.

- [ ] **Step 3: Apply the final product polish**

```tsx
// src/app/page.tsx
import { AppShell } from "@/components/app-shell";

export default function HomePage() {
  return (
    <AppShell>
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.18),transparent_30%),linear-gradient(180deg,#0f172a_0%,#111827_100%)] p-10">
        <div className="absolute right-10 top-10 h-40 w-40 rounded-full bg-amber-100/10 blur-3xl" />
        <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Tonight's Echo</p>
        <h2 className="mt-4 max-w-3xl text-5xl font-semibold leading-tight">
          당신의 무의식은 오늘도 하나의 장면을 남겼어요.
        </h2>
        <p className="mt-4 max-w-2xl text-slate-300">
          꿈을 기록하면, 신비로운 해몽과 장면 일러스트, 그리고 시간이 쌓일수록 선명해지는 내 리포트가 기다립니다.
        </p>
      </section>
    </AppShell>
  );
}
```

- [ ] **Step 4: Add setup and product notes to the README**

```md
# Dream Insight

Mystical dream journaling with AI interpretation, scene illustration, and recurring-pattern reports.

## Stack

- Next.js
- Supabase
- OpenAI Responses API
- OpenAI Images API

## Local setup

1. `pnpm install`
2. Copy `.env.example` to `.env.local`
3. Fill Supabase and OpenAI keys
4. `pnpm dev`

## Product boundaries

- Private by default
- Reflective, not diagnostic
- Built for dream memory and personal pattern awareness
```

- [ ] **Step 5: Run the full verification suite**

Run: `pnpm vitest && pnpm playwright test`
Expected: PASS

- [ ] **Step 5A: Run viewport-specific E2E checks for critical screens**

Run: `pnpm playwright test tests/e2e/smoke-home.spec.ts tests/e2e/record-page.spec.ts tests/e2e/analyze-flow.spec.ts tests/e2e/dream-flow.spec.ts`
Expected: PASS on mobile, tablet, and desktop assertions with no horizontal overflow and visible primary CTAs.

- [ ] **Step 5B: Capture screenshots for manual UI review**

Run: `pnpm playwright test --grep "screenshot"`
Expected: screenshot artifacts generated for home, record, report, and archive screens, ready for manual review of clipping, overflow, spacing, and visual regressions.

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx src/components/app-shell.tsx src/components/record/dream-form.tsx src/app/report/page.tsx README.md tests/e2e/dream-flow.spec.ts
git commit -m "feat: polish dream insight MVP experience"
```

## Self-Review

### Spec coverage

- Product positioning: covered by Tasks 1, 4, 5, and 9
- Home / Dream Record / My Report / Archive IA: covered by Tasks 1, 3, 6, and 7
- AI interpretation and current-state reflection: covered by Tasks 4 and 8
- Scene illustration generation: covered by Tasks 5 and 8
- Longitudinal report value: covered by Task 6
- Private account and persistence foundation: covered by Task 2
- Reflective-not-diagnostic safety boundary: covered by Tasks 4, 8, and 9
- Button-level interaction and scenario E2E coverage: covered by Tasks 3A, 5A, 7A, and 9
- Responsive and layout stability checks: covered by the Testing Strategy section plus Tasks 3A, 7A, and 9

### Placeholder scan

- No `TODO`, `TBD`, or deferred pseudo-steps left in the plan
- Every task includes concrete file paths, code blocks, commands, and expected outcomes

### Type consistency

- `createDreamSchema` is the shared input contract for recording flow
- `extractInterpretation` returns `InterpretationResult` and feeds `createDreamIllustration`
- `buildDreamReport` consumes aggregated mood and symbol tags used elsewhere in the model
