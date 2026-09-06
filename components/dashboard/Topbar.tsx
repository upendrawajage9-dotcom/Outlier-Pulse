"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Check, Download, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import type { ChannelAnalysis } from "@/lib/types";

interface TopbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  apiLive: boolean;
  loading: boolean;
  analysis?: ChannelAnalysis | null;
}

/* ── Notification data ────────────────────────────────────────────────── */
const NOTIFICATIONS = [
  {
    id: "api",
    icon: "🟢",
    title: "YouTube Data API connected",
    body: "Quota cost: 2 units / query",
    time: "just now",
  },
  {
    id: "breakout",
    icon: "⚡",
    title: "Breakout video detected",
    body: "Active channel exceeded 5.0× baseline",
    time: "3 min ago",
  },
  {
    id: "quota",
    icon: "🛡️",
    title: "Quota shield active",
    body: "98% daily quota remaining",
    time: "10 min ago",
  },
] as const;

export function Topbar({
  query,
  onQueryChange,
  onSubmit,
  apiLive,
  loading,
  analysis,
}: TopbarProps) {
  const [unread, setUnread] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);

  function toggleNotif() {
    setNotifOpen((p) => !p);
  }

  function markRead() {
    setUnread(false);
    setNotifOpen(false);
  }

  function handleExportCSV() {
    if (!analysis || !analysis.videos || analysis.videos.length === 0) {
      toast.error("No channel data available to export", {
        description: "Search for a channel first before exporting.",
      });
      return;
    }

    const headers = [
      "Channel Title",
      "Channel Handle",
      "Video Title",
      "Views",
      "V-Score",
      "Outlier Flag",
      "Published Date",
      "Video ID",
      "Video URL",
    ];

    const rows = analysis.videos.map((v) => [
      `"${(analysis.channelTitle || "").replace(/"/g, '""')}"`,
      `"${(analysis.handle || "").replace(/"/g, '""')}"`,
      `"${(v.title || "").replace(/"/g, '""')}"`,
      v.views ?? 0,
      v.vScore ?? 1,
      `"${v.flag === "super" ? "Breakout (>3.0x)" : v.flag === "growth" ? "Outlier (>1.5x)" : "Standard Baseline"}"`,
      `"${v.publishedAt || ""}"`,
      `"${v.id || ""}"`,
      `"https://www.youtube.com/watch?v=${v.id || ""}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "outlierpulse_analytics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("CSV export downloaded", {
      description: `Saved ${analysis.videos.length} videos for ${analysis.channelTitle} as outlierpulse_analytics.csv`,
    });
  }

  return (
    <header className="flex items-center gap-3">
      {/* ── 1. Search form ─────────────────────────────────────────────── */}
      <form
        className="relative flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        {loading ? (
          <Loader2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-violet-400" />
        ) : (
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        )}

        <Input
          id="channel-search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Detect Outlier Trends… (URL / @handle / channel ID)"
          className="pl-11 pr-24"
          disabled={loading}
        />

        {/* Functional submit button — triggers form submit */}
        <button
          id="search-submit"
          type="submit"
          disabled={loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-400 transition-all cursor-pointer hover:bg-violet-500/20 hover:border-violet-500/50 hover:text-violet-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Syncing" : "Enter"}
        </button>
      </form>

      {/* ── 2. Export CSV Button ───────────────────────────────────────── */}
      <motion.button
        id="export-csv-btn"
        whileTap={{ scale: 0.95 }}
        onClick={handleExportCSV}
        disabled={loading || !analysis}
        title="Export channel metrics as CSV"
        className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-medium text-slate-200 backdrop-blur-sm transition-all hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Download className="h-3.5 w-3.5 text-violet-400" />
        <span className="hidden sm:inline">Export CSV</span>
      </motion.button>

      {/* ── 3. Dynamic status badge ────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {apiLive ? (
          <motion.div
            key="live"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            className="hidden md:flex items-center gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 backdrop-blur-sm"
          >
            <motion.span
              className="h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
            <div>
              <p className="text-[11px] font-semibold text-emerald-300">Live API Connected</p>
              <p className="text-[10px] text-emerald-500/70">Quota-optimised · 2 units</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="sandbox"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            className="hidden md:flex items-center gap-2 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 backdrop-blur-sm"
          >
            <motion.span
              className="h-2 w-2 flex-shrink-0 rounded-full bg-amber-400"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div>
              <p className="text-[11px] font-semibold text-amber-300">Sandbox Mode</p>
              <p className="text-[10px] text-amber-500/70">Mock data active</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 4. Notification Bell ───────────────────────────────────────── */}
      <div className="relative">
        <button
          id="notif-bell"
          onClick={toggleNotif}
          className="relative grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition-all hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-white"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unread && (
            <motion.span
              layoutId="notif-dot"
              className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_#ef4444]"
            />
          )}
        </button>

        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-[calc(100%+8px)] z-50 w-80 overflow-hidden rounded-2xl border border-white/10 bg-[#12141d]/98 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
                <p className="text-[12px] font-semibold text-slate-200">Notifications</p>
                <button
                  onClick={markRead}
                  className="flex items-center gap-1 text-[10px] text-violet-400 transition-colors hover:text-violet-300"
                >
                  <Check className="h-3 w-3" /> Mark all read
                </button>
              </div>

              <div className="divide-y divide-white/5">
                {NOTIFICATIONS.map((n, i) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex gap-3 px-4 py-3 hover:bg-white/[0.03] cursor-default"
                  >
                    <span className="mt-0.5 text-base leading-none">{n.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium text-slate-100">{n.title}</p>
                      <p className="text-[11px] text-slate-400">{n.body}</p>
                      <p className="mt-0.5 text-[10px] text-slate-600">{n.time}</p>
                    </div>
                    {i === 0 && unread && (
                      <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-violet-400" />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Click-outside dismiss */}
        {notifOpen && (
          <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
        )}
      </div>
    </header>
  );
}
