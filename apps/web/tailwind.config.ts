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
        "error-container": "#ffdad6",
        "secondary-fixed": "#e9e1d7",
        "on-tertiary": "#ffffff",
        "on-background": "#1d1b16",
        "outline-variant": "#d7c2b8",
        "primary-fixed-dim": "#ffb689",
        "surface": "#fff9ee",
        "primary-fixed": "#ffdbc8",
        "primary-container": "#945b35",
        "surface-tint": "#88512c",
        "surface-container-highest": "#e8e2d8",
        "surface-bright": "#fff9ee",
        "on-primary-fixed-variant": "#6b3a17",
        "surface-container-high": "#ede7de",
        "surface-variant": "#e8e2d8",
        "surface-container-low": "#f9f3e9",
        "on-secondary-container": "#67625a",
        "on-primary-fixed": "#311300",
        "tertiary-container": "#915c3b",
        "on-tertiary-container": "#ffe4d5",
        "tertiary": "#754525",
        "on-primary-container": "#ffe4d6",
        "error": "#ba1a1a",
        "inverse-primary": "#ffb689",
        "on-secondary-fixed-variant": "#4a463f",
        "outline": "#85746a",
        "inverse-on-surface": "#f6f0e6",
        "secondary-fixed-dim": "#cdc5bc",
        "secondary-container": "#e6dfd4",
        "on-secondary": "#ffffff",
        "on-surface-variant": "#52443c",
        "on-error": "#ffffff",
        "tertiary-fixed-dim": "#fbb890",
        "on-error-container": "#93000a",
        "surface-dim": "#dfd9d0",
        "secondary": "#635e56",
        "on-tertiary-fixed": "#321300",
        "background": "#fff9ee",
        "tertiary-fixed": "#ffdbc8",
        "on-tertiary-fixed-variant": "#693b1c",
        "on-secondary-fixed": "#1e1b15",
        "primary": "#774420",
        "on-surface": "#1d1b16",
        "surface-container-lowest": "#ffffff",
        "on-primary": "#ffffff",
        "surface-container": "#f3ede3",
        "inverse-surface": "#33302a"
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
