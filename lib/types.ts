export type OutlierFlag = "super" | "growth" | "baseline";

export type StrategyId = "current" | "aggressive" | "evergreen";

export type NavId =
  | "dashboard"
  | "simulations"
  | "trends"
  | "title-lab"
  | "network"
  | "settings";

export interface VideoStats {
  id: string;
  title: string;
  views: number;
  likes?: number;
  comments?: number;
  publishedAt: string;
  thumbnail?: string;
  vScore: number;
  flag: OutlierFlag;
}

export type VideoData = VideoStats;

export interface StrategySignal {
  id: string;
  label: string;
  description: string;
  progress: number;
}

export interface TitlePattern {
  id: string;
  template: string;
  multiplier: number;
  hits: number;
  examples: string[];
  category?: string;
  psychologicalTag?: string;
  variables?: string[];
  defaultValues?: Record<string, string>;
}

export interface SimulationPoint {
  week: string;
  conservative: number;
  likely: number;
  viral: number;
  percentile: number;
  confidence: number;
}

export interface SimulationSeries {
  strategy: StrategyId;
  points: SimulationPoint[];
}

export interface RelatedCreator {
  name: string;
  niche: string;
  affinity: number;
}

export interface ChannelAnalysis {
  channelId: string;
  channelTitle: string;
  handle: string;
  thumbnail?: string;
  subscriberCount: number;
  videoCount: number;
  medianViews90d: number;
  viralMultiplier: number;
  alphaScore: number;
  precisionConfidence: number;
  videos: VideoStats[];
  strategies: StrategySignal[];
  titlePatterns: TitlePattern[];
  simulation: SimulationSeries;
  relatedCreators: RelatedCreator[];
  source: "youtube" | "mock";
  queriedAt: string;
}
