import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          deep: "#0a0a0a",
          surface: "#0d1117",
          elevated: "#141820",
          hover: "#1a2030",
        },
        text: {
          primary: "#c8d6e5",
          dim: "#4a5568",
          muted: "#2d3748",
        },
        neon: {
          green: "#00FF41",
          cyan: "#00fff9",
          yellow: "#FFD900",
          orange: "#FF8000",
          blue: "#00B3FF",
          mint: "#00ff88",
        },
        danger: "#ff3333",
        entity: {
          kairos: "#FFD900",
          hibbert: "#00ff88",
          atlas: "#00B3FF",
          echo: "#FF8000",
          commons: "#00FF41",
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', "Fira Code", "Consolas", "monospace"],
      },
      animation: {
        "glow-pulse": "glow-pulse 2s ease-in-out infinite alternate",
        "scanline": "scanline 8s linear infinite",
        "flicker": "flicker 0.15s infinite",
        "boot": "boot 1.5s ease-out forwards",
        "typewriter": "typewriter 2s steps(40) forwards",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "slide-up": "slide-up 0.3s ease-out forwards",
      },
      keyframes: {
        "glow-pulse": {
          "0%": { textShadow: "0 0 4px #00FF41, 0 0 8px #00FF4180" },
          "100%": { textShadow: "0 0 8px #00FF41, 0 0 20px #00FF4140, 0 0 40px #00FF4120" },
        },
        "scanline": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        "flicker": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.98" },
        },
        "boot": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "typewriter": {
          "0%": { width: "0" },
          "100%": { width: "100%" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        "glow-green": "0 0 10px #00FF4140, 0 0 20px #00FF4120",
        "glow-cyan": "0 0 10px #00fff940, 0 0 20px #00fff920",
        "glow-yellow": "0 0 10px #FFD90040, 0 0 20px #FFD90020",
        "glow-orange": "0 0 10px #FF800040, 0 0 20px #FF800020",
        "glow-blue": "0 0 10px #00B3FF40, 0 0 20px #00B3FF20",
        "glow-mint": "0 0 10px #00ff8840, 0 0 20px #00ff8820",
      },
    },
  },
  plugins: [],
};

export default config;
