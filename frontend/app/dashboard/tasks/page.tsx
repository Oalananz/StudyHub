"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Calendar, GripVertical } from "lucide-react";
import { api, Task, TaskStatus } from "@/lib/api";
import { BoardSkeleton } from "@/components/skeletons";

const COLUMNS: { status: TaskStatus; title: string; accent: string }[] = [
  { status: 0, title: "To do", accent: "border-t-rose" },
  { status: 1, title: "Doing", accent: "border-t-amber" },
  { status: 2, title: "Done", accent: "border-t-mint" },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<TaskStatus | null>(null);

  useEffect(() => {
    api.get<Task[]>("/api/tasks").then(setTasks).finally(() => setLoading(false));
  }, []);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const task = await api.post<Task>("/api/tasks", {
      title: newTitle,
      subject: newSubject || null,
    });
    setTasks((t) => [...t, task]);
    setNewTitle("");
    setNewSubject("");
  }

  async function move(id: string, status: TaskStatus) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    await api.put(`/api/tasks/${id}`, { status });
  }

  async function remove(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await api.del(`/api/tasks/${id}`);
  }

  if (loading) {
    return <BoardSkeleton />;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-4xl font-semibold">Task board</h1>
      <p className="mt-1 text-white/50">Drag cards between columns as you make progress.</p>

      {/* Add task */}
      <form onSubmit={addTask} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          className="input flex-1"
          placeholder="Add a task…"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <input
          className="input sm:w-48"
          placeholder="Subject (optional)"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
        />
        <button className="btn-primary"><Plus size={18} /> Add</button>
      </form>

      {/* Columns */}
      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        {COLUMNS.map((col) => {
          const items = tasks.filter((t) => t.status === col.status);
          return (
            <div
              key={col.status}
              onDragOver={(e) => { e.preventDefault(); setOverCol(col.status); }}
              onDragLeave={() => setOverCol(null)}
              onDrop={() => {
                if (dragId) move(dragId, col.status);
                setDragId(null);
                setOverCol(null);
              }}
              className={`card border-t-2 p-4 transition ${col.accent} ${
                overCol === col.status ? "ring-2 ring-violet/40" : ""
              }`}
            >
              <div className="mb-4 flex items-center justify-between px-1">
                <h2 className="font-display text-lg font-semibold">{col.title}</h2>
                <span className="chip">{items.length}</span>
              </div>

              <div className="flex min-h-[120px] flex-col gap-3">
                <AnimatePresence>
                  {items.map((task) => (
                    <motion.div
                      layout
                      key={task.id}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      draggable
                      onDragStart={() => setDragId(task.id)}
                      className={`group cursor-grab rounded-2xl border border-white/10 bg-ink-700/60 p-3.5 active:cursor-grabbing ${
                        task.status === 2 ? "opacity-60" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical size={16} className="mt-0.5 shrink-0 text-white/20" />
                        <div className="flex-1">
                          <p className={`text-sm ${task.status === 2 ? "line-through" : ""}`}>{task.title}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {task.subject && <span className="chip">{task.subject}</span>}
                            {task.dueDate && (
                              <span className="chip"><Calendar size={11} /> {task.dueDate}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => remove(task.id)}
                          className="text-white/20 opacity-0 transition group-hover:opacity-100 hover:text-rose"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {items.length === 0 && (
                  <p className="grid flex-1 place-items-center py-6 text-center text-xs text-white/25">
                    Drop tasks here
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
