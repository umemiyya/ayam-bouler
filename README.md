# Count AI — Broiler Detection Admin Dashboard

A single-page admin dashboard for uploading broiler chicken imagery, running
AI-powered detection through the Anthropic API, and tracking counts over time.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- shadcn/ui-style components built on Radix primitives
- Framer Motion, React Hook Form + Zod, Lucide icons
- Anthropic API (`@anthropic-ai/sdk`) via a server-side API route

## Getting started

```bash
npm install
cp .env.local.example .env.local
# then put your key in .env.local:
# ANTHROPIC_API_KEY=sk-ant-...
npm run dev
```

Open http://localhost:3000 — the whole dashboard lives on that one page.

## How detection works

1. The user drags/drops or browses a JPG/PNG/WEBP image (or MP4, though video
   frame extraction isn't wired up yet — see note below) into the uploader.
2. On **Analyze Chickens**, the file and the current Detection Settings
   (confidence threshold, model version, mode, count method) are POSTed as
   `multipart/form-data` to `POST /api/detect`.
3. `src/app/api/detect/route.ts` sends the image to a Claude vision model
   with a system prompt that forces a strict JSON response: whether the
   image contains chickens, the count, overall confidence, and per-bird
   bounding boxes as percentages.
4. The route normalizes that into one of the `DetectionResult` variants in
   `src/types/detection.ts` (`success`, `no_chickens`, `not_a_chicken`,
   `image_corrupted`, `timeout`, `network_error`, `api_error`) and the page
   renders the matching UI — including the bounding-box overlay on the
   original image for a successful run.
5. Every run appends a row to the Detection History table and updates the
   stat cards, backed by local component state (swap in a real database call
   whenever you're ready to persist).

**Video note:** the API route currently analyzes a single still image. MP4
uploads are accepted by the dropzone (per the brief) but the client shows a
clear message asking for a still frame until a frame-extraction step (e.g.
ffmpeg on the server, or a canvas grab on the client) is added in front of
the same `/api/detect` endpoint.

## Project layout

```
src/
  app/
    api/detect/route.ts     # Anthropic API integration
    layout.tsx, page.tsx    # root layout + the single dashboard page
    globals.css             # design tokens (colors, fonts, motifs)
  components/
    ui/                     # shadcn-style primitives (button, card, table…)
    dashboard/               # sidebar, header, stats, uploader, settings,
                              # analysis/result panel, history table
  lib/                       # cn(), formatters, mock data
  types/detection.ts         # shared types incl. the DetectionResult union
```

## Design notes

Dark, slate-charcoal base with a grain-gold accent (poultry feed, not the
common cream/terracotta AI-dashboard default). Big numeric readouts use a
monospaced face for a sensor/telemetry feel, and cards/uploader borrow a
"viewfinder" corner-bracket motif that echoes the bounding boxes the model
itself draws — the one signature element tying the visual language back to
what the product actually does.
