import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#172622",
        canvas: "#f7f7f4",
        brand: {
          DEFAULT: "#c96b46",
          dark: "#a84e2f",
          soft: "#f8e8df",
        },
        sage: {
          DEFAULT: "#769286",
          dark: "#46675d",
          soft: "#e5eeea",
        },
      },
      boxShadow: {
        soft: "0 24px 70px -32px rgba(23, 38, 34, 0.28)",
        card: "0 1px 2px rgba(23, 38, 34, 0.03), 0 14px 36px -28px rgba(23, 38, 34, 0.3)",
        lift: "0 22px 60px -30px rgba(23, 38, 34, 0.38)",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
        display: ["var(--font-fraunces)", "serif"],
      },
      letterSpacing: {
        tightest: "-0.035em",
      },
    },
  },
  plugins: [],
} satisfies Config;
