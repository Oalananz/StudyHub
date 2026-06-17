"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import AuroraBackground from "@/components/AuroraBackground";
import Logo from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export default function RegisterPage() {
  const { register } = useAuth();
  const [displayName, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(displayName, email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative z-10 grid min-h-screen place-items-center px-6">
      <AuroraBackground />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card w-full max-w-md p-8"
      >
        <Link href="/" className="mb-8 flex items-center gap-2 font-display text-lg font-semibold">
          <Logo className="h-8 w-8" />
          Study Hub
        </Link>

        <h1 className="font-display text-3xl font-semibold">Create your hub</h1>
        <p className="mt-1 text-sm text-white/50">Free forever. No card required.</p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              required
              value={displayName}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex"
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-rose/30 bg-rose/10 px-4 py-2.5 text-sm text-rose">
              {error}
            </p>
          )}

          <button className="btn-primary w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : <>Create account <ArrowRight size={16} /></>}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/50">
          Already have an account?{" "}
          <Link href="/login" className="text-violet-soft hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
