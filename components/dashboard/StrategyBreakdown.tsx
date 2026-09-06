"use client";

import { ArrowUpRight, FlaskConical, Percent } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/dashboard/GlassCard";
import { outlierLabel } from "@/lib/analytics";
import type { ChannelAnalysis } from "@/lib/types";

interface StrategyBreakdownProps {
  analysis: ChannelAnalysis;
}

export function StrategyBreakdown({ analysis }: StrategyBreakdownProps) {
  const top = [...analysis.videos].sort((a, b) => b.vScore - a.vScore)[0];

  return (
    <GlassCard glow="violet">
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Strategy Breakdown</h2>
            <p className="text-sm text-slate-400">Outlier Alpha Feed</p>
          </div>
          <Badge variant="emerald">Live</Badge>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
            <div className="mb-1 flex items-center gap-2 text-xs text-slate-400">
              <FlaskConical className="h-3.5 w-3.5 text-violet-400" />
              Title Lab drill-down
            </div>
            <p className="text-sm text-slate-100">{top?.title ?? "No videos yet"}</p>
            <p className="mt-1 text-xs text-slate-500">
              {top ? `${outlierLabel(top.flag)} · ${top.vScore.toFixed(1)}× median` : "Awaiting sample"}
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
            <div className="mb-1 flex items-center gap-2 text-xs text-slate-400">
              <Percent className="h-3.5 w-3.5 text-emerald-400" />
              ROI pattern
            </div>
            <p className="text-sm text-slate-100">
              Super outliers convert {analysis.viralMultiplier.toFixed(1)}× baseline packaging.
            </p>
            <button className="mt-2 inline-flex items-center gap-1 text-xs text-violet-300">
              Open pattern map <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
