"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { MetricsCounter } from "@/components/dashboard/MetricsCounter";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { StrategyBreakdown } from "@/components/dashboard/StrategyBreakdown";
import { StrategyDetector } from "@/components/dashboard/StrategyDetector";
import { TitleLabCard } from "@/components/dashboard/TitleLabCard";
import { Topbar } from "@/components/dashboard/Topbar";
import { VideoModal } from "@/components/dashboard/VideoModal";
import { GlassCard } from "@/components/dashboard/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { outlierLabel } from "@/lib/analytics";
import type { ChannelAnalysis, NavId, StrategyId, VideoData } from "@/lib/types";
import { formatCompact, formatNumber } from "@/lib/utils";

interface AnalyzeResponse {
  ok: boolean;
  success?: boolean;
  isMockData: boolean;
  analysis: ChannelAnalysis;
  apiConfigured: boolean;
  alert?: string;
  error?: string;
}

function BentoSkeleton() {
  return (
    <div className="grid h-full grid-cols-12 grid-rows-2 gap-4">
      <Skeleton className="col-span-8 row-span-2 h-full min-h-[420px]" />
      <Skeleton className="col-span-4 h-full" />
      <div className="col-span-12 grid grid-cols-3 gap-4">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </div>
  );
}

export function DashboardShell() {
  const [nav, setNav] = useState<NavId>("dashboard");
  const [query, setQuery] = useState("Veritasium");
  const [strategy, setStrategy] = useState<StrategyId>("current");
  const [analysis, setAnalysis] = useState<ChannelAnalysis | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [apiLive, setApiLive] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (channelQuery: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analyze?query=${encodeURIComponent(channelQuery)}`);
      const payload = (await response.json()) as AnalyzeResponse;
      if (!payload.ok) {
        throw new Error(payload.error ?? "Failed to analyze channel");
      }
      setAnalysis(payload.analysis);
      // isMockData is the authoritative flag; fall back to !apiConfigured for compat
      setApiLive(payload.isMockData === false ? true : !payload.isMockData);
      if (payload.alert) {
        toast.warning(payload.alert, {
          description: "Add YOUTUBE_API_KEY to .env.local to enable live data.",
        });
      }
      setStrategy("current");
    } catch (error) {
      toast.error("Could not load channel intelligence", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load("Veritasium");
  }, [load]);

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-root p-4 text-slate-50 md:p-6">
      <div className="orb orb-violet" />
      <div className="orb orb-crimson" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] gap-4">
        <Sidebar active={nav} onChange={setNav} />

        <main className="flex min-w-0 flex-1 flex-col gap-4">
          <Topbar
            query={query}
            onQueryChange={setQuery}
            onSubmit={() => void load(query)}
            apiLive={apiLive}
            loading={loading}
            analysis={analysis}
          />

          {loading || !analysis ? (
            <BentoSkeleton />
          ) : nav === "dashboard" ? (
            <div className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-12 xl:grid-rows-[minmax(420px,1.4fr)_minmax(240px,1fr)]">
              <div className="xl:col-span-8 xl:row-span-1">
                <PerformanceChart
                  analysis={analysis}
                  strategy={strategy}
                  onStrategyChange={setStrategy}
                  onSelectVideo={setSelectedVideo}
                />
              </div>
              <div className="xl:col-span-4">
                <StrategyDetector
                  signals={analysis.strategies}
                  onActivate={() => setNav("trends")}
                  analysis={analysis}
                  onSelectVideo={setSelectedVideo}
                />
              </div>
              <div className="xl:col-span-4">
                <StrategyBreakdown analysis={analysis} />
              </div>
              <div className="xl:col-span-4">
                <TitleLabCard
                  patterns={analysis.titlePatterns}
                  videos={analysis.videos}
                  channelTitle={analysis.channelTitle}
                />
              </div>
              <div className="xl:col-span-4">
                <MetricsCounter
                  multiplier={analysis.viralMultiplier}
                  alpha={analysis.alphaScore}
                  confidence={analysis.precisionConfidence}
                />
              </div>
            </div>
          ) : nav === "simulations" ? (
            <PerformanceChart
              analysis={analysis}
              strategy={strategy}
              onStrategyChange={setStrategy}
              onSelectVideo={setSelectedVideo}
            />
          ) : nav === "trends" ? (
            <GlassCard>
              <div className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Outlier Trends</h2>
                    <p className="text-xs text-slate-400">
                      Click any video to inspect packaging intelligence &amp; embedded 1080p playback.
                    </p>
                  </div>
                  <Badge variant="violet">{analysis.videos.length} Videos Analyzed</Badge>
                </div>
                <div className="space-y-2">
                  {analysis.videos.map((video) => (
                    <button
                      key={video.id}
                      onClick={() => setSelectedVideo(video)}
                      className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-left transition hover:border-violet-500/30 hover:bg-white/[0.06] active:scale-[0.99]"
                    >
                      <div className="min-w-0 flex-1 pr-4">
                        <p className="truncate text-sm font-medium text-slate-100">{video.title}</p>
                        <p className="text-xs text-slate-400">
                          {formatNumber(video.views)} views · {video.publishedAt}
                        </p>
                      </div>
                      <Badge
                        variant={
                          video.flag === "super"
                            ? "crimson"
                            : video.flag === "growth"
                              ? "violet"
                              : "default"
                        }
                        className="flex-shrink-0"
                      >
                        {outlierLabel(video.flag)} {video.vScore.toFixed(1)}x
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            </GlassCard>
          ) : nav === "title-lab" ? (
            <TitleLabCard
              patterns={analysis.titlePatterns}
              videos={analysis.videos}
              channelTitle={analysis.channelTitle}
            />
          ) : nav === "network" ? (
            <GlassCard>
              <div className="p-5">
                <h2 className="mb-4 text-lg font-semibold">Creator Network</h2>
                <p className="mb-4 text-sm text-slate-400">
                  Adjacent channels with overlapping packaging DNA.
                </p>
                <div className="grid gap-3 md:grid-cols-3">
                  {analysis.relatedCreators.map((creator) => (
                    <div
                      key={creator.name}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <p className="font-medium">{creator.name}</p>
                      <p className="text-sm text-slate-400">{creator.niche}</p>
                      <p className="mt-3 text-2xl font-semibold text-violet-300">
                        {creator.affinity}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          ) : (
            <GlassCard>
              <div className="p-5">
                <h2 className="mb-2 text-lg font-semibold">Settings</h2>
                <p className="text-sm text-slate-400">
                  
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 p-4">
                    <p className="text-xs text-slate-500">Channel</p>
                    <p className="text-lg font-medium">{analysis.channelTitle}</p>
                    <p className="text-sm text-slate-400">{analysis.handle}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 p-4">
                    <p className="text-xs text-slate-500">Subscribers</p>
                    <p className="text-lg font-medium">{formatCompact(analysis.subscriberCount)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 p-4">
                    <p className="text-xs text-slate-500">Data source</p>
                    <p className="text-lg font-medium capitalize">{analysis.source}</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}
        </main>
      </div>

      {/* ── Interactive Video Inspector Modal ────────────────────── */}
      <VideoModal
        video={selectedVideo}
        isOpen={Boolean(selectedVideo)}
        onClose={() => setSelectedVideo(null)}
        channelTitle={analysis?.channelTitle}
      />
    </div>
  );
}
