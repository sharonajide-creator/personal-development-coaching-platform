import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#6C00FF",
          dark: "#4A00B0",
          light: "#9D5CFF",
        },
        accent: {
          DEFAULT: "#FF0A7A",
          gold: "#FFB800",
        },
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
