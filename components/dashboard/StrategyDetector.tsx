"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Map, Play, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GlassCard } from "@/components/dashboard/GlassCard";
import { PatternMapModal } from "@/components/dashboard/PatternMapModal";
import type { ChannelAnalysis, StrategySignal, VideoData } from "@/lib/types";

interface StrategyDetectorProps {
  signals: StrategySignal[];
  onActivate: (id: string) => void;
  analysis: ChannelAnalysis;
  onSelectVideo?: (video: VideoData) => void;
}

export function StrategyDetector({
  signals,
  onActivate,
  analysis,
  onSelectVideo,
}: StrategyDetectorProps) {
  const [patternOpen, setPatternOpen] = useState(false);

  // Get top breakout video to inspect directly
  const topBreakout = useMemo(() => {
    return (
      analysis.videos.find((v) => v.flag === "super") ??
      analysis.videos.find((v) => v.flag === "growth") ??
      analysis.videos[0] ??
      null
    );
  }, [analysis.videos]);

  return (
    <>
      <GlassCard glow="emerald">
        <div className="flex h-full flex-col p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold">Outlier Strategy Detector</h2>
            <p className="text-sm text-slate-400">High-growth content pattern alerts.</p>
          </div>

          <div className="space-y-3">
            {signals.map((signal) => (
              <div key={signal.id} className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    <p className="text-sm font-medium">{signal.label}</p>
                  </div>
                  <Badge variant="emerald">{signal.progress}%</Badge>
                </div>
                <p className="mb-2 text-xs text-slate-500">{signal.description}</p>
                <Progress value={signal.progress} />
              </div>
            ))}

            {/* Quick Breakout Video Trigger */}
            {topBreakout && onSelectVideo && (
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectVideo(topBreakout)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-violet-500/20 bg-violet-500/5 p-2.5 text-left transition hover:border-violet-500/40 hover:bg-violet-500/10"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg bg-violet-500/20 text-violet-300">
                    <Play className="h-3.5 w-3.5 fill-current" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-white">
                      {topBreakout.title}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Click to inspect video in 1080p player
                    </p>
                  </div>
                </div>
                <Badge variant="crimson" className="text-[10px] flex-shrink-0">
                  {topBreakout.vScore}x
                </Badge>
              </motion.button>
            )}
          </div>

          {/* ── Action row ─────────────────────────────────────────── */}
          <div className="mt-auto space-y-2 pt-4">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button className="w-full" onClick={() => onActivate("alpha-feed")}>
                Outlier Alpha Feed
              </Button>
            </motion.div>

            {/* "Open pattern map ↗" — modal trigger */}
            <motion.div whileTap={{ scale: 0.97 }}>
              <button
                onClick={() => setPatternOpen(true)}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-violet-500/25 bg-violet-500/8 px-3 py-2 text-[12px] font-medium text-violet-300 transition-all hover:border-violet-500/50 hover:bg-violet-500/15 hover:text-violet-200 active:scale-95"
              >
                <Map className="h-3.5 w-3.5" />
                Open pattern map ↗
              </button>
            </motion.div>
          </div>
        </div>
      </GlassCard>

      {/* Portal-level modal — renders outside the card */}
      <PatternMapModal
        open={patternOpen}
        onClose={() => setPatternOpen(false)}
        analysis={analysis}
      />
    </>
  );
}
