"use client";

import { motion } from "framer-motion";

/** Soft animated colour blobs + faint grid. Sits behind all content. */
export default function AuroraBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-ink">
      <div className="absolute inset-0 grid-faint opacity-60" />

      <motion.div
        className="aurora-blob"
        style={{ width: 520, height: 520, background: "#7c5cff", top: "-10%", left: "-5%" }}
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="aurora-blob"
        style={{ width: 440, height: 440, background: "#ffb86b", top: "30%", right: "-8%" }}
        animate={{ x: [0, -50, 0], y: [0, 60, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="aurora-blob"
        style={{ width: 380, height: 380, background: "#5eead4", bottom: "-12%", left: "25%" }}
        animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/70 to-ink" />
    </div>
  );
}
