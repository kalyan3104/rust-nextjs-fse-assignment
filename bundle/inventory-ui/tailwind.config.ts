import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          bg: "#0B0F14",
          panel: "#121821",
          panel2: "#161D27",
          border: "#232B36",
          borderMuted: "#1B222C",
        },
        ink: {
          DEFAULT: "#E5E9EF",
          muted: "#8A97A6",
          faint: "#5B6675",
        },
        signal: {
          ok: "#3DDC97",
          warn: "#F5A623",
          danger: "#EF4444",
          accent: "#5B8DEF",
        },
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "10px",
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.02) inset",
      },
    },
  },
  plugins: [],
};

export default config;
