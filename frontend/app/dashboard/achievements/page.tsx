"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Lock } from "lucide-react";
import { api, Achievement } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function AchievementsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Achievement[] | null>(null);

  useEffect(() => {
    api.get<Achievement[]>("/api/dashboard/achievements").then(setItems);
  }, []);

  if (!items) {
    return <div className="grid h-[60vh] place-items-center"><Loader2 className="animate-spin text-violet" size={28} /></div>;
  }

  const unlocked = items.filter((a) => a.unlocked).length;
  const level = Math.floor((user?.xp ?? 0) / 500) + 1;
  const xpInLevel = (user?.xp ?? 0) % 500;

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-4xl font-semibold">Achievements</h1>
      <p className="mt-1 text-white/50">{unlocked} of {items.length} unlocked</p>

      {/* Level banner */}
      <div className="card mt-6 overflow-hidden p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-white/40">Current level</div>
            <div className="font-display text-4xl font-semibold text-gradient">Level {level}</div>
          </div>
          <div className="text-right">
            <div className="font-display text-3xl font-semibold">{user?.xp ?? 0}</div>
            <div className="text-xs uppercase tracking-widest text-white/40">total XP</div>
          </div>
        </div>
        <div className="mt-5">
          <div className="mb-1 flex justify-between text-xs text-white/40">
            <span>{xpInLevel} / 500 XP</span>
            <span>{500 - xpInLevel} to level {level + 1}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet to-amber"
              initial={{ width: 0 }}
              animate={{ width: `${(xpInLevel / 500) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Badges grid */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((a, i) => (
          <motion.div
            key={a.code}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className={`card relative overflow-hidden p-6 text-center ${a.unlocked ? "" : "opacity-60"}`}
          >
            {a.unlocked && (
              <div className="absolute inset-0 bg-gradient-to-br from-violet/10 to-amber/5" />
            )}
            <div className={`relative mb-3 text-5xl ${a.unlocked ? "" : "grayscale"}`}>
              {a.unlocked ? a.icon : <Lock className="mx-auto text-white/30" size={40} />}
            </div>
            <h3 className="relative font-display text-base font-semibold">{a.title}</h3>
            <p className="relative mt-1 text-xs text-white/50">{a.description}</p>
            <div className="relative mt-3">
              <span className={`chip ${a.unlocked ? "border-amber/40 text-amber" : ""}`}>+{a.xpReward} XP</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
