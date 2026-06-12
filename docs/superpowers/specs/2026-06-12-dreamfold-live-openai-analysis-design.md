# DreamFold Live OpenAI Analysis Design

## Purpose

This document defines the approved design for replacing DreamFold's mock dream interpretation flow with real OpenAI-backed analysis and optional image generation.

The scope is intentionally narrow:

- keep the current local-file persistence model
- generate interpretation text first
- generate the dream image only from a separate user action
- save both text analysis and image metadata back into the stored dream record
- show explicit failure states instead of falling back to mock results

This design preserves the existing product position:

- mystical first impression
- reflective, non-clinical interpretation language
- cumulative dream archive value over time

## Approved User Flow

The approved flow is:

1. The user writes a dream and saves it.
2. The app calls a server route that requests a real OpenAI interpretation.
3. The interpreted result is stored on the dream entry and shown immediately.
4. The user can separately press a button to generate a dream illustration.
5. The server generates the image, saves it locally, stores the image metadata on the dream entry, and returns the new image path.

### Why this flow

This separates the lower-cost, faster text step from the slower and more expensive image step.

It also matches the intended product behavior:

- interpretation is the default core experience
- image generation is an enhancement, not a requirement
- failure in image generation should not block the interpretation experience

## Architecture

The approved implementation is a server-only OpenAI integration with local file storage.

### Server routes

Two server routes should own the live AI behavior:

#### `POST /api/dreams/[id]/analyze`

Responsibilities:

- load the stored dream entry by id
- validate that the dream exists and has enough content to analyze
- call OpenAI text generation from the server
- normalize the model output into the app's `AnalysisResult` shape
- persist the result back onto the dream entry
- return the saved analysis payload

#### `POST /api/dreams/[id]/image`

Responsibilities:

- load the stored dream entry by id
- ensure a text analysis already exists
- derive the image prompt from `analysis.scenePrompt` with dream text as supporting context if needed
- call OpenAI image generation from the server
- save the returned image bytes to a local public path
- persist image metadata back onto the same dream entry
- return the updated image metadata

### OpenAI integration boundary

OpenAI calls must remain in server-only code.

The client must never receive:

- `OPENAI_API_KEY`
- raw provider credentials
- direct provider request logic

The client only interacts with the app's own API routes.

## Data Model Changes

The current `AnalysisResult` shape should be extended with optional image metadata so the app can represent interpretation-only and interpretation-plus-image states with one object.

Approved additional fields:

- `imagePath?: string`
- `imagePrompt?: string`
- `imageGeneratedAt?: string`

### Meaning of each field

- `imagePath`: public browser path such as `/generated-dreams/<file>.png`
- `imagePrompt`: the final prompt used for the image request, useful for debugging and later portability
- `imageGeneratedAt`: ISO timestamp for recency and future sorting or invalidation rules

### Persistence behavior

- text analysis creation updates `dream.analysis`
- image generation updates only the image-related fields inside `dream.analysis`
- image regeneration replaces the referenced latest image fields with the newest output

Old files may remain on disk for now. Cleanup is intentionally out of scope for this phase.

## Local File Storage Design

Generated images should be written to a public local directory:

- `public/generated-dreams`

Recommended file naming:

- `<dreamId>-<timestamp>.png`

### Why this location

- Next.js can serve the file immediately as a static public asset path
- the browser can render the image with no extra download route
- the storage model remains simple and easy to replace later with object storage

### Portability note

This layout should be treated as a local-phase storage contract only.

If the app later moves to Supabase, the equivalent mapping is straightforward:

- `imagePath` becomes a storage-backed URL or path
- `imagePrompt` and `imageGeneratedAt` remain in database metadata

## Prompting Rules

### Interpretation prompt

The interpretation prompt should instruct the model to produce:

- mystical but grounded Korean prose
- no medical, therapeutic, or diagnostic claims
- a dominant scene summary
- an emotional reading
- a current-state reflection
- symbol labels and symbolic meanings
- a concise scene prompt suitable for later image generation

The server should request structured output that can be mapped deterministically into `AnalysisResult`.

### Image prompt

The image prompt should emphasize DreamFold's existing visual direction:

- dreamy editorial illustration
- soft surreal watercolor
- nocturnal or misty atmosphere when appropriate
- one vivid central scene instead of many disconnected events

The prompt should avoid:

- photorealistic outputs
- horror exaggeration unless the dream explicitly requires strong tension
- cluttered multi-scene compositions

## UI Changes

### Record result card

The analysis result card remains the primary place where live AI output first appears.

It should gain:

- a `그림 만들기` button after text analysis exists
- a loading state while image generation is running
- an inline error message when image generation fails
- an image preview area when `imagePath` is available

### Dream detail and archive reuse

Existing dream detail and archive-related screens should reuse `analysis.imagePath` when present.

This allows generated images to behave like persisted dream artifacts rather than one-session-only previews.

## Error Handling

No mock fallback is allowed in this phase.

### Failure rules

- if `OPENAI_API_KEY` is missing, return a server error with a clear Korean message
- if the dream id is invalid, return `404`
- if image generation is requested before analysis exists, return `409` with a message telling the user to generate interpretation first
- if OpenAI returns an invalid or incomplete payload, return a controlled failure message
- if local file saving fails, return a controlled failure message

### Logging rules

The server should log technical failure details for debugging, but user-visible messages should stay short and readable.

The UI should not expose raw provider errors, request ids, stack traces, or internal paths.

## Environment Variables

Approved environment variables:

- `OPENAI_API_KEY`
- `OPENAI_TEXT_MODEL`
- `OPENAI_IMAGE_MODEL`

### Default behavior

- `OPENAI_API_KEY` is required
- model variables may have server-side defaults if omitted
- all environment variables are read only on the server

## Testing Scope

### Unit and integration coverage

Tests should cover:

- interpretation response normalization into `AnalysisResult`
- storage updates when analysis is saved
- storage updates when image metadata is saved
- image generation rejection when no analysis exists
- error translation for missing env vars and provider failures

### End-to-end coverage

The main browser flow should cover:

1. write and save a dream
2. wait for interpretation result
3. verify the interpretation card renders
4. press `그림 만들기`
5. verify either the generated image appears or the intended failure message is shown in controlled test scenarios

Because DreamFold is UI-heavy, verification should include actual rendered-state checks rather than route smoke only.

## Out of Scope

The following are explicitly not part of this phase:

- Supabase database integration
- Supabase Storage integration
- authentication
- background job orchestration
- image cleanup or retention policies
- multiple image variants
- client-side direct OpenAI access
- mock fallback behavior

## Implementation Summary

The approved design is:

- real OpenAI text analysis from the server
- separate user-triggered image generation from the server
- local public file storage for generated images
- persisted image metadata inside the stored dream analysis
- explicit error handling with no mock fallback

This is the smallest implementation that delivers a real end-to-end DreamFold AI experience while keeping the current local architecture intact.
