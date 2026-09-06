import type {
  OutlierFlag,
  SimulationPoint,
  SimulationSeries,
  StrategyId,
  StrategySignal,
  TitlePattern,
  VideoStats,
} from "@/lib/types";

interface TitlePatternDefinition {
  id: string;
  category: string;
  template: string;
  regex: RegExp;
  benchmarkMultiplier: number;
  psychologicalTag: string;
  variables: string[];
  defaultValues: Record<string, string>;
}

const TITLE_PATTERN_DEFINITIONS: TitlePatternDefinition[] = [
  {
    id: "question-curiosity",
    category: "Question / Curiosity Hook",
    template: "Why [Entity] is [Emotion]...",
    regex: /^why\b/i,
    benchmarkMultiplier: 3.4,
    psychologicalTag: "Counter-Intuitive",
    variables: ["Entity", "Emotion"],
    defaultValues: { Entity: "AI Coding", Emotion: "Terrifyingly Good" },
  },
  {
    id: "what-happens",
    category: "Question / Curiosity Hook",
    template: "What Happens When You [Action]...",
    regex: /^what (happens|if|is)\b/i,
    benchmarkMultiplier: 3.8,
    psychologicalTag: "Curiosity Gap",
    variables: ["Action"],
    defaultValues: { Action: "Automate Your Entire Business" },
  },
  {
    id: "challenge-timebound",
    category: "Challenge / Time-Bound",
    template: "I Tested [Subject] for [Time]...",
    regex: /^i (tested|tried|built|spent|did|survived|lived in)\b/i,
    benchmarkMultiplier: 4.2,
    psychologicalTag: "Extreme Stakes",
    variables: ["Subject", "Time"],
    defaultValues: { Subject: "10 Viral Title Formats", Time: "30 Days" },
  },
  {
    id: "comparison-stakes",
    category: "Comparison / Stakes",
    template: "[Item A] vs [Item B]: The Real Winner",
    regex: /\b(vs|versus)\b/i,
    benchmarkMultiplier: 2.8,
    psychologicalTag: "High Stakes",
    variables: ["Item A", "Item B"],
    defaultValues: { "Item A": "Next.js 15", "Item B": "Remix" },
  },
  {
    id: "secret-forbidden",
    category: "Comparison / Stakes",
    template: "The Secret of [Domain] Nobody [Verb]...",
    regex: /\b(secret|nobody|hidden|truth|exposed|myth|lie)\b/i,
    benchmarkMultiplier: 2.9,
    psychologicalTag: "FOMO",
    variables: ["Domain", "Verb"],
    defaultValues: { Domain: "YouTube Virality", Verb: "Talks About" },
  },
  {
    id: "how-i-result",
    category: "Direct Value / Blueprint",
    template: "How I [Result] with [Method]...",
    regex: /^how i\b/i,
    benchmarkMultiplier: 2.5,
    psychologicalTag: "Social Proof",
    variables: ["Result", "Method"],
    defaultValues: { Result: "Engineered 10M Views", Method: "Outlier Packaging" },
  },
  {
    id: "warning-negative",
    category: "Loss Aversion / Warning",
    template: "Don't [Action] Until You [Requirement]...",
    regex: /^(don't|stop|never|avoid)\b/i,
    benchmarkMultiplier: 3.1,
    psychologicalTag: "Loss Aversion",
    variables: ["Action", "Requirement"],
    defaultValues: { Action: "Publish Another Video", Requirement: "Test This Syntax" },
  },
];

export function rollingMedian(values: number[]): number {
  if (values.length === 0) return 1;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Normalized outlier formula:
 * V-Score = Video Views / Channel 90-Day Rolling Median Views
 *
 * The denominator uses a dynamic minimum floor of 20 so that
 * micro-channels with a near-zero rolling median never produce
 * Infinity or astronomically large scores, keeping the metric
 * meaningful and scale-agnostic across all channel sizes.
 */
export function computeVScore(views: number, medianViews: number): number {
  const baseline = Math.max(medianViews, 20);
  return parseFloat((views / baseline).toFixed(2));
}

export function classifyOutlier(vScore: number): OutlierFlag {
  if (vScore >= 3) return "super";
  if (vScore >= 1.5) return "growth";
  return "baseline";
}

export function outlierLabel(flag: OutlierFlag): string {
  switch (flag) {
    case "super":
      return "Breakout";
    case "growth":
      return "Outlier";
    default:
      return "Standard";
  }
}

export function enrichVideos(
  videos: Array<Omit<VideoStats, "vScore" | "flag">>,
  medianViews: number,
): VideoStats[] {
  return videos.map((video) => {
    const vScore = computeVScore(video.views, medianViews);
    return {
      ...video,
      vScore: Number(vScore.toFixed(2)),
      flag: classifyOutlier(vScore),
    };
  });
}

export function viralMultiplier(videos: VideoStats[]): number {
  if (videos.length === 0) return 1;
  const top = [...videos].sort((a, b) => b.vScore - a.vScore).slice(0, 5);
  const avg = top.reduce((sum, video) => sum + video.vScore, 0) / top.length;
  return Number(avg.toFixed(1));
}

export function alphaScore(videos: VideoStats[]): number {
  if (videos.length === 0) return 50;
  const superCount = videos.filter((v) => v.flag === "super").length;
  const growthCount = videos.filter((v) => v.flag === "growth").length;
  const density = (superCount * 2 + growthCount) / videos.length;
  return Math.min(99, Math.round(62 + density * 48));
}

export function extractTitlePatterns(videos: VideoStats[]): TitlePattern[] {
  // Breakout videos (V-Score >= 1.5x)
  const breakouts = videos.filter((v) => v.vScore >= 1.5);

  return TITLE_PATTERN_DEFINITIONS.map((def) => {
    // Matches across all channel videos
    const matches = videos.filter((video) => def.regex.test(video.title));
    const breakoutMatches = breakouts.filter((video) => def.regex.test(video.title));

    let multiplier = def.benchmarkMultiplier;
    if (matches.length > 0) {
      // Calculate true dynamic multiplier lift on this channel
      const avgScore =
        matches.reduce((sum, video) => sum + video.vScore, 0) / matches.length;
      multiplier = Math.max(def.benchmarkMultiplier, Number(avgScore.toFixed(1)));
    }

    // Extract real examples from this channel, prioritizing breakout videos
    const examples = [
      ...breakoutMatches.map((v) => v.title),
      ...matches.map((v) => v.title),
    ].slice(0, 3);

    return {
      id: def.id,
      category: def.category,
      template: def.template,
      multiplier,
      hits: matches.length,
      examples,
      psychologicalTag: def.psychologicalTag,
      variables: def.variables,
      defaultValues: def.defaultValues,
    };
  }).sort((a, b) => b.multiplier - a.multiplier);
}

export function detectStrategies(videos: VideoStats[]): StrategySignal[] {
  const curiosity = videos.filter((v) =>
    /\b(why|secret|nobody|hidden|actually)\b/i.test(v.title),
  );
  const rare = videos.filter((v) => v.flag !== "baseline");
  const alpha = videos.filter((v) => v.flag === "super");

  const score = (subset: VideoStats[]) => {
    if (videos.length === 0) return 0;
    const share = subset.length / videos.length;
    const lift =
      subset.reduce((sum, v) => sum + v.vScore, 0) / Math.max(subset.length, 1);
    return Math.min(99, Math.round(share * 55 + Math.min(lift, 8) * 6));
  };

  return [
    {
      id: "alpha-feed",
      label: "Outlier Alpha Feed",
      description: "High-growth videos exceeding 3.0× median views.",
      progress: Math.max(72, score(alpha) + 14),
    },
    {
      id: "curiosity",
      label: "Rare Content / Curiosity",
      description: "Question-led titles that spike click-through.",
      progress: Math.max(38, score(curiosity)),
    },
    {
      id: "rare-pattern",
      label: "Rare Content Pattern",
      description: "Low-frequency formats with disproportionate ROI.",
      progress: Math.max(52, score(rare)),
    },
  ];
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function series(
  points: number,
  start: number,
  end: number,
  volatility: number,
  seed: number,
): number[] {
  return Array.from({ length: points }, (_, index) => {
    const t = index / (points - 1);
    const wave = Math.sin(index * 0.55 + seed) * volatility;
    const spike = index === points - 3 ? volatility * 1.8 : 0;
    return Math.max(0.2, lerp(start, end, t) + wave + spike);
  });
}

export function buildSimulation(
  medianViews: number,
  multiplier: number,
  strategy: StrategyId,
): SimulationSeries {
  const labels = [
    "W1",
    "W2",
    "W3",
    "W4",
    "W5",
    "W6",
    "W7",
    "W8",
    "W9",
    "W10",
    "W11",
    "W12",
  ];

  const strategyBoost =
    strategy === "aggressive" ? 1.45 : strategy === "evergreen" ? 0.92 : 1;

  const conservative = series(12, medianViews * 0.7, medianViews * 1.05, medianViews * 0.08, 0.4);
  const likely = series(
    12,
    medianViews * 0.95,
    medianViews * multiplier * 0.55 * strategyBoost,
    medianViews * 0.18,
    1.1,
  );
  const viral = series(
    12,
    medianViews * 1.2,
    medianViews * multiplier * 1.15 * strategyBoost,
    medianViews * 0.32,
    2.2,
  );

  const points: SimulationPoint[] = labels.map((week, index) => ({
    week,
    conservative: Math.round(conservative[index]),
    likely: Math.round(likely[index]),
    viral: Math.round(viral[index]),
    percentile: Math.min(99, Math.round(58 + index * 2.4)),
    confidence: Math.min(97, 78 + index),
  }));

  return { strategy, points };
}
