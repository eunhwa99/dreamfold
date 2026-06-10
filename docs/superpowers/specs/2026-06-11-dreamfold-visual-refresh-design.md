# DreamFold Visual Refresh Design

## Purpose

This document defines the approved visual refresh for DreamFold's web app.

It keeps the existing product position intact:

- a dreamy dream journal
- a mystical first impression
- a reflective, non-clinical interpretation experience

But it replaces the current visual language with a softer, more premium, more iPhone-adjacent interface that feels friendlier, more memorable, and more intentional.

This spec supersedes the earlier visual direction where it conflicts with:

- color system
- typography
- component styling
- layout density
- light and dark theme behavior

## Approved Direction

### Theme system

The approved theme pair is:

- Light mode: `A1 Mystic Lavender`
- Dark mode: `A3 Midnight Reverie`

This means the product should feel like the same brand across day and night, not like two unrelated skins.

### User experience intent

The experience should feel:

- dreamy and emotionally soft
- friendly instead of mystical-to-the-point-of-occult
- premium but not cold
- immersive but still easy to read

The app should not feel like:

- a generic SaaS dashboard
- a tarot marketplace app
- a harsh dark-mode developer tool
- a beige wellness product with no identity

## Visual Principles

### 1. Emotion first, but usable

The interface should create mood immediately, but primary actions must still be obvious within the first glance.

Users should instantly understand:

- where to record a dream
- what their latest dream says
- where long-term reports live

### 2. Soft surfaces over glassmorphism

Do not use the current dark translucent panel style as the main language.

Instead prefer:

- creamy, tactile surfaces in light mode
- ink-dark, velvety surfaces in dark mode
- rounded cards with gentle elevation
- gradient illustration zones used selectively, not everywhere

### 3. One magical moment per screen

Each screen should have one strong emotional focal point.

Examples:

- Home: the hero dream card
- Record: the writing prompt area
- Result: the generated illustration and title
- Report: one summary insight section

Avoid stacking too many decorative moments in the same viewport.

### 4. Apple-like calm, not literal iOS mimicry

The goal is not to copy Apple UI components.

The goal is to match the qualities people associate with iPhone apps:

- spacious composition
- obvious hierarchy
- smooth corners
- restrained accents
- touch-friendly controls
- low visual noise

## Typography System

Use:

- Display / editorial headings: `Fraunces`
- UI and body copy: `Plus Jakarta Sans`

### Why this pairing

`Fraunces` gives DreamFold a soft, literary, slightly romantic voice that still feels premium. It is not a literal rounded sans-serif, but it has enough softness and warmth to match the "friendly, rounded, Fraunces-like" direction the user wanted.

`Plus Jakarta Sans` is cleaner and friendlier than Inter for this product. It reads softly on cards, buttons, chips, and mobile-like layouts without feeling childish.

This pair supports the target mood:

- rounded and approachable
- editorial without feeling old-fashioned
- premium without becoming stiff

### Tone guidance

Use `Fraunces` only where emotion or emphasis matters:

- wordmark
- hero headlines
- dream titles
- result titles
- key insight values

Use `Plus Jakarta Sans` for:

- navigation
- body copy
- labels
- chips
- helper text
- button text
- metadata

### Weight guidance

Recommended ranges:

- Fraunces: `400`, `500`, `600`
- Plus Jakarta Sans: `400`, `500`, `600`

Avoid overly thin body text. The product should feel soft, not faint.

## Color System

### Light mode

Primary light palette:

- background: warm ivory
- raised surface: pale cream
- soft surface: mist lavender
- primary ink: deep plum-ink
- secondary ink: muted gray-plum
- accent: lavender violet
- warm accent support: rose dust

Suggested reference colors:

- `--bg`: `#FAF8F4`
- `--bg-soft`: `#F3EFFA`
- `--surface`: `#FFFFFF`
- `--surface-soft`: `#EAE4F5`
- `--text`: `#1C1824`
- `--text-muted`: `#6B6478`
- `--accent`: `#8B6FBF`
- `--accent-soft`: `#C4B5E8`
- `--warm-soft`: `#E8C9C2`
- `--deep`: `#2D2050`

### Dark mode

Primary dark palette:

- background: blue-black plum
- raised surface: midnight indigo
- soft surface: smoky violet
- primary text: moonlit lavender-white
- muted text: dusty lilac-gray
- accent: vivid restrained violet
- glow support: pale orchid mist

Suggested reference colors:

