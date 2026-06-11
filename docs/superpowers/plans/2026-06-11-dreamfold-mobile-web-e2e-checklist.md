# DreamFold Mobile-Web E2E Checklist

## Purpose

This checklist protects the DreamFold mobile-inspired web experience across:

- primary dream journaling flows
- button-level interactions
- success and error states
- responsive behavior
- visual stability in light and dark mode

## Required Viewports

- Small mobile: `390 x 844`
- Tablet: `768 x 1024`
- Desktop: `1280 x 960`

## Global Checks

- page loads without fatal error
- primary heading is visible
- main CTA is visible and clickable
- no horizontal overflow
- content stays inside the phone-style frame
- bottom navigation remains visible
- text remains readable in light and dark mode

## User Journey Checks

### 1. Home to record flow

- load `/`
- verify brand, hero prompt, mood pills, and summary cards
- click primary record CTA or floating action button
- confirm navigation to `/record`

### 2. Record to analysis flow

- load `/record`
- type into dream textarea
- toggle a mood tag
- click `AI 분석 & 일러스트 생성`
- verify loading or result transition
- confirm analysis result headline, current-state text, and key scene content

### 3. Analysis error flow

- intercept analyze request with server error
- submit valid input
- verify visible error feedback
- confirm page remains usable after failure

### 4. Archive to detail flow

- load `/archive`
- open a stored dream entry
- confirm `/dreams/[id]` detail screen
- verify title, current-state copy, and scene box

### 5. Report flow

- load `/report`
- verify recurring emotion and symbol summaries
- verify reflective AI insight block

## Screen-by-Screen Interaction Checks

### Home

- primary CTA: `오늘 꿈 기록하기`
- secondary CTA: `내 리포트 보기`
- floating action button opens record flow
- bottom nav links switch screens correctly

### Record

- textarea accepts input
- mood tags toggle selected state
- submit button is clickable in light and dark mode
- helper/support card remains readable

### Analysis Result

- result title visible
- insight cards render without overflow
- interpretation block is readable

### Report

- summary cards remain readable at mobile and tablet widths
- AI insight block does not clip

### Archive

- archive cards stay tappable
- metadata pill and long dream text do not overlap

## State Coverage

- success: analysis result rendered
- error: failed analysis request shows feedback
- loading: submit flow shows interim loading UI
- populated: home/report/archive with seeded data
- empty: report summary fallback copy when no items exist

## Responsive and Layout Checks

- no horizontal overflow on `/record` at `390 x 844`
- no horizontal overflow on `/archive` at `768 x 1024`
- bottom navigation remains visible on mobile
- hero card, metric cards, and report cards do not clip at desktop width
- floating action button does not cover primary content on home

## Visual Regression Review

Capture screenshots for:

- home light mode
- home dark mode
- record screen light mode
- analysis success state
- archive list

Manual review should look for:

- clipped Fraunces headlines
- overlapping cards inside the phone frame
- hidden CTA labels in dark mode
- awkward wrapping in bottom nav labels
- decorative gradient orbs obscuring text

## Suggested Test Buckets

- `smoke-home.spec.ts`
- `record-page.spec.ts`
- `analyze-flow.spec.ts`
- `archive-flow.spec.ts`
- `report-page.spec.ts`
- future addition: `navigation-flow.spec.ts`
- future addition: `visual-regression.spec.ts`

## Release Gate

- `npm test` passes
- `npm run test:e2e` passes
- `npm run build` passes
- mobile overflow checks pass
- key screenshots reviewed in light and dark mode
- no blocked CTA remains on home, record, report, or archive
