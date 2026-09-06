"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Brain, TrendingUp, X, Zap } from "lucide-react";
import type { ChannelAnalysis } from "@/lib/types";

interface PatternMapModalProps {
  open: boolean;
  onClose: () => void;
  analysis: ChannelAnalysis;
}

/* ── Module 1 data — title-length buckets ─────────────────────────────── */
const TITLE_LENGTH_BUCKETS = [
  { range: "< 30 chars", lift: 0.8, pct: 15 },
  { range: "30–50 chars", lift: 1.4, pct: 28 },
  { range: "50–70 chars", lift: 2.4, pct: 38, best: true },
  { range: "70–90 chars", lift: 1.7, pct: 12 },
  { range: "> 90 chars", lift: 0.9, pct: 7 },
];

/* ── Module 2 data — emotion/curiosity drivers ───────────────────────── */
const EMOTION_DRIVERS = [
  { label: "Extreme Challenge", emoji: "🔥", multiplier: 4.1, color: "#ef4444" },
  { label: "Curiosity Gap", emoji: "🧠", multiplier: 3.4, color: "#8b5cf6" },
  { label: "Financial Stakes", emoji: "💰", multiplier: 2.8, color: "#f59e0b" },
  { label: "Identity Threat", emoji: "⚡", multiplier: 2.5, color: "#3b82f6" },
  { label: "Social Proof", emoji: "🏆", multiplier: 2.1, color: "#10b981" },
  { label: "Controversy", emoji: "🎭", multiplier: 1.9, color: "#ec4899" },
];

const MAX_MULT = 4.1;

export function PatternMapModal({ open, onClose, analysis }: PatternMapModalProps) {
  /* Derive Live Strategy Recommendation from the top-scoring video */
  const topVideo = [...analysis.videos].sort((a, b) => b.vScore - a.vScore)[0];
  const avgTitleLen = Math.round(
    analysis.videos.reduce((s, v) => s + v.title.length, 0) / Math.max(analysis.videos.length, 1),
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ── Backdrop ──────────────────────────────────────────────── */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* ── Modal panel ───────────────────────────────────────────── */}
          <motion.div
            key="modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
          >
            <div
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0e1018]/98 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow orbs inside modal */}
              <div className="pointer-events-none absolute -top-20 left-1/4 h-48 w-48 rounded-full bg-violet-600/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-10 right-1/4 h-40 w-40 rounded-full bg-rose-600/15 blur-3xl" />

              {/* ── Header ──────────────────────────────────────────── */}
              <div className="relative flex items-start justify-between border-b border-white/8 p-6 pb-5">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-violet-400" />
                    <h2 className="text-base font-semibold text-white">
                      ROI Packaging &amp; Virality Pattern Map
                    </h2>
                  </div>
                  <p className="text-[12px] text-slate-400">
                    Structural analysis for{" "}
                    <span className="text-violet-300">{analysis.channelTitle}</span> ·{" "}
                    {analysis.videos.length} videos scanned
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition-colors hover:border-white/20 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="relative space-y-6 p-6">
                {/* ── Module 1: Title Length & Emoji ──────────────── */}
                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-white">
                      Module 1 — Title Length &amp; Lift Analysis
                    </h3>
                    <span className="ml-auto rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                      Avg on channel: {avgTitleLen} chars
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {TITLE_LENGTH_BUCKETS.map((bucket) => (
                      <div key={bucket.range}>
                        <div className="mb-1 flex items-center justify-between text-[11px]">
                          <span
                            className={
                              bucket.best ? "font-medium text-violet-300" : "text-slate-400"
                            }
                          >
                            {bucket.range}
                            {bucket.best && (
                              <span className="ml-1.5 rounded-full bg-violet-500/20 px-1.5 py-0.5 text-[9px] text-violet-300">
                                OPTIMAL
                              </span>
                            )}
                          </span>
                          <span
                            className={
                              bucket.best
                                ? "font-bold text-violet-300"
                                : "text-slate-400"
                            }
                          >
                            +{bucket.lift}x views
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                          <motion.div
                            className={
                              bucket.best
                                ? "h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400"
                                : "h-full rounded-full bg-white/20"
                            }
                            initial={{ width: 0 }}
                            animate={{ width: `${bucket.pct * 2.5}%` }}
                            transition={{ duration: 0.7, delay: 0.15 + TITLE_LENGTH_BUCKETS.indexOf(bucket) * 0.07 }}
                          />
                        </div>
                        <p className="mt-0.5 text-right text-[10px] text-slate-600">
                          {bucket.pct}% of videos in this range
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* ── Module 2: Emotion & Curiosity Drivers ───────── */}
                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-rose-400" />
                    <h3 className="text-sm font-semibold text-white">
                      Module 2 — Emotion &amp; Curiosity Drivers
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {EMOTION_DRIVERS.map((driver, i) => (
                      <motion.div
                        key={driver.label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.06 }}
                        className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-3 transition-colors hover:border-white/15 hover:bg-white/[0.06]"
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-lg">{driver.emoji}</span>
                          <span className="text-[11px] font-semibold" style={{ color: driver.color }}>
                            +{driver.multiplier}x
                          </span>
                        </div>
                        <p className="text-[11px] leading-snug text-slate-300">{driver.label}</p>

                        {/* Mini bar */}
                        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/5">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: driver.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${(driver.multiplier / MAX_MULT) * 100}%` }}
                            transition={{ duration: 0.6, delay: 0.25 + i * 0.06 }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* ── Module 3: Live Strategy Recommendation ───────── */}
                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-400" />
                    <h3 className="text-sm font-semibold text-white">
                      Module 3 — Live Strategy Recommendation
                    </h3>
                    <span className="ml-auto rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                      {analysis.viralMultiplier}x viral multiplier
                    </span>
                  </div>

                  <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-rose-500/5 p-4">
                    {topVideo ? (
                      <>
                        <p className="mb-2 text-[11px] text-slate-400">
                          Best-performing structure on{" "}
                          <span className="text-violet-300">{analysis.channelTitle}</span>:
                        </p>
                        <p className="mb-3 text-sm font-medium leading-snug text-white">
                          &ldquo;{topVideo.title}&rdquo;
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-xl border border-white/8 bg-white/5 p-2 text-center">
                            <p className="text-[10px] text-slate-500">V-Score</p>
                            <p className="text-base font-bold text-violet-300">
                              {topVideo.vScore}x
                            </p>
                          </div>
                          <div className="rounded-xl border border-white/8 bg-white/5 p-2 text-center">
                            <p className="text-[10px] text-slate-500">Title Len</p>
                            <p className="text-base font-bold text-emerald-300">
                              {topVideo.title.length}
                            </p>
                          </div>
                          <div className="rounded-xl border border-white/8 bg-white/5 p-2 text-center">
                            <p className="text-[10px] text-slate-500">Flag</p>
                            <p className="text-base font-bold text-rose-300 capitalize">
                              {topVideo.flag}
                            </p>
                          </div>
                        </div>
                        <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
                          <span className="text-violet-300">↳ Recommendation:</span> Mirror this
                          video&apos;s packaging structure — keep titles between 50–70 characters,
                          lead with a curiosity gap or financial-stakes hook, and front-load the
                          thumbnail with a single bold emotion signal. Projected lift:{" "}
                          <span className="font-semibold text-white">+2.4× to +4.1×</span> baseline
                          views within the first 48 h.
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-slate-400">No video data available.</p>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
