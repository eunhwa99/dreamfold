# DreamFold

DreamFold is a dreamy web app for recording dreams, getting AI-style interpretations, and discovering recurring emotional and symbolic patterns over time.

## Current MVP

- Record a dream with a low-friction writing flow
- Get an immediate mystical interpretation
- See a scene prompt for dream-inspired illustration
- Revisit saved dreams in an archive
- Review recurring moods and symbols in a report view

The current build calls OpenAI for dream interpretation and offers separate image generation for the saved dream scene.

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

## Environment

Create `.env.local` with:

```bash
OPENAI_API_KEY=your_api_key
OPENAI_TEXT_MODEL=gpt-5.5
OPENAI_IMAGE_MODEL=gpt-image-1
DREAMFOLD_DATA_DIR=.dreamfold-data
```

`OPENAI_API_KEY` is required for live interpretation and image generation.
`DREAMFOLD_DATA_DIR` controls where `dreams.json` and generated images are stored locally.
`npm run test:e2e` uses an isolated temporary data directory and seeded sample dreams so the browser flows stay deterministic.

## Test

```bash
npm test
npm run test:e2e
npm run build
```

## Roadmap

- Persist dream history and reports with Supabase
- Add authentication and private personal data storage
- Polish the portfolio story with product screenshots and architecture notes
