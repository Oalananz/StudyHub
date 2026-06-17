"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  Timer,
  Layers,
  KanbanSquare,
  NotebookPen,
  Flame,
  BarChart3,
  Trophy,
  ArrowRight,
} from "lucide-react";
import AuroraBackground from "@/components/AuroraBackground";
import Logo from "@/components/Logo";
import Tilt3D from "@/components/Tilt3D";
import { useAuth } from "@/lib/auth";

// 3D scene is client-only (WebGL canvas) so it never runs during static prerender.
const KnowledgeOrb = dynamic(() => import("@/components/three/KnowledgeOrb"), {
  ssr: false,
  loading: () => null,
});

const features = [
  { icon: Timer, title: "Pomodoro & logs", text: "A focus timer that logs every minute you study, automatically.", color: "text-violet-soft" },
  { icon: Layers, title: "Smart flashcards", text: "Spaced repetition (SM-2) resurfaces cards right before you forget.", color: "text-mint" },
  { icon: KanbanSquare, title: "Task board", text: "Drag assignments across To-do, Doing and Done.", color: "text-amber" },
  { icon: NotebookPen, title: "Nested notes", text: "Organise subjects and chapters like a personal wiki.", color: "text-rose" },
  { icon: Flame, title: "Streaks & XP", text: "Keep the flame alive and earn XP for deep work.", color: "text-amber" },
  { icon: BarChart3, title: "Analytics", text: "See where your hours go with subject charts and a heatmap.", color: "text-violet-soft" },
  { icon: Trophy, title: "Achievements", text: "Unlock badges for milestones and stay motivated.", color: "text-rose" },
];

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Home() {
  const { user } = useAuth();
  const cta = user ? "/dashboard" : "/register";

  return (
    <main className="relative z-10">
      <AuroraBackground />

      {/* Nav */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold">
          <Logo className="h-9 w-9" />
          Study Hub
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard" className="btn-primary text-sm">
              Open app <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-ghost text-sm">Log in</Link>
              <Link href="/register" className="btn-primary text-sm">Get started</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pb-20 pt-12 text-center md:pt-20">
        {/* 3D knowledge orb — ambient backdrop centered behind the headline (decorative) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[-40px] z-0 mx-auto h-[560px] w-[820px] max-w-[125%] opacity-50 md:opacity-[0.62]"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, delay: 0.2 }}
            className="h-full w-full"
          >
            <KnowledgeOrb />
          </motion.div>
        </div>

        <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/60"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-mint" />
          Your cozy corner for deep work
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl"
        >
          Study deeper.<br />
          <span className="text-gradient italic">Remember longer.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mx-auto mt-6 max-w-xl text-lg text-white/60"
        >
          One calm workspace for focus timers, spaced-repetition flashcards, tasks,
          notes and progress — all wrapped in a quiet, late-night study aesthetic.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-9 flex items-center justify-center gap-4"
        >
          <Link href={cta} className="btn-primary text-base">
            Start studying free <ArrowRight size={18} />
          </Link>
          <Link href="/login" className="btn-ghost text-base">I have an account</Link>
        </motion.div>

        </div>

        {/* Floating timer mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative z-10 mx-auto mt-16 max-w-sm"
        >
          <div className="animate-float card p-8">
            <div className="text-xs uppercase tracking-widest text-white/40">Focus session</div>
            <div className="my-4 font-display text-7xl font-semibold tabular-nums text-gradient">
              24:13
            </div>
            <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-violet to-amber" />
            </div>
            <div className="flex justify-center gap-2 text-xs">
              <span className="chip">🔥 7-day streak</span>
              <span className="chip">📐 Calculus</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-28">
        <h2 className="mb-3 text-center font-display text-3xl font-semibold md:text-4xl">
          Everything in one quiet place
        </h2>
        <p className="mx-auto mb-12 max-w-lg text-center text-white/50">
          No tab-juggling. Focus, review, plan and track — without leaving the room.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fade}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              custom={i}
            >
              <Tilt3D max={12} className="h-full">
                <div className="card group h-full p-6 transition-shadow hover:shadow-glow">
                  <f.icon className={`mb-4 ${f.color}`} size={28} style={{ transform: "translateZ(40px)" }} />
                  <h3 className="mb-1.5 font-display text-lg font-semibold" style={{ transform: "translateZ(24px)" }}>
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/50">{f.text}</p>
                </div>
              </Tilt3D>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-28">
        <div className="card relative overflow-hidden p-12 text-center">
          <h2 className="relative font-display text-3xl font-semibold md:text-5xl">
            Ready to get in the zone?
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-white/60">
            Create a free account and start your first focus session in under a minute.
          </p>
          <Link href={cta} className="btn-primary relative mt-8 text-base">
            Build your study hub <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-sm text-white/30">
        <p>Made for late-night learners · Study Hub</p>
        <p className="mt-1">
          © {new Date().getFullYear()} Study Hub — owned &amp; built by{" "}
          <span className="font-medium text-white/60">Oalananz</span>
        </p>
      </footer>
    </main>
  );
}
