# Dream Insight E2E Checklist

## Purpose

This checklist defines the minimum end-to-end verification bar for the Dream Insight MVP.

The goal is not only to confirm that routes load, but also to verify that:

- important buttons can actually be clicked
- core user scenarios succeed or fail in the expected way
- layout remains stable across mobile, tablet, and desktop
- no major UI overflow, clipping, or collision issues appear

## Required Viewports

Run critical flows at:

- mobile: `390x844`
- tablet: `768x1024`
- desktop: `1440x1024`

## Global Checks For Every Critical Screen

Apply these checks on Home, Record, Report, Archive, and Dream Detail pages.

- [ ] Page loads without a fatal error screen
- [ ] Primary heading is visible
- [ ] Main CTA is visible and clickable
- [ ] No horizontal overflow on `document.body`
- [ ] Navigation remains usable
- [ ] Important text is not clipped or overlapping
- [ ] Card containers stay inside the viewport width
- [ ] Scrolling works naturally if content exceeds viewport height

Suggested Playwright assertion:

```ts
const hasOverflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
expect(hasOverflow).toBe(false);
```

## Home Page Checklist

- [ ] Home hero heading is visible
- [ ] `꿈 기록` tab is clickable
- [ ] `내 리포트` tab is clickable
- [ ] `보관함` tab is clickable
- [ ] Quick record CTA is visible above the fold on desktop
- [ ] Hero copy does not wrap awkwardly on mobile
- [ ] Decorative background elements do not cover text or buttons

## Record Page Checklist

### Input behavior

- [ ] Dream textarea accepts typing
- [ ] Long text input remains readable
- [ ] Placeholder is visible before typing
- [ ] Submit button is visible and clickable
- [ ] Voice-entry button, if present, is visible and clickable
- [ ] Mood selection UI, if present, can be toggled
- [ ] Symbol/person/place helper tags, if present, can be selected and deselected

### Scenario checks

- [ ] Valid dream input leads to analysis request
- [ ] Empty or too-short input shows validation feedback
- [ ] Loading state appears while analysis is running
- [ ] Success state renders interpretation result
- [ ] Error state renders failure feedback

### Layout checks

- [ ] Textarea does not overflow container on mobile
- [ ] CTA remains visible without layout breakage
- [ ] Result cards stack cleanly on small screens
- [ ] Labels, helper text, and tags do not collide

## Analysis Result Checklist

- [ ] `오늘의 해몽` heading appears after success
- [ ] Emotional summary block appears
- [ ] Current-state reflection block appears
- [ ] Core scene block appears
- [ ] Generated image area, if present, stays within container bounds
- [ ] Retry or back action, if present, is clickable
- [ ] Error state message is visible when API fails
- [ ] Loading skeleton or spinner disappears after success or failure

## Report Page Checklist

- [ ] `내 리포트` heading is visible
- [ ] Top emotions section renders
- [ ] Top symbols section renders
- [ ] Summary insight block renders
- [ ] Empty state renders correctly when there is not enough dream data
- [ ] Cards remain readable on tablet and mobile
- [ ] Chart-like or metric blocks, if added later, do not overflow narrow screens

## Archive Page Checklist

- [ ] `보관함` heading is visible
- [ ] Dream cards render in list or grid form
- [ ] Search input is visible and usable, if implemented
- [ ] Filter controls are clickable, if implemented
- [ ] Dream card click opens detail page
- [ ] Long preview text truncates gracefully
- [ ] Card spacing remains stable on tablet and mobile

## Dream Detail Page Checklist

- [ ] Dream detail heading is visible
- [ ] Original dream text is visible
- [ ] Interpretation summary is visible
- [ ] Scene image or placeholder is visible, if implemented
- [ ] Back navigation works
- [ ] Long dream text wraps without overflow
- [ ] Detail card padding and spacing remain clean on mobile

## Navigation Flow Checklist

- [ ] User can move from Home -> Record
- [ ] User can move from Home -> Report
- [ ] User can move from Home -> Archive
- [ ] User can move from Archive -> Dream Detail
- [ ] User can navigate back without broken UI state
- [ ] Active tab styling, if implemented, updates correctly

## Failure and Edge Case Checklist

- [ ] Unauthorized API state is handled gracefully
- [ ] Analysis API failure shows a readable error message
- [ ] Empty archive state is handled
- [ ] Empty report state is handled
- [ ] Very long dream text does not visually break the page
- [ ] Slow network simulation does not produce duplicated clicks or broken state

## Visual Regression Checklist

Capture screenshots for manual review of:

- [ ] Home page
- [ ] Record page before input
- [ ] Record page during loading
- [ ] Record page after successful analysis
- [ ] Report page with populated data
- [ ] Archive page with at least one dream card
- [ ] Dream detail page

Manual review should specifically look for:

- [ ] clipped text
- [ ] overlapping cards
- [ ] buttons outside container bounds
- [ ] broken spacing at mobile width
- [ ] broken spacing at tablet width
- [ ] visual noise from decorative gradients or blur layers

## Suggested Playwright Test Buckets

Organize E2E coverage into these files:

- `tests/e2e/smoke-home.spec.ts`
- `tests/e2e/record-page.spec.ts`
- `tests/e2e/analyze-flow.spec.ts`
- `tests/e2e/report-page.spec.ts`
- `tests/e2e/archive-flow.spec.ts`
- `tests/e2e/responsive-layout.spec.ts`

## Release Gate

Do not treat the MVP as ready unless:

- [ ] unit tests pass
- [ ] integration tests pass
- [ ] all Playwright E2E tests pass
- [ ] responsive checks pass at all required viewports
- [ ] screenshot artifacts have been manually reviewed
- [ ] no critical overflow, clipping, or blocked-CTA issue remains
