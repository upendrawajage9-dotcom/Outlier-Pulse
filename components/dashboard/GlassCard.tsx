"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  glow?: "violet" | "crimson" | "emerald" | "none";
}

export function GlassCard({
  children,
  className,
  contentClassName,
  glow = "violet",
}: GlassCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [7, -7]), {
    stiffness: 180,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-9, 9]), {
    stiffness: 180,
    damping: 18,
  });
  const glareX = useSpring(useTransform(x, [-0.5, 0.5], [0, 100]), {
    stiffness: 120,
    damping: 20,
  });
  const glareY = useSpring(useTransform(y, [-0.5, 0.5], [0, 100]), {
    stiffness: 120,
    damping: 20,
  });
  const glare = useMotionTemplate`radial-gradient(420px circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.08), transparent 42%)`;

  function onMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={cn("relative h-full", className)}
    >
      <div
        className={cn(
          "glass-card relative h-full overflow-hidden rounded-2xl",
          glow === "violet" && "hover:border-violet-500/40",
          glow === "crimson" && "hover:border-rose-500/40",
          glow === "emerald" && "hover:border-emerald-500/40",
          contentClassName,
        )}
      >
        <motion.div className="pointer-events-none absolute inset-0" style={{ background: glare }} />
        <div className="relative h-full" style={{ transform: "translateZ(24px)" }}>
          {children}
        </div>
      </div>
    </motion.div>
  );
}
