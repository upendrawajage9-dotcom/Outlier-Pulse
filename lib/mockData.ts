import {
  alphaScore,
  buildSimulation,
  detectStrategies,
  enrichVideos,
  extractTitlePatterns,
  rollingMedian,
  viralMultiplier,
} from "@/lib/analytics";
import type { ChannelAnalysis, VideoStats } from "@/lib/types";

type SeedVideo = Omit<VideoStats, "vScore" | "flag">;

interface SeedChannel {
  channelId: string;
  channelTitle: string;
  handle: string;
  aliases: string[];
  subscriberCount: number;
  videos: SeedVideo[];
  relatedCreators: ChannelAnalysis["relatedCreators"];
}

const SEED_CHANNELS: SeedChannel[] = [
  {
    channelId: "UCHnyfMqiRRG1u-2MsSQLbXA",
    channelTitle: "Veritasium",
    handle: "@veritasium",
    aliases: ["veritasium", "derek muller"],
    subscriberCount: 16_800_000,
    relatedCreators: [
      { name: "Vsauce", niche: "Science curiosity", affinity: 92 },
      { name: "SmarterEveryDay", niche: "Engineering", affinity: 88 },
      { name: "minutephysics", niche: "Explainers", affinity: 81 },
    ],
    videos: [
      { id: "v1", title: "Why Gravity is Not a Force", views: 42_100_000, publishedAt: "2026-06-02" },
      { id: "v2", title: "What is Quantum Entanglement to Engineers", views: 18_400_000, publishedAt: "2026-06-18" },
      { id: "v3", title: "I Tested a Nuclear Clock for 30 Days", views: 21_900_000, publishedAt: "2026-07-01" },
      { id: "v4", title: "The Secret of Electricity Nobody Teaches", views: 9_200_000, publishedAt: "2026-07-12" },
      { id: "v5", title: "How I Measured Light Speed with a Microwave", views: 6_800_000, publishedAt: "2026-07-20" },
      { id: "v6", title: "This Paradox Broke Physics", views: 11_100_000, publishedAt: "2026-07-28" },
      { id: "v7", title: "Why Time is an Illusion", views: 28_600_000, publishedAt: "2026-08-04" },
      { id: "v8", title: "A Simple Experiment on Relativity", views: 4_900_000, publishedAt: "2026-08-11" },
    ],
  },
  {
    channelId: "UCX6OQ3DkcsbYNE6H8uQQuVA",
    channelTitle: "MrBeast",
    handle: "@mrbeast",
    aliases: ["mrbeast", "mr beast", "jimmy donaldson"],
    subscriberCount: 380_000_000,
    relatedCreators: [
      { name: "MrBeast Gaming", niche: "Entertainment", affinity: 96 },
      { name: "Beast Philanthropy", niche: "Impact", affinity: 91 },
      { name: "Unspeakable", niche: "Challenges", affinity: 74 },
    ],
    videos: [
      { id: "m1", title: "I Tested $1 vs $1,000,000 for 7 Days", views: 212_000_000, publishedAt: "2026-05-22" },
      { id: "m2", title: "Why This Island is Impossible", views: 148_000_000, publishedAt: "2026-06-08" },
      { id: "m3", title: "What is $1 to Survive 50 Hours", views: 176_000_000, publishedAt: "2026-06-21" },
      { id: "m4", title: "100 People Fight For $1,000,000", views: 98_400_000, publishedAt: "2026-07-03" },
      { id: "m5", title: "I Built 100 Houses And Gave Them Away", views: 121_000_000, publishedAt: "2026-07-16" },
      { id: "m6", title: "The Secret of Viral Challenges Nobody Copies", views: 67_200_000, publishedAt: "2026-07-29" },
      { id: "m7", title: "How I Spent 7 Days Buried Alive", views: 54_800_000, publishedAt: "2026-08-06" },
      { id: "m8", title: "World's Most Dangerous Game Show", views: 88_100_000, publishedAt: "2026-08-14" },
    ],
  },
  {
    channelId: "UCsBjURrPoezykLs9EqgamOA",
    channelTitle: "Fireship",
    handle: "@fireship",
    aliases: ["fireship", "jeff delaney"],
    subscriberCount: 3_400_000,
    relatedCreators: [
      { name: "Theo", niche: "Web engineering", affinity: 90 },
      { name: "ThePrimeTime", niche: "Dev culture", affinity: 86 },
      { name: "Web Dev Simplified", niche: "Tutorials", affinity: 79 },
    ],
    videos: [
      { id: "f1", title: "I Tested Rust for 100 Hours", views: 4_800_000, publishedAt: "2026-06-04" },
      { id: "f2", title: "Why TypeScript is Actually Insane", views: 2_100_000, publishedAt: "2026-06-19" },
      { id: "f3", title: "What is Next.js 15 to Production Apps", views: 1_640_000, publishedAt: "2026-07-02" },
      { id: "f4", title: "100 Seconds of WebGPU", views: 890_000, publishedAt: "2026-07-11" },
      { id: "f5", title: "The Secret of CSS Nobody Uses", views: 1_220_000, publishedAt: "2026-07-22" },
      { id: "f6", title: "How I Built an AI Agent in 100 Lines", views: 3_310_000, publishedAt: "2026-08-01" },
      { id: "f7", title: "React Server Components Explained", views: 740_000, publishedAt: "2026-08-08" },
      { id: "f8", title: "Why AI Coding Tools are Overhyped", views: 2_760_000, publishedAt: "2026-08-15" },
    ],
  },
  {
    channelId: "UC8butISFwT-Wl7EV0hUK0BQ",
    channelTitle: "freeCodeCamp.org",
    handle: "@freecodecamp",
    aliases: ["freecodecamp", "free code camp"],
    subscriberCount: 9_900_000,
    relatedCreators: [
      { name: "Traversy Media", niche: "Full-stack", affinity: 87 },
      { name: "Programming with Mosh", niche: "Foundations", affinity: 84 },
      { name: "The Net Ninja", niche: "Tutorials", affinity: 82 },
    ],
    videos: [
      { id: "c1", title: "What is Python to Build Real Apps", views: 8_400_000, publishedAt: "2026-05-18" },
      { id: "c2", title: "I Tested a Full Stack Course for 12 Hours", views: 3_200_000, publishedAt: "2026-06-09" },
      { id: "c3", title: "Why JavaScript is Still Essential", views: 2_450_000, publishedAt: "2026-06-27" },
      { id: "c4", title: "SQL for Beginners — Complete Course", views: 1_880_000, publishedAt: "2026-07-08" },
      { id: "c5", title: "The Secret of Algorithms Nobody Mentions", views: 1_120_000, publishedAt: "2026-07-21" },
      { id: "c6", title: "How I Learned Rust as a Beginner", views: 960_000, publishedAt: "2026-08-02" },
      { id: "c7", title: "Machine Learning Crash Course", views: 2_080_000, publishedAt: "2026-08-09" },
      { id: "c8", title: "Next.js 14 Full Course", views: 1_540_000, publishedAt: "2026-08-16" },
    ],
  },
];

