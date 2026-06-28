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
        cream: "#FDFAF3",
        ivory: "#F7F3E9",
        parchm: "#EDE8D8",
        divider: "#E2DCCF",
        gold: {
          DEFAULT: "#B8942A",
          l: "#D4AC3E",
          pale: "#F5EDD0",
          glow: "rgba(184, 148, 42, 0.18)",
        },
        m: {
          DEFAULT: "#A0621A",
          mid: "#C07828",
          pale: "#FEF0DC",
          glow: "rgba(160, 98, 26, 0.15)",
        },
        f: {
          DEFAULT: "#9E3D5A",
          mid: "#C05070",
          pale: "#FDEEF3",
          glow: "rgba(158, 61, 90, 0.12)",
        },
        ink: {
          DEFAULT: "#1E1810",
          mid: "#5A4E3A",
          soft: "#8C7F6C",
          faint: "#C4B89A",
        },
        green: {
          DEFAULT: "#2D7A4F",
        },
        red: {
          DEFAULT: "#C0392B",
        }
      },
      boxShadow: {
        DEFAULT: "0 4px 18px rgba(90,70,30,.08)",
        md: "0 4px 18px rgba(90,70,30,.14)",
      },
      borderRadius: {
        DEFAULT: "24px",
        sm: "14px",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        deva: ["var(--font-deva)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
