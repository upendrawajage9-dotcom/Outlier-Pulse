"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Brain,
  Check,
  ChevronRight,
  Copy,
  Flame,
  Info,
  Loader2,
  RotateCcw,
  Sparkles,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/dashboard/GlassCard";
import type { TitlePattern, VideoData } from "@/lib/types";

interface TitleLabCardProps {
  patterns: TitlePattern[];
  videos?: VideoData[];
  channelTitle?: string;
}

const QUICK_SUGGESTIONS: Record<string, string[]> = {
  Entity: ["AI Coding", "Next.js 15", "Cursor AI", "Tailwind CSS", "TypeScript"],
  Emotion: ["Terrifyingly Good", "Completely Broken", "Insanely Fast", "Game Changing"],
  Subject: ["10 AI Video Models", "React 19 vs Svelte", "Solo Dev Workflow", "Rust Backend"],
  Time: ["30 Days", "48 Hours", "100 Hours", "1 Year"],
  Action: ["Automate Your Entire Business", "Switch to Linux", "Build an AI App", "Quit Your Job"],
  "Item A": ["Next.js", "Claude 3.7", "Vite", "VS Code"],
  "Item B": ["Remix", "GPT-4o", "Turbopack", "Cursor"],
  Domain: ["YouTube Virality", "Full-Stack Dev", "AI Engineering", "SaaS Pricing"],
  Verb: ["Talks About", "Understands", "Wants You to Know", "Dares to Reveal"],
  Result: ["Engineered 10M Views", "Built a $10k/mo SaaS", "Ranked #1 on Google"],
  Method: ["Outlier Packaging", "Zero Marketing", "Pure TypeScript", "Sub-Agent Automation"],
  Requirement: ["Test This Syntax", "Fix Your Thumbnails", "Understand the Algorithm"],
};

