# OutlierPulse

[![Next.js 14](https://img.shields.io/badge/Next.js-14-111827?logo=nextdotjs)](https://nextjs.org) [![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org) [![YouTube Data API](https://img.shields.io/badge/YouTube-Data%20API%20v3-ff0000?logo=youtube&logoColor=white)](https://developers.google.com/youtube/v3) [![License](https://img.shields.io/badge/License-MIT-10b981)](#license)

OutlierPulse is a dark, glassmorphic YouTube intelligence dashboard for spotting content that performs far above a creator’s normal baseline. It works out of the box in an elegant demo mode, and switches to live channel analysis when a YouTube Data API key is configured.

## What it does

- Calculates a normalized **V-Score** against a channel’s rolling 90-day median views.
- Detects high-signal title patterns and ranks reusable packaging templates.
- Simulates conservative, likely, and viral-breakout view trajectories.
- Uses a quota-conscious YouTube pipeline: one channel lookup, upload-playlist batches of 50, then statistics batches of 50.
- Provides animated loading states, 3D glass-card tilt, copyable title templates, and responsive Bento-grid analytics.

## Architecture

```text
Browser dashboard
  └─ /api/analyze?channel=...
       ├─ YouTube Data API v3 (when YOUTUBE_API_KEY exists)
       │    ├─ channels.list → uploads playlist
       │    ├─ playlistItems.list → video IDs, 50 at a time
       │    └─ videos.list → statistics, 50 at a time
       └─ deterministic mock generator (no key / API fallback)
              └─ analytics engine → V-Score, title insights, simulation data
```

## V-Score model

```text
V-Score = video views / channel 90-day rolling median views

V ≥ 3.0          Super Outlier
1.5 ≤ V < 3.0    Outlier Growth
V < 1.5          Standard Baseline
```

The rolling baseline uses publicly accessible recent videos. If a channel does not have five videos within 90 days, the median of the sampled catalog is used to avoid a misleading near-zero baseline.

## Run locally

```bash
npm install
copy .env.example .env.local
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). With no API key, submit `Fireship`, `Veritasium`, `MrBeast`, or `freeCodeCamp` to explore the deterministic demo datasets.

### Enable live channel analysis

1. Create a YouTube Data API v3 key in Google Cloud.
2. Put it in `.env.local`:

```dotenv
YOUTUBE_API_KEY="your-key"
```

3. Restart the development server and enter a channel URL, handle (for example `@veritasium`), or channel ID.

The key is only read on the server by `app/api/analyze/route.ts`; it is never sent to the browser.

## Project map

| Location | Responsibility |
| --- | --- |
| `app/page.tsx` | Dashboard state, requests, and Bento-grid assembly |
| `app/api/analyze/route.ts` | Safe live/mock analysis boundary |
| `lib/analytics.ts` | V-Score math, title-pattern extraction, simulation model |
| `lib/youtube.ts` | Batched YouTube Data API client |
| `lib/mockData.ts` | Deterministic realistic demo channel data |
| `components/dashboard/` | Motion-enabled dashboard modules |
| `components/ui/` | Small reusable UI primitives |

## Checks

```bash
npm run typecheck
npm run build
```

## License

MIT. Use it as a starting point for your own creator-intelligence product.
