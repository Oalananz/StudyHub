"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Layers, Loader2, ArrowLeft, GraduationCap, Sparkles } from "lucide-react";
import { api, Deck, Card } from "@/lib/api";

const DECK_COLORS = ["#7c5cff", "#ffb86b", "#5eead4", "#ff7eb6", "#9d86ff", "#fbbf24"];

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Deck | null>(null);

  async function load() {
    const d = await api.get<Deck[]>("/api/decks");
    setDecks(d);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  if (loading) {
    return <div className="grid h-[60vh] place-items-center"><Loader2 className="animate-spin text-violet" size={28} /></div>;
  }

  if (active) {
    return <DeckView deck={active} onBack={() => { setActive(null); load(); }} />;
  }

  return <DeckGrid decks={decks} onOpen={setActive} onChange={load} />;
}

function DeckGrid({ decks, onOpen, onChange }: { decks: Deck[]; onOpen: (d: Deck) => void; onChange: () => void }) {
  const [name, setName] = useState("");
  const [showForm, setShowForm] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const color = DECK_COLORS[Math.floor(Math.random() * DECK_COLORS.length)];
    await api.post("/api/decks", { name, color });
    setName("");
    setShowForm(false);
    onChange();
  }

  async function remove(id: string) {
    await api.del(`/api/decks/${id}`);
    onChange();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold">Flashcards</h1>
          <p className="mt-1 text-white/50">Spaced repetition keeps knowledge from fading.</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary"><Plus size={18} /> New deck</button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={create}
            className="card mt-6 flex gap-3 overflow-hidden p-5"
          >
            <input className="input flex-1" placeholder="Deck name (e.g. Spanish Verbs)" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            <button className="btn-primary">Create</button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {decks.map((deck, i) => (
          <motion.div
            key={deck.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -5 }}
            className="card group relative cursor-pointer overflow-hidden p-6"
            onClick={() => onOpen(deck)}
          >
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-30 blur-2xl" style={{ background: deck.color }} />
            <Layers size={26} style={{ color: deck.color }} className="mb-4" />
            <h3 className="font-display text-xl font-semibold">{deck.name}</h3>
            <div className="mt-4 flex items-center gap-2">
              <span className="chip">{deck.cardCount} cards</span>
              {deck.dueCount > 0 && (
                <span className="chip border-amber/40 text-amber">{deck.dueCount} due</span>
              )}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); remove(deck.id); }}
              className="absolute right-4 top-4 text-white/20 opacity-0 transition group-hover:opacity-100 hover:text-rose"
            >
              <Trash2 size={16} />
            </button>
          </motion.div>
        ))}

        {decks.length === 0 && (
          <div className="card col-span-full grid place-items-center py-16 text-center text-white/40">
            <Sparkles size={28} className="mb-3 text-violet-soft" />
            Create your first deck to start building memory.
          </div>
        )}
      </div>
    </div>
  );
}

