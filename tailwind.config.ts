import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#08090d",
        foreground: "#f8fafc",
        violet: {
          DEFAULT: "#8b5cf6",
          glow: "rgba(139, 92, 246, 0.3)",
        },
        crimson: {
          DEFAULT: "#ef4444",
          glow: "rgba(239, 68, 68, 0.3)",
        },
        emerald: {
          DEFAULT: "#10b981",
        },
      },
      borderRadius: {
        "2xl": "1rem",
      },
      boxShadow: {
        glass: "inset 0 1px 1px 0 rgba(255,255,255,0.05)",
        glow: "0 0 32px rgba(139, 92, 246, 0.3)",
      },
      backdropBlur: {
        glass: "24px",
      },
      keyframes: {
        "pulse-orb": {
          "0%, 100%": { opacity: "0.45", transform: "translateY(0px)" },
          "50%": { opacity: "0.75", transform: "translateY(-12px)" },
        },
      },
      animation: {
        "pulse-orb": "pulse-orb 15s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
