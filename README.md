# OutlierPulse ⚡

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live_Demo-outlierpulse.vercel.app-00F0FF?style=for-the-badge&logo=vercel&logoColor=black)](https://outlierpulse.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.35-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/Gemini-1.5_Flash-4E75F6?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Upstash Redis](https://img.shields.io/badge/Upstash-Redis_Edge-00E599?style=for-the-badge&logo=redis&logoColor=white)](https://upstash.com/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

<p align="center">
  <strong>Enterprise-grade YouTube packaging intelligence, outlier detection engine, and viral multiplier analytics platform.</strong>
  <br />
  🚀 <strong>Live Demo:</strong> <a href="https://outlierpulse.vercel.app/">https://outlierpulse.vercel.app/</a>
</p>

</div>

---

## 🌟 Executive Summary

**OutlierPulse** is an intelligence dashboard engineered for creators, media networks, and algorithmic strategists. Rather than tracking vanity metrics, OutlierPulse isolates statistical anomalies using a normalized **Viral Multiplier Score ($V\text{-Score}$)** to expose high-ROI packaging formulas, cognitive title hooks, and outlier growth patterns.

Built on **Next.js 14 App Router**, the platform combines sub-20ms edge caching via Upstash Redis, a 97% quota-optimized YouTube Data API pipeline, and Google Gemini 1.5 Flash for deep psychological hook deconstruction.

---

## 📐 The Scale-Agnostic $V\text{-Score}$ Engine

Traditional analytics platforms fail when comparing channels of different sizes: a 50,000-view video is catastrophic for a mega-creator but life-changing for a micro-creator.

OutlierPulse solves this by normalizing video performance against each channel's **90-day rolling median view baseline**. To prevent division-by-zero or astronomically inflated scores on nascent channels, a dynamic safety floor ($\max(\text{median}, 20)$) is enforced:

$$V\text{-Score} = \frac{\text{Video Views}}{\max(\text{Channel Rolling Median Views}, 20)}$$

### Classification Thresholds

| Multiplier Band | Classification | System Indicator | Algorithmic Impact |
| :--- | :--- | :--- | :--- |
| **$V \ge 3.0\times$** | **Super Outlier (Breakout)** | `crimson` badge | Multi-standard-deviation breakout into external/browse recommendation feeds |
| **$1.5\times \le V < 3.0\times$** | **Outlier Growth** | `violet` badge | Significant packaging overperformance; strong click-through and retention signal |
| **$V < 1.5\times$** | **Standard Baseline** | `default` badge | Expected baseline performance within typical subscriber notification velocity |

---

## 🚀 Key Features

### 1. 🛡️ 97% Quota-Optimized API Pipeline
Standard YouTube API integrations consume **100–102 quota units** per channel lookup by querying `search.list`. OutlierPulse executes a batched, two-step pipeline that cuts quota consumption to **only 2 units total** (a **97% reduction**):
- **Step 1 (`playlistItems.list`, 1 unit):** Queries the channel's upload playlist (`UU...`) with `part=contentDetails` to extract video IDs without loading heavy snippet payloads.
- **Step 2 (`videos.list`, 1 unit):** Batches up to 50 video IDs in a single call with `part=snippet,statistics` to retrieve view counts, likes, and comments simultaneously.

### 2. ⚡ Sub-20ms Upstash Redis Edge Caching
- Channel analysis payloads are cached at the edge with a 24-hour TTL (`ex: 86400`).
- Cache hits return in **< 20ms**, eliminating redundant Google API roundtrips and shielding your daily quota limits.
- Graceful degradation: if Redis credentials are not present, queries bypass the cache transparently.

### 3. 🧠 Gemini 1.5 Flash Viral Hook Analyzer
- Integrated directly into the **Title Lab**: Gemini deconstructs high-performing titles to identify core cognitive triggers (Curiosity Gap, Extreme Stakes, Loss Aversion, Counter-Intuitive Framing).
- Synthesizes 3 production-ready title variants tailored to the optimal 45–65 character mobile sweet spot.

### 4. 🧪 Interactive Title Intelligence & Packaging Sandbox
- Real-time syntax template builder with live variable substitution (e.g., `Why [Entity] is [Emotion]...`).
- Dynamic character counter with sweet-spot validation meter to prevent mobile truncation.
- One-click copy-to-clipboard integration with toast notifications.

### 5. 🎬 Video Inspector Modal & Embedded 1080p Playback
- Click any video in the dashboard to open an inspection drawer with embedded 1080p player.
- Instant calculation of like-to-view ratios, comment engagement rates, and packaging impact diagnostics.

### 6. 📊 Enterprise CSV Export
- Download comprehensive channel analytics, video IDs, view counts, $V\text{-Scores}$, outlier flags, and YouTube URLs in a sanitized CSV format with a single click.

### 7. 🎛️ Sandbox Fallback Mode
- Out-of-the-box demo mode featuring realistic creator seeds (**Veritasium**, **MrBeast**, **Fireship**, **freeCodeCamp**).
- Zero setup required to evaluate the entire UI and analytics suite without supplying API keys.

---

## 🏗️ Cleaned Repository Architecture

```
outlier-pulse/
├── app/
│   ├── api/
│   │   ├── ai-insights/
│   │   │   └── route.ts            # Gemini 1.5 Flash hook deconstruction & generation
│   │   └── analyze/
│   │       └── route.ts            # Channel intelligence pipeline + Redis edge caching
│   ├── favicon.ico                 # App icon
│   ├── globals.css                 # Dark glassmorphic design system & neon glow utilities
│   ├── layout.tsx                  # Root layout, Google Fonts (Inter & JetBrains Mono), Sonner
│   └── page.tsx                    # Landing / dashboard coordinator entry
├── components/
│   ├── dashboard/
│   │   ├── DashboardShell.tsx      # Main layout coordinator & navigation tab switcher
│   │   ├── GlassCard.tsx           # 3D interactive tilt cards with cursor-following glare
│   │   ├── MetricsCounter.tsx      # Spring-animated counter for V-Score & Alpha Score
│   │   ├── PatternMapModal.tsx     # ROI packaging & virality pattern deep-dive modal
│   │   ├── PerformanceChart.tsx    # Multi-band bezier forecasting area chart (Recharts)
│   │   ├── Sidebar.tsx             # Floating glass navigation dock with pulse indicator
│   │   ├── StrategyBreakdown.tsx   # Outlier Alpha feed & packaging ROI highlights
│   │   ├── StrategyDetector.tsx    # Outlier strategy signals & quick video inspection
│   │   ├── TitleLabCard.tsx        # NLP syntax template sandbox & Gemini AI generator
│   │   ├── Topbar.tsx              # Quota indicator, real-time search form & CSV export
│   │   └── VideoModal.tsx          # 1080p embedded player with engagement diagnostics
│   └── ui/
│       ├── badge.tsx               # CVA badge variants (emerald, violet, crimson)
│       ├── button.tsx              # Radix slot button component
│       ├── dropdown-menu.tsx       # Radix UI dropdown primitive
│       ├── input.tsx               # Glassmorphic input field
│       ├── progress.tsx            # Radix UI gradient progress bar
│       └── skeleton.tsx            # Shimmer loading placeholder
├── lib/
│   ├── analytics.ts                # V-Score algorithm, rolling median, pattern NLP matcher
│   ├── mockData.ts                 # High-fidelity creator seed database & synthetic generator
│   ├── types.ts                    # Strict TypeScript domain interfaces & data contracts
│   ├── utils.ts                    # Tailwind class merger & compact number formatters
│   └── youtube.ts                  # 2-unit quota-batched YouTube Data API v3 client
├── .env.example                    # Template environment variables
├── .eslintrc.json                  # Next.js ESLint configuration
├── .gitignore                      # Strict ignore rules for dependencies and secrets
├── components.json                 # Shadcn UI registry configuration
├── next.config.mjs                 # Next.js image domain permissions & build settings
├── package.json                    # Project dependencies & operational scripts
├── postcss.config.mjs              # PostCSS Tailwind plugins
├── tailwind.config.ts              # Custom color palette, animations & glass utilities
└── tsconfig.json                   # Strict TypeScript compiler options
```

---

## ⚡ Quickstart Guide

### Prerequisites
- **Node.js**: v18.17.0 or later
- **npm** or **pnpm**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/outlier-pulse.git
   cd outlier-pulse
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment template:
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and add your optional API keys:
   ```env
   # YouTube Data API v3 (enables live YouTube channel queries)
   YOUTUBE_API_KEY=your_youtube_api_key_here

   # Google Gemini API (powers AI viral hook analysis)
   GEMINI_API_KEY=your_gemini_api_key_here

   # Upstash Redis (enables sub-20ms edge caching)
   UPSTASH_REDIS_REST_URL=your_upstash_redis_url_here
   UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token_here
   ```
   > **Note:** If API keys are omitted, OutlierPulse automatically operates in **Sandbox Mode** with realistic seed datasets for full evaluation.

4. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Operational Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts local Next.js development server with hot-reload |
| `npm run build` | Generates optimized production build |
| `npm run start` | Runs production server |
| `npm run lint` | Runs ESLint analysis across `app/`, `components/`, and `lib/` |

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
