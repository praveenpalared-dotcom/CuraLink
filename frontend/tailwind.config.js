/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#090D1A",       // Deep slate dark background
          card: "#131C33",     // Slightly lighter navy card background
          accent: "#00F2FE",   // Electric neon cyan
          teal: "#05F2C7",     // Soft mint green/teal
          border: "#1E2E5A",   // Subtle neon highlight borders
          text: "#E2E8F0",     // Off-white readability text
          muted: "#94A3B8"     // Soft secondary gray
        }
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 15px rgba(0, 242, 254, 0.15)",
        "glow-lg": "0 0 25px rgba(5, 242, 199, 0.25)"
      }
    },
  },
  plugins: [],
}
