"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  Cell,
} from "recharts";
import { Clock, Flame, Layers, CheckCircle2 } from "lucide-react";
import { api, Dashboard } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { DashboardSkeleton } from "@/components/skeletons";

const SUBJECT_COLORS = ["#7c5cff", "#ffb86b", "#5eead4", "#ff7eb6", "#9d86ff", "#fbbf24"];

function fmtHours(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

function Heatmap({ data }: { data: { date: string; minutes: number }[] }) {
  // Build last ~13 weeks grid
  const map = new Map(data.map((d) => [d.date, d.minutes]));
  const days: { date: string; minutes: number }[] = [];
  const today = new Date();
  for (let i = 90; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    days.push({ date: iso, minutes: map.get(iso) ?? 0 });
  }
  const level = (m: number) =>
    m === 0 ? "bg-white/5" : m < 25 ? "bg-violet/30" : m < 60 ? "bg-violet/55" : m < 120 ? "bg-violet/80" : "bg-amber";

  return (
    <div className="flex flex-wrap gap-1.5">
      {days.map((d) => (
        <div
          key={d.date}
          title={`${d.date}: ${fmtHours(d.minutes)}`}
          className={`h-3.5 w-3.5 rounded-[4px] ${level(d.minutes)} transition hover:scale-125`}
        />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    api.get<Dashboard>("/api/dashboard").then(setData).catch(() => {});
  }, []);

  if (!data) {
    return <DashboardSkeleton />;
  }

  const stats = [
    { label: "Total focus", value: fmtHours(data.totalMinutes), icon: Clock, color: "text-violet-soft" },
    { label: "Today", value: fmtHours(data.todayMinutes), icon: Flame, color: "text-amber" },
    { label: "Cards due", value: data.dueCards, icon: Layers, color: "text-mint" },
    { label: "Open tasks", value: data.openTasks, icon: CheckCircle2, color: "text-rose" },
  ];

  const chartData = data.timeBySubject.map((s) => ({ name: s.subject, minutes: s.minutes }));

  return (
    <div className="mx-auto max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm text-white/40">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
        <h1 className="font-display text-4xl font-semibold">
          Hey {user?.displayName.split(" ")[0]}
        </h1>
        <p className="mt-1 text-white/50">Here's how your studying is going.</p>
      </motion.div>

      {/* Stat cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card p-5"
          >
            <s.icon className={`mb-3 ${s.color}`} size={22} />
            <div className="font-display text-3xl font-semibold tabular-nums">{s.value}</div>
            <div className="mt-1 text-xs uppercase tracking-wider text-white/40">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Time by subject */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
          <h2 className="mb-4 font-display text-xl font-semibold">Time by subject</h2>
          {chartData.length === 0 ? (
            <Empty text="Log a focus session to see your subjects here." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  contentStyle={{ background: "#13141f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                  formatter={(v: number) => [fmtHours(v), "Focus"]}
                />
                <Bar dataKey="minutes" radius={[8, 8, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={SUBJECT_COLORS[i % SUBJECT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Heatmap */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="card p-6">
          <h2 className="mb-4 font-display text-xl font-semibold">Last 90 days</h2>
          <Heatmap data={data.heatmap} />
          <div className="mt-5 flex items-center gap-2 text-xs text-white/40">
            Less
            <span className="h-3 w-3 rounded bg-white/5" />
            <span className="h-3 w-3 rounded bg-violet/30" />
            <span className="h-3 w-3 rounded bg-violet/55" />
            <span className="h-3 w-3 rounded bg-violet/80" />
            <span className="h-3 w-3 rounded bg-amber" />
            More
          </div>
          <div className="mt-6 flex items-center gap-4 text-sm">
            <span className="chip">🔥 {data.user.currentStreak}-day streak</span>
            <span className="chip">🏅 Longest {data.user.longestStreak}</span>
            <span className="chip">📈 {data.sessionsCount} sessions</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="grid h-[200px] place-items-center text-center text-sm text-white/40">
      {text}
    </div>
  );
}
