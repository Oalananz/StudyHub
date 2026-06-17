"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Timer,
  KanbanSquare,
  Layers,
  NotebookPen,
  Trophy,
  LogOut,
  Flame,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import Logo from "@/components/Logo";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/timer", label: "Focus timer", icon: Timer },
  { href: "/dashboard/tasks", label: "Task board", icon: KanbanSquare },
  { href: "/dashboard/flashcards", label: "Flashcards", icon: Layers },
  { href: "/dashboard/notes", label: "Notes", icon: NotebookPen },
  { href: "/dashboard/achievements", label: "Achievements", icon: Trophy },
];

// Static export uses trailing slashes (e.g. "/dashboard/timer/"), so normalise before comparing.
const stripSlash = (p: string) => (p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p);

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const current = stripSlash(pathname);

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/5 bg-ink-800/40 px-4 py-6 backdrop-blur-xl md:flex">
      <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2 font-display text-xl font-semibold">
        <Logo className="h-9 w-9" />
        Study Hub
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {links.map((l) => {
          const active = current === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition ${
                active ? "text-white" : "text-white/55 hover:bg-white/5 hover:text-white"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 -z-10 rounded-2xl bg-violet/15 ring-1 ring-violet/30"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <l.icon size={18} className={active ? "text-violet-soft" : ""} />
              {l.label}
            </Link>
          );
        })}
      </nav>

      {/* Streak + XP */}
      <div className="card mb-3 p-4">
        <div className="flex items-center gap-2 text-sm">
          <Flame size={18} className="text-amber" />
          <span className="font-semibold">{user?.currentStreak ?? 0}-day streak</span>
        </div>
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs text-white/40">
            <span>{user?.xp ?? 0} XP</span>
            <span>Lvl {Math.floor((user?.xp ?? 0) / 500) + 1}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet to-amber"
              style={{ width: `${((user?.xp ?? 0) % 500) / 5}%` }}
            />
          </div>
        </div>
      </div>

      <button
        onClick={logout}
        className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-white/55 transition hover:bg-white/5 hover:text-rose"
      >
        <LogOut size={18} /> Log out
      </button>
    </aside>
  );
}
