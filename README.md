# DreamFold

DreamFold is a dreamy web app for recording dreams, getting AI-style interpretations, and discovering recurring emotional and symbolic patterns over time.

## Current MVP

- Record a dream with a low-friction writing flow
- Get an immediate mystical interpretation
- See a scene prompt for dream-inspired illustration
- Revisit saved dreams in an archive
- Review recurring moods and symbols in a report view

The current build uses local mock analysis so the full product flow can be explored without external services.

## Tech Stack

- Next.js
- TypeScript
- React
- Zod
- Vitest
- Playwright

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Test

```bash
npm test
npm run test:e2e
npm run build
```

## Roadmap

- Replace mock interpretation with OpenAI-backed analysis
- Add image generation for dream scene visuals
- Persist dream history and reports with Supabase
- Add authentication and private personal data storage
- Polish the portfolio story with product screenshots and architecture notes
