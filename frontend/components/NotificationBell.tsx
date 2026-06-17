"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellRing, Check, X, Layers, CheckCircle2, Flame, Trophy } from "lucide-react";
import { api, Dashboard, Task, Achievement } from "@/lib/api";
import {
  notificationPermission,
  requestNotificationPermission,
} from "@/lib/browserNotify";

interface Notice {
  id: string;
  icon: typeof Bell;
  color: string;
  title: string;
  body: string;
  href: string;
}

const DISMISS_KEY = "studyhub_dismissed_notices";

function loadDismissed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(DISMISS_KEY) || "[]");
  } catch {
    return [];
  }
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/** Builds the notification feed from current study state. */
function buildNotices(dash: Dashboard, tasks: Task[], achievements: Achievement[]): Notice[] {
  const list: Notice[] = [];
  const today = todayIso();

  if (dash.dueCards > 0) {
    list.push({
      id: `cards-${today}`,
      icon: Layers,
      color: "text-mint",
      title: `${dash.dueCards} flashcard${dash.dueCards > 1 ? "s" : ""} due`,
      body: "Review them now to keep them in long-term memory.",
      href: "/dashboard/flashcards",
    });
  }

  const overdue = tasks.filter((t) => t.status !== 2 && t.dueDate && t.dueDate < today);
  if (overdue.length) {
    list.push({
      id: `overdue-${today}`,
      icon: CheckCircle2,
      color: "text-rose",
      title: `${overdue.length} task${overdue.length > 1 ? "s" : ""} overdue`,
      body: overdue.slice(0, 2).map((t) => t.title).join(", ") + (overdue.length > 2 ? "…" : ""),
      href: "/dashboard/tasks",
    });
  }

  const dueToday = tasks.filter((t) => t.status !== 2 && t.dueDate === today);
  if (dueToday.length) {
    list.push({
      id: `duetoday-${today}`,
      icon: CheckCircle2,
      color: "text-amber",
      title: `${dueToday.length} task${dueToday.length > 1 ? "s" : ""} due today`,
      body: dueToday.slice(0, 2).map((t) => t.title).join(", ") + (dueToday.length > 2 ? "…" : ""),
      href: "/dashboard/tasks",
    });
  }

  // Streak reminder if nothing studied yet today.
  if (dash.todayMinutes === 0) {
    list.push({
      id: `streak-${today}`,
      icon: Flame,
      color: "text-amber",
      title: dash.user.currentStreak > 0 ? `Keep your ${dash.user.currentStreak}-day streak alive` : "Start a study streak today",
      body: "A short focus session today keeps the flame going.",
      href: "/dashboard/timer",
    });
  }

  // Achievements unlocked in the last 24h.
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  achievements
    .filter((a) => a.unlocked && a.unlockedAt && new Date(a.unlockedAt).getTime() > dayAgo)
    .forEach((a) =>
      list.push({
        id: `ach-${a.code}`,
        icon: Trophy,
        color: "text-violet-soft",
        title: `${a.icon} Unlocked: ${a.title}`,
        body: `${a.description} (+${a.xpReward} XP)`,
        href: "/dashboard/achievements",
      })
    );

  return list;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">("default");

  const refresh = useCallback(async () => {
    try {
      const [dash, tasks, achievements] = await Promise.all([
        api.get<Dashboard>("/api/dashboard"),
        api.get<Task[]>("/api/tasks"),
        api.get<Achievement[]>("/api/dashboard/achievements"),
      ]);
      setNotices(buildNotices(dash, tasks, achievements));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    setDismissed(loadDismissed());
    setPerm(notificationPermission());
    refresh();
    const interval = setInterval(refresh, 60_000); // refresh every minute
    return () => clearInterval(interval);
  }, [refresh]);

  const visible = notices.filter((n) => !dismissed.includes(n.id));

  function dismiss(id: string) {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem(DISMISS_KEY, JSON.stringify(next));
  }

  function dismissAll() {
    const next = Array.from(new Set([...dismissed, ...notices.map((n) => n.id)]));
    setDismissed(next);
    localStorage.setItem(DISMISS_KEY, JSON.stringify(next));
  }

  async function enableBrowser() {
    const p = await requestNotificationPermission();
    setPerm(p);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-ink-800/60 text-white/70 transition hover:bg-white/5 hover:text-white"
        aria-label="Notifications"
      >
        {visible.length ? <BellRing size={19} /> : <Bell size={19} />}
        {visible.length > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-rose px-1 text-[11px] font-semibold text-white"
          >
            {visible.length}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* click-away backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              className="card absolute right-0 z-50 mt-2 w-80 overflow-hidden p-0"
            >
              <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                <h3 className="font-display text-lg font-semibold">Notifications</h3>
                {visible.length > 0 && (
                  <button onClick={dismissAll} className="text-xs text-white/40 hover:text-white">
                    Clear all
                  </button>
                )}
              </div>

              {/* Browser notification opt-in */}
              {perm === "default" && (
                <button
                  onClick={enableBrowser}
                  className="flex w-full items-center gap-2 border-b border-white/5 bg-violet/10 px-4 py-2.5 text-left text-xs text-violet-soft hover:bg-violet/20"
                >
                  <BellRing size={14} /> Enable desktop alerts for finished timers
                </button>
              )}

              <div className="max-h-[60vh] overflow-y-auto">
                <AnimatePresence initial={false}>
                  {visible.map((n) => (
                    <motion.div
                      layout
                      key={n.id}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12, height: 0 }}
                      className="group flex gap-3 border-b border-white/5 px-4 py-3 last:border-0 hover:bg-white/[0.03]"
                    >
                      <n.icon size={18} className={`mt-0.5 shrink-0 ${n.color}`} />
                      <Link href={n.href} onClick={() => setOpen(false)} className="flex-1">
                        <p className="text-sm font-medium leading-snug">{n.title}</p>
                        <p className="mt-0.5 text-xs text-white/45">{n.body}</p>
                      </Link>
                      <button
                        onClick={() => dismiss(n.id)}
                        className="self-start text-white/20 opacity-0 transition group-hover:opacity-100 hover:text-white"
                        aria-label="Dismiss"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {visible.length === 0 && (
                  <div className="grid place-items-center gap-2 px-4 py-10 text-center text-sm text-white/40">
                    <Check size={22} className="text-mint" />
                    You&apos;re all caught up!
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
