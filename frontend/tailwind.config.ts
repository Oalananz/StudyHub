import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0c0d16",
          800: "#13141f",
          700: "#1a1c2b",
          600: "#242639",
        },
        parchment: "#f4ecd8",
        violet: {
          DEFAULT: "#7c5cff",
          soft: "#9d86ff",
        },
        amber: {
          DEFAULT: "#ffb86b",
        },
        mint: "#5eead4",
        rose: "#ff7eb6",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(124, 92, 255, 0.45)",
        "glow-amber": "0 0 40px -8px rgba(255, 184, 107, 0.45)",
        card: "0 18px 50px -20px rgba(0,0,0,0.7)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        aurora: {
          "0%": { transform: "translate(0%, 0%) rotate(0deg)" },
          "50%": { transform: "translate(8%, 6%) rotate(8deg)" },
          "100%": { transform: "translate(0%, 0%) rotate(0deg)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        aurora: "aurora 18s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
