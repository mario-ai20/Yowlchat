import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
    "../../packages/config/src/**/*.{js,ts}",
    "../../packages/types/src/**/*.{js,ts}"
  ],
  theme: {
    extend: {
      colors: {
        yowl: {
          50: "#f8efff",
          100: "#eed8ff",
          200: "#dcafff",
          300: "#c783ff",
          400: "#b058fa",
          500: "#A855F7",
          600: "#8f3de4",
          700: "#7326be",
          800: "#561b91",
          900: "#381062"
        }
      },
      boxShadow: {
        glow: "0 0 40px rgba(168, 85, 247, 0.28)"
      },
      backdropBlur: {
        xs: "2px"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        glowPulse: {
          "0%, 100%": { opacity: 0.55, transform: "scale(1)" },
          "50%": { opacity: 0.9, transform: "scale(1.05)" }
        }
      },
      animation: {
        floaty: "floaty 8s ease-in-out infinite",
        glowPulse: "glowPulse 4.5s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
