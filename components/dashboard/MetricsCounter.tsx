"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";
import { GlassCard } from "@/components/dashboard/GlassCard";

function SpringNumber({
  value,
  decimals = 0,
  suffix = "",
}: {
  value: number;
  decimals?: number;
  suffix?: string;
}) {
  const motionValue = useMotionValue(0);
  const display = useTransform(motionValue, (latest) => `${latest.toFixed(decimals)}${suffix}`);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      type: "spring",
      stiffness: 70,
      damping: 18,
      mass: 0.8,
    });
    return controls.stop;
  }, [motionValue, value]);

  return <motion.span>{display}</motion.span>;
}

interface MetricsCounterProps {
  multiplier: number;
  alpha: number;
  confidence: number;
}

export function MetricsCounter({ multiplier, alpha, confidence }: MetricsCounterProps) {
  return (
    <GlassCard glow="crimson">
      <div className="flex h-full flex-col p-5">
        <p className="text-sm text-slate-400">Live Metrics Counter</p>
        <p className="mt-3 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-rose-400 bg-clip-text text-5xl font-bold tracking-tight text-transparent">
          <SpringNumber value={multiplier} decimals={1} suffix="x" />
        </p>
        <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">
          Viral Multiplier Score (V-Score)
        </p>

        <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
            <p className="text-[11px] text-slate-500">Alpha Score</p>
            <p className="text-lg font-semibold text-slate-100">
              <SpringNumber value={alpha} />
              <span className="text-slate-500">/100</span>
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: `${alpha}%` }}
                transition={{ type: "spring", stiffness: 80, damping: 18 }}
              />
            </div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
            <p className="text-[11px] text-slate-500">Precision Confidence</p>
            <p className="text-lg font-semibold text-emerald-300">
              <SpringNumber value={confidence} suffix="%" />
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