function DeckView({ deck, onBack }: { deck: Deck; onBack: () => void }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [studying, setStudying] = useState(false);

  async function load() {
    setCards(await api.get<Card[]>(`/api/decks/${deck.id}/cards`));
  }
  useEffect(() => { load(); }, []);

  const due = cards.filter((c) => new Date(c.dueAt) <= new Date());

  if (studying) {
    return <StudyMode deck={deck} onExit={() => { setStudying(false); load(); }} />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={onBack} className="btn-ghost mb-6"><ArrowLeft size={16} /> All decks</button>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold">{deck.name}</h1>
          <p className="mt-1 text-white/50">{cards.length} cards · {due.length} due now</p>
        </div>
        <button
          onClick={() => setStudying(true)}
          disabled={due.length === 0}
          className="btn-primary"
        >
          <GraduationCap size={18} /> Study {due.length > 0 ? `(${due.length})` : ""}
        </button>
      </div>

      <AddCardForm deckId={deck.id} onAdd={load} />

      <div className="mt-6 space-y-3">
        {cards.map((c) => (
          <div key={c.id} className="card group flex items-center justify-between p-4">
            <div className="flex-1">
              <p className="font-medium">{c.front}</p>
              <p className="mt-1 text-sm text-white/50">{c.back}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="chip">×{c.repetitions}</span>
              <button
                onClick={async () => { await api.del(`/api/decks/cards/${c.id}`); load(); }}
                className="text-white/20 opacity-0 transition group-hover:opacity-100 hover:text-rose"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {cards.length === 0 && (
          <p className="py-10 text-center text-sm text-white/40">No cards yet — add your first above.</p>
        )}
      </div>
    </div>
  );
}

function AddCardForm({ deckId, onAdd }: { deckId: string; onAdd: () => void }) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    await api.post(`/api/decks/${deckId}/cards`, { front, back });
    setFront("");
    setBack("");
    onAdd();
  }

  return (
    <form onSubmit={submit} className="card mt-6 grid gap-3 p-5 sm:grid-cols-2">
      <input className="input" placeholder="Front (question)" value={front} onChange={(e) => setFront(e.target.value)} />
      <input className="input" placeholder="Back (answer)" value={back} onChange={(e) => setBack(e.target.value)} />
      <button className="btn-primary sm:col-span-2"><Plus size={18} /> Add card</button>
    </form>
  );
}

function StudyMode({ deck, onExit }: { deck: Deck; onExit: () => void }) {
  const [queue, setQueue] = useState<Card[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Card[]>(`/api/decks/${deck.id}/due`).then((c) => { setQueue(c); setLoading(false); });
  }, [deck.id]);

  async function grade(quality: number) {
    const card = queue[idx];
    await api.post(`/api/decks/cards/${card.id}/review`, { quality });
    if (idx + 1 >= queue.length) {
      onExit();
    } else {
      setFlipped(false);
      setIdx((i) => i + 1);
    }
  }

  if (loading) return <div className="grid h-[60vh] place-items-center"><Loader2 className="animate-spin text-violet" size={28} /></div>;

  if (queue.length === 0) {
    return (
      <div className="mx-auto grid max-w-xl place-items-center py-20 text-center">
        <div className="mb-4 text-5xl">🎉</div>
        <h2 className="font-display text-2xl font-semibold">All caught up!</h2>
        <p className="mt-2 text-white/50">No cards due in this deck right now.</p>
        <button onClick={onExit} className="btn-primary mt-6">Back to deck</button>
      </div>
    );
  }

  const card = queue[idx];
  const grades = [
    { q: 0, label: "Again", color: "bg-rose/80" },
    { q: 3, label: "Hard", color: "bg-amber/80" },
    { q: 4, label: "Good", color: "bg-violet" },
    { q: 5, label: "Easy", color: "bg-mint text-ink" },
  ];

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={onExit} className="btn-ghost"><ArrowLeft size={16} /> Exit</button>
        <span className="chip">{idx + 1} / {queue.length}</span>
      </div>

      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div className="h-full bg-gradient-to-r from-violet to-amber" animate={{ width: `${(idx / queue.length) * 100}%` }} />
      </div>

      <div className="relative" style={{ perspective: 1200 }}>
        <motion.div
          onClick={() => setFlipped((f) => !f)}
          className="grid min-h-[320px] cursor-pointer place-items-center rounded-3xl p-10 text-center"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Front */}
          <div className="card absolute inset-0 grid place-items-center p-10" style={{ backfaceVisibility: "hidden" }}>
            <div>
              <p className="mb-4 text-xs uppercase tracking-widest text-white/30">Question</p>
              <p className="font-display text-2xl">{card.front}</p>
              <p className="mt-6 text-xs text-white/30">Tap to reveal</p>
            </div>
          </div>
          {/* Back */}
          <div
            className="card absolute inset-0 grid place-items-center bg-violet/10 p-10"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div>
              <p className="mb-4 text-xs uppercase tracking-widest text-white/30">Answer</p>
              <p className="font-display text-2xl">{card.back}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {flipped && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 grid grid-cols-4 gap-2"
          >
            {grades.map((g) => (
              <button key={g.q} onClick={() => grade(g.q)} className={`btn ${g.color} text-white`}>
                {g.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
