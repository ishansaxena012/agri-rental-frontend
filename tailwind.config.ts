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
        earth: {
          50: "#faf7f2",
          100: "#f2ebe0",
          200: "#e4d4be",
          300: "#d1b595",
          400: "#bc9168",
          500: "#ad7a4d",
          600: "#9f6841",
          700: "#845337",
          800: "#6c4430",
          900: "#583829",
          950: "#2f1d14",
        },
        sage: {
          50: "#f4f7f2",
          100: "#e5ede1",
          200: "#ccdbc4",
          300: "#a7c09d",
          400: "#7da072",
          500: "#5c8252",
          600: "#476840",
          700: "#395335",
          800: "#2f432c",
          900: "#273826",
          950: "#121e12",
        },
        clay: {
          50: "#fdf6ef",
          100: "#fae9d8",
          200: "#f4d0af",
          300: "#ecaf7d",
          400: "#e38549",
          500: "#dc6826",
          600: "#ce511c",
          700: "#ab3d19",
          800: "#88321b",
          900: "#6e2b19",
          950: "#3b130b",
        },
        cream: "#fdfaf5",
        bark: "#2c1810",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 2px 20px rgba(44,24,16,0.08)",
        card: "0 4px 32px rgba(44,24,16,0.12)",
        float: "0 8px 40px rgba(44,24,16,0.16)",
      },
      animation: {
        "slide-up": "slideUp 0.3s ease-out",
        "fade-in": "fadeIn 0.2s ease-out",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
