"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Settings, Coffee, Brain, SkipForward } from "lucide-react";
import { api, User } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { requestNotificationPermission, sendBrowserNotification } from "@/lib/browserNotify";

type Phase = "work" | "short" | "long";

export default function TimerPage() {
  const { user, setUser } = useAuth();
  const [phase, setPhase] = useState<Phase>("work");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [round, setRound] = useState(1);
  const [subject, setSubject] = useState("General");
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const durations = {
    work: (user?.pomodoroWorkMinutes ?? 25) * 60,
    short: (user?.pomodoroShortBreakMinutes ?? 5) * 60,
    long: (user?.pomodoroLongBreakMinutes ?? 15) * 60,
  };
  const roundsBeforeLong = user?.pomodoroRoundsBeforeLongBreak ?? 4;

  // Reset timer when phase or settings change (and not running)
  useEffect(() => {
    if (!running) setSecondsLeft(durations[phase]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, user?.pomodoroWorkMinutes, user?.pomodoroShortBreakMinutes, user?.pomodoroLongBreakMinutes]);

  const logSession = useCallback(
    async (minutes: number) => {
      try {
        const res = await api.post<{ user: User; unlocked: { title: string; icon: string }[] }>(
          "/api/sessions",
          { subject, durationMinutes: minutes }
        );
        setUser(res.user);
        if (res.unlocked.length) {
          setToast(`${res.unlocked[0].icon} Unlocked: ${res.unlocked[0].title}!`);
        } else {
          setToast(`✅ Logged ${minutes} min of ${subject}`);
        }
        setTimeout(() => setToast(null), 4000);
      } catch {
        /* ignore */
      }
    },
    [subject, setUser]
  );

  const advancePhase = useCallback(() => {
    if (phase === "work") {
      logSession(user?.pomodoroWorkMinutes ?? 25);
      const long = round % roundsBeforeLong === 0;
      setPhase(long ? "long" : "short");
      sendBrowserNotification(
        "🎉 Focus session complete!",
        `Nice work on ${subject}. Time for a ${long ? "long" : "short"} break.`
      );
    } else {
      setRound((r) => r + 1);
      setPhase("work");
      sendBrowserNotification("⏰ Break's over", "Back to focus — you've got this.");
    }
    setRunning(false);
    // play a soft chime
    try {
      const ctx = new AudioContext();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 660;
      g.gain.setValueAtTime(0.2, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
      o.connect(g).connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 1);
    } catch {
      /* ignore */
    }
  }, [phase, round, roundsBeforeLong, logSession, user, subject]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            advancePhase();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, advancePhase]);

  const total = durations[phase];
  const progress = 1 - secondsLeft / total;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  const phaseMeta = {
    work: { label: "Focus", icon: Brain, color: "#7c5cff", grad: "from-violet to-amber" },
    short: { label: "Short break", icon: Coffee, color: "#5eead4", grad: "from-mint to-violet" },
    long: { label: "Long break", icon: Coffee, color: "#ffb86b", grad: "from-amber to-rose" },
  }[phase];

  const R = 130;
  const C = 2 * Math.PI * R;

  function reset() {
    setRunning(false);
    setSecondsLeft(durations[phase]);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold">Focus timer</h1>
          <p className="mt-1 text-white/50">Round {round} · {phaseMeta.label}</p>
        </div>
        <button onClick={() => setShowSettings((s) => !s)} className="btn-ghost">
          <Settings size={18} />
        </button>
      </div>

      <AnimatePresence>
        {showSettings && (
          <PomodoroSettings onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>

      {/* Subject */}
      <div className="mb-8">
        <label className="label">What are you studying?</label>
        <input
          className="input max-w-xs"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Organic Chemistry"
        />
      </div>

      {/* Phase tabs */}
      <div className="mb-8 flex gap-2">
        {(["work", "short", "long"] as Phase[]).map((p) => (
          <button
            key={p}
            onClick={() => { setRunning(false); setPhase(p); }}
            className={`rounded-full px-4 py-2 text-sm transition ${
              phase === p ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
            }`}
          >
            {p === "work" ? "Focus" : p === "short" ? "Short break" : "Long break"}
          </button>
        ))}
      </div>

      {/* Circular timer */}
      <div className="relative mx-auto grid place-items-center">
        <svg width={300} height={300} className="-rotate-90">
          <circle cx={150} cy={150} r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={14} />
          <motion.circle
            cx={150}
            cy={150}
            r={R}
            fill="none"
            stroke={phaseMeta.color}
            strokeWidth={14}
            strokeLinecap="round"
            strokeDasharray={C}
            animate={{ strokeDashoffset: C * (1 - progress) }}
            transition={{ ease: "linear", duration: 0.4 }}
            style={{ filter: `drop-shadow(0 0 12px ${phaseMeta.color})` }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <phaseMeta.icon size={26} style={{ color: phaseMeta.color }} className="mb-2" />
          <div className="font-display text-7xl font-semibold tabular-nums">
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </div>
          <div className="mt-1 text-xs uppercase tracking-widest text-white/40">{phaseMeta.label}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-10 flex items-center justify-center gap-4">
        <button onClick={reset} className="btn-ghost h-12 w-12 !p-0">
          <RotateCcw size={20} />
        </button>
        <button
          onClick={() => {
            if (!running) requestNotificationPermission();
            setRunning((r) => !r);
          }}
          className={`grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br ${phaseMeta.grad} text-white shadow-glow transition active:scale-95`}
        >
          {running ? <Pause size={30} /> : <Play size={30} className="ml-1" />}
        </button>
        <button onClick={advancePhase} className="btn-ghost h-12 w-12 !p-0" title="Skip phase">
          <SkipForward size={20} />
        </button>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full border border-violet/40 bg-ink-700 px-6 py-3 text-sm shadow-glow"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PomodoroSettings({ onClose }: { onClose: () => void }) {
  const { user, setUser } = useAuth();
  const [work, setWork] = useState(user?.pomodoroWorkMinutes ?? 25);
  const [short, setShort] = useState(user?.pomodoroShortBreakMinutes ?? 5);
  const [long, setLong] = useState(user?.pomodoroLongBreakMinutes ?? 15);
  const [rounds, setRounds] = useState(user?.pomodoroRoundsBeforeLongBreak ?? 4);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const updated = await api.put<User>("/api/auth/preferences", {
        pomodoroWorkMinutes: work,
        pomodoroShortBreakMinutes: short,
        pomodoroLongBreakMinutes: long,
        pomodoroRoundsBeforeLongBreak: rounds,
      });
      setUser(updated);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const fields = [
    { label: "Focus (min)", value: work, set: setWork, max: 120 },
    { label: "Short break", value: short, set: setShort, max: 60 },
    { label: "Long break", value: long, set: setLong, max: 60 },
    { label: "Rounds → long", value: rounds, set: setRounds, max: 12 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="card mb-8 overflow-hidden p-6"
    >
      <h3 className="mb-4 font-display text-lg font-semibold">Timer settings</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {fields.map((f) => (
          <div key={f.label}>
            <label className="label">{f.label}</label>
            <input
              type="number"
              min={1}
              max={f.max}
              value={f.value}
              onChange={(e) => f.set(Math.max(1, parseInt(e.target.value) || 1))}
              className="input"
            />
          </div>
        ))}
      </div>
      <div className="mt-5 flex gap-3">
        <button onClick={save} className="btn-primary" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
        <button onClick={onClose} className="btn-ghost">Cancel</button>
      </div>
    </motion.div>
  );
}
