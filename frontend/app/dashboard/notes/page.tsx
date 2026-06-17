"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, FileText, Loader2, Check } from "lucide-react";
import { api, Note } from "@/lib/api";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  const active = notes.find((n) => n.id === activeId) ?? null;

  useEffect(() => {
    api.get<Note[]>("/api/notes").then((n) => {
      setNotes(n);
      if (n.length) setActiveId(n[0].id);
      setLoading(false);
    });
  }, []);

  async function createNote() {
    const note = await api.post<Note>("/api/notes", { title: "Untitled" });
    setNotes((n) => [...n, note]);
    setActiveId(note.id);
  }

  async function remove(id: string) {
    await api.del(`/api/notes/${id}`);
    setNotes((prev) => {
      const next = prev.filter((n) => n.id !== id);
      if (activeId === id) setActiveId(next[0]?.id ?? null);
      return next;
    });
  }

  function update(field: "title" | "content", value: string) {
    if (!active) return;
    setNotes((prev) => prev.map((n) => (n.id === active.id ? { ...n, [field]: value } : n)));
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaving(true);
    saveTimer.current = setTimeout(async () => {
      await api.put(`/api/notes/${active.id}`, { [field]: value });
      setSaving(false);
    }, 600);
  }

  if (loading) {
    return <div className="grid h-[60vh] place-items-center"><Loader2 className="animate-spin text-violet" size={28} /></div>;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-6 font-display text-4xl font-semibold">Notes</h1>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-[260px_1fr]">
        {/* List */}
        <div className="card h-fit p-3">
          <button onClick={createNote} className="btn-primary mb-3 w-full"><Plus size={16} /> New note</button>
          <div className="space-y-1">
            {notes.map((n) => (
              <button
                key={n.id}
                onClick={() => setActiveId(n.id)}
                className={`group flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${
                  activeId === n.id ? "bg-violet/15 text-white" : "text-white/55 hover:bg-white/5"
                }`}
              >
                <span>{n.icon}</span>
                <span className="flex-1 truncate">{n.title || "Untitled"}</span>
                <Trash2
                  size={14}
                  onClick={(e) => { e.stopPropagation(); remove(n.id); }}
                  className="opacity-0 transition group-hover:opacity-100 hover:text-rose"
                />
              </button>
            ))}
            {notes.length === 0 && (
              <p className="px-3 py-6 text-center text-xs text-white/30">No notes yet.</p>
            )}
          </div>
        </div>

        {/* Editor */}
        {active ? (
          <motion.div key={active.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-8">
            <div className="mb-2 flex items-center justify-end text-xs text-white/30">
              {saving ? "Saving…" : <span className="flex items-center gap-1 text-mint"><Check size={12} /> Saved</span>}
            </div>
            <input
              value={active.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Untitled"
              className="w-full bg-transparent font-display text-3xl font-semibold outline-none placeholder:text-white/20"
            />
            <div className="my-5 h-px bg-white/10" />
            <textarea
              value={active.content}
              onChange={(e) => update("content", e.target.value)}
              placeholder="Start writing… use this space for chapter summaries, definitions, anything."
              className="min-h-[50vh] w-full resize-none bg-transparent leading-relaxed text-white/80 outline-none placeholder:text-white/20"
            />
          </motion.div>
        ) : (
          <div className="card grid place-items-center p-16 text-center text-white/40">
            <FileText size={28} className="mb-3 text-violet-soft" />
            Select or create a note to begin.
          </div>
        )}
      </div>
    </div>
  );
}