- `--bg`: `#11111A`
- `--bg-soft`: `#171624`
- `--surface`: `#1C1A2B`
- `--surface-soft`: `#2A2340`
- `--text`: `#F6F0FF`
- `--text-muted`: `#B8AFD1`
- `--accent`: `#8B6FBF`
- `--accent-soft`: `#C4B5E8`
- `--warm-soft`: `#D9B9C4`
- `--deep`: `#0F0C18`

### Color behavior rules

- Lavender is an accent, not a full-page wash.
- Ivory or dark ink backgrounds should carry readability.
- Rose dust should appear as a soft supporting note, not a competing brand color.
- Main CTA contrast must remain strong in both themes.

## Layout Direction

### Global shell

Replace the current desktop-first dark shell feel with a centered, mobile-inspired composition that still works on desktop.

Structure:

- narrow readable content column by default
- generous outer padding
- top brand area with softer spacing
- persistent bottom-style navigation on mobile
- calm tab presentation on desktop

The product should feel like a mobile app translated elegantly to the web, not a web dashboard squeezed into mobile language.

### Home

Home should prioritize:

1. immediate dream-record prompt
2. one strong dream card or latest-reading card
3. small supporting summary cards

Home should not feel like a report overview first.

### Record

Record should feel intimate and inviting.

Prioritize:

- a poetic prompt
- a soft, highly legible text area
- rounded tag pills
- one obvious action button

The writing area should feel like a journal page, not a generic form.

### Result

Result should feel ceremonial but calm.

Prioritize:

- large illustration zone
- elegant dream title
- 2-3 compact insight cards
- one interpretation card with high readability

### Report

Report should look more reflective than analytical.

Use:

- summary cards with emotional labels
- rhythm and grouping
- short readable insight sections

Avoid charts that make the product feel clinical unless the design specifically softens them.

### Archive

Archive should feel like a curated collection, not a raw list dump.

Use:

- rounded entry cards
- soft metadata
- clear date grouping
- thumbnail or symbolic preview when available

## Component Styling

### Cards

Cards should be:

- more rounded than the current implementation
- lighter in outline treatment
- separated more by spacing than borders
- elevated with soft shadow, not heavy blur

### Buttons

Primary buttons:

- dark plum in light mode
- bright text on deep surface
- fully rounded capsule or soft pill

Secondary buttons:

- low-contrast filled surfaces
- soft outlines only when necessary

Buttons should feel thumb-friendly and slightly luxurious.

### Chips and tags

Chips should feel tactile and collectible.

Use:

- soft filled backgrounds
- small shadow or inset contrast
- clear selected state

Avoid chip styles that look too technical or filter-panel-like.

### Navigation

Navigation should be simplified.

For implementation:

- keep the same destination set for now
- present them with calmer typography
- make active state more elegant than bright

If a floating action button competes with the main CTA, prefer removing the FAB.

## Motion

Motion should be subtle and atmospheric.

Recommended:

- soft fade-and-rise on page entry
- slight card lift on hover
- gentle pressed-state compression on tap
- slow background gradient drift only if extremely subtle

Avoid:

- bouncy transitions
- excessive parallax
- glowing pulse effects that reduce premium feel

## Responsive Behavior

### Mobile

Mobile is the reference experience.

Design for:

- easy one-hand scanning
- comfortable tap targets
- no crowded top navigation
- readable stacked cards

### Desktop

Desktop should not expand into a wide dashboard.

Instead:

- keep content centered
- preserve mobile-like rhythm
- allow a little more breathing room
- optionally place supporting cards beside the hero only when the hierarchy still feels calm

## Accessibility and Readability

The new design must remain readable despite its emotional styling.

Requirements:

- body text contrast must pass comfortably in both modes
- decorative gradients must never sit behind long paragraphs
- chips and buttons must remain distinguishable by more than color alone
- dark mode text should not drop into low-contrast gray-purple

## Content Tone Alignment

The visual refresh should reinforce the existing copy style:

- suggestive
- reflective
- non-diagnostic
- poetic but not vague

Visual softness should support trust, not replace clarity.

## Implementation Scope for the Refresh

This visual refresh should cover:

- global typography
- color tokens
- global page shell
- navigation treatment
- hero section
- cards
- forms
- result presentation
- report presentation
- archive list styling
- dark mode support

It does not require changing:

- core routes
- data model
- AI behavior
- information architecture at the feature level

## Final Recommendation

Ship DreamFold with:

- Light mode based on `A1 Mystic Lavender`
- Dark mode based on `A3 Midnight Reverie`
- `Fraunces` for display typography
- `Plus Jakarta Sans` for UI and body typography

This combination best preserves the user's preferred dreamy identity while making the product feel friendlier, more premium, and more distinctive than the current build.
