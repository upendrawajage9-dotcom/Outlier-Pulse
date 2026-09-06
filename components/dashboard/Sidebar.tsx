"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Beaker,
  LayoutDashboard,
  Network,
  Settings,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { NavId } from "@/lib/types";
import { cn } from "@/lib/utils";

const NAV: Array<{ id: NavId; label: string; icon: typeof LayoutDashboard }> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "simulations", label: "Simulations", icon: Activity },
  { id: "trends", label: "Outlier Trends", icon: TrendingUp },
  { id: "title-lab", label: "Title Lab", icon: Beaker },
  { id: "network", label: "Creator Network", icon: Network },
  { id: "settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  active: NavId;
  onChange: (id: NavId) => void;
}

export function Sidebar({ active, onChange }: SidebarProps) {
  return (
    <aside className="glass-card flex h-full w-[248px] shrink-0 flex-col rounded-[28px] p-5">
      <div className="mb-8 flex items-center gap-3">
        <div className="relative grid h-11 w-11 place-items-center rounded-2xl border border-violet-500/30 bg-violet-500/10">
          <Sparkles className="h-5 w-5 text-violet-400" />
          <svg className="absolute inset-x-1 bottom-1 h-4 w-auto text-violet-400" viewBox="0 0 40 12">
            <motion.path
              d="M1 8 C 8 2, 12 10, 20 6 S 32 2, 39 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              initial={{ pathLength: 0.2, opacity: 0.4 }}
              animate={{ pathLength: [0.2, 1, 0.2], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight text-slate-50">OutlierPulse</p>
          <p className="text-[11px] text-slate-500">YouTube intelligence</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={cn(
                "flex items-center gap-3 rounded-full px-3.5 py-2.5 text-sm transition-all",
                isActive
                  ? "bg-violet-500/15 text-white shadow-[0_0_24px_rgba(139,92,246,0.25)]"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-100",
              )}
            >
              <Icon className={cn("h-4 w-4", isActive && "text-violet-300")} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <Badge variant="emerald" className="mt-6 w-fit px-3 py-1">
        PRO / Alpha
      </Badge>
    </aside>
  );
}
