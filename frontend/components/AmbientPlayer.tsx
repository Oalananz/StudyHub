"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Play, Pause, Volume2, X } from "lucide-react";

type Scape = "rain" | "white" | "ocean" | "focus";

const scapes: { id: Scape; label: string; emoji: string }[] = [
  { id: "rain", label: "Rain", emoji: "🌧️" },
  { id: "ocean", label: "Ocean", emoji: "🌊" },
  { id: "white", label: "White noise", emoji: "📻" },
  { id: "focus", label: "Deep hum", emoji: "🧘" },
];

/**
 * Soundscapes synthesised live with the Web Audio API — no audio files needed,
 * so the whole player works fully offline.
 */
export default function AmbientPlayer() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Scape | null>(null);
  const [volume, setVolume] = useState(0.5);

  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);
  const gainRef = useRef<GainNode | null>(null);

  function stop() {
    nodesRef.current.forEach((n) => {
      try {
        // @ts-expect-error stop exists on source nodes
        n.stop?.();
        n.disconnect();
      } catch {
        /* ignore */
      }
    });
    nodesRef.current = [];
    setActive(null);
  }

  function noiseBuffer(ctx: AudioContext, type: "white" | "brown") {
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (type === "brown") {
        data[i] = (last + 0.02 * w) / 1.02;
        last = data[i];
        data[i] *= 3.5;
      } else {
        data[i] = w;
      }
    }
    return buf;
  }

  function play(scape: Scape) {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    const ctx = ctxRef.current;
    ctx.resume();
    stop();

    const master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
    gainRef.current = master;

    const src = ctx.createBufferSource();
    src.loop = true;

    if (scape === "white") {
      src.buffer = noiseBuffer(ctx, "white");
      src.connect(master);
      src.start();
      nodesRef.current = [src, master];
    } else if (scape === "rain") {
      src.buffer = noiseBuffer(ctx, "brown");
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 400;
      src.connect(hp).connect(master);
      src.start();
      nodesRef.current = [src, hp, master];
    } else if (scape === "ocean") {
      src.buffer = noiseBuffer(ctx, "brown");
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 600;
      // slow LFO swells the volume like waves
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.12;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.35;
      lfo.connect(lfoGain).connect(master.gain);
      src.connect(lp).connect(master);
      src.start();
      lfo.start();
      nodesRef.current = [src, lp, lfo, lfoGain, master];
    } else {
      // deep hum: two detuned low sines
      const o1 = ctx.createOscillator();
      o1.frequency.value = 110;
      const o2 = ctx.createOscillator();
      o2.type = "sine";
      o2.frequency.value = 110.5;
      const g = ctx.createGain();
      g.gain.value = 0.25;
      o1.connect(g);
      o2.connect(g);
      g.connect(master);
      o1.start();
      o2.start();
      nodesRef.current = [o1, o2, g, master];
    }

    setActive(scape);
  }

  useEffect(() => {
    if (gainRef.current) gainRef.current.gain.value = volume;
  }, [volume]);

  useEffect(() => () => stop(), []);

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full shadow-glow transition ${
          active ? "bg-mint text-ink animate-pulse" : "bg-violet text-white"
        }`}
        aria-label="Ambient sounds"
      >
        <Music size={22} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="card fixed bottom-24 right-6 z-40 w-72 p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">Soundscapes</h3>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {scapes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => (active === s.id ? stop() : play(s.id))}
                  className={`flex flex-col items-center gap-1 rounded-2xl border p-3 text-sm transition ${
                    active === s.id
                      ? "border-mint/50 bg-mint/10 text-mint"
                      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  <span className="text-2xl">{s.emoji}</span>
                  {s.label}
                </button>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-3">
              <Volume2 size={16} className="text-white/50" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-violet"
              />
            </div>

            <button
              onClick={() => (active ? stop() : play("rain"))}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/5 py-2 text-sm text-white/70 hover:bg-white/10"
            >
              {active ? <><Pause size={16} /> Stop</> : <><Play size={16} /> Quick play</>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