function hashQuery(input: string): number {
  return Array.from(input).reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function toAnalysis(seed: SeedChannel, source: "youtube" | "mock"): ChannelAnalysis {
  const medianViews90d = Math.round(
    rollingMedian(seed.videos.map((video) => video.views)),
  );
  const videos = enrichVideos(seed.videos, medianViews90d);
  const multiplier = viralMultiplier(videos);

  return {
    channelId: seed.channelId,
    channelTitle: seed.channelTitle,
    handle: seed.handle,
    subscriberCount: seed.subscriberCount,
    videoCount: seed.videos.length,
    medianViews90d,
    viralMultiplier: multiplier,
    alphaScore: alphaScore(videos),
    precisionConfidence: 96,
    videos,
    strategies: detectStrategies(videos),
    titlePatterns: extractTitlePatterns(videos),
    simulation: buildSimulation(medianViews90d, multiplier, "current"),
    relatedCreators: seed.relatedCreators,
    source,
    queriedAt: new Date().toISOString(),
  };
}

function syntheticChannel(query: string): SeedChannel {
  const seed = hashQuery(query.toLowerCase());
  const base = 80_000 + (seed % 40) * 12_000;
  const name = query.replace(/^@/, "").trim() || "Independent Creator";

  const titles = [
    `Why ${name} is Exploding Overnight`,
    `I Tested this Niche for 30 Days`,
    `What is ${name} to Viral Growth`,
    `The Secret of Thumbnails Nobody Shares`,
    `How I Hit 100k with One Format`,
    `${name} Strategy Breakdown`,
    `Rare Content Pattern in ${name}`,
    `Why this Hook is Unfair`,
  ];

  return {
    channelId: `UC${(seed * 13).toString(16).padStart(22, "0").slice(0, 22)}`,
    channelTitle: name.replace(/\b\w/g, (c) => c.toUpperCase()),
    handle: `@${name.replace(/\s+/g, "").toLowerCase()}`,
    aliases: [query],
    subscriberCount: 120_000 + (seed % 90) * 8_000,
    relatedCreators: [
      { name: "Fireship", niche: "Dev velocity", affinity: 71 },
      { name: "Veritasium", niche: "Curiosity", affinity: 68 },
      { name: "MrBeast", niche: "Packaging", affinity: 64 },
    ],
    videos: titles.map((title, index) => ({
      id: `syn-${seed}-${index}`,
      title,
      views: Math.round(base * (0.6 + ((seed + index * 17) % 9) / 4 + (index === 0 ? 3.4 : 0))),
      publishedAt: new Date(Date.now() - (8 - index) * 86400000 * 7).toISOString().slice(0, 10),
    })),
  };
}

export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function findSeedChannel(query: string): SeedChannel | undefined {
  const normalized = normalizeQuery(query)
    .replace("https://", "")
    .replace("http://", "")
    .replace("www.", "")
    .replace("youtube.com/", "")
    .replace("youtu.be/", "")
    .replace("channel/", "")
    .replace("@", "")
    .trim();

  return SEED_CHANNELS.find((channel) => {
    const haystack = [
      channel.channelId.toLowerCase(),
      channel.channelTitle.toLowerCase(),
      channel.handle.toLowerCase(),
      ...channel.aliases,
    ];
    return haystack.some((value) => value.includes(normalized) || normalized.includes(value.replace("@", "")));
  });
}

export function getMockAnalysis(query: string): ChannelAnalysis {
  const seed = findSeedChannel(query) ?? syntheticChannel(query);
  return toAnalysis(seed, "mock");
}

export function listSeedChannels() {
  return SEED_CHANNELS.map((channel) => ({
    title: channel.channelTitle,
    handle: channel.handle,
  }));
}