export function TitleLabCard({ patterns, videos, channelTitle }: TitleLabCardProps) {
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // AI Hook Breakdown State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<{
    hookAnalysis: string;
    titleIdeas: string[];
  } | null>(null);
  const [aiCopiedIndex, setAiCopiedIndex] = useState<number | null>(null);

  // Active pattern selected for sandbox
  const activePattern = useMemo(() => {
    return patterns.find((p) => p.id === selectedPatternId) ?? patterns[0] ?? null;
  }, [patterns, selectedPatternId]);

  // Form variable values state
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  // When opening sandbox for a pattern, seed with default values
  function openPatternSandbox(pattern: TitlePattern) {
    setSelectedPatternId(pattern.id);
    const defaults = pattern.defaultValues ?? {};
    setVariableValues(defaults);
  }

  function handleVariableChange(variable: string, val: string) {
    setVariableValues((prev) => ({
      ...prev,
      [variable]: val,
    }));
  }

  // Generate title dynamically by replacing `[Var]` with `variableValues[Var]`
  const generatedTitle = useMemo(() => {
    if (!activePattern) return "";
    let title = activePattern.template;
    const vars = activePattern.variables ?? [];

    for (const v of vars) {
      const userVal = variableValues[v] ?? activePattern.defaultValues?.[v] ?? `[${v}]`;
      title = title.replace(new RegExp(`\\[${v}\\]`, "g"), userVal);
    }
    return title.replace(/\.\.\.$/, "");
  }, [activePattern, variableValues]);

  const charCount = generatedTitle.length;
  const isSweetSpot = charCount >= 45 && charCount <= 65;
  const isShort = charCount < 45;

  async function copyGeneratedTitle() {
    if (!generatedTitle) return;
    await navigator.clipboard.writeText(generatedTitle);
    setCopied(true);
    toast.success("Title copied to clipboard!", {
      description: `"${generatedTitle}" (${charCount} chars)`,
    });
    setTimeout(() => setCopied(false), 2000);
  }

  function resetToDefaults() {
    if (activePattern?.defaultValues) {
      setVariableValues(activePattern.defaultValues);
      toast.info("Reset variables to template defaults");
    }
  }

  // AI Hook Generation Trigger
  async function generateAiHooks() {
    setAiLoading(true);
    try {
      // Gather top breakout video titles
      const breakoutTitles = (videos ?? [])
        .filter((v) => v.vScore >= 1.5)
        .map((v) => v.title);

      const topTitles =
        breakoutTitles.length > 0
          ? breakoutTitles.slice(0, 5)
          : (videos ?? []).slice(0, 5).map((v) => v.title);

      const response = await fetch("/api/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topTitles,
          channelTopic: channelTitle ?? "Tech & Content Strategy",
        }),
      });

      const data = await response.json();
      if (!data.success && !data.hookAnalysis) {
        throw new Error("Failed to generate AI insights");
      }

      setAiInsights({
        hookAnalysis: data.hookAnalysis,
        titleIdeas: data.titleIdeas,
      });

      toast.success("AI Hook Breakdown Generated!", {
        description: "Gemini 1.5 Flash analyzed your top outlier video packaging.",
      });
    } catch (error) {
      toast.error("Failed to generate AI insights", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setAiLoading(false);
    }
  }

  async function copyAiTitle(title: string, index: number) {
    await navigator.clipboard.writeText(title);
    setAiCopiedIndex(index);
    toast.success("AI Title Copied!", { description: `"${title}"` });
    setTimeout(() => setAiCopiedIndex(null), 2000);
  }

  return (
    <>
      <GlassCard glow="violet">
        <div className="flex h-full flex-col p-5">
          {/* ── Header with live pattern count badge ── */}
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-violet-400" />
                <h2 className="text-base font-semibold text-white">
                  Title Lab &amp; Packaging Intelligence
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                NLP-extracted syntax templates &amp; AI virality engine.
              </p>
            </div>
            <Badge variant="violet" className="flex items-center gap-1 text-[10px]">
              <Sparkles className="h-3 w-3" />
              {patterns.length} Patterns Active
            </Badge>
          </div>

          {/* ── AI Hook Generator Action Bar ── */}
          <div className="mb-4">
            <Button
              onClick={generateAiHooks}
              disabled={aiLoading}
              className="w-full gap-2 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-semibold shadow-lg shadow-violet-900/30 hover:from-violet-500 hover:to-indigo-500 active:scale-95 disabled:opacity-75"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Deconstructing Hooks with Gemini 1.5 Flash...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span>✨ Generate AI Hook Breakdown</span>
                </>
              )}
            </Button>
          </div>

          {/* ── Neon Violet Pulsing Skeleton Loader ── */}
          <AnimatePresence>
            {aiLoading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-4 w-4 animate-pulse text-violet-400" />
                  <span className="text-xs font-semibold text-violet-200 animate-pulse">
                    Deconstructing Cognitive Triggers &amp; Synthesizing Outliers...
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="h-3.5 w-full rounded-full bg-violet-500/20 animate-pulse" />
                  <div className="h-3.5 w-4/5 rounded-full bg-violet-500/20 animate-pulse" />
                  <div className="h-3.5 w-3/5 rounded-full bg-violet-500/20 animate-pulse" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Render AI Insights Container if Generated ── */}
          <AnimatePresence>
            {aiInsights && !aiLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="mb-4 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-[#12141d]/90 to-purple-950/30 p-4 shadow-xl backdrop-blur-xl"
              >
                {/* 1. Psychological Hook Section */}
                <div className="mb-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Brain className="h-4 w-4 text-violet-400" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-violet-300">
                        AI Psychological Hook Analysis
                      </span>
                    </div>
                    <button
                      onClick={() => setAiInsights(null)}
                      className="text-slate-400 hover:text-white transition"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-200 bg-white/[0.03] border border-white/5 rounded-xl p-3">
                    {aiInsights.hookAnalysis}
                  </p>
                </div>

                {/* 2. AI Generated Title Ideas */}
                <div>
                  <div className="mb-2 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                      Gemini Optimized Title Ideas
                    </span>
                  </div>

                  <div className="space-y-2">
                    {aiInsights.titleIdeas.map((title, idx) => {
                      const len = title.length;
                      const inSweetSpot = len >= 45 && len <= 65;
                      const isItemCopied = aiCopiedIndex === idx;

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.04] p-2.5 transition hover:border-violet-500/40 hover:bg-white/[0.07]"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-white line-clamp-1">{title}</p>
                            <span
                              className={`text-[10px] font-mono ${
                                inSweetSpot ? "text-emerald-400 font-semibold" : "text-slate-400"
                              }`}
                            >
                              {len} chars {inSweetSpot ? "(Sweet Spot)" : ""}
                            </span>
                          </div>

                          <button
                            onClick={() => copyAiTitle(title, idx)}
                            className="flex items-center gap-1 rounded-lg bg-violet-500/15 px-2.5 py-1 text-[10px] font-semibold text-violet-300 transition hover:bg-violet-500/30 hover:text-white active:scale-95 flex-shrink-0"
                          >
                            {isItemCopied ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-400" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Pattern Cards List ── */}
          <div className="space-y-2.5">
            {patterns.slice(0, 3).map((pattern) => (
              <motion.div
                key={pattern.id}
                whileHover={{ y: -1 }}
                className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-3.5 transition-all hover:border-violet-500/30 hover:bg-white/[0.06]"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
                      {pattern.psychologicalTag ?? "High Virality"}
                    </span>
                    {pattern.hits > 0 && (
                      <span className="text-[10px] text-slate-400">
                        {pattern.hits} channel {pattern.hits === 1 ? "match" : "matches"}
                      </span>
                    )}
                  </div>
                  <Badge variant="emerald" className="text-[10px] font-bold">
                    +{pattern.multiplier.toFixed(1)}x V-Score
                  </Badge>
                </div>

                <p className="mb-3 text-xs font-medium leading-relaxed text-slate-200">
                  {pattern.template}
                </p>

                {/* Example from channel if available */}
                {pattern.examples && pattern.examples.length > 0 && (
                  <p className="mb-3 truncate text-[11px] italic text-slate-400">
                    &ldquo;{pattern.examples[0]}&rdquo;
                  </p>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className="text-[10px] text-slate-400 capitalize">
                    {pattern.category ?? "Syntax Hook"}
                  </span>
                  <button
                    onClick={() => openPatternSandbox(pattern)}
                    className="flex items-center gap-1 rounded-lg bg-violet-500/15 px-2.5 py-1 text-[11px] font-medium text-violet-300 transition hover:bg-violet-500/25 hover:text-white active:scale-95"
                  >
                    Try Pattern
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── View All / Open Sandbox Trigger ── */}
          <div className="mt-auto pt-4">
            <motion.div whileTap={{ scale: 0.97 }}>
              <Button
                variant="outline"
                className="w-full gap-2 text-xs border-violet-500/25 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20 hover:text-white"
                onClick={() => openPatternSandbox(patterns[0])}
              >
                <Wand2 className="h-3.5 w-3.5 text-violet-400" />
                Launch Interactive Title Sandbox
              </Button>
            </motion.div>
          </div>
        </div>
      </GlassCard>

      {/* ── Interactive Title Sandbox Modal / Drawer ── */}
      <AnimatePresence>
        {selectedPatternId && activePattern && (
          <>
            {/* Backdrop */}
            <motion.div
              key="sandbox-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPatternId(null)}
              className="fixed inset-0 z-40 bg-black/75 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              key="sandbox-modal"
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0e1018]/98 p-6 shadow-2xl backdrop-blur-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Decorative glow */}
                <div className="pointer-events-none absolute -top-24 left-1/3 h-52 w-52 rounded-full bg-violet-600/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 right-1/4 h-48 w-48 rounded-full bg-emerald-600/15 blur-3xl" />

                {/* ── Sandbox Header ── */}
                <div className="relative mb-5 flex items-start justify-between border-b border-white/8 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Wand2 className="h-4 w-4 text-violet-400" />
                      <h3 className="text-lg font-semibold text-white">
                        Title Intelligence &amp; Packaging Sandbox
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400">
                      Customize hook placeholders and optimize title packaging for maximum CTR.
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPatternId(null)}
                    className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:border-white/20 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* ── Pattern Selector Tabs ── */}
                <div className="mb-5 flex flex-wrap gap-1.5 rounded-2xl border border-white/8 bg-white/[0.02] p-1.5">
                  {patterns.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => openPatternSandbox(p)}
                      className={`rounded-xl px-2.5 py-1.5 text-[11px] font-medium transition ${
                        p.id === activePattern.id
                          ? "bg-violet-500/20 text-violet-200 border border-violet-500/30"
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                      }`}
                    >
                      {p.psychologicalTag ?? p.category}
                      <span className="ml-1.5 font-bold text-emerald-400">
                        +{p.multiplier.toFixed(1)}x
                      </span>
                    </button>
                  ))}
                </div>

                {/* ── Active Pattern Info Bar ── */}
                <div className="mb-5 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      Active Template
                    </span>
                    <Badge variant="emerald" className="gap-1 text-[11px]">
                      <Flame className="h-3 w-3 text-emerald-400" />
                      +{activePattern.multiplier.toFixed(1)}x Predicted Lift
                    </Badge>
                  </div>
                  <p className="text-sm font-semibold text-violet-200">{activePattern.template}</p>
                </div>

                {/* ── Variable Inputs ── */}
                <div className="mb-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Customize Placeholders
                    </h4>
                    <button
                      onClick={resetToDefaults}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-violet-300 transition"
                    >
                      <RotateCcw className="h-3 w-3" /> Reset
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {(activePattern.variables ?? []).map((v) => (
                      <div key={v} className="space-y-1.5">
                        <label className="text-[11px] font-medium text-slate-300">
                          [{v}]
                        </label>
                        <Input
                          value={variableValues[v] ?? activePattern.defaultValues?.[v] ?? ""}
                          onChange={(e) => handleVariableChange(v, e.target.value)}
                          placeholder={`Enter ${v.toLowerCase()}...`}
                          className="bg-white/5 border-white/10 text-xs focus:border-violet-500/50"
                        />

                        {/* Quick suggestions chips */}
                        {QUICK_SUGGESTIONS[v] && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {QUICK_SUGGESTIONS[v].slice(0, 3).map((sugg) => (
                              <button
                                key={sugg}
                                onClick={() => handleVariableChange(v, sugg)}
                                className="rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] text-slate-400 hover:bg-violet-500/20 hover:text-violet-200 transition"
                              >
                                + {sugg}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Live Title Preview & Validation ── */}
                <div className="mb-6 rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-500/10 via-purple-900/10 to-transparent p-5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-violet-300 font-semibold flex items-center gap-1.5">
                      <Zap className="h-3 w-3 text-amber-400" />
                      Live Title Preview
                    </span>
                    <span className="text-xs font-mono text-slate-400">{charCount} characters</span>
                  </div>

                  {/* Generated Title Display */}
                  <div className="rounded-xl border border-white/10 bg-[#12141d]/90 p-4 shadow-inner mb-3">
                    <p className="text-base font-bold text-white leading-snug break-words">
                      {generatedTitle || "Enter values above to construct your title..."}
                    </p>
                  </div>

                  {/* Character Length Validation Meter */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Optimal Range: 45–65 chars</span>
                      {isSweetSpot ? (
                        <span className="font-semibold text-emerald-300 flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" /> Optimal Sweet Spot (+2.4x Views)
                        </span>
                      ) : isShort ? (
                        <span className="text-amber-400 flex items-center gap-1">
                          <Info className="h-3.5 w-3.5" /> Short (expand context)
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1">
                          <Info className="h-3.5 w-3.5" /> Truncation Risk on Mobile
                        </span>
                      )}
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className={`h-full rounded-full transition-colors ${
                          isSweetSpot
                            ? "bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_10px_#10b981]"
                            : isShort
                              ? "bg-amber-400"
                              : "bg-rose-400"
                        }`}
                        style={{ width: `${Math.min(100, (charCount / 80) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* ── Actions: Copy Title ── */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={copyGeneratedTitle}
                    disabled={!generatedTitle}
                    className="flex-1 gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg hover:from-violet-500 hover:to-purple-500 active:scale-95"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-300" />
                        Copied to Clipboard!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Optimized Title
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPatternId(null)}
                    className="border-white/10 hover:bg-white/5"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
