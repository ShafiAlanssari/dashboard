import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1B1464",
          light: "#7B5CE5",
          bg: "#F8F9FA",
        },
      },
      fontFamily: {
        sans: ["var(--font-cairo)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(27, 20, 100, 0.06), 0 1px 2px -1px rgba(27, 20, 100, 0.06)",
        "card-hover": "0 4px 12px 0 rgba(27, 20, 100, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
