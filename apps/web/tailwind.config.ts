import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "error-container": "#fee4e2",
        "secondary-fixed": "#d9f99d",
        "on-tertiary": "#ffffff",
        "on-background": "#141515",
        "outline-variant": "#c6d8d1",
        "primary-fixed-dim": "#99f6e4",
        "surface": "#f6fbf8",
        "primary-fixed": "#ccfbf1",
        "primary-container": "#0d9488",
        "surface-tint": "#0f766e",
        "surface-container-highest": "#dfeee8",
        "surface-bright": "#ffffff",
        "on-primary-fixed-variant": "#0f4f49",
        "surface-container-high": "#e8f5ef",
        "surface-variant": "#e3f2ec",
        "surface-container-low": "#f0f8f4",
        "on-secondary-container": "#59615d",
        "on-primary-fixed": "#073b36",
        "tertiary-container": "#ffe1e8",
        "on-tertiary-container": "#7a1d35",
        "tertiary": "#e85d75",
        "on-primary-container": "#ecfffb",
        "error": "#b42318",
        "inverse-primary": "#99f6e4",
        "on-secondary-fixed-variant": "#31533f",
        "outline": "#81958c",
        "inverse-on-surface": "#f2fbf7",
        "secondary-fixed-dim": "#bef264",
        "secondary-container": "#eaffc7",
        "on-secondary": "#ffffff",
        "on-surface-variant": "#3f4a45",
        "on-error": "#ffffff",
        "tertiary-fixed-dim": "#fda4af",
        "on-error-container": "#7a271a",
        "surface-dim": "#d9e8e1",
        "secondary": "#2f7d5c",
        "on-tertiary-fixed": "#4f1022",
        "background": "#f6fbf8",
        "tertiary-fixed": "#ffe4ea",
        "on-tertiary-fixed-variant": "#941f3d",
        "on-secondary-fixed": "#143322",
        "primary": "#0f766e",
        "on-surface": "#141515",
        "surface-container-lowest": "#ffffff",
        "on-primary": "#ffffff",
        "surface-container": "#ebf6f1",
        "inverse-surface": "#26312d"
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "3rem",
        "full": "9999px"
      },
      fontFamily: {
        "headline": ["var(--font-noto-serif)", "serif"],
        "body": ["var(--font-inter)", "sans-serif"],
        "label": ["var(--font-inter)", "sans-serif"]
      }
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/container-queries")
  ],
};

export default config;
