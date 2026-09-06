"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChevronDown, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GlassCard } from "@/components/dashboard/GlassCard";
import { buildSimulation } from "@/lib/analytics";
import type { ChannelAnalysis, StrategyId, VideoData } from "@/lib/types";
import { formatCompact } from "@/lib/utils";

const STRATEGIES: Array<{ id: StrategyId; label: string }> = [
  { id: "current", label: "Current Strategy" },
  { id: "aggressive", label: "Aggressive Viral" },
  { id: "evergreen", label: "Evergreen SEO" },
];

/**
 * Scale-agnostic view label formatter for YAxis ticks.
 * - Views < 1,000      → raw integer  (e.g. 450)
 * - Views 1k – 999.9k  → "#.#k"       (e.g. 4.5k)
 * - Views ≥ 1,000,000  → "#.#M"       (e.g. 12.4M)
 */
function formatViewLabel(value: number): string {
  if (value >= 1_000_000) {
    return `${parseFloat((value / 1_000_000).toFixed(1))}M`;
  }
  if (value >= 1_000) {
    return `${parseFloat((value / 1_000).toFixed(1))}k`;
  }
  return String(Math.round(value));
}

interface PerformanceChartProps {
  analysis: ChannelAnalysis;
  strategy: StrategyId;
  onStrategyChange: (id: StrategyId) => void;
  onSelectVideo?: (video: VideoData) => void;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const likely = payload.find((item) => item.name === "Likely Views")?.value ?? 0;
  const point = payload[0];

  return (
    <div className="min-w-[220px] rounded-xl border border-white/10 bg-[#12141d]/95 p-3 shadow-2xl backdrop-blur-xl">
      <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
      {payload.map((item) => (
        <div key={item.name} className="flex items-center justify-between gap-6 text-xs">
          <span className="text-slate-400">{item.name}</span>
          <span className="font-medium text-slate-100">{formatCompact(item.value)}</span>
        </div>
      ))}
      <div className="mt-2 border-t border-white/10 pt-2 text-[11px] text-slate-400">
        Projected views {formatCompact(likely)} · P{Math.min(99, Math.round(62 + likely / 1e7))}
        <br />
        Confidence interval ±{point ? 12 : 8}%
      </div>
    </div>
  );
}

export function PerformanceChart({
  analysis,
  strategy,
  onStrategyChange,
  onSelectVideo,
}: PerformanceChartProps) {
  const data = useMemo(
    () =>
      buildSimulation(analysis.medianViews90d, analysis.viralMultiplier, strategy).points,
    [analysis.medianViews90d, analysis.viralMultiplier, strategy],
  );

  const activeLabel = STRATEGIES.find((item) => item.id === strategy)?.label;
  const topBreakoutVideo = useMemo(() => {
    return [...analysis.videos].sort((a, b) => b.vScore - a.vScore)[0] ?? null;
  }, [analysis.videos]);

  return (
    <GlassCard className="min-h-[420px]" glow="violet">
      <div className="flex h-full flex-col p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h2 className="text-lg font-semibold">Performance Simulator: Current Strategy</h2>
              <Badge variant="violet">Bezier forecast</Badge>
            </div>
            <p className="text-sm text-slate-400">
              Three-band projection against 90-day median views for {analysis.channelTitle}.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {topBreakoutVideo && onSelectVideo && (
              <button
                onClick={() => onSelectVideo(topBreakoutVideo)}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20 hover:border-rose-500/50 hover:text-white active:scale-95"
                title={`Inspect top breakout video: ${topBreakoutVideo.title}`}
              >
                <Play className="h-3.5 w-3.5 fill-current text-rose-400" />
                <span>Top Breakout ({topBreakoutVideo.vScore}x)</span>
              </button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  {activeLabel}
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {STRATEGIES.map((item) => (
                  <DropdownMenuItem key={item.id} onClick={() => onStrategyChange(item.id)}>
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="min-h-0 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="conservativeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="likelyFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="viralFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.38} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tickFormatter={(value) => formatViewLabel(Number(value))}
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={48}
                domain={[0, "dataMax"]}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="conservative"
                name="Expected Conservative"
                stroke="#6366f1"
                fill="url(#conservativeFill)"
                strokeWidth={2}
                filter="url(#glow)"
              />
              <Area
                type="monotone"
                dataKey="likely"
                name="Likely Views"
                stroke="#8b5cf6"
                fill="url(#likelyFill)"
                strokeWidth={2.4}
                filter="url(#glow)"
              />
              <Area
                type="monotone"
                dataKey="viral"
                name="Viral Breakout"
                stroke="#ef4444"
                fill="url(#viralFill)"
                strokeWidth={2}
                filter="url(#glow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-2">
            <i className="h-2 w-2 rounded-full bg-[#6366f1]" /> Expected Conservative
          </span>
          <span className="flex items-center gap-2">
            <i className="h-2 w-2 rounded-full bg-[#8b5cf6]" /> Likely Views
          </span>
          <span className="flex items-center gap-2">
            <i className="h-2 w-2 rounded-full bg-[#ef4444]" /> Viral Breakout
          </span>
        </div>
      </div>
    </GlassCard>
  );
}
